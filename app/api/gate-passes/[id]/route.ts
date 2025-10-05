import { type NextRequest, NextResponse } from "next/server";
import connectDB from "@/server/config/database";
import GatePass from "@/server/models/GatePass";
import User from "@/server/models/User";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    // Fix: Extract the ID from the request URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Define which statuses are accessible to security personnel
    const allowedStatusesForSecurity = ["approved", "active", "completed"];

    const gatePassQuery: any = { _id: id };

    // If the user is a security guard, restrict the query to allowed statuses
    if (user.role === 'security') {
      gatePassQuery.status = { $in: allowedStatusesForSecurity };
    }

    const gatePass = await GatePass.findOne(gatePassQuery)
      .populate("studentId", "name studentId email roomNumber")
      .populate("parentApprovals.parentId", "name email phoneNumber");

    if (!gatePass) {
      return NextResponse.json({ error: "Gate pass not found or you don't have permission to view it." }, { status: 404 });
    }

    // Ensure students can only view their own gate passes
    if (user.role === 'student' && gatePass.studentId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden: You can only view your own gate passes." }, { status: 403 });
    }

    return NextResponse.json({ gatePass });
  } catch (error) {
    console.error("[v0] Error fetching gate pass:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}