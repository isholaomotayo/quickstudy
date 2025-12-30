import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Build where clause for grade definitions
    const whereClause: any = {};

    if (institutionId) {
      whereClause.institution_id = parseInt(institutionId);
    }

    // Get grade definitions from grades table
    const [grades, totalCount] = await Promise.all([
      prisma.grade.findMany({
        where: whereClause,
        orderBy: [
          { point: "desc" }, // Order by highest points first (A, B, C, etc.)
          { name: "asc" },
        ],
        skip: offset,
        take: limit,
      }),
      prisma.grade.count({
        where: whereClause,
      }),
    ]);

    // Transform data for frontend
    const transformedGrades = grades.map((grade) => ({
      id: grade.id.toString(),
      name: grade.name,
      letter: grade.name,
      point: grade.point,
      minScore: grade.min_score,
      maxScore: grade.max_score,
      weight: grade.weight,
      institutionId: grade.institution_id,
    }));

    return NextResponse.json({
      success: true,
      data: {
        grades: transformedGrades,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching grade definitions:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch grade definitions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
