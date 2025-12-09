import { NextRequest, NextResponse } from 'next/server';
import { getCourseStats } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const stats = await getCourseStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in course stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
