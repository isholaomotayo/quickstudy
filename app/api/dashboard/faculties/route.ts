import { NextRequest, NextResponse } from 'next/server';
import { getFacultiesWithUserCounts } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    
    const faculties = await getFacultiesWithUserCounts(
      institutionId ? parseInt(institutionId) : undefined
    );
    
    return NextResponse.json(faculties);
  } catch (error) {
    console.error('Error in faculties API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch faculties data' },
      { status: 500 }
    );
  }
}
