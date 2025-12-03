import express, { Response } from "express"
import { Complaint, ComplaintCategory } from "../models/Complaint"
import { authenticate, AuthRequest } from "../middleware/auth"
import { User } from "../models/User"
import { Vote } from "../models/Vote"
import multer from "multer"
import axios from "axios"
import FormData from "form-data"

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// Create complaint (User only)
router.post("/", authenticate, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "user") {
      return res.status(403).json({ error: "Only users can create complaints" })
    }

    const { category, address, description } = req.body
    const image = req.file

    // Validate address
    if (!address || !address.trim()) {
      return res.status(400).json({ error: "Address is required" })
    }

    let complaintCategory = category

    // If no category provided, use ML classification
    if (!category && image) {
      try {
        // Create form data for the image - properly formatted for the ML service
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('image', image.buffer, {
          filename: image.originalname,
          contentType: image.mimetype
        });
        
        // Call ML service to classify image
        const mlResponse = await axios.post('http://localhost:5001/predict', 
          formData,
          {
            headers: {
              ...formData.getHeaders()
            }
          }
        )
        
        complaintCategory = mlResponse.data.category
        console.log(`ML classified image as: ${complaintCategory} (${mlResponse.data.className}) with confidence: ${mlResponse.data.confidence}`)
      } catch (mlError) {
        console.error('ML classification error:', mlError)
        // Fallback to 'others' category if ML fails
        complaintCategory = 'others'
      }
    }
    
    // If still no category, return error
    if (!complaintCategory) {
      return res.status(400).json({ error: "Category is required or image must be provided for classification" })
    }

    const validCategories: ComplaintCategory[] = ["waterlogging", "potholes", "garbages", "streetlight", "others"]
    if (!validCategories.includes(complaintCategory as ComplaintCategory)) {
      return res.status(400).json({ error: "Invalid category" })
    }

    // Get user to fetch pincode
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Create complaint
    const complaint = new Complaint({
      username: user.username,
      category: complaintCategory,
      address: address.trim(),
      description: description?.trim() || undefined,
      pincode: user.pincode,
      upvote: 0,
      downvote: 0,
    })

    await complaint.save()

    res.status(201).json({
      message: "Complaint created successfully",
      complaint: {
        id: complaint._id,
        username: complaint.username,
        category: complaint.category,
        address: complaint.address,
        description: complaint.description,
        pincode: complaint.pincode,
        upvote: complaint.upvote,
        downvote: complaint.downvote,
        createdAt: complaint.createdAt,
      },
      usedMLClassification: !category && !!image
    })
  } catch (error) {
    console.error("Create complaint error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get complaints for user (filtered by pincode)
router.get("/user", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "user") {
      return res.status(403).json({ error: "Access denied" })
    }

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const complaints = await Complaint.find({ pincode: user.pincode })
      .sort({ createdAt: -1 })
      .select("-__v")

    // Get user's votes for all complaints
    const complaintIds = complaints.map((c) => c._id)
    const userVotes = await Vote.find({
      complaintId: { $in: complaintIds },
      username: user.username,
    })

    const voteMap = new Map(
      userVotes.map((v) => [v.complaintId.toString(), v.voteType])
    )

    res.json({
      complaints: complaints.map((c) => ({
        id: c._id,
        username: c.username,
        category: c.category,
        address: c.address,
        description: c.description,
        pincode: c.pincode,
        upvotes: c.upvote,
        downvotes: c.downvote,
        createdAt: c.createdAt,
        userVote: voteMap.get(c._id.toString()) || null,
      })),
    })
  } catch (error) {
    console.error("Get user complaints error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get complaints for department (filtered by category and pincode)
router.get("/department", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "department") {
      return res.status(403).json({ error: "Access denied" })
    }

    const department = req.user.department
    const pincode = req.user.pincode

    if (!department || !pincode) {
      return res.status(400).json({ error: "Department information missing" })
    }

    const complaints = await Complaint.find({
      category: department,
      pincode: pincode,
    })
      .sort({ createdAt: -1 })
      .select("-__v")

    res.json({
      complaints: complaints.map((c) => ({
        id: c._id,
        username: c.username,
        category: c.category,
        address: c.address,
        description: c.description,
        pincode: c.pincode,
        upvotes: c.upvote,
        downvotes: c.downvote,
        createdAt: c.createdAt,
      })),
    })
  } catch (error) {
    console.error("Get department complaints error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Upvote complaint
router.post("/:id/upvote", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "user" || !req.user.username) {
      return res.status(403).json({ error: "Only users can vote" })
    }

    const complaint = await Complaint.findById(req.params.id)

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" })
    }

    const username = req.user.username
    const complaintId = complaint._id

    // Check if user already voted
    const existingVote = await Vote.findOne({ complaintId, username })

    if (existingVote) {
      if (existingVote.voteType === "upvote") {
        // User already upvoted, remove the upvote
        await Vote.deleteOne({ _id: existingVote._id })
        complaint.upvote = Math.max(0, complaint.upvote - 1)
        await complaint.save()

        return res.json({
          message: "Upvote removed",
          upvote: complaint.upvote,
          downvote: complaint.downvote,
          userVote: null,
        })
      } else {
        // User downvoted, switch to upvote
        existingVote.voteType = "upvote"
        await existingVote.save()
        complaint.downvote = Math.max(0, complaint.downvote - 1)
        complaint.upvote += 1
        await complaint.save()

        return res.json({
          message: "Switched to upvote",
          upvote: complaint.upvote,
          downvote: complaint.downvote,
          userVote: "upvote",
        })
      }
    } else {
      // User hasn't voted, add upvote
      await Vote.create({
        complaintId,
        username,
        voteType: "upvote",
      })
      complaint.upvote += 1
      await complaint.save()

      return res.json({
        message: "Upvoted successfully",
        upvote: complaint.upvote,
        downvote: complaint.downvote,
        userVote: "upvote",
      })
    }
  } catch (error: any) {
    console.error("Upvote error:", error)
    if (error.code === 11000) {
      return res.status(400).json({ error: "You have already voted on this complaint" })
    }
    res.status(500).json({ error: "Internal server error" })
  }
})

