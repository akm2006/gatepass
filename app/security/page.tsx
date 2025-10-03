import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-utils"
import connectDB from "@/server/config/database"
import GatePass from "@/server/models/GatePass"
import { SecurityDashboard } from "@/components/security/security-dashboard"

export default async function SecurityPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "security") {
    redirect("/dashboard")
  }

  await connectDB()

  // Get approved and active gate passes
  const gatePasses = await GatePass.find({
    status: { $in: ["approved", "active"] },
  })
    .populate("studentId", "name studentId email roomNumber")
    .sort({ createdAt: -1 })
    .lean()

  return (
    <SecurityDashboard user={JSON.parse(JSON.stringify(user))} gatePasses={JSON.parse(JSON.stringify(gatePasses))} />
  )
}
