import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  authenticateUser,
  createAuthErrorResponse,
} from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching grade configuration from database');

    // Authenticate user
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    // Fetch all grades from database
    const grades = await prisma.grade.findMany({
      orderBy: {
        min_score: 'asc',
      },
    });

    if (!grades || grades.length === 0) {
      console.log('No grades found in database');
      return NextResponse.json(
        { 
          error: 'No grades configured in the system. Please contact administrator to set up grades.',
          grades: []
        },
        { status: 404 }
      );
    }

    console.log(`Successfully fetched ${grades.length} grade configurations`);

    // Transform the grades to match the frontend interface
    const transformedGrades = grades.map((grade) => ({
      id: grade.id,
      letter: grade.name, // grade uses 'name' for grade letter
      min_score: grade.min_score,
      max_score: grade.max_score,
      point: grade.point ? Number(grade.point) : 0,
    }));

    return NextResponse.json(transformedGrades);
  } catch (error) {
    console.error('Error in grade configuration API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grade configuration', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}