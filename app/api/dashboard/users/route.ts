import { NextRequest, NextResponse } from "next/server";
import { getUsersData } from "@/lib/data";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
  hasInstitutionAccess,
} from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user and check permissions
    const authResult = await authenticateUser(undefined, [
      "user_management",
    ]);

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId");
    const search = searchParams.get("search");
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    // Check institution access
    const requestedInstitutionId = institutionId
      ? parseInt(institutionId)
      : user.institution_id;
    if (!hasInstitutionAccess(user, requestedInstitutionId)) {
      return createAuthErrorResponse("Access denied to this institution", 403);
    }

    const usersData = await getUsersData(
      requestedInstitutionId,
      search || undefined,
      role || undefined,
      status || undefined,
      limit ? parseInt(limit) : 50
    );

    return createSuccessResponse(usersData, user);
  } catch (error) {
    console.error("Error in users API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch users data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
