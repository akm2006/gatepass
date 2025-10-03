import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-utils"
import connectDB from "@/server/config/database"
import GatePass from "@/server/models/GatePass"
import User from "@/server/models/User"
import { WardenDashboard } from "@/components/warden/warden-dashboard"

export default async function WardenPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "warden") {
    redirect("/dashboard")
  }

  await connectDB()

  const gatePasses = await GatePass.find()
    .populate("studentId", "name studentId email roomNumber")
    .populate("parentApprovals.parentId", "name email phoneNumber")
    .sort({ createdAt: -1 })
    .lean()

  const students = await User.find({ role: "student" })
    .populate("parentIds", "name email phoneNumber")
    .sort({ name: 1 })
    .lean()

  return (
    <WardenDashboard
      user={JSON.parse(JSON.stringify(user))}
      gatePasses={JSON.parse(JSON.stringify(gatePasses))}
      students={JSON.parse(JSON.stringify(students))}
    />
  )
}
