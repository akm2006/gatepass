import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/server/config/database"
import User from "@/server/models/User"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const currentUser = await User.findOne({ clerkId: userId })
    if (!currentUser || currentUser.role !== "warden") {
      return NextResponse.json({ error: "Only wardens can link parents" }, { status: 403 })
    }

    const { studentId, parentEmail } = await request.json()

    const student = await User.findById(studentId)
    if (!student || student.role !== "student") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const parent = await User.findOne({ email: parentEmail, role: "parent" })
    if (!parent) {
      return NextResponse.json({ error: "Parent account not found with this email" }, { status: 404 })
    }

    // Check if already linked
    if (student.parentIds?.some((id: any) => id.toString() === parent._id.toString())) {
      return NextResponse.json({ error: "Parent is already linked to this student" }, { status: 400 })
    }

    // Link parent to student
    student.parentIds = student.parentIds || []
    student.parentIds.push(parent._id)
    await student.save()

    // Link student to parent
    parent.childIds = parent.childIds || []
    parent.childIds.push(student._id)
    await parent.save()

    return NextResponse.json({ message: "Parent linked successfully" })
  } catch (error) {
    console.error("[v0] Error linking parent:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
