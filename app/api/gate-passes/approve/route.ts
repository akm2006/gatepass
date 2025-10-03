import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/server/config/database"
import GatePass from "@/server/models/GatePass"
import User from "@/server/models/User"
import { isTokenExpired } from "@/server/utils/token"
import { generateQRCodeData } from "@/server/utils/qrcode"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    if (!user || user.role !== "parent") {
      return NextResponse.json({ error: "Only parents can approve gate passes" }, { status: 403 })
    }

    const { gatePassId, action } = await request.json()

    if (!gatePassId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const gatePass = await GatePass.findById(gatePassId)
    if (!gatePass) {
      return NextResponse.json({ error: "Gate pass not found" }, { status: 404 })
    }

    // Find the current parent approval
    const currentApproval = gatePass.parentApprovals[gatePass.currentApprovalIndex]

    if (!currentApproval || currentApproval.parentId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Not authorized to approve this gate pass" }, { status: 403 })
    }

    // Check if token is expired
    if (isTokenExpired(currentApproval.expiresAt)) {
      currentApproval.status = "expired"
      gatePass.status = "expired"
      await gatePass.save()
      return NextResponse.json({ error: "Approval token has expired" }, { status: 400 })
    }

    // Update approval status
    currentApproval.status = action === "approve" ? "approved" : "rejected"
    currentApproval.respondedAt = new Date()

    if (action === "reject") {
      gatePass.status = "rejected"
      await gatePass.save()
      return NextResponse.json({
        message: "Gate pass rejected",
        gatePass,
      })
    }

    // If approved, move to next parent or mark as fully approved
    if (gatePass.currentApprovalIndex < gatePass.parentApprovals.length - 1) {
      gatePass.currentApprovalIndex += 1
      await gatePass.save()
      return NextResponse.json({
        message: "Approved. Waiting for next parent approval.",
        gatePass,
      })
    } else {
      // All parents approved - generate QR code
      gatePass.status = "approved"
      gatePass.qrCode = generateQRCodeData(gatePass._id.toString())
      await gatePass.save()
      return NextResponse.json({
        message: "Gate pass fully approved!",
        gatePass,
      })
    }
  } catch (error) {
    console.error("[v0] Error approving gate pass:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
