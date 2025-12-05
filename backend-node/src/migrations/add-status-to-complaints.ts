import mongoose from "mongoose"
import { config } from "dotenv"
import { Complaint } from "../models/Complaint"

// Load environment variables
config({ path: ".env" })

async function addStatusToExistingComplaints() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/civiclens")
    console.log("✅ Connected to MongoDB")

    // Update all existing complaints to have status "active"
    const result = await Complaint.updateMany(
      { status: { $exists: false } }, // Only update documents without status field
      { $set: { status: "active" } }   // Set status to active
    )

    console.log(`✅ Updated ${result.modifiedCount} complaints with status field`)
    console.log(`ℹ️  Matched ${result.matchedCount} complaints`)

    // Verify the update
    const complaints = await Complaint.find({})
    console.log(`📊 Total complaints in database: ${complaints.length}`)
    
    const activeComplaints = await Complaint.countDocuments({ status: "active" })
    const resolvedComplaints = await Complaint.countDocuments({ status: "resolved" })
    
    console.log(`📊 Active complaints: ${activeComplaints}`)
    console.log(`📊 Resolved complaints: ${resolvedComplaints}`)

    await mongoose.connection.close()
    console.log("✅ Disconnected from MongoDB")
  } catch (error) {
    console.error("❌ Error updating complaints:", error)
    process.exit(1)
  }
}

// Run the migration
addStatusToExistingComplaints()