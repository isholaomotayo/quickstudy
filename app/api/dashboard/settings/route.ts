import { NextRequest, NextResponse } from "next/server";
import { getSettingsData } from "@/lib/data";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
  hasInstitutionAccess,
} from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user - settings should be accessible to administrators
    const authResult = await authenticateUser(undefined, [
      "user_management",
    ]);

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

    const settingsData = await getSettingsData(requestedInstitutionId);

    return createSuccessResponse(settingsData, user);
  } catch (error) {
    console.error("Error in settings API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch settings data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
