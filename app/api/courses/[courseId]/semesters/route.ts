import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerApiUrl } from '@/lib/server-api-url';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await context.params;
    
    console.log(`Getting semesters for course ${courseId}`);

    // Get cookies for authentication
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    // Call the backend API
    const response = await fetch(getServerApiUrl(request, `/api/studentcourse/course/${courseId}/semesters`), {
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
      return NextResponse.json(
        { error: 'Failed to fetch course semesters', status: response.status },
        { status: response.status }
      );
    }

    const semesters = await response.json();
    console.log(`Found ${semesters.length} semesters for course ${courseId}`);
    
    return NextResponse.json(semesters);
  } catch (error) {
    console.error('Error in course semesters API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course semesters', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
