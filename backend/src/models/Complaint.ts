import mongoose, { Schema, Document } from "mongoose"

export type ComplaintCategory = "waterlogging" | "potholes" | "garbages" | "streetlight" | "others"

export interface IComplaint extends Document {
  username: string
  category: ComplaintCategory
  address: string
  description?: string
  pincode: string
  upvote: number
  downvote: number
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
      required: true,
      enum: ["waterlogging", "potholes", "garbages", "streetlight", "others"],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, "Pincode must be a 6-digit number"],
    },
    upvote: {
      type: Number,
      default: 0,
      min: 0,
    },
    downvote: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient querying
ComplaintSchema.index({ pincode: 1 })
ComplaintSchema.index({ category: 1 })
ComplaintSchema.index({ pincode: 1, category: 1 })
ComplaintSchema.index({ createdAt: -1 })

export const Complaint = mongoose.model<IComplaint>("Complaint", ComplaintSchema)

