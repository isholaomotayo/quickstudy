import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateUser, createAuthErrorResponse } from "@/lib/api-auth";

/**
 * GET /api/studenttest/new
 * Get list of student tests with course information
 * For students: returns their own tests
 * For admin/staff: returns all tests
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const userId = BigInt(user.id);

    let studentTests;

    if (user.role === "STUDENT") {
      // For students, get only their tests
      studentTests = await prisma.student_test.findMany({
        where: {
          user_id: userId,
        },
        select: {
          id: true,
          course_test_id: true,
          test_name: true,
          course_test: {
            select: {
              id: true,
              course_id: true,
              course: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      });
    } else {
      // For admin/staff, get all tests
      studentTests = await prisma.student_test.findMany({
        select: {
          id: true,
          course_test_id: true,
          test_name: true,
          course_test: {
            select: {
              id: true,
              course_id: true,
              course: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      });
    }

    // Format the response to match the expected structure
    const formattedTests = studentTests.map((test) => ({
      id: test.id,
      course_test_id: test.course_test_id ? Number(test.course_test_id) : 0,
      test_name: test.test_name,
      name: test.course_test?.course?.name || "",
    }));

    return NextResponse.json(formattedTests);
  } catch (error) {
    console.error("Error fetching student tests:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch student tests",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
