import { NextRequest, NextResponse } from "next/server";
import { getFinancialData } from "@/lib/data";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
  hasInstitutionAccess,
} from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user and check permissions - only SUPERADMIN can access finance overview
    const authResult = await authenticateUser(undefined, [
      "finance_overview",
    ]);

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId");
    const period = searchParams.get("period");

    // Check institution access
    const requestedInstitutionId = institutionId
      ? parseInt(institutionId)
      : user.institution_id;
    if (!hasInstitutionAccess(user, requestedInstitutionId)) {
      return createAuthErrorResponse("Access denied to this institution", 403);
    }

    const financialData = await getFinancialData(
      requestedInstitutionId,
      period || undefined
    );

    return createSuccessResponse(financialData, user);
  } catch (error) {
    console.error("Error in financial API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch financial data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
