import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { reason } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    // Update user application status to rejected
    const updatedUser = await prisma.user.update({
      where: {
        id: BigInt(id),
        role: "APPLICANT",
      },
      data: {
        active: false,
        application_declined_reason: reason || "Application rejected by administrator",
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Application rejected successfully",
      data: {
        id: updatedUser.id.toString(),
        active: updatedUser.active,
        application_declined_reason: updatedUser.application_declined_reason,
      }
    });

  } catch (error) {
    console.error('Error rejecting application:', error);
    return NextResponse.json(
      { error: 'Failed to reject application', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}


