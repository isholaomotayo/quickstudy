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

    const studentGpas = await prisma.student_gpa.findMany({
      where: {
        student_id: studentId,
      },
      include: {
        student: true,
        level: true,
        semester: true,
        class_degree: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    return createJsonResponse(studentGpas);
  } catch (error) {
    console.error("Error fetching student GPAs:", error);
    return createAuthErrorResponse("Failed to fetch student GPAs", 500);
  }
}
