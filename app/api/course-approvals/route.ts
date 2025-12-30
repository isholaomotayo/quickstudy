import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hasAnyRole, UserRole, ROLE_GROUPS } from "@/lib/roles";


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

    // Check if user can approve course registrations
    if (
      !hasAnyRole(userRole, [
        "SUPERADMIN",
        "SYSADMIN",
        "ADMIN",
        "PROGRAMME_COORDINATOR",
        "HOD",
        "FACILITATOR",
        "ETUTOR",
      ])
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to view course approvals",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";
    const programme = searchParams.get("programme") || "all";
    const priority = searchParams.get("priority") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    // Build where clause based on user role and filters
    let whereClause: any = {};

    // Role-based data filtering
    if (userRole === "PROGRAMME_COORDINATOR") {
      // Filter by programme - get student's programme through student relation
      whereClause.student = {
        programme_id: userData.programme_id || 1, // Default programme if not set
      };
    } else if (userRole === "HOD") {
      // Filter by department - get through programme->department relation
      whereClause.student = {
        programme: {
          department_id: userData.department_id || 1, // Default department if not set
        },
      };
    } else if (["FACILITATOR", "ETUTOR"].includes(userRole)) {
      // Filter by assigned courses - would need staff_course table join
      // For now, we'll get all and filter by institution
      whereClause.student = {
        user_student_user_idTouser: {
          institution_id: userData.institution_id,
        },
      };
    } else if (userRole === "ADMIN") {
      // Institution-wide access
      whereClause.student = {
        user_student_user_idTouser: {
          institution_id: userData.institution_id,
        },
      };
    }
    // SUPERADMIN and SYSADMIN get all data (no additional filters)

    // Status filters
    if (status !== "all") {
      if (status === "pending") {
        whereClause.approval_status = false;
      } else if (status === "approved") {
        whereClause.approval_status = true;
      }
    }

    // Programme filter
    if (programme !== "all") {
      whereClause.student = {
        ...whereClause.student,
        programme: {
          name: programme,
        },
      };
    }

    // Search filter
    if (search) {
      whereClause.OR = [
        {
          student: {
            user_student_user_idTouser: {
              OR: [
                { first_name: { contains: search, mode: "insensitive" } },
                { last_name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            },
          },
        },
        {
          course: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { code: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.student_course.count({
      where: whereClause,
    });

    // Fetch student course registrations with related data
    const studentCourses = await prisma.student_course.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      include: {
        student: {
          include: {
            user_student_user_idTouser: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
            programme: {
              include: {
                department: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        course: {
          select: {
            id: true,
            code: true,
            name: true,
            units: true,
          },
        },
        semester: {
          select: {
            id: true,
            name: true,
          },
        },
        user_student_course_created_byTouser: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
        user_student_course_updated_byTouser: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Transform data to match frontend interface
    const registrations = studentCourses.map((sc) => {
      const student = sc.student;
      const course = sc.course;
      const user = student?.user_student_user_idTouser;
      const programme = student?.programme;
      const department = programme?.department;

      // Determine status based on approval_status field
      let status = "PENDING";
      if (sc.approval_status === true) {
        status = "APPROVED";
      } else if (sc.approval_status === false) {
        status = "PENDING";
      }

      // Determine priority (mock logic - could be based on course level, deadlines, etc.)
      let priority = "MEDIUM";
      if (course?.code?.includes("101") || course?.code?.includes("100")) {
        priority = "HIGH"; // First year courses get high priority
      } else if (
        course?.code?.includes("301") ||
        course?.code?.includes("400")
      ) {
        priority = "LOW"; // Final year courses get lower priority
      }

      return {
        id: sc.id.toString(),
        studentId: student?.id?.toString() || "",
        studentName: user ? `${user.first_name} ${user.last_name}` : "Unknown",
        studentEmail: user?.email || "",
        courseId: course?.id?.toString() || "",
        courseName: course?.name || "Unknown Course",
        courseCode: course?.code || "",
        programme: programme?.name || "Unknown Programme",
        department: department?.name || "Unknown Department",
        semester: sc.semester?.name || "Unknown Semester",
        status,
        registeredBy: sc.user_student_course_created_byTouser
          ? `${sc.user_student_course_created_byTouser.first_name} ${sc.user_student_course_created_byTouser.last_name}`
          : "System",
        registeredAt: sc.created_at.toISOString(),
        approvedBy:
          sc.user_student_course_updated_byTouser && sc.approval_status
            ? `${sc.user_student_course_updated_byTouser.first_name} ${sc.user_student_course_updated_byTouser.last_name}`
            : undefined,
        approvedAt: sc.approval_status
          ? sc.updated_at.toISOString()
          : undefined,
        priority,
      };
    });

    // Calculate statistics from all data (not just current page)
    const allStatistics = await Promise.all([
      prisma.student_course.count({ where: { ...whereClause } }), // total
      prisma.student_course.count({
        where: { ...whereClause, approval_status: false },
      }), // pending
      prisma.student_course.count({
        where: { ...whereClause, approval_status: true },
      }), // approved
      // For rejected, we'll need to add a rejection field or use a different approach
      // For now, set to 0 as we don't have explicit rejection tracking
    ]);

    const statistics = {
      total: allStatistics[0],
      pending: allStatistics[1],
      approved: allStatistics[2],
      rejected: 0, // Will need schema change to track rejections properly
      awaitingApproval: allStatistics[1], // Same as pending for now
    };

    // Get available programmes for dropdown (based on role scope)
    let availableProgrammes: Array<{ id: number; name: string }> = [];
    if (userRole === "PROGRAMME_COORDINATOR") {
      // Only show their assigned programme
      availableProgrammes = await prisma.programme.findMany({
        where: { id: userData.programme_id || 1 },
        select: { id: true, name: true },
      });
    } else if (userRole === "HOD") {
      // Show programmes in their department
      availableProgrammes = await prisma.programme.findMany({
        where: { department_id: userData.department_id || 1 },
        select: { id: true, name: true },
      });
    } else if (userRole === "ADMIN") {
      // Show programmes in their institution
      availableProgrammes = await prisma.programme.findMany({
        where: {
          department: {
            faculty: {
              institution_id: userData.institution_id,
            },
          },
        },
        select: { id: true, name: true },
      });
    } else if (["SUPERADMIN", "SYSADMIN"].includes(userRole)) {
      // Show all programmes
      availableProgrammes = await prisma.programme.findMany({
        select: { id: true, name: true },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        registrations,
        statistics,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          limit,
        },
        availableProgrammes,
        permissions: {
          canApprove: hasAnyRole(userRole, [
            "SUPERADMIN",
            "SYSADMIN",
            "ADMIN",
            "PROGRAMME_COORDINATOR",
            "HOD",
            "FACILITATOR",
            "ETUTOR",
          ]),
          canReject: hasAnyRole(userRole, [
            "SUPERADMIN",
            "SYSADMIN",
            "ADMIN",
            "PROGRAMME_COORDINATOR",
            "HOD",
          ]),
          scope: getUserScope(userRole),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching course approvals:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
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

    // Check approval permissions
    if (
      !hasAnyRole(userRole, [
        "SUPERADMIN",
        "SYSADMIN",
        "ADMIN",
        "PROGRAMME_COORDINATOR",
        "HOD",
        "FACILITATOR",
        "ETUTOR",
      ])
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to approve course registrations",
        },
        { status: 403 }
      );
    }

    const { action, registrationId, rejectionReason } = await request.json();

    if (action === "approve") {
      const updatedRegistration = await prisma.student_course.update({
        where: {
          id: BigInt(registrationId),
        },
        data: {
          approval_status: true,
          cleared: true,
          updated_by: BigInt(userData.id),
          updated_at: new Date(),
        },
        include: {
          student: {
            include: {
              user_student_user_idTouser: {
                select: {
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
            },
          },
          course: {
            select: {
              name: true,
              code: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Course registration approved successfully",
        data: {
          id: updatedRegistration.id.toString(),
          status: "APPROVED",
          approvedBy: `${userData.first_name} ${userData.last_name}`,
          approvedAt: updatedRegistration.updated_at.toISOString(),
        },
      });
    } else if (action === "reject") {
      // For now, we'll mark as not approved and not cleared
      // In the future, you might want a separate rejected status or reason field
      const updatedRegistration = await prisma.student_course.update({
        where: {
          id: BigInt(registrationId),
        },
        data: {
          approval_status: false,
          cleared: false,
          updated_by: BigInt(userData.id),
          updated_at: new Date(),
          // Note: rejectionReason would need a new field in the schema
        },
      });

      return NextResponse.json({
        success: true,
        message: "Course registration rejected",
        data: {
          id: updatedRegistration.id.toString(),
          status: "REJECTED",
          rejectedBy: `${userData.first_name} ${userData.last_name}`,
          rejectedAt: updatedRegistration.updated_at.toISOString(),
          rejectionReason,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid action",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing course approval:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
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
      return "programme";
    case "HOD":
      return "department";
    case "FACILITATOR":
    case "ETUTOR":
      return "assigned_courses";
    default:
      return "none";
  }
}
