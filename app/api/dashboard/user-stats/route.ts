import { NextRequest, NextResponse } from 'next/server';
import { getUserStats } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    
    const stats = await getUserStats(
      institutionId ? parseInt(institutionId) : undefined
    );
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in user stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
