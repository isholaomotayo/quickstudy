import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pass through all query parameters
    const queryString = searchParams.toString();
    
    console.log('StudentCourses API called with params:', queryString);

    // Get cookies for authentication
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    // Call the backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
    const response = await fetch(`${backendUrl}/api/studentcourse?${queryString}`, {
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
        { error: 'Failed to fetch student courses', details: errorText, status: response.status },
        { status: response.status }
      );
    }

    const studentCourses = await response.json();
    console.log(`Found ${studentCourses.length} student courses`);
    
    return NextResponse.json(studentCourses);
  } catch (error) {
    console.error('Error in student courses API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student courses', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
