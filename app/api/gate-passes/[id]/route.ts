import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/server/config/database"
import GatePass from "@/server/models/GatePass"
import { auth } from "@clerk/nextjs/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const gatePass = await GatePass.findById(params.id)
      .populate("studentId", "name studentId email roomNumber")
      .populate("parentApprovals.parentId", "name email phoneNumber")

    if (!gatePass) {
      return NextResponse.json({ error: "Gate pass not found" }, { status: 404 })
    }

    return NextResponse.json({ gatePass })
  } catch (error) {
    console.error("[v0] Error fetching gate pass:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
