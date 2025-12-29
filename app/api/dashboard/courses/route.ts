import { NextRequest, NextResponse } from "next/server";
import { getCoursesData } from "@/lib/data";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user - courses should be accessible to all authenticated users
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    console.log("Courses API called");
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const faculty = searchParams.get("faculty");
    const department = searchParams.get("department");
    const programme = searchParams.get("programme");
    const level = searchParams.get("level");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");

    console.log("Courses API params:", {
      search,
      faculty,
      department,
      programme,
      level,
      status,
      limit,
      page,
    });

    const result = await getCoursesData(
      search || undefined,
      faculty || undefined,
      department || undefined,
      programme || undefined,
      level || undefined,
      status || undefined,
      limit ? parseInt(limit) : 50,
      page ? parseInt(page) : 1
    );

    console.log(
      "Courses fetched successfully, count:",
      result.courses.length,
      "total:",
      result.total
    );
    return createSuccessResponse(result, user);
  } catch (error) {
    console.error("Error in courses API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch courses data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
