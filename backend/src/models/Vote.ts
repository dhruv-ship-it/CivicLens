import mongoose, { Schema, Document } from "mongoose"

export interface IVote extends Document {
  complaintId: mongoose.Types.ObjectId
  username: string
  voteType: "upvote" | "downvote"
  createdAt: Date
}

const VoteSchema = new Schema<IVote>(
  {
    complaintId: {
      type: Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    voteType: {
      type: String,
      enum: ["upvote", "downvote"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Composite unique index: one vote per user per complaint
VoteSchema.index({ complaintId: 1, username: 1 }, { unique: true })
VoteSchema.index({ complaintId: 1 })
VoteSchema.index({ username: 1 })

export const Vote = mongoose.model<IVote>("Vote", VoteSchema)

