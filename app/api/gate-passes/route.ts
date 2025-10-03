import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/server/config/database"
import GatePass from "@/server/models/GatePass"
import User from "@/server/models/User"
import { generateApprovalToken, getTokenExpirationTime } from "@/server/utils/token"
import { auth } from "@clerk/nextjs/server"

// GET - Fetch gate passes based on user role
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    let gatePasses

    switch (user.role) {
      case "student":
        gatePasses = await GatePass.find({ studentId: user._id })
          .populate("studentId", "name studentId email")
          .sort({ createdAt: -1 })
        break

      case "parent":
        // Find gate passes where this parent needs to approve
        gatePasses = await GatePass.find({
          "parentApprovals.parentId": user._id,
        })
          .populate("studentId", "name studentId email")
          .sort({ createdAt: -1 })
        break

      case "warden":
        gatePasses = await GatePass.find()
          .populate("studentId", "name studentId email roomNumber")
          .sort({ createdAt: -1 })
        break

      case "security":
        gatePasses = await GatePass.find({
          status: { $in: ["approved", "active"] },
        })
          .populate("studentId", "name studentId email")
          .sort({ createdAt: -1 })
        break

      default:
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    return NextResponse.json({ gatePasses })
  } catch (error) {
    console.error("[v0] Error fetching gate passes:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new gate pass (students only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    if (!user || user.role !== "student") {
      return NextResponse.json({ error: "Only students can create gate passes" }, { status: 403 })
    }

    const { reason, destination, departureTime, expectedReturnTime } = await request.json()

    // Validate required fields
    if (!reason || !destination || !departureTime || !expectedReturnTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get parent IDs
    if (!user.parentIds || user.parentIds.length === 0) {
      return NextResponse.json({ error: "No parents linked to your account" }, { status: 400 })
    }

    // Create parent approvals with tokens
    const parentApprovals = user.parentIds.map((parentId) => ({
      parentId,
      status: "pending",
      token: generateApprovalToken(),
      expiresAt: getTokenExpirationTime(),
    }))

    // Create gate pass
    const gatePass = new GatePass({
      studentId: user._id,
      reason,
      destination,
      departureTime: new Date(departureTime),
      expectedReturnTime: new Date(expectedReturnTime),
      parentApprovals,
      currentApprovalIndex: 0,
    })

    await gatePass.save()

    return NextResponse.json(
      {
        message: "Gate pass created successfully",
        gatePass,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error creating gate pass:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
