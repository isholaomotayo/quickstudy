import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/db";


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId') || '1';

    const institutionFilter = parseInt(institutionId);

    // Test basic student count
    const totalStudents = await prisma.student.count({
      where: {
        is_deleted: false,
        user_student_user_idTouser: { institution_id: institutionFilter }
      }
    });

    // Test applicant count
    const applicantCount = await prisma.student.count({
      where: {
        status: false,
        is_deleted: false,
        user_student_user_idTouser: { 
          institution_id: institutionFilter,
          role: 'APPLICANT'
        }
      }
    });

    // Test admitted count
    const admittedCount = await prisma.student.count({
      where: {
        admitted: true,
        is_deleted: false,
        user_student_user_idTouser: { 
          institution_id: institutionFilter,
          role: 'STUDENT'
        }
      }
    });

    // Test payment count
    const paymentCount = await prisma.payment2.count({
      where: {
        status: 1,
        student: {
          user_student_user_idTouser: { institution_id: institutionFilter }
        }
      }
    });

    // Test user count
    const userCount = await prisma.user.count({
      where: {
        institution_id: institutionFilter
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        totalStudents,
        applicantCount,
        admittedCount,
        paymentCount,
        userCount,
        institutionId: institutionFilter
      }
    });

  } catch (error) {
    console.error('Test analytics error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test analytics', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
