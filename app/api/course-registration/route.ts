import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hasAnyRole, UserRole, ROLE_GROUPS } from "@/lib/roles";

interface CourseRegistrationRequest {
  studentId: string;
  courseId: string;
  action: "register" | "approve" | "reject";
}

// interface CourseRegistrationResponse {
//   success: boolean;
//   message: string;
//   data?: any;
// }

async function getUserRole(): Promise<UserRole | null> {
  try {
    const cookieStore = await cookies();
    const role = cookieStore.get("role")?.value;
    return (role as UserRole) || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

async function getUserData() {
  try {
    const cookieStore = await cookies();
    const userData = cookieStore.get("userData")?.value;
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const userRole = await getUserRole();
    const userData = await getUserData();

    if (!userRole || !userData) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const body: CourseRegistrationRequest = await request.json();
    const { action } = body;
    // const { studentId, courseId } = body; // Commented out unused variables

    // Role-based access control for different actions
    switch (action) {
      case "register":
        // Only SysAdmins and Programme Coordinators can register students for courses
        if (
          !hasAnyRole(userRole, [
            "SUPERADMIN",
            "SYSADMIN",
            "PROGRAMME_COORDINATOR",
          ])
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "You do not have permission to register students for courses",
            },
            { status: 403 }
          );
        }

        // Implement course registration logic here
        // This would involve:
        // 1. Check if student exists and is active
        // 2. Check if course exists and is available
        // 3. Check programme coordinator scope (if PROGRAMME_COORDINATOR)
        // 4. Create course_registration record with status 'REGISTERED'

        return NextResponse.json({
          success: true,
          message: `Student successfully registered for course. Pending approval.`,
          data: {
            registrationId: "mock-registration-id",
            status: "REGISTERED",
            requiresApproval: true,
          },
        });

      case "approve":
        // Check if user has course approval access
        if (!hasAnyRole(userRole, [...ROLE_GROUPS.COURSE_APPROVAL])) {
          return NextResponse.json(
            {
              success: false,
              message:
                "You do not have permission to approve course registrations",
            },
            { status: 403 }
          );
        }

        // Additional scope checks for different roles
        if (userRole === "PROGRAMME_EXAM_OFFICER") {
          return NextResponse.json(
            {
              success: false,
              message:
                "Programme Exam Officers cannot approve course registrations, only manage results",
            },
            { status: 403 }
          );
        }

        // Implement approval logic here
        // This would involve:
        // 1. Update course_registration status to 'APPROVED'
        // 2. Set approved_by and approved_at fields
        // 3. Enable student access to course content and assessments

        return NextResponse.json({
          success: true,
          message: `Course registration approved successfully`,
          data: {
            status: "APPROVED",
            approvedBy: userData.id,
            approvedAt: new Date().toISOString(),
          },
        });

      case "reject":
        // Same permissions as approve
        if (!hasAnyRole(userRole, [...ROLE_GROUPS.COURSE_APPROVAL])) {
          return NextResponse.json(
            {
              success: false,
              message:
                "You do not have permission to reject course registrations",
            },
            { status: 403 }
          );
        }

        if (userRole === "PROGRAMME_EXAM_OFFICER") {
          return NextResponse.json(
            {
              success: false,
              message:
                "Programme Exam Officers cannot reject course registrations",
            },
            { status: 403 }
          );
        }

        // Implement rejection logic here
        return NextResponse.json({
          success: true,
          message: `Course registration rejected`,
          data: {
            status: "REJECTED",
            rejectedBy: userData.id,
            rejectedAt: new Date().toISOString(),
          },
        });

      default:
        return NextResponse.json(
          {
            success: false,
            message: "Invalid action specified",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Course registration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userRole = await getUserRole();
    const userData = await getUserData();

    if (!userRole || !userData) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    // const programmeId = searchParams.get('programmeId'); // Commented out unused variable
    // const status = searchParams.get('status') || 'all'; // Commented out unused variable

    // Role-based data access - Mock data for demonstration
    const registrations: Array<{
      id: string;
      studentName: string;
      courseName: string;
      programme: string;
      status: string;
      registeredAt: string;
    }> = [];

    if (hasAnyRole(userRole, ["SUPERADMIN", "SYSADMIN"])) {
      // Full access - can see all registrations across all institutions
      registrations.push({
        id: "1",
        studentName: "John Doe",
        courseName: "Computer Science 101",
        programme: "Computer Science",
        status: "PENDING",
        registeredAt: "2024-01-15T10:30:00Z",
      });
    } else if (userRole === "ADMIN") {
      // Institution-wide access
      registrations.push({
        id: "2",
        studentName: "Jane Smith",
        courseName: "Mathematics 201",
        programme: "Mathematics",
        status: "APPROVED",
        registeredAt: "2024-01-14T09:15:00Z",
      });
    } else if (userRole === "PROGRAMME_COORDINATOR") {
      // Programme-specific access
      registrations.push({
        id: "3",
        studentName: "Bob Johnson",
        courseName: "Physics 301",
        programme: "Physics",
        status: "REGISTERED",
        registeredAt: "2024-01-13T14:20:00Z",
      });
    } else if (hasAnyRole(userRole, ["FACILITATOR", "ETUTOR"])) {
      // Course-specific access based on assigned courses
      registrations.push({
        id: "4",
        studentName: "Alice Brown",
        courseName: "Chemistry 101",
        programme: "Chemistry",
        status: "APPROVED",
        registeredAt: "2024-01-12T11:45:00Z",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to view course registrations",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        registrations,
        permissions: {
          canRegister: hasAnyRole(userRole, [
            "SUPERADMIN",
            "SYSADMIN",
            "PROGRAMME_COORDINATOR",
          ]),
          canApprove:
            hasAnyRole(userRole, [...ROLE_GROUPS.COURSE_APPROVAL]) &&
            userRole !== "PROGRAMME_EXAM_OFFICER",
          canViewAll: hasAnyRole(userRole, ["SUPERADMIN", "SYSADMIN", "ADMIN"]),
          scope: getUserScope(userRole),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching course registrations:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

function getUserScope(role: UserRole): string {
  switch (role) {
    case "SUPERADMIN":
    case "SYSADMIN":
      return "global";
    case "ADMIN":
      return "institution";
    case "PROGRAMME_COORDINATOR":
    case "PROGRAMME_EXAM_OFFICER":
      return "programme";
    case "HOD":
      return "department";
    case "FACILITATOR":
    case "ETUTOR":
    case "STAFF":
    case "LECTURER":
      return "assigned_courses";
    default:
      return "none";
  }
}
