import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/server/config/database"
import User from "@/server/models/User"
import { auth, clerkClient } from "@clerk/nextjs/server"

// GET - Fetch current user
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findOne({ clerkId: userId })
      .populate("parentIds", "name email phoneNumber")
      .populate("childIds", "name email studentId")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create or update user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clerkClient()
    const clerkUser = await client.users.getUser(userId)
    const clerkEmail = clerkUser.emailAddresses[0]?.emailAddress

    await connectDB()

    const { email, name, role, studentId, roomNumber, phoneNumber } = await request.json()

    const userEmail = email || clerkEmail

    if (!userEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    let user = await User.findOne({ clerkId: userId })

    if (user) {
      // Update existing user
      user.email = userEmail
      user.name = name || user.name
      user.role = role || user.role
      user.studentId = studentId || user.studentId
      user.roomNumber = roomNumber || user.roomNumber
      user.phoneNumber = phoneNumber || user.phoneNumber
      await user.save()
    } else {
      // Create new user
      user = new User({
        clerkId: userId,
        email: userEmail,
        name,
        role,
        studentId,
        roomNumber,
        phoneNumber,
      })
      await user.save()
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Error creating/updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
