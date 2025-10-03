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
      return NextResponse.json({ error: "Only wardens can unlink parents" }, { status: 403 })
    }

    const { studentId, parentId } = await request.json()

    const student = await User.findById(studentId)
    if (!student || student.role !== "student") {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const parent = await User.findById(parentId)
    if (!parent || parent.role !== "parent") {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 })
    }

    // Unlink parent from student
    student.parentIds = student.parentIds?.filter((id: any) => id.toString() !== parent._id.toString()) || []
    await student.save()

    // Unlink student from parent
    parent.childIds = parent.childIds?.filter((id: any) => id.toString() !== student._id.toString()) || []
    await parent.save()

    return NextResponse.json({ message: "Parent unlinked successfully" })
  } catch (error) {
    console.error("[v0] Error unlinking parent:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
