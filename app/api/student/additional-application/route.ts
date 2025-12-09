import { NextRequest, NextResponse } from 'next/server';
import { createAdditionalProgramApplication, canApplyForAdditionalProgram } from '../../../../helpers/studentContext';

// Simple auth helper for API routes
function getAuthFromHeaders(request: NextRequest) {
  const cookies = request.cookies;
  const token = cookies.get('token')?.value;
  const role = cookies.get('role')?.value;
  const userId = cookies.get('userId')?.value;

  return token ? { userRole: role, userId: Number(userId), authToken: token } : null;
}

export async function POST(request: NextRequest) {
  try {
    const authData = getAuthFromHeaders(request);
    if (!authData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = authData;
    const body = await request.json();
    const { programmeId } = body;

    if (!programmeId) {
      return NextResponse.json({ error: 'Programme ID is required' }, { status: 400 });
    }

    // Check if user can apply for additional programs
    const canApply = await canApplyForAdditionalProgram(BigInt(userId));
    if (!canApply) {
      return NextResponse.json({ 
        error: 'You must be admitted to at least one program before applying for additional programs' 
      }, { status: 403 });
    }

    // Create additional program application
    const newStudentProfile = await createAdditionalProgramApplication(
      BigInt(userId), 
      Number(programmeId)
    );

    if (newStudentProfile) {
      // Convert BigInt fields to strings for JSON serialization
      const serializedStudentProfile = {
        ...newStudentProfile,
        id: newStudentProfile.id.toString(),
        user_id: newStudentProfile.user_id.toString(),
        user: newStudentProfile.user ? {
          ...newStudentProfile.user,
          id: newStudentProfile.user.id.toString(),
        } : undefined,
      };
      
      return NextResponse.json({ 
        message: 'Additional program application created successfully',
        student: serializedStudentProfile 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to create additional program application' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Additional application API error:', error);
    
    if (error.message.includes('already has an application')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    
    return NextResponse.json(
      { error: 'Failed to create additional program application' },
      { status: 500 }
    );
  }
}