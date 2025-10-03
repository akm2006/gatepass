import { auth } from "@clerk/nextjs/server"
import connectDB from "@/server/config/database"
import User from "@/server/models/User"

export async function getCurrentUser() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  await connectDB()
  const user = await User.findOne({ clerkId: userId })
    .populate("parentIds", "name email phoneNumber")
    .populate("childIds", "name email studentId")

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden")
  }

  return user
}
