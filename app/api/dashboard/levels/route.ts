import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    
    const levels = await prisma.level.findMany({
      where: {
        ...(institutionId ? { institution_id: parseInt(institutionId) } : {}),
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(levels);
  } catch (error) {
    console.error('Error fetching levels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch levels data' },
      { status: 500 }
    );
  }
}


