import mongoose, { Schema, Document } from "mongoose"

export interface IComment extends Document {
  complaintId: mongoose.Types.ObjectId
  username: string
  content: string
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500, // Limit comment length
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for efficient querying
CommentSchema.index({ complaintId: 1, createdAt: -1 }) // Get comments for a complaint, newest first
CommentSchema.index({ username: 1 }) // Find comments by user

export const Comment = mongoose.model<IComment>("Comment", CommentSchema)