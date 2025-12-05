import express, { Request, Response } from "express"
import { User } from "../models/User"
import { hashPassword, comparePassword, generateToken } from "../utils/auth"
import { authenticate, AuthRequest } from "../middleware/auth"

const router = express.Router()

// User Signup
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { username, email, password, pincode } = req.body

    // Validation
    if (!username || !email || !password || !pincode) {
      return res.status(400).json({ error: "All fields are required" })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" })
    }

    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ error: "Pincode must be a 6-digit number" })
    }

    // Check if username already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    })

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ error: "Username already exists" })
      }
      if (existingUser.email === email) {
        return res.status(400).json({ error: "Email already exists" })
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      pincode,
    })

    await user.save()

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      role: "user",
      username: user.username,
      pincode: user.pincode,
    })

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        pincode: user.pincode,
      },
    })
  } catch (error: any) {
    console.error("Signup error:", error)
    if (error.code === 11000) {
      return res.status(400).json({ error: "Username or email already exists" })
    }
    res.status(500).json({ error: "Internal server error" })
  }
})

// User Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" })
    }

    // Find user
    const user = await User.findOne({ username })

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      role: "user",
      username: user.username,
      pincode: user.pincode,
    })

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        pincode: user.pincode,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Get current user profile
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "user") {
      return res.status(403).json({ error: "Access denied" })
    }

    const user = await User.findById(req.user.userId).select("-password")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      pincode: user.pincode,
    })
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({ error: "Internal server error" })
  }
})

// Update user profile (except email)
router.put("/profile", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "user") {
      return res.status(403).json({ error: "Access denied" })
    }

    const { username, pincode, currentPassword, newPassword } = req.body

    const user = await User.findById(req.user.userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Update username if provided
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username })
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" })
      }
      user.username = username
    }

    // Update pincode if provided
    if (pincode) {
      if (!/^\d{6}$/.test(pincode)) {
        return res.status(400).json({ error: "Pincode must be a 6-digit number" })
      }
      user.pincode = pincode
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required to change password" })
      }

      const isPasswordValid = await comparePassword(currentPassword, user.password)
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Current password is incorrect" })
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" })
      }

      user.password = await hashPassword(newPassword)
    }

    await user.save()

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        pincode: user.pincode,
      },
    })
  } catch (error: any) {
    console.error("Update profile error:", error)
    if (error.code === 11000) {
      return res.status(400).json({ error: "Username already exists" })
    }
    res.status(500).json({ error: "Internal server error" })
  }
})

export default router

