import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from '@/lib/api-auth';
import { hasPermission } from '@/lib/permissions-config';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions - only staff/admin can delete results
    if (!hasPermission(user.role, 'academic.grades.edit')) {
      return createAuthErrorResponse(
        'You do not have permission to delete results',
        403
      );
    }

    const { id } = await context.params;
    const resultId = BigInt(id);
    
    console.log(`Deleting grade result with ID: ${id}`);

    // Check if result exists
    const existingResult = await prisma.student_result.findUnique({
      where: { id: resultId },
    });

    if (!existingResult) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      );
    }

    // Delete the result
    await prisma.student_result.delete({
      where: { id: resultId },
    });

    console.log(`Successfully deleted result ${id}`);

    return NextResponse.json({
      success: true,
      message: 'Result deleted successfully',
    });
  } catch (error) {
    console.error('Error in delete result API:', error);
    return NextResponse.json(
      { error: 'Failed to delete result', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions - only staff/admin can update results
    if (!hasPermission(user.role, 'academic.grades.edit')) {
      return createAuthErrorResponse(
        'You do not have permission to update results',
        403
      );
    }

    const { id } = await context.params;
    const resultId = BigInt(id);
    const body = await request.json();
    
    console.log(`Updating grade result with ID: ${id}`, body);

    // Check if result exists
    const existingResult = await prisma.student_result.findUnique({
      where: { id: resultId },
    });

    if (!existingResult) {
      return NextResponse.json(
        { error: 'Result not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_by: BigInt(user.id),
      updated_at: new Date(),
    };

    if (body.score !== undefined) {
      updateData.score = String(body.score);
    }
    if (body.cumulative_point !== undefined) {
      updateData.cumulative_point = body.cumulative_point;
    }
    if (body.grade_id !== undefined) {
      updateData.grade_id = parseInt(body.grade_id);
    }
    if (body.approved !== undefined) {
      updateData.approved = body.approved;
    }
    if (body.publish !== undefined) {
      updateData.publish = body.publish;
    }
    if (body.ca_mark !== undefined) {
      updateData.ca_mark = body.ca_mark;
    }
    if (body.exam_score !== undefined) {
      updateData.exam_score = body.exam_score;
    }

    // Update the result
    const updatedResult = await prisma.student_result.update({
      where: { id: resultId },
      data: updateData,
      include: {
        grade: true,
        student_course: {
          include: {
            student: {
              select: {
                id: true,
                reg_no: true,
                user_id: true,
              },
            },
            course: {
              select: {
                id: true,
                code: true,
                name: true,
                units: true,
              },
            },
            level: {
              select: {
                id: true,
                name: true,
              },
            },
            semester: {
              select: {
                id: true,
                name: true,
                position: true,
              },
            },
          },
        },
      },
    });

    console.log(`Successfully updated result ${id}`);

    // Transform to match backend response format
    const transformedResult = {
      ...updatedResult,
      studentcourse: updatedResult.student_course,
    };

    return createSuccessResponse(transformedResult, user);
  } catch (error) {
    console.error('Error in update result API:', error);
    return NextResponse.json(
      { error: 'Failed to update result', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}