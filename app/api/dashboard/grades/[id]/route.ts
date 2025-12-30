import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerApiUrl } from '@/lib/server-api-url';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log(`Deleting grade result with ID: ${id}`);

    // Get cookies for authentication
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    // Construct absolute URL for server-side fetch
    const deleteUrl = getServerApiUrl(request, `/api/studentresult/${id}`);

    // Forward the DELETE request to backend
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
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
        { error: 'Failed to delete result', details: errorText, status: response.status },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log(`Successfully deleted result ${id}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in delete result API:', error);
    return NextResponse.json(
      { error: 'Failed to delete result', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    console.log(`Updating grade result with ID: ${id}`, body);

    // Get cookies for authentication
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();

    // Construct absolute URL for server-side fetch
    const updateUrl = getServerApiUrl(request, `/api/studentresult/${id}`);

    // Forward the PUT request to backend
    const response = await fetch(updateUrl, {
      method: 'PUT',
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
        { error: 'Failed to update result', details: errorText, status: response.status },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log(`Successfully updated result ${id}`);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in update result API:', error);
    return NextResponse.json(
      { error: 'Failed to update result', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}