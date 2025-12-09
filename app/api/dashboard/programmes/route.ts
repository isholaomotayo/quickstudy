import { NextRequest, NextResponse } from 'next/server';
import { getProgrammesData } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    const departmentId = searchParams.get('departmentId');
    
    const programmes = await getProgrammesData(
      institutionId ? parseInt(institutionId) : undefined,
      departmentId ? parseInt(departmentId) : undefined
    );
    
    return NextResponse.json(programmes);
  } catch (error) {
    console.error('Error in programmes API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programmes data' },
      { status: 500 }
    );
  }
}