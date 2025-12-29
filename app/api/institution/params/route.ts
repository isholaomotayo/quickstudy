import { NextRequest } from "next/server";
import { createJsonResponse, createAuthErrorResponse } from "@/lib/api-auth";
import { prisma } from "@/lib/db";

/**
 * Normalizes a URL for comparison by removing www, trailing slashes, and normalizing protocol
 */
function normalizeUrl(url: string): string {
  if (!url || typeof url !== "string") return "";
  
  try {
    let normalized = url.trim();
    
    // Add protocol if missing
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = `https://${normalized}`;
    }
    
    // Parse URL
    const urlObj = new URL(normalized);
    
    // Remove www. from hostname
    let hostname = urlObj.hostname.toLowerCase();
    if (hostname.startsWith("www.")) {
      hostname = hostname.substring(4);
    }
    
    // Reconstruct URL with normalized hostname and https
    return `https://${hostname}${urlObj.pathname.replace(/\/$/, "")}`;
  } catch (e) {
    // If URL parsing fails, try simple string manipulation
    let normalized = url.trim().toLowerCase();
    normalized = normalized.replace(/^https?:\/\//i, "");
    normalized = normalized.replace(/^www\./i, "");
    normalized = normalized.replace(/\/$/, "");
    return normalized ? `https://${normalized}` : "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Convert string numbers to integers for numeric fields
    const whereClause: any = {};

    // Handle URL-based lookup with normalization
    if (body.url || body.website) {
      const urlToMatch = body.url || body.website;
      const normalizedUrl = normalizeUrl(urlToMatch);
      
      if (normalizedUrl) {
        // Fetch all institutions and match by normalized URL
        const institutions = await prisma.institution.findMany({
          where: {
            website: {
              not: null,
            },
          },
        });

        // Find institution with matching normalized URL
        const institution = institutions.find((inst) => {
          if (!inst.website) return false;
          const normalizedDbUrl = normalizeUrl(inst.website);
          return normalizedDbUrl === normalizedUrl || 
                 normalizedDbUrl === normalizedUrl.replace(/\/$/, "") ||
                 normalizedUrl === normalizedDbUrl.replace(/\/$/, "");
        });

        if (institution) {
          return createJsonResponse(institution);
        }
      }
    }

    // Fallback to original logic for other params
    for (const [key, value] of Object.entries(body)) {
      if (key === "url" || key === "website") {
        // Already handled above, skip
        continue;
      } else if (key === "id" && typeof value === "string") {
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
