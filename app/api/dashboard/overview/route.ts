import { NextRequest, NextResponse } from "next/server";
import { getOverviewData } from "@/lib/data";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
  hasInstitutionAccess,
} from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user - overview is accessible to all authenticated users
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId");

    // Check institution access
    const requestedInstitutionId = institutionId
      ? parseInt(institutionId)
      : user.institution_id;
    if (!hasInstitutionAccess(user, requestedInstitutionId)) {
      return createAuthErrorResponse("Access denied to this institution", 403);
    }

    const overviewData = await getOverviewData(requestedInstitutionId);

    return createSuccessResponse(overviewData, user);
  } catch (error) {
    console.error("Error in overview API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch overview data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
