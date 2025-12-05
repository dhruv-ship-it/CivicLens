import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
  username: string
  email: string
  password: string
  pincode: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    pincode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, "Pincode must be a 6-digit number"],
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
UserSchema.index({ username: 1 }, { unique: true })
UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ pincode: 1 })

export const User = mongoose.model<IUser>("User", UserSchema)

