import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivity } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    const limit = searchParams.get('limit');
    
    const activity = await getRecentActivity(
      institutionId ? parseInt(institutionId) : undefined,
      limit ? parseInt(limit) : 10
    );
    
    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error in recent activity API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
