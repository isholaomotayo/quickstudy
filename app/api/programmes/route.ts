import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    
    // Build search condition
    const searchCondition = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              prefix: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const programmes = await prisma.programme.findMany({
      where: searchCondition,
      select: {
        id: true,
        name: true,
        prefix: true,
        description: true,
        department: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        { name: 'asc' },
      ],
      take: 50, // Limit results for performance
    });

    // Format for react-select and backward compatibility
    const formattedProgrammes = programmes.map(prog => ({
      id: prog.id,
      name: prog.name,
      prefix: prog.prefix,
      description: prog.description,
      department_name: prog.department?.name,
      // react-select format
      value: prog.id,
      label: prog.name,
    }));

    return NextResponse.json({ 
      programmes: formattedProgrammes,
      // Also provide in the legacy format for backward compatibility
      success: true,
    });
  } catch (error) {
    console.error('Programme API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programmes' },
      { status: 500 }
    );
  }
}