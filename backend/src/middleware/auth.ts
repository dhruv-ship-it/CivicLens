import { Request, Response, NextFunction } from "express"
import { verifyToken, JWTPayload } from "../utils/auth"

// Extend Express Request to include user info
export interface AuthRequest extends Request {
  user?: JWTPayload
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" })
    }

    const token = authHeader.substring(7) // Remove "Bearer " prefix
    const decoded = verifyToken(token)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}

export function requireRole(role: "user" | "department") {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" })
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: "Insufficient permissions" })
    }

    next()
  }
}

