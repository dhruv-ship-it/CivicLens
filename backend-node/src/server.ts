import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDatabase } from "./config/database"
import userAuthRoutes from "./routes/userAuth"
import departmentAuthRoutes from "./routes/departmentAuth"
import complaintRoutes from "./routes/complaints"

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000", "http://localhost:3001"]

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
)

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Civic Lens API is running" })
})

// Routes
app.use("/api/users", userAuthRoutes)
app.use("/api/departments", departmentAuthRoutes)
app.use("/api/complaints", complaintRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err)
  res.status(500).json({ error: "Internal server error" })
})

// Start server
async function startServer() {
  try {
    await connectDatabase()
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📡 API available at http://localhost:${PORT}`)
      console.log(`🔗 CORS enabled for: ${corsOrigins.join(", ")}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()

