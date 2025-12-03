import express, { Request, Response } from "express"
import { Department, DepartmentCategory } from "../models/Department"
import { hashPassword, comparePassword, generateToken } from "../utils/auth"
import { authenticate, AuthRequest } from "../middleware/auth"

const router = express.Router()

// Department Signup
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { department, pincode, password } = req.body

    // Validation
    if (!department || !pincode || !password) {
      return res.status(400).json({ error: "All fields are required" })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" })
    }

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ error: "Pincode must be a 6-digit number" })
    }

    const validDepartments: DepartmentCategory[] = ["waterlogging", "potholes", "garbages", "streetlight", "others"]
    if (!validDepartments.includes(department)) {
      return res.status(400).json({ error: "Invalid department category" })
    }

    // Check if department + pincode combination already exists
    const existingDept = await Department.findOne({ department, pincode })

    if (existingDept) {
      return res.status(400).json({
        error: `Pincode ${pincode} is already in use with ${department} department`,
      })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create department
    const dept = new Department({
      department,
      pincode,
      password: hashedPassword,
    })

    await dept.save()

    // Generate token
    const token = generateToken({
      userId: dept._id.toString(),
      role: "department",
      department: dept.department,
      pincode: dept.pincode,
    })

    res.status(201).json({
      message: "Department account created successfully",
      token,
      department: {
        id: dept._id,
        department: dept.department,
        pincode: dept.pincode,
      },
    })
  } catch (error: any) {
    console.error("Department signup error:", error)
    if (error.code === 11000) {
      return res.status(400).json({
        error: `Pincode ${req.body.pincode} is already in use with ${req.body.department} department`,
      })
    }
    res.status(500).json({ error: "Internal server error" })
  }
})

// Department Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { department, pincode, password } = req.body

    if (!department || !pincode || !password) {
      return res.status(400).json({ error: "Department, pincode, and password are required" })
    }

    // Find department
    const dept = await Department.findOne({ department, pincode })

    if (!dept) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, dept.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate token
    const token = generateToken({
      userId: dept._id.toString(),
      role: "department",
      department: dept.department,
      pincode: dept.pincode,
    })

    res.json({
      message: "Login successful",
      token,
      department: {
        id: dept._id,
        department: dept.department,
        pincode: dept.pincode,
      },
    })
  } catch (error) {
    console.error("Department login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get current department profile
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "department") {
      return res.status(403).json({ error: "Access denied" })
    }

    const dept = await Department.findById(req.user.userId).select("-password")

    if (!dept) {
      return res.status(404).json({ error: "Department not found" })
    }

    res.json({
      id: dept._id,
      department: dept.department,
      pincode: dept.pincode,
    })
  } catch (error) {
    console.error("Get department error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router

