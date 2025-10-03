import mongoose, { Schema, type Document } from "mongoose"

export interface IParentApproval {
  parentId: mongoose.Types.ObjectId
  status: "pending" | "approved" | "rejected" | "expired"
  token: string
  respondedAt?: Date
  expiresAt: Date
}

export interface IGatePass extends Document {
  studentId: mongoose.Types.ObjectId
  reason: string
  destination: string
  departureTime: Date
  expectedReturnTime: Date
  status: "pending" | "approved" | "rejected" | "expired" | "active" | "completed"
  parentApprovals: IParentApproval[]
  currentApprovalIndex: number
  wardenApproved: boolean
  wardenNotes?: string
  qrCode?: string
  checkOutTime?: Date
  checkInTime?: Date
  securityGuardCheckOut?: mongoose.Types.ObjectId
  securityGuardCheckIn?: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const ParentApprovalSchema: Schema = new Schema({
  parentId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "expired"],
    default: "pending",
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  respondedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
})

const GatePassSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    expectedReturnTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "expired", "active", "completed"],
      default: "pending",
    },
    parentApprovals: [ParentApprovalSchema],
    currentApprovalIndex: {
      type: Number,
      default: 0,
    },
    wardenApproved: {
      type: Boolean,
      default: false,
    },
    wardenNotes: {
      type: String,
    },
    qrCode: {
      type: String,
    },
    checkOutTime: {
      type: Date,
    },
    checkInTime: {
      type: Date,
    },
    securityGuardCheckOut: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    securityGuardCheckIn: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.GatePass || mongoose.model<IGatePass>("GatePass", GatePassSchema)
