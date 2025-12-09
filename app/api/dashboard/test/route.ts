import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    const studentCount = await prisma.student.count()
    const courseCount = await prisma.course.count()

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        userCount,
        studentCount,
        courseCount
      }
    })
  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
