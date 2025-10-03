import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-utils"
import connectDB from "@/server/config/database"
import GatePass from "@/server/models/GatePass"
import { ParentDashboard } from "@/components/parent/parent-dashboard"

export default async function ParentPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "parent") {
    redirect("/dashboard")
  }

  await connectDB()

  // Find gate passes where this parent needs to approve
  const gatePasses = await GatePass.find({
    "parentApprovals.parentId": user._id,
  })
    .populate("studentId", "name studentId email roomNumber")
    .populate("parentApprovals.parentId", "name email")
    .sort({ createdAt: -1 })
    .lean()

  return <ParentDashboard user={JSON.parse(JSON.stringify(user))} gatePasses={JSON.parse(JSON.stringify(gatePasses))} />
}
