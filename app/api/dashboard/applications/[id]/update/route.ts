import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { programmeId, levelId } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    if (!programmeId || !levelId) {
      return NextResponse.json(
        { error: "Programme ID and Level ID are required" },
        { status: 400 }
      );
    }

    // Find the student record for this application
    const student = await prisma.student.findFirst({
      where: { user_id: BigInt(id) }
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student record not found for this application" },
        { status: 404 }
      );
    }

    // Update the student's programme and level selections
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        programme_id: programmeId,
        entry_level_id: levelId,
        updated_at: new Date(),
      },
      include: {
        programme: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        level: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Programme and level selections updated successfully",
      data: {
        id: updatedStudent.id.toString(),
        programmeId: updatedStudent.programme_id,
        levelId: updatedStudent.entry_level_id,
        programme: updatedStudent.programme,
        level: updatedStudent.level,
      }
    });

  } catch (error) {
    console.error('Error updating application selections:', error);
    return NextResponse.json(
      { error: 'Failed to update application selections', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


