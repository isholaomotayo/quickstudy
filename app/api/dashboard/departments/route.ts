import { NextRequest, NextResponse } from 'next/server';
import { getDepartmentsWithUserCounts } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    
    const departments = await getDepartmentsWithUserCounts(
      institutionId ? parseInt(institutionId) : undefined
    );
    
    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error in departments API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments data' },
      { status: 500 }
    );
  }
}
