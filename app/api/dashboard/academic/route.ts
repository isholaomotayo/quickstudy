import { NextRequest, NextResponse } from 'next/server';
import { getAcademicData } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    
    const academicData = await getAcademicData(
      institutionId ? parseInt(institutionId) : undefined
    );

    return NextResponse.json(academicData);
  } catch (error) {
    console.error('Error in academic API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academic data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
