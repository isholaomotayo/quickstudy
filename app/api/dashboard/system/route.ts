import { NextRequest, NextResponse } from 'next/server';
import { getSystemData } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const systemData = await getSystemData();

    return NextResponse.json(systemData);
  } catch (error) {
    console.error('Error in system API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
