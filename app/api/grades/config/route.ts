import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerApiUrl } from '@/lib/server-api-url';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching grade configuration from backend API');

    // Get cookies for authentication
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    // Construct absolute URL for server-side fetch
    const gradesUrl = getServerApiUrl(request, `/api/grade`);

    // Call the backend API
    const response = await fetch(gradesUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        ...(cookieString && { Cookie: cookieString }),
      },
    });

    if (!response.ok) {
      console.error(`Backend API error: ${response.status}`);
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to fetch grade configuration', details: errorText, status: response.status },
        { status: response.status }
      );
    }

    const grades = await response.json();
    console.log(`Successfully fetched ${grades.length} grade configurations`);

    // Transform the grades to match the frontend interface
    const transformedGrades = grades.map((grade: any) => ({
      id: grade.id,
      letter: grade.name, // backend uses 'name' for grade letter
      min_score: grade.min_score,
      max_score: grade.max_score,
      point: grade.point
    }));

    return NextResponse.json(transformedGrades);
  } catch (error) {
    console.error('Error in grade configuration API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grade configuration', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}