import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    console.log('Dashboard stats API called');
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    
    console.log('Institution ID:', institutionId);
    
    const stats = await getDashboardStats(
      institutionId ? parseInt(institutionId) : undefined
    );
    
    console.log('Stats fetched successfully:', stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in dashboard stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
