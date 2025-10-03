import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/server/config/database"
import GatePass from "@/server/models/GatePass"
import User from "@/server/models/User"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ clerkId: userId })
    if (!user || user.role !== "security") {
      return NextResponse.json({ error: "Only security guards can check out students" }, { status: 403 })
    }

    const { gatePassId } = await request.json()

    const gatePass = await GatePass.findById(gatePassId)
    if (!gatePass) {
      return NextResponse.json({ error: "Gate pass not found" }, { status: 404 })
    }

    if (gatePass.status !== "approved") {
      return NextResponse.json({ error: "Gate pass is not approved" }, { status: 400 })
    }

    gatePass.status = "active"
    gatePass.checkOutTime = new Date()
    gatePass.securityGuardCheckOut = user._id
    await gatePass.save()

    return NextResponse.json({
      message: "Student checked out successfully",
      gatePass,
    })
  } catch (error) {
    console.error("[v0] Error checking out:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
