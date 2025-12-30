import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId");
    const departmentId = searchParams.get("departmentId");
    const semesterId = searchParams.get("semesterId");
    const courseId = searchParams.get("courseId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Build where clause based on filters
    const whereClause: any = {};

    if (institutionId) {
      whereClause.student_course = {
        student: {
          is_deleted: false,
          user_student_user_idTouser: {
            institution_id: parseInt(institutionId),
          },
        },
      };
    }

    if (semesterId) {
      whereClause.student_course.semester_id = parseInt(semesterId);
    }

    if (courseId) {
      whereClause.student_course.course_id = parseInt(courseId);
    }

    if (departmentId) {
      whereClause.student_course.course.department_id = parseInt(departmentId);
    }

    // Get student results with related data
    const [results, totalCount] = await Promise.all([
      prisma.student_result.findMany({
        where: whereClause,
        include: {
          student_course: {
            include: {
              student: {
                include: {
                  user_student_user_idTouser: {
                    select: {
                      first_name: true,
                      last_name: true,
                      other_name: true,
                    },
                  },
                },
              },
              course: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  units: true,
                  department: {
                    select: {
                      name: true,
                      code: true,
                    },
                  },
                },
              },
              semester: {
                select: {
                  id: true,
                  name: true,
                  session: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
          grade: {
            select: {
              id: true,
              name: true,
              point: true,
              min_score: true,
              max_score: true,
            },
          },
        },
        orderBy: [{ created_at: "desc" }],
        skip: offset,
        take: limit,
      }),
      prisma.student_result.count({
        where: whereClause,
      }),
    ]);

    // Transform data for frontend
    const transformedResults = results.map((result) => {
      const studentCourse = result.student_course;
      const student = studentCourse?.student;
      const course = studentCourse?.course;
      const semester = studentCourse?.semester;
      const user = student?.user_student_user_idTouser;

      return {
        id: result.id.toString(),
        studentName: user
          ? `${user.last_name || ""}, ${user.first_name || ""} ${
              user.other_name || ""
            }`.trim()
          : "Unknown Student",
        studentId: student?.reg_no || "Unknown",
        studentUserId: student?.user_id?.toString() || null,
        course: course
          ? {
              id: course.id,
              name: course.name,
              code: course.code,
              units: course.units,
              department: course.department?.name || "Unknown Department",
            }
          : null,
        semester: semester
          ? {
              id: semester.id,
              name: semester.name,
              session: semester.session?.name,
            }
          : null,
        score: parseFloat(result.score || "0"),
        camark: result.ca_mark,
        exam_score: result.exam_score,
        grade: result.grade
          ? {
              id: result.grade.id,
              letter: result.grade.name,
              point: result.grade.point,
              minScore: result.grade.min_score,
              maxScore: result.grade.max_score,
            }
          : null,
        publish: result.publish,
        createdAt: result.created_at?.toISOString(),
        updatedAt: result.updated_at?.toISOString(),
        createdBy: result.created_by?.toString(),
        updatedBy: result.updated_by?.toString(),
      };
    });

    // Get grade distribution statistics
    const gradeDistribution = await prisma.student_result.groupBy({
      by: ["grade_id"],
      where: whereClause,
      _count: {
        grade_id: true,
      },
      orderBy: {
        grade_id: "asc",
      },
    });

    // Get grade details for distribution
    const gradeDetails = await prisma.grade.findMany({
      where: {
        id: {
          in: gradeDistribution
            .map((g) => g.grade_id)
            .filter((id): id is number => id !== null),
        },
      },
      select: {
        id: true,
        name: true,
        point: true,
      },
    });

    const gradeDistributionWithDetails = gradeDistribution.map((dist) => {
      const gradeDetail = gradeDetails.find((g) => g.id === dist.grade_id);
      return {
        gradeId: dist.grade_id,
        gradeLetter: gradeDetail?.name,
        gradePoint: gradeDetail?.point,
        count: dist._count.grade_id,
      };
    });

    // Calculate statistics
    const statistics = {
      totalGrades: totalCount,
      averageScore:
        results.length > 0
          ? results.reduce((sum, g) => sum + parseFloat(g.score || "0"), 0) /
            results.length
          : 0,
      publishedCount: results.filter((g) => g.publish).length,
      unpublishedCount: results.filter((g) => !g.publish).length,
      gradeDistribution: gradeDistributionWithDetails,
    };

    return NextResponse.json({
      success: true,
      data: {
        grades: transformedResults, // Keep 'grades' key for compatibility
        statistics,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching student results:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch student results",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
