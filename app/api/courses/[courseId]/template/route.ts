import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await context.params;
    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semester_id');
    
    console.log(`Generating template for course ${courseId}, semester ${semesterId}`);

    // Get cookies for authentication
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    // Build backend URL with query parameters
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
    let templateUrl = `${backendUrl}/api/studentresult/template/${courseId}`;
    if (semesterId) {
      templateUrl += `?semester_id=${semesterId}`;
    }

    // Call the backend API
    const response = await fetch(templateUrl, {
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
        { error: 'Failed to generate template', details: errorText, status: response.status },
        { status: response.status }
      );
    }

    // Get the CSV content as text (backend returns CSV string)
    const csvContent = await response.text();
    console.log(`Template generated successfully for course ${courseId}`);
    
    // Convert CSV string to blob and return with proper headers for download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="course_${courseId}_template.csv"`,
      },
    });
  } catch (error) {
    console.error('Error in template generation API:', error);
    return NextResponse.json(
      { error: 'Failed to generate template', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
