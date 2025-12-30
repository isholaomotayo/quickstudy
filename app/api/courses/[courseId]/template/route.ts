import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  authenticateUser,
  createAuthErrorResponse,
} from '@/lib/api-auth';
import { hasPermission } from '@/lib/permissions-config';
import { filterStudentsForSemester } from '@/helpers/studentFilterUtils';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions - only staff/admin can generate templates
    if (!hasPermission(user.role, 'academic.results.manage')) {
      return createAuthErrorResponse(
        'You do not have permission to generate result templates',
        403
      );
    }

    // Get institution data
    const institution = await prisma.institution.findUnique({
      where: { id: user.institution_id || 1 },
      select: {
        name: true,
        code: true,
      },
    });

    const { courseId } = await context.params;
    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semester_id');
    const courseIdNum = parseInt(courseId);
    
    console.log(`Generating template for course ${courseId}, semester ${semesterId}`);

    // Get course with department and faculty
    const course = await prisma.course.findUnique({
      where: { id: courseIdNum },
      include: {
        department: {
          include: {
            faculty: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Get all student course registrations for this course
    const studentCourses = await prisma.student_course.findMany({
      where: {
        course_id: courseIdNum,
      },
      include: {
        student: {
          include: {
            user_student_user_idTouser: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                other_name: true,
              },
            },
          },
        },
        level: {
          select: {
            id: true,
            name: true,
          },
        },
        semester: {
          select: {
            id: true,
            name: true,
            position: true,
          },
        },
      },
    });

    // Use shared filtering utility (same as backend) to filter students
    const filterResult = filterStudentsForSemester(
      studentCourses,
      semesterId ? parseInt(semesterId) : (null as any),
      false // isBackend = false since we're using Prisma JSON structure
    );

    // Transform filtered results for CSV generation
    const students = filterResult.students.map((sc: any) => {
      const user = sc.student?.user_student_user_idTouser;
      return {
        student_course_id: sc.id,
        surname: user?.last_name || '',
        firstname: user?.first_name || '',
        othername: user?.other_name || '',
        reg_no: sc.student?.reg_no || '',
        level_name: sc.level?.name || '',
        semester_name: sc.semester?.name || '',
      };
    });

    if (students.length === 0) {
      return NextResponse.json(
        {
          error: `No valid students found for this course${
            semesterId ? ' and semester' : ''
          }. Students must have registration numbers to be included.`,
        },
        { status: 404 }
      );
    }

    // Get course data
    const courseData = {
      course_name: course.name,
      course_code: course.code,
      units: course.units,
      department_name: course.department?.name || '',
      faculty_name: course.department?.faculty?.name || '',
    };

    // Generate CSV content
    let csvContent = '';

    // Header information
    csvContent += `${institution?.name?.toUpperCase() || 'INSTITUTION NAME'}\n`;
    csvContent += `${institution?.code || 'INSTITUTION'}\n`;
    csvContent += `OFFICIAL GRADE REPORT \n`;
    csvContent += `${students.length} student registrations found for ${
      courseData.course_code
    } in ${students[0]?.semester_name || ''}.\n\n`;

    csvContent += `Title of Course:,${courseData.course_name},,Course No:,${courseData.course_code}\n`;
    csvContent += `Examination Date:,,,Unit:,${courseData.units}\n`;
    csvContent += `Department:,${courseData.department_name},,Semester:,${
      students[0]?.semester_name || ''
    }\n`;
    csvContent += `Faculty:,${courseData.faculty_name},,Session:,2024/2025\n`;
    csvContent += `Name of Lecturer:,\n\n`;

    // Add separator before table header
    csvContent += `---DATA---\n`;

    // Table headers
    csvContent += `S/N,Name of Student (Surname First),Reg. No,CA Mark,Exam Score,Total,Letter Grade\n`;

    // Student rows (sorted by reg_no for consistency)
    students
      .sort((a, b) => (a.reg_no || '').localeCompare(b.reg_no || ''))
      .forEach((student, index) => {
        const fullName = `${student.surname}, ${student.firstname}${
          student.othername ? ` ${student.othername}` : ''
        }`;
        csvContent += `${index + 1},${fullName},${student.reg_no},,,,\n`;
      });

    console.log(`Template generated successfully for course ${courseId}`);
    
    // Return CSV content with proper headers for download
    return new NextResponse(csvContent, {
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