// Downvote complaint
router.post("/:id/downvote", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "user" || !req.user.username) {
      return res.status(403).json({ error: "Only users can vote" })
    }

    const complaint = await Complaint.findById(req.params.id)

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" })
    }

    const username = req.user.username
    const complaintId = complaint._id

    // Check if user already voted
    const existingVote = await Vote.findOne({ complaintId, username })

    if (existingVote) {
      if (existingVote.voteType === "downvote") {
        // User already downvoted, remove the downvote
        await Vote.deleteOne({ _id: existingVote._id })
        complaint.downvote = Math.max(0, complaint.downvote - 1)
        await complaint.save()

        return res.json({
          message: "Downvote removed",
          upvote: complaint.upvote,
          downvote: complaint.downvote,
          userVote: null,
        })
      } else {
        // User upvoted, switch to downvote
        existingVote.voteType = "downvote"
        await existingVote.save()
        complaint.upvote = Math.max(0, complaint.upvote - 1)
        complaint.downvote += 1
        await complaint.save()

        return res.json({
          message: "Switched to downvote",
          upvote: complaint.upvote,
          downvote: complaint.downvote,
          userVote: "downvote",
        })
      }
    } else {
      // User hasn't voted, add downvote
      await Vote.create({
        complaintId,
        username,
        voteType: "downvote",
      })
      complaint.downvote += 1
      await complaint.save()

      return res.json({
        message: "Downvoted successfully",
        upvote: complaint.upvote,
        downvote: complaint.downvote,
        userVote: "downvote",
      })
    }
  } catch (error: any) {
    console.error("Downvote error:", error)
    if (error.code === 11000) {
      return res.status(400).json({ error: "You have already voted on this complaint" })
    }
    res.status(500).json({ error: "Internal server error" })
  }
})

// Resolve complaint (Department only) - Delete complaint
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "department") {
      return res.status(403).json({ error: "Only departments can resolve complaints" })
    }

    const complaint = await Complaint.findById(req.params.id)

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" })
    }

    // Verify the complaint belongs to this department's jurisdiction
    if (complaint.category !== req.user.department || complaint.pincode !== req.user.pincode) {
      return res.status(403).json({ error: "You can only resolve complaints in your jurisdiction" })
    }

    await Complaint.findByIdAndDelete(req.params.id)

    res.json({
      message: "Complaint resolved and deleted successfully",
    })
  } catch (error) {
    console.error("Resolve complaint error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router

