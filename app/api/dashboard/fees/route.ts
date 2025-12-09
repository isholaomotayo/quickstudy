import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Build where clause for fees
    const whereClause: any = {};

    if (institutionId) {
      whereClause.institution_id = parseInt(institutionId);
    }

    // Get fees with related data
    const [fees, totalCount] = await Promise.all([
      prisma.fee.findMany({
        where: whereClause,
        include: {
          institution: {
            select: {
              id: true,
              name: true,
            },
          },
          faculty: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          programme: {
            select: {
              id: true,
              name: true,
            },
          },
          level: {
            select: {
              id: true,
              name: true,
            },
          },
          session: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ name: "asc" }, { created_at: "desc" }],
        skip: offset,
        take: limit,
      }),
      prisma.fee.count({
        where: whereClause,
      }),
    ]);

    // Transform data for frontend
    const transformedFees = fees.map((fee) => ({
      id: fee.id.toString(),
      name: fee.name,
      description: fee.description,
      amount: fee.amount ? parseFloat(fee.amount.toString()) : null,
      optional: fee.optional === 1,
      frequency: fee.frequency,
      compulsory: fee.compulsory === 1,
      active: fee.active,
      monthly: fee.monthly ? parseFloat(fee.monthly.toString()) : null,
      monthlyParts: fee.monthly_parts,
      semesterly: fee.semesterly ? parseFloat(fee.semesterly.toString()) : null,
      semesterlyParts: fee.semesterly_parts,
      sessionly: fee.sessionly ? parseFloat(fee.sessionly.toString()) : null,
      sessionlyParts: fee.sessionly_parts,
      institutionId: fee.institution_id,
      sessionId: fee.session_id,
      facultyId: fee.faculty_id,
      departmentId: fee.department_id,
      programmeId: fee.programme_id,
      levelId: fee.level_id,
      institution: fee.institution,
      faculty: fee.faculty,
      department: fee.department,
      programme: fee.programme,
      level: fee.level,
      session: fee.session,
      createdAt: fee.created_at?.toISOString(),
      updatedAt: fee.updated_at?.toISOString(),
      createdBy: fee.created_by?.toString(),
      updatedBy: fee.updated_by?.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        fees: transformedFees,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching fees:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch fees",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      amount,
      optional,
      frequency,
      compulsory,
      active = true,
      monthly,
      monthlyParts,
      semesterly,
      semesterlyParts,
      sessionly,
      sessionlyParts,
      institutionId,
      sessionId,
      facultyId,
      departmentId,
      programmeId,
      levelId,
    } = body;

    // Validate required fields
    if (!name || !institutionId) {
      return NextResponse.json(
        { error: "Name and institution ID are required" },
        { status: 400 }
      );
    }

    const newFee = await prisma.fee.create({
      data: {
        name,
        description,
        amount: amount ? parseFloat(amount) : null,
        optional: optional ? 1 : 0,
        frequency,
        compulsory: compulsory ? 1 : 0,
        active,
        monthly: monthly ? parseFloat(monthly) : null,
        monthly_parts: monthlyParts || 0,
        semesterly: semesterly ? parseFloat(semesterly) : null,
        semesterly_parts: semesterlyParts || 0,
        sessionly: sessionly ? parseFloat(sessionly) : null,
        sessionly_parts: sessionlyParts || 0,
        institution_id: parseInt(institutionId),
        session_id: sessionId ? parseInt(sessionId) : null,
        faculty_id: facultyId ? parseInt(facultyId) : null,
        department_id: departmentId ? parseInt(departmentId) : null,
        programme_id: programmeId ? parseInt(programmeId) : null,
        level_id: levelId ? parseInt(levelId) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Fee created successfully",
        fee: newFee,
      },
    });
  } catch (error) {
    console.error("Error creating fee:", error);
    return NextResponse.json(
      {
        error: "Failed to create fee",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
