import mongoose, { Schema, Document } from "mongoose"

export type ComplaintCategory = "waterlogging" | "potholes" | "garbages" | "streetlight" | "others"
export type ComplaintStatus = "active" | "resolved"

export interface IComplaint extends Document {
  username: string
  category: ComplaintCategory
  address: string
  description?: string
  pincode: string
  upvote: number
  downvote: number
  status: ComplaintStatus
  createdAt: Date
  updatedAt: Date
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    username: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["waterlogging", "potholes", "garbages", "streetlight", "others"],
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    pincode: {
      type: String,
      required: true,
      match: /^\d{6}$/, // Indian pincode format
    },
    upvote: {
      type: Number,
      default: 0,
    },
    downvote: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient querying
ComplaintSchema.index({ pincode: 1, category: 1 })
ComplaintSchema.index({ createdAt: -1 })
ComplaintSchema.index({ upvote: -1, createdAt: -1 }) // For department sorting by popularity
ComplaintSchema.index({ pincode: 1 })
ComplaintSchema.index({ username: 1 })
ComplaintSchema.index({ status: 1 })

export const Complaint = mongoose.model<IComplaint>("Complaint", ComplaintSchema)