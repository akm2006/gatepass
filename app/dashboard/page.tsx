import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import connectDB from "@/server/config/database"
import User from "@/server/models/User"

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  await connectDB()
  const user = await User.findOne({ clerkId: userId })

  if (!user) {
    redirect("/onboarding")
  }

  // Redirect to role-specific dashboard
  switch (user.role) {
    case "student":
      redirect("/student")
    case "parent":
      redirect("/parent")
    case "warden":
      redirect("/warden")
    case "security":
      redirect("/security")
    default:
      redirect("/onboarding")
  }
}
