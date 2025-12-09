import { NextRequest, NextResponse } from 'next/server';
import { getFinancialStats } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    console.log('Financial stats API called');
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    
    const stats = await getFinancialStats(
      institutionId ? parseInt(institutionId) : undefined
    );
    
    console.log('Financial stats fetched successfully:', stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error in financial stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch financial stats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
