import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  clerkId: string
  email: string
  name: string
  role: "student" | "parent" | "warden" | "security"
  studentId?: string // For students
  parentIds?: string[] // For students - references to parent User IDs
  childIds?: string[] // For parents - references to student User IDs
  roomNumber?: string // For students
  phoneNumber?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "parent", "warden", "security"],
      required: true,
    },
    studentId: {
      type: String,
      sparse: true,
    },
    parentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    childIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    roomNumber: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
