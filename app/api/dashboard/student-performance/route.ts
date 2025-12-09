import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    const departmentId = searchParams.get('departmentId');
    const programmeId = searchParams.get('programmeId');
    const levelId = searchParams.get('levelId');
    const academicStanding = searchParams.get('academicStanding');
    const searchTerm = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Build where clause based on filters
    const whereClause: any = {
      is_deleted: false,
    };

    if (institutionId) {
      whereClause.user_student_user_idTouser = {
        institution_id: parseInt(institutionId)
      };
    }

    if (programmeId) {
      whereClause.programme_id = parseInt(programmeId);
    }

    // Handle search functionality
    if (searchTerm) {
      const searchConditions: any[] = [];
      
      // Search by student name (first_name, last_name, other_name)
      searchConditions.push({
        user_student_user_idTouser: {
          OR: [
            { first_name: { contains: searchTerm, mode: 'insensitive' } },
            { last_name: { contains: searchTerm, mode: 'insensitive' } },
            { other_name: { contains: searchTerm, mode: 'insensitive' } }
          ]
        }
      });

      // Search by student registration number
      searchConditions.push({
        reg_no: { contains: searchTerm, mode: 'insensitive' }
      });

      // Search by department name
      searchConditions.push({
        programme: {
          department: {
            name: { contains: searchTerm, mode: 'insensitive' }
          }
        }
      });

      // Search by programme name
      searchConditions.push({
        programme: {
          name: { contains: searchTerm, mode: 'insensitive' }
        }
      });

      // Apply OR search conditions
      whereClause.OR = searchConditions;
    }

    // Get students with their performance data
    const [students, totalCount] = await Promise.all([
      prisma.student.findMany({
        where: whereClause,
        include: {
          user_student_user_idTouser: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              other_name: true,
              active: true
            }
          },
          programme: {
            select: {
              id: true,
              name: true,
              years: true,
              department: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  faculty: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          },
          student_gpa: {
            orderBy: { created_at: 'desc' },
            take: 1,
            select: {
              id: true,
              current_gpa: true,
              cumulative_gpa: true,
              level_id: true,
              semester_id: true,
              semester: {
                select: {
                  name: true,
                  session: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          },
          student_course: {
            include: {
              course: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  units: true
                }
              },
              student_result: {
                select: {
                  id: true,
                  score: true,
                  grade: {
                    select: {
                      name: true,
                      point: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { created_at: 'desc' }
        ],
        skip: offset,
        take: limit
      }),
      prisma.student.count({
        where: whereClause
      })
    ]);

    // Transform student data with performance metrics
    const transformedStudents = students.map(student => {
      const latestGPA = student.student_gpa?.[0];
      const studentCourses = student.student_course || [];
      const user = student.user_student_user_idTouser;
      
      // Calculate course statistics
      const totalCoursesEnrolled = studentCourses.length;
      const completedCourses = studentCourses.filter(sc => 
        sc.student_result && sc.student_result.length > 0
      ).length;
      const coursesWithResults = studentCourses.filter(sc => 
        sc.student_result && sc.student_result.length > 0
      );

      // Calculate average score from results
      const totalScore = coursesWithResults.reduce((sum, sc) => {
        const result = sc.student_result?.[0];
        return sum + (result ? parseFloat(result.score || '0') : 0);
      }, 0);
      const averageScore = coursesWithResults.length > 0 ? totalScore / coursesWithResults.length : 0;

      // Determine academic standing based on GPA
      const gpa = Number(latestGPA?.current_gpa) || 0;
      let academicStanding = 'good';
      if (gpa < 1.5) {
        academicStanding = 'probation';
      } else if (gpa < 2.0) {
        academicStanding = 'warning';
      }

      return {
        id: student.id.toString(),
        studentId: student.reg_no,
        studentName: user ? 
          `${user.last_name || ''}, ${user.first_name || ''} ${user.other_name || ''}`.trim() :
          'Unknown Student',
        userId: student.user_id?.toString(),
        isActive: user?.active || false,
        programme: student.programme ? {
          id: student.programme.id,
          name: student.programme.name,
          years: student.programme.years,
          department: student.programme.department
        } : null,
        currentLevel: 'Not Set', // Level relation doesn't exist on student_gpa
        currentSemester: latestGPA?.semester?.name || 'Not Set',
        academicSession: latestGPA?.semester?.session?.name || 'Not Set',
        performance: {
          gpa: Number(latestGPA?.current_gpa) || 0,
          cgpa: Number(latestGPA?.cumulative_gpa) || 0,
          averageScore,
          coursesEnrolled: totalCoursesEnrolled,
          coursesCompleted: completedCourses,
          completionRate: totalCoursesEnrolled > 0 ? 
            (completedCourses / totalCoursesEnrolled) * 100 : 0,
          academicStanding,
          totalUnits: studentCourses.reduce((sum, sc) => 
            sum + Number(sc.course?.units || 0), 0
          ),
          completedUnits: coursesWithResults.reduce((sum, sc) => 
            sum + Number(sc.course?.units || 0), 0
          )
        },
        recentCourses: studentCourses.slice(0, 5).map(sc => ({
          id: sc.course?.id || 0,
          name: sc.course?.name || 'Unknown Course',
          code: sc.course?.code || 'N/A',
          units: sc.course?.units || 0,
          hasResult: !!(sc.student_result && sc.student_result.length > 0),
          grade: sc.student_result?.[0]?.grade?.name,
          score: sc.student_result?.[0] ? parseFloat(sc.student_result[0].score || '0') : null
        })),
        createdAt: student.created_at?.toISOString(),
        updatedAt: student.updated_at?.toISOString()
      };
    });

    // Filter by academic standing if specified
    let filteredStudents = transformedStudents;
    if (academicStanding) {
      filteredStudents = transformedStudents.filter(s => 
        s.performance.academicStanding === academicStanding
      );
    }

    // Calculate performance statistics
    const performanceStats = {
      totalStudents: filteredStudents.length,
      activeStudents: filteredStudents.filter(s => s.isActive).length,
      averageGPA: filteredStudents.length > 0 ? 
        filteredStudents.reduce((sum, s) => sum + s.performance.gpa, 0) / filteredStudents.length : 0,
      averageCGPA: filteredStudents.length > 0 ? 
        filteredStudents.reduce((sum, s) => sum + s.performance.cgpa, 0) / filteredStudents.length : 0,
      academicStandingDistribution: {
        good: filteredStudents.filter(s => s.performance.academicStanding === 'good').length,
        warning: filteredStudents.filter(s => s.performance.academicStanding === 'warning').length,
        probation: filteredStudents.filter(s => s.performance.academicStanding === 'probation').length
      },
      completionRateStats: {
        high: filteredStudents.filter(s => s.performance.completionRate >= 80).length,
        medium: filteredStudents.filter(s => s.performance.completionRate >= 60 && s.performance.completionRate < 80).length,
        low: filteredStudents.filter(s => s.performance.completionRate < 60).length
      }
    };

    // Get department-wise performance if no specific filters
    let departmentStats: any[] = [];
    if (!departmentId && !programmeId) {
      const deptPerformance = await prisma.student.groupBy({
        by: ['programme_id'],
        where: whereClause,
        _count: {
          id: true
        }
      });

      const programmeDetails = await prisma.programme.findMany({
        where: {
          id: {
            in: deptPerformance.map(d => d.programme_id).filter((id): id is number => id !== null)
          }
        },
        select: {
          id: true,
          name: true,
          department_id: true
        }
      });

      departmentStats = deptPerformance.map(perf => {
        const programme = programmeDetails.find(p => p.id === perf.programme_id);
        return {
          programmeId: perf.programme_id,
          programmeName: programme?.name,
          departmentId: programme?.department_id,
          studentCount: perf._count.id
        };
      });
    }

    return NextResponse.json({
      students: filteredStudents,
      statistics: performanceStats,
      departmentStats,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching student performance:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch student performance data', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}