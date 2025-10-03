import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-utils"
import connectDB from "@/server/config/database"
import GatePass from "@/server/models/GatePass"
import { StudentDashboard } from "@/components/student/student-dashboard"

export default async function StudentPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "student") {
    redirect("/dashboard")
  }

  await connectDB()
  const gatePasses = await GatePass.find({ studentId: user._id })
    .populate("parentApprovals.parentId", "name email")
    .sort({ createdAt: -1 })
    .lean()

  return (
    <StudentDashboard user={JSON.parse(JSON.stringify(user))} gatePasses={JSON.parse(JSON.stringify(gatePasses))} />
  )
}
