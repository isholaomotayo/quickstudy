import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('Processing bulk student result upload');

    // Get cookies for authentication
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    // Parse request body
    const body = await request.json();
    console.log('Request body received:', JSON.stringify(body, null, 2));

    // Build backend URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
    const uploadUrl = `${backendUrl}/api/studentresult`;

    // Forward the request to backend
    const response = await fetch(uploadUrl, {
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
        { error: 'Failed to upload results', details: errorText, status: response.status },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log(`Bulk upload successful. Results processed: ${result.results ? result.results.length : 0}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in student result upload API:', error);
    return NextResponse.json(
      { error: 'Failed to upload results', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}