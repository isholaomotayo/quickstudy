import { NextRequest } from "next/server";
import {
  createJsonResponse,
  createAuthErrorResponse,
  authenticateUserWithPermissions,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await authenticateUserWithPermissions();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  try {
    const { id } = await params;
    const studentId = parseInt(id);

    // Get student results with published set as true
    const studentResults = await prisma.student_result.findMany({
      where: {
        publish: true,
        student_course: {
          student_id: studentId,
        },
      },
      include: {
        grade: true,
        student_course: {
          include: {
            student: true,
            course: true,
            level: true,
            semester: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    // Transform snake_case to camelCase for frontend compatibility
    const transformedResults = studentResults.map((result) => ({
      ...result,
      studentcourse: result.student_course,
      student_course: undefined,
    }));

    return createJsonResponse(transformedResults);
  } catch (error) {
    console.error("Error fetching student results:", error);
    return createAuthErrorResponse("Failed to fetch student results", 500);
  }
}
