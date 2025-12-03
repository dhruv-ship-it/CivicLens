import mongoose, { Schema, Document } from "mongoose"

export type DepartmentCategory = "waterlogging" | "potholes" | "garbages" | "streetlight" | "others"

export interface IDepartment extends Document {
  department: DepartmentCategory
  pincode: string
  password: string
  createdAt: Date
  updatedAt: Date
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    department: {
      type: String,
      required: true,
      enum: ["waterlogging", "potholes", "garbages", "streetlight", "others"],
    },
    pincode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, "Pincode must be a 6-digit number"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    timestamps: true,
  }
)

// Composite unique index for department + pincode
DepartmentSchema.index({ department: 1, pincode: 1 }, { unique: true })
DepartmentSchema.index({ pincode: 1 })

export const Department = mongoose.model<IDepartment>("Department", DepartmentSchema)

