import { NextRequest } from "next/server";
import { createJsonResponse, createAuthErrorResponse } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Convert string numbers to integers for numeric fields
    const whereClause: any = {};

    for (const [key, value] of Object.entries(body)) {
      if (key === "id" && typeof value === "string") {
        // Convert id from string to number
        whereClause[key] = parseInt(value);
      } else if (key === "created_by" || key === "updated_by") {
        // Convert BigInt fields from string to BigInt
        whereClause[key] = typeof value === "string" ? BigInt(value) : value;
      } else {
        // Keep other fields as-is
        whereClause[key] = value;
      }
    }

    // Find institution by provided params
    const institution = await prisma.institution.findFirst({
      where: whereClause,
    });

    if (!institution) {
      return createAuthErrorResponse("Institution not found", 404);
    }

    return createJsonResponse(institution);
  } catch (error) {
    console.error("Error fetching institution:", error);
    return createAuthErrorResponse("Failed to fetch institution", 500);
  }
}
