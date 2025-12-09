import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - List all grades for an institution
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');

    if (!institutionId) {
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      );
    }

    const grades = await prisma.grade.findMany({
      where: {
        institution_id: parseInt(institutionId)
      },
      orderBy: [
        { point: 'desc' }, // Order by highest points first (A, B, C, etc.)
        { name: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      grades
    });

  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch grades', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Create a new grade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, weight, minScore, maxScore, point, institutionId } = body;

    if (!name || !institutionId) {
      return NextResponse.json(
        { error: 'Grade name and institution ID are required' },
        { status: 400 }
      );
    }

    // Check if grade with same name already exists for this institution
    const existingGrade = await prisma.grade.findFirst({
      where: {
        name: name.toUpperCase(),
        institution_id: parseInt(institutionId)
      }
    });

    if (existingGrade) {
      return NextResponse.json(
        { error: `Grade '${name}' already exists for this institution` },
        { status: 409 }
      );
    }

    const newGrade = await prisma.grade.create({
      data: {
        name: name.toUpperCase(),
        weight: weight ? parseInt(weight) : null,
        min_score: minScore ? parseInt(minScore) : null,
        max_score: maxScore ? parseInt(maxScore) : null,
        point: point ? parseFloat(point) : 0,
        institution_id: parseInt(institutionId)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Grade created successfully',
      grade: newGrade
    });

  } catch (error) {
    console.error('Error creating grade:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create grade', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Update a grade
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, weight, minScore, maxScore, point } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Grade ID and name are required' },
        { status: 400 }
      );
    }

    // Check if grade exists
    const existingGrade = await prisma.grade.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingGrade) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      );
    }

    const updatedGrade = await prisma.grade.update({
      where: { id: parseInt(id) },
      data: {
        name: name.toUpperCase(),
        weight: weight ? parseInt(weight) : null,
        min_score: minScore ? parseInt(minScore) : null,
        max_score: maxScore ? parseInt(maxScore) : null,
        point: point ? parseFloat(point) : 0
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Grade updated successfully',
      grade: updatedGrade
    });

  } catch (error) {
    console.error('Error updating grade:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update grade', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete a grade
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Grade ID is required' },
        { status: 400 }
      );
    }

    // Check if grade exists
    const existingGrade = await prisma.grade.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingGrade) {
      return NextResponse.json(
        { error: 'Grade not found' },
        { status: 404 }
      );
    }

    // Check if grade is being used in student results
    const gradeInUse = await prisma.student_result.findFirst({
      where: { grade_id: parseInt(id) }
    });

    if (gradeInUse) {
      return NextResponse.json(
        { error: 'Cannot delete grade that is being used in student results' },
        { status: 409 }
      );
    }

    await prisma.grade.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Grade deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting grade:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete grade', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}