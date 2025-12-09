import { NextRequest } from "next/server";
import {
  createJsonResponse,
  createAuthErrorResponse,
  authenticateUser,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";

// Helper function to calculate student current level
async function calculateStudentCurrentLevel(
  studentId: bigint,
  semesterAdmittedId: number,
  entryLevelId: number,
  institutionId: number
) {
  try {
    // Get current active semester
    const currentSemester = await prisma.semester.findFirst({
      where: {
        is_active: true,
        institution_id: institutionId,
      },
    });

    if (!currentSemester) {
      throw new Error("No active semester found");
    }

    const currentSemesterId = Number(currentSemester.id);

    // Calculate level progression based on semesters
    const semestersDifference = currentSemesterId - semesterAdmittedId;
    const calculatedLevelId = Math.max(
      1,
      entryLevelId + Math.floor(semestersDifference / 2)
    );

    // Validate against actual levels in database
    const validLevels = await prisma.level.findMany();
    const validLevelIds = validLevels.map((level) => Number(level.id));

    let finalLevelId: number;
    if (validLevelIds.includes(calculatedLevelId)) {
      finalLevelId = calculatedLevelId;
    } else {
      // Find closest valid level ID
      finalLevelId = validLevelIds.reduce((closest, levelId) => {
        return Math.abs(levelId - calculatedLevelId) <
          Math.abs(closest - calculatedLevelId)
          ? levelId
          : closest;
      }, validLevelIds[0]);

      console.warn(
        `Student ${studentId}: Calculated level ID ${calculatedLevelId} not found in database, using ${finalLevelId}`
      );
    }

    return {
      levelId: finalLevelId,
      levelDisplay: finalLevelId * 100, // Display format (100, 200, 300, etc.)
      currentSemesterId: currentSemesterId,
      semesterName: currentSemester.name,
    };
  } catch (error) {
    console.error("Error calculating student level:", error);

    // Fallback to entry level
    return {
      levelId: entryLevelId,
      levelDisplay: entryLevelId * 100,
      currentSemesterId: null,
      semesterName: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function GET(req: NextRequest) {
  const authResult = await authenticateUser();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;

  // Only students can access this endpoint
  if (user.role !== "STUDENT") {
    return createAuthErrorResponse("Access denied. Students only.", 403);
  }

  try {
    // Get student info
    const student = await prisma.student.findFirst({
      where: {
        user_id: BigInt(user.id),
      },
    });

    if (!student) {
      return createAuthErrorResponse("Student record not found", 404);
    }

    // Get programme name separately
    let programmeName: string | null = null;
    if (student.programme_id) {
      const programme = await prisma.programme.findFirst({
        where: { id: student.programme_id },
      });
      programmeName = programme?.name || null;
    }

    // Add programme name to student data
    const studentData: any = {
      ...student,
      programme_name: programmeName,
    };

    // Get current active semester
    const currentSemester = await prisma.semester.findFirst({
      where: {
        is_active: true,
        institution_id: user.institution_id,
      },
    });

    // Calculate current level using centralized service
    const levelInfo = await calculateStudentCurrentLevel(
      student.id,
      Number(student.semester_admitted_id),
      Number(student.entry_level_id),
      user.institution_id
    );

    studentData.current_semester =
      levelInfo.semesterName || currentSemester?.name;
    studentData.current_level_id = levelInfo.levelId;
    studentData.current_level = levelInfo.levelDisplay;

    // Get student GPAs with class_degree
    const studentGpas = await prisma.student_gpa.findMany({
      where: {
        student_id: student.id,
      },
      include: {
        class_degree: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
    });

    const studentGpa =
      studentGpas.length > 0 ? studentGpas[studentGpas.length - 1] : null;

    // Get all student courses
    const allStudentCourses = await prisma.student_course.findMany({
      where: {
        student_id: student.id,
      },
      include: {
        student: true,
        course: true,
        semester: true,
      },
    });

    // Calculate registration sizes
    const approvedRegistrations = allStudentCourses.filter(
      (sc) => sc.approval_status === true
    );
    const unApprovedRegistrations = allStudentCourses.filter(
      (sc) => sc.approval_status !== true
    );

    const approvedRegistrationsSize = approvedRegistrations.length;
    const unApprovedRegistrationsSize = unApprovedRegistrations.length;

    // Get student results
    let allStudentResult: any[] = [];
    if (allStudentCourses.length > 0) {
      const courseIds = allStudentCourses.map((course) => course.id);

      const rawResults = await prisma.student_result.findMany({
        where: {
          publish: true,
          student_course_id: {
            in: courseIds,
          },
        },
        include: {
          grade: true,
          student_course: {
            include: {
              course: true,
              semester: true,
            },
          },
        },
      });

      // Transform snake_case to camelCase for frontend compatibility
      allStudentResult = rawResults.map((result) => ({
        ...result,
        studentcourse: result.student_course,
        student_course: undefined,
      }));
    }

    // Check if student is admitted to a future session
    let isFutureStudent = false;
    let admittedSession: any = null;

    if (student.session_admitted_id) {
      try {
        const currentSession = await prisma.session.findFirst({
          where: { is_active: true },
        });

        if (currentSession && student.session_admitted_id > currentSession.id) {
          isFutureStudent = true;
          // Fetch the student's admitted session details
          const studentSession = await prisma.session.findFirst({
            where: {
              id: student.session_admitted_id,
            },
          });
          if (studentSession) {
            admittedSession = studentSession;
          }
        }
      } catch (error) {
        console.error("Error checking future student status:", error);
      }
    }

    // Return dashboard data without duplicating student in userData
    return createJsonResponse({
      student: studentData,
      studentGpa,
      allStudentResult,
      approvedRegistrationsSize,
      unApprovedRegistrationsSize,
      userData: {
        id: user.id,
        email: user.email,
        role: user.role,
        institution_id: user.institution_id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
      },
      isFutureStudent,
      admittedSession,
    });
  } catch (error) {
    console.error("Error fetching student dashboard:", error);
    return createAuthErrorResponse("Failed to fetch dashboard data", 500);
  }
}
