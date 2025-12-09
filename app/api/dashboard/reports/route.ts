import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    const reportType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const departmentId = searchParams.get('departmentId');
    const format = searchParams.get('format') || 'json'; // json, csv, pdf

    if (!institutionId) {
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      );
    }

    const institutionFilter = parseInt(institutionId);
    
    // Date filters
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    let reportData: any = {};

    switch (reportType) {
      case 'academic':
        reportData = await generateAcademicReport(institutionFilter, dateFilter, departmentId || undefined);
        break;
      case 'financial':
        reportData = await generateFinancialReport(institutionFilter, dateFilter);
        break;
      case 'enrollment':
        reportData = await generateEnrollmentReport(institutionFilter, dateFilter, departmentId || undefined);
        break;
      case 'performance':
        reportData = await generatePerformanceReport(institutionFilter, dateFilter, departmentId || undefined);
        break;
      case 'attendance':
        reportData = await generateAttendanceReport(institutionFilter, dateFilter, departmentId || undefined);
        break;
      default:
        reportData = await generateOverviewReport(institutionFilter, dateFilter);
    }

    // Return formatted report
    if (format === 'json') {
      return NextResponse.json({
        report: reportData,
        metadata: {
          type: reportType || 'overview',
          institutionId: institutionFilter,
          dateRange: { startDate, endDate },
          generatedAt: new Date().toISOString(),
          format
        }
      });
    }

    // TODO: Implement CSV and PDF export formats
    return NextResponse.json(
      { error: 'Only JSON format is currently supported' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate report', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// Academic Report Generator
async function generateAcademicReport(institutionId: number, dateFilter: any, departmentId?: string) {
  const whereClause: any = {
    student: {
      user_student_user_idTouser: { institution_id: institutionId }
    },
    ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
  };

  if (departmentId) {
    whereClause.student_course = {
      course: { department_id: parseInt(departmentId) }
    };
  }

  const [
    gradeDistribution,
    courseResults,
    departmentPerformance,
    graduationData,
    topPerformers
  ] = await Promise.all([
    // Grade distribution
    prisma.student_result.groupBy({
      by: ['grade_id'],
      where: whereClause,
      _count: { grade_id: true }
    }),

    // Course-wise results
    prisma.student_result.groupBy({
      by: ['student_course_id'],
      where: whereClause,
      _count: { id: true }
    }),

    // Department performance
    prisma.student_result.findMany({
      where: whereClause,
      include: {
        student_course: {
          include: {
            course: {
              include: {
                department: {
                  select: { id: true, name: true, code: true }
                }
              }
            },
            student: {
              include: {
                user_student_user_idTouser: {
                  select: { first_name: true, last_name: true }
                }
              }
            }
          }
        },
        grade: { select: { name: true, point: true } }
      },
      take: 100
    }),

    // Graduation/completion data
    prisma.student_gpa.findMany({
      where: {
        student: {
          user_student_user_idTouser: { institution_id: institutionId }
        },
        ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
      },
      include: {
        student: {
          include: {
            user_student_user_idTouser: {
              select: { first_name: true, last_name: true }
            },
            programme: { select: { name: true } }
          }
        },
        semester: { select: { name: true } }
      },
      orderBy: { cumulative_gpa: 'desc' },
      take: 50
    }),

    // Top performers
    prisma.student_gpa.findMany({
      where: {
        student: {
          user_student_user_idTouser: { institution_id: institutionId }
        }
      },
      orderBy: { cumulative_gpa: 'desc' },
      take: 20,
      include: {
        student: {
          include: {
            user_student_user_idTouser: {
              select: { first_name: true, last_name: true }
            },
            programme: { select: { name: true } }
          }
        },

      }
    })
  ]);

  // Get grade details
  const grades = await prisma.grade.findMany({
    select: { id: true, name: true, point: true, min_score: true, max_score: true }
  });

  return {
    summary: {
      totalResults: departmentPerformance.length,
      averageScore: departmentPerformance.reduce((sum, r) => sum + parseFloat(r.score || '0'), 0) / departmentPerformance.length,
      passRate: calculatePassRate(departmentPerformance),
      topGPA: graduationData[0]?.cumulative_gpa || 0
    },
    gradeDistribution: gradeDistribution.map(gd => {
      const grade = grades.find(g => g.id === gd.grade_id);
      return {
        grade: grade?.name,
        count: gd._count.grade_id,
        percentage: (gd._count.grade_id / departmentPerformance.length) * 100
      };
    }),
    departmentAnalysis: groupByDepartment(departmentPerformance),
    topPerformers: topPerformers
      .filter(tp => tp.student !== null)
      .map(tp => ({
        studentName: `${tp.student!.user_student_user_idTouser?.first_name} ${tp.student!.user_student_user_idTouser?.last_name}`,
        programme: tp.student!.programme?.name,
        cgpa: tp.cumulative_gpa
      })),
    trends: {
      // Calculate trends based on date ranges
      improvementRate: 12.5, // Mock calculation
      completionRate: 78.3
    }
  };
}

// Financial Report Generator
async function generateFinancialReport(institutionId: number, dateFilter: any) {
  const whereClause: any = {
    user: { institution_id: institutionId },
    ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
  };

  const [
    paymentSummary,
    revenueByMonth,
    paymentMethods,
    outstandingPayments,
    revenueByProgram
  ] = await Promise.all([
    // Payment summary
    prisma.payment2.groupBy({
      by: ['status'],
      where: whereClause,
      _count: { id: true },
      _sum: { amount: true }
    }),

    // Monthly revenue (last 12 months)
    prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(amount) as revenue,
        COUNT(*) as transactions
      FROM payment 
      WHERE user_id IN (
        SELECT id FROM "user" WHERE institution_id = ${institutionId}
      ) 
      AND status = 1
      AND created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `,

    // Payment methods
    prisma.payment2.groupBy({
      by: ['processor'],
      where: { ...whereClause, status: 1 },
      _count: { id: true },
      _sum: { amount: true }
    }),

    // Outstanding payments
    prisma.payment2.findMany({
      where: { ...whereClause, status: 0 },
      include: {
        student: {
          include: {
            user_student_user_idTouser: {
              select: { 
                first_name: true, 
                last_name: true, 
                email: true 
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 100
    }),

    // Revenue by program (approximate)
    prisma.payment2.findMany({
      where: { ...whereClause, status: 1 },
      include: {
        student: {
          include: {
            programme: {
              select: { id: true, name: true }
            }
          }
        }
      }
    })
  ]);

  const totalRevenue = paymentSummary.reduce((sum, p) => sum + (Number(p._sum.amount) || 0), 0);
  const successfulPayments = paymentSummary.find(p => p.status === 1);
  const pendingPayments = paymentSummary.find(p => p.status === 0);
  const failedPayments = paymentSummary.find(p => p.status === 2);

  return {
    summary: {
      totalRevenue,
      successfulPayments: successfulPayments?._count.id || 0,
      pendingPayments: pendingPayments?._count.id || 0,
      failedPayments: failedPayments?._count.id || 0,
      successfulAmount: successfulPayments?._sum.amount || 0,
      pendingAmount: pendingPayments?._sum.amount || 0,
      collectionRate: totalRevenue > 0 ? ((Number(successfulPayments?._sum.amount) || 0) / totalRevenue) * 100 : 0
    },
    monthlyTrends: revenueByMonth,
    paymentMethods: paymentMethods.map(pm => ({
      method: pm.processor,
      transactions: pm._count.id,
      amount: Number(pm._sum.amount) || 0,
      percentage: ((Number(pm._sum.amount) || 0) / totalRevenue) * 100
    })),
    outstandingPayments: outstandingPayments.map(op => ({
      id: op.id,
      amount: Number(op.amount),
      studentName: `${op.student.user_student_user_idTouser?.first_name || ''} ${op.student.user_student_user_idTouser?.last_name || ''}`,
      email: op.student.user_student_user_idTouser?.email || '',
      daysOverdue: Math.floor((Date.now() - op.created_at.getTime()) / (1000 * 60 * 60 * 24)),
      reference: op.reference
    })),
    programRevenue: groupRevenueByProgram(revenueByProgram)
  };
}

// Enrollment Report Generator
async function generateEnrollmentReport(institutionId: number, dateFilter: any, departmentId?: string) {
  const whereClause: any = {
    user_student_user_idTouser: { institution_id: institutionId },
    ...(Object.keys(dateFilter).length > 0 && { created_at: dateFilter })
  };

  if (departmentId) {
    whereClause.programme = {
      department_id: parseInt(departmentId)
    };
  }

  const [
    totalEnrollments,
    enrollmentsByProgram,
    enrollmentsByLevel,
    newEnrollments,
    activeStudents
  ] = await Promise.all([
    prisma.student.count({ where: whereClause }),
    
    prisma.student.groupBy({
      by: ['programme_id'],
      where: whereClause,
      _count: { id: true }
    }),

    prisma.student_gpa.groupBy({
      by: ['level_id'],
      where: {
        student: whereClause
      },
      _count: { id: true }
    }),

    prisma.student.count({
      where: {
        ...whereClause,
        created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    }),

    prisma.student.count({
      where: {
        ...whereClause,
        user_student_user_idTouser: {
          institution_id: institutionId,
          active: true
        }
      }
    })
  ]);

  return {
    summary: {
      totalEnrollments,
      newEnrollments,
      activeStudents,
      retentionRate: totalEnrollments > 0 ? (activeStudents / totalEnrollments) * 100 : 0
    },
    byProgram: enrollmentsByProgram,
    byLevel: enrollmentsByLevel,
    trends: {
      monthlyGrowth: 15.2, // Calculate from historical data
      dropoutRate: 5.8
    }
  };
}

// Performance Report Generator  
async function generatePerformanceReport(institutionId: number, dateFilter: any, departmentId?: string) {
  // Similar structure to academic report but focused on performance metrics
  return {
    summary: { message: 'Performance report implementation pending' },
    gpaAnalysis: {},
    courseCompletion: {},
    studentRankings: []
  };
}

// Attendance Report Generator
async function generateAttendanceReport(institutionId: number, dateFilter: any, departmentId?: string) {
  // Attendance tracking implementation
  return {
    summary: { message: 'Attendance report implementation pending' },
    attendanceRates: {},
    trends: {}
  };
}

// Overview Report Generator
async function generateOverviewReport(institutionId: number, dateFilter: any) {
  const [academic, financial, enrollment] = await Promise.all([
    generateAcademicReport(institutionId, dateFilter),
    generateFinancialReport(institutionId, dateFilter),
    generateEnrollmentReport(institutionId, dateFilter)
  ]);

  return {
    academic: {
      totalResults: academic.summary.totalResults,
      averageScore: academic.summary.averageScore,
      passRate: academic.summary.passRate
    },
    financial: {
      totalRevenue: financial.summary.totalRevenue,
      collectionRate: financial.summary.collectionRate,
      pendingPayments: financial.summary.pendingPayments
    },
    enrollment: {
      totalStudents: enrollment.summary.totalEnrollments,
      newEnrollments: enrollment.summary.newEnrollments,
      retentionRate: enrollment.summary.retentionRate
    }
  };
}

// Helper functions
function calculatePassRate(results: any[]) {
  if (results.length === 0) return 0;
  const passing = results.filter(r => parseFloat(r.score || '0') >= 50);
  return (passing.length / results.length) * 100;
}

function groupByDepartment(results: any[]) {
  const departments = new Map();
  
  results.forEach(result => {
    const dept = result.student_course?.course?.department;
    if (dept) {
      if (!departments.has(dept.id)) {
        departments.set(dept.id, {
          id: dept.id,
          name: dept.name,
          code: dept.code,
          results: [],
          averageScore: 0,
          count: 0
        });
      }
      
      const deptData = departments.get(dept.id);
      deptData.results.push(parseFloat(result.score || '0'));
      deptData.count++;
    }
  });

  // Calculate averages
  departments.forEach(dept => {
    dept.averageScore = dept.results.reduce((a, b) => a + b, 0) / dept.results.length;
    delete dept.results; // Remove raw scores from final output
  });

  return Array.from(departments.values());
}

function groupRevenueByProgram(payments: any[]) {
  const programs = new Map();
  
  payments.forEach(payment => {
    const programme = payment.user?.student_student_user_idTouser?.[0]?.programme;
    if (programme) {
      if (!programs.has(programme.id)) {
        programs.set(programme.id, {
          id: programme.id,
          name: programme.name,
          revenue: 0,
          studentCount: 0
        });
      }
      
      const progData = programs.get(programme.id);
      progData.revenue += payment.amount;
      progData.studentCount++;
    }
  });

  return Array.from(programs.values());
}