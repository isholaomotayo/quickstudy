import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const feeId = parseInt(params.id);

    if (isNaN(feeId)) {
      return NextResponse.json(
        { error: "Invalid fee ID provided" },
        { status: 400 }
      );
    }

    const fee = await prisma.fee.findUnique({
      where: { id: feeId },
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
    });

    if (!fee) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 });
    }

    // Transform data for frontend
    const transformedFee = {
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
    };

    return NextResponse.json({
      success: true,
      data: { fee: transformedFee },
    });
  } catch (error) {
    console.error("Error fetching fee:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch fee",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const feeId = parseInt(params.id);
    const body = await request.json();
    const {
      name,
      description,
      amount,
      optional,
      frequency,
      compulsory,
      active,
      monthly,
      monthlyParts,
      semesterly,
      semesterlyParts,
      sessionly,
      sessionlyParts,
      sessionId,
      facultyId,
      departmentId,
      programmeId,
      levelId,
    } = body;

    if (isNaN(feeId)) {
      return NextResponse.json(
        { error: "Invalid fee ID provided" },
        { status: 400 }
      );
    }

    // Check if fee exists
    const existingFee = await prisma.fee.findUnique({
      where: { id: feeId },
    });

    if (!existingFee) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 });
    }

    const updatedFee = await prisma.fee.update({
      where: { id: feeId },
      data: {
        name: name !== undefined ? name : existingFee.name,
        description:
          description !== undefined ? description : existingFee.description,
        amount:
          amount !== undefined
            ? amount
              ? parseFloat(amount)
              : null
            : existingFee.amount,
        optional:
          optional !== undefined ? (optional ? 1 : 0) : existingFee.optional,
        frequency: frequency !== undefined ? frequency : existingFee.frequency,
        compulsory:
          compulsory !== undefined
            ? compulsory
              ? 1
              : 0
            : existingFee.compulsory,
        active: active !== undefined ? active : existingFee.active,
        monthly:
          monthly !== undefined
            ? monthly
              ? parseFloat(monthly)
              : null
            : existingFee.monthly,
        monthly_parts:
          monthlyParts !== undefined ? monthlyParts : existingFee.monthly_parts,
        semesterly:
          semesterly !== undefined
            ? semesterly
              ? parseFloat(semesterly)
              : null
            : existingFee.semesterly,
        semesterly_parts:
          semesterlyParts !== undefined
            ? semesterlyParts
            : existingFee.semesterly_parts,
        sessionly:
          sessionly !== undefined
            ? sessionly
              ? parseFloat(sessionly)
              : null
            : existingFee.sessionly,
        sessionly_parts:
          sessionlyParts !== undefined
            ? sessionlyParts
            : existingFee.sessionly_parts,
        session_id:
          sessionId !== undefined
            ? sessionId
              ? parseInt(sessionId)
              : null
            : existingFee.session_id,
        faculty_id:
          facultyId !== undefined
            ? facultyId
              ? parseInt(facultyId)
              : null
            : existingFee.faculty_id,
        department_id:
          departmentId !== undefined
            ? departmentId
              ? parseInt(departmentId)
              : null
            : existingFee.department_id,
        programme_id:
          programmeId !== undefined
            ? programmeId
              ? parseInt(programmeId)
              : null
            : existingFee.programme_id,
        level_id:
          levelId !== undefined
            ? levelId
              ? parseInt(levelId)
              : null
            : existingFee.level_id,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Fee updated successfully",
        fee: updatedFee,
      },
    });
  } catch (error) {
    console.error("Error updating fee:", error);
    return NextResponse.json(
      {
        error: "Failed to update fee",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const feeId = parseInt(params.id);

    if (isNaN(feeId)) {
      return NextResponse.json(
        { error: "Invalid fee ID provided" },
        { status: 400 }
      );
    }

    // Check if fee exists
    const existingFee = await prisma.fee.findUnique({
      where: { id: feeId },
    });

    if (!existingFee) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 });
    }

    await prisma.fee.delete({
      where: { id: feeId },
    });

    return NextResponse.json({
      success: true,
      data: {
        message: "Fee deleted successfully",
      },
    });
  } catch (error) {
    console.error("Error deleting fee:", error);
    return NextResponse.json(
      {
        error: "Failed to delete fee",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
