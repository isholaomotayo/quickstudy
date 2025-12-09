import { NextRequest, NextResponse } from 'next/server';
import { getAcademicStats } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    console.log('Academic stats API called');
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    
    const stats = await getAcademicStats(
      institutionId ? parseInt(institutionId) : undefined
    );
    
    console.log('Academic stats fetched successfully:', stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in academic stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch academic stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
