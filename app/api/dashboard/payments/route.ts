import { NextRequest, NextResponse } from "next/server";
import { getPaymentsData } from "@/lib/data";
import {
  protectApiRouteWithPermissions,
  createSuccessResponse,
  createAuthErrorResponse,
  hasInstitutionAccess,
} from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user and check permissions using centralized system
    const { user } = await protectApiRouteWithPermissions(request, [
      "finance.payments.view",
    ]);
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId");
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const search = searchParams.get("search");

    // Check institution access
    const requestedInstitutionId = institutionId
      ? parseInt(institutionId)
      : user.institution_id;
    if (!hasInstitutionAccess(user, requestedInstitutionId)) {
      return createAuthErrorResponse("Access denied to this institution", 403);
    }

    const paymentsData = await getPaymentsData(
      requestedInstitutionId,
      status ? parseInt(status) : undefined,
      limit ? parseInt(limit) : undefined,
      search || undefined
    );

    return createSuccessResponse(paymentsData, user);
  } catch (error) {
    console.error("Error in payments API:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch payments data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
