import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerApiUrl } from '@/lib/server-api-url';

export async function POST(request: NextRequest) {
  try {
    console.log('Processing batch GPA calculation request');

    // Get cookies for authentication
    const cookieStore = cookies();
    const cookieString = cookieStore.toString();

    // Parse request body
    const body = await request.json();
    console.log('Batch GPA calculation request body:', JSON.stringify(body, null, 2));

    // Construct absolute URL for server-side fetch
    const gpaUrl = getServerApiUrl(request, `/api/studentgpa/batch`);

    // Forward the request to backend
    const response = await fetch(gpaUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        ...(cookieString && { Cookie: cookieString }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`Backend API error: ${response.status}`);
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to calculate batch GPA', details: errorText, status: response.status },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log(`Batch GPA calculation successful:`, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in batch GPA calculation API:', error);
    return NextResponse.json(
      { error: 'Failed to calculate batch GPA', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}