import { NextRequest, NextResponse } from "next/server";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";
import { UserRole } from "@/lib/roles";

/**
 * GET /api/manage/overview
 *
 * Returns role-scoped overview data for the manage dashboard
 * Scoped by:
 * - PROGRAMME_COORDINATOR / PROGRAMME_EXAM_OFFICER: Programme-level data
 * - HOD: Department-level data
 * - FACILITATOR / ETUTOR: Assigned courses only
 *
 * NOTE: Currently returns mock data. TODO: Implement actual database queries.
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const userRole = user.role as UserRole;

    // Check if user has permission to access manage dashboard
    if (!hasPermission(userRole, "manage.view")) {
      return createAuthErrorResponse(
        "You don't have permission to access the management dashboard",
        403
      );
    }

    // Fetch role-scoped data
    // TODO: Implement actual database queries with correct Prisma schema field names
    // For now, return mock data to allow testing of the UI
    let overviewData: any = {
      role: userRole,
      coursesCount: 0,
      studentsCount: 0,
      pendingApprovals: 0,
      resultsEntered: 0,
      pendingResults: 0,
      recentActivity: [],
    };

    // Programme Coordinator: Programme-scoped data
    if (userRole === "PROGRAMME_COORDINATOR") {
      overviewData = {
        ...overviewData,
        coursesCount: 12,
        activeCourses: 10,
        studentsCount: 156,
        pendingApprovals: 8,
        staffCount: 15,
        resultsEntered: 245,
        programmeName: "Computer Science Programme",
        totalResults: 300,
      };
    }
    // Programme Exam Officer: Programme-scoped results data
    else if (userRole === "PROGRAMME_EXAM_OFFICER") {
      overviewData = {
        ...overviewData,
        studentsCount: 156,
        pendingResults: 23,
        programmeName: "Computer Science Programme",
      };
    }
    // HOD: Department-scoped data
    else if (userRole === "HOD") {
      overviewData = {
        ...overviewData,
        coursesCount: 28,
        activeCourses: 24,
        studentsCount: 342,
        pendingApprovals: 15,
        resultsEntered: 450,
        totalResults: 550,
      };
    }
    // Facilitator / E-Tutor: Assigned courses only
    else if (userRole === "FACILITATOR" || userRole === "ETUTOR") {
      overviewData = {
        ...overviewData,
        coursesCount: 3,
        assignedCourses: 3,
        studentsCount: 45,
        activeStudents: 42,
        pendingApprovals: 5,
        resultsEntered: 38,
        totalResults: 45,
      };
    }

    // Mock recent activity based on role
    overviewData.recentActivity = [
      {
        type: "approval",
        title: "Course Registration Approved",
        description: "5 student registrations approved for Advanced Database Systems",
        time: "2 hours ago",
      },
      {
        type: "result",
        title: "Results Submitted",
        description: "Midterm results submitted for Web Development",
        time: "5 hours ago",
      },
      {
        type: "assignment",
        title: "New Staff Assigned",
        description: "Dr. Smith assigned to teach Data Structures",
        time: "1 day ago",
      },
    ];

    return createSuccessResponse(overviewData, user);
  } catch (error) {
    console.error("Error in manage overview API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch manage overview data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
