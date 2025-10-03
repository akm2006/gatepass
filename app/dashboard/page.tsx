// app/dashboard/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/server/config/database";
import User, { type IUser } from "@/server/models/User";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }

  await connectDB();
  const user = (await User.findOne({ clerkId: userId }).lean<IUser>()) as IUser | null;
  if (!user) {
    return redirect("/onboarding");
  }

  switch (user.role) {
    case "student":
      return redirect("/student");
    case "parent":
      return redirect("/parent");
    case "warden":
      return redirect("/warden");
    case "security":
      return redirect("/security");
    default:
      return redirect("/onboarding");
  }
}
