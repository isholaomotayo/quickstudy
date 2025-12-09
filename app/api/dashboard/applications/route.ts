import { NextRequest, NextResponse } from "next/server";
import { getApplicationsData } from "@/lib/data";
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
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const type = searchParams.get("type");

    // Check institution access
    const requestedInstitutionId = institutionId
      ? parseInt(institutionId)
      : user.institution_id;
    if (!hasInstitutionAccess(user, requestedInstitutionId)) {
      return createAuthErrorResponse("Access denied to this institution", 403);
    }

    const applicationsData = await getApplicationsData(
      requestedInstitutionId,
      status || undefined,
      limit ? parseInt(limit) : undefined,
      type || undefined
    );

    return createSuccessResponse(applicationsData, user);
  } catch (error) {
    console.error("Error in applications API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch applications data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
