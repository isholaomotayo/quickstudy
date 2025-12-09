import { NextRequest, NextResponse } from 'next/server';
import { resolveStudentContext } from '../../../../../helpers/studentContext';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get the active student profile for backward compatibility
    const studentProfile = await resolveStudentContext(BigInt(userId));
    
    if (!studentProfile) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Format the response to match the existing FetchWrapper expectations
    const student = {
      id: studentProfile.id.toString(),
      user_id: studentProfile.user_id.toString(),
      programme_id: studentProfile.programme_id,
      status: studentProfile.status,
      admitted: studentProfile.admitted,
      programme: studentProfile.programme,
      user: studentProfile.user,
    };

    return NextResponse.json({ student });
  } catch (error) {
    console.error('Student by userId API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500 }
    );
  }
}