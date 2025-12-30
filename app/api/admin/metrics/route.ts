import { NextRequest, NextResponse } from "next/server";
import { getApiMetrics, getRecentApiLogs, getSlowApiRequests } from "@/lib/api-client";
import { authenticateUser } from "@/lib/api-auth";

/**
 * API endpoint to get API performance metrics
 * Only accessible to admins
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser();
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = authResult.user!;
    const allowedRoles = ["SUPERADMIN", "ADMIN"];
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const metrics = getApiMetrics();
    const recentLogs = getRecentApiLogs(50);
    const slowRequests = getSlowApiRequests();

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        recentLogs,
        slowRequests,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching API metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}


