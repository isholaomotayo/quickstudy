import { NextRequest, NextResponse } from 'next/server';


import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    const reportType = searchParams.get('type') || 'academic';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const format = searchParams.get('format') || 'json';

    if (!institutionId) {
      return NextResponse.json(
        { error: 'Institution ID is required' },
        { status: 400 }
      );
    }

    const institutionFilter = parseInt(institutionId);
    const dateFilter = startDate && endDate ? {
      gte: new Date(startDate),
      lte: new Date(endDate)
    } : undefined;

    let reportData;

    switch (reportType) {
      case 'academic':
        reportData = await generateAcademicReport(institutionFilter, dateFilter);
        break;
      case 'financial':
        reportData = await generateFinancialReport(institutionFilter, dateFilter);
        break;
      case 'enrollment':
        reportData = await generateEnrollmentReport(institutionFilter, dateFilter);
        break;
      case 'performance':
        reportData = await generatePerformanceReport(institutionFilter, dateFilter);
        break;
      default:
        reportData = await generateAcademicReport(institutionFilter, dateFilter);
    }

    if (format === 'csv') {
      const csv = convertToCSV(reportData);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${reportType}-report.csv"`,
        },
      });
    }

    return NextResponse.json(reportData);

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

async function generateAcademicReport(institutionId: number, dateFilter?: any) {
  const [
    totalStudents,
    admittedStudents,
    completedApplications,
    ongoingApplications,
    gradeDistribution,
    averageGPA,
    topPerformers,
    programmeStats
  ] = await Promise.all([
    // Total students
    prisma.student.count({
      where: {
        is_deleted: false,
        user_student_user_idTouser: { institution_id: institutionId }
      }
    }),

    // Admitted students
    prisma.student.count({
      where: {
        admitted: true,
        is_deleted: false,
        user_student_user_idTouser: { institution_id: institutionId }
      }
    }),

    // Completed applications
    prisma.student.count({
      where: {
        status: true,
        admitted: false,
        is_deleted: false,
        user_student_user_idTouser: { institution_id: institutionId }
      }
    }),

    // Ongoing applications
    prisma.student.count({
      where: {
        status: false,
        is_deleted: false,
        user_student_user_idTouser: { institution_id: institutionId }
      }
    }),

    // Grade distribution
    prisma.student_result.groupBy({
      by: ['grade_id'],
      where: {
        student_course: {
          student: {
            user_student_user_idTouser: { institution_id: institutionId }
          }
        }
      },
      _count: { grade_id: true }
    }),

    // Average GPA
    prisma.student_gpa.aggregate({
      _avg: { cumulative_gpa: true },
      where: {
        student: {
          user_student_user_idTouser: { institution_id: institutionId }
        }
      }
    }),

    // Top performers
    prisma.student_gpa.findMany({
      where: {
        student: {
          user_student_user_idTouser: { institution_id: institutionId }
        }
      },
      orderBy: { cumulative_gpa: 'desc' },
      take: 10,
      include: {
        student: {
          include: {
            user_student_user_idTouser: {
              select: { first_name: true, last_name: true, email: true }
            },
            programme: { select: { name: true } }
          }
        }
      }
    }),

    // Programme statistics
    prisma.student.groupBy({
      by: ['programme_id'],
      where: {
        is_deleted: false,
        user_student_user_idTouser: { institution_id: institutionId }
      },
      _count: { id: true }
    })
  ]);

  // Get reference data
  const [programmes, grades] = await Promise.all([
    prisma.programme.findMany({
      where: {
        department: {
          faculty: { institution_id: institutionId }
        }
      },
      select: { id: true, name: true }
    }),
    prisma.grade.findMany({
      select: { id: true, name: true, point: true }
    })
  ]);

  return {
    reportType: 'academic',
    summary: {
      totalStudents,
      admittedStudents,
      completedApplications,
      ongoingApplications,
      averageGPA: averageGPA._avg.cumulative_gpa || 0,
      admissionRate: totalStudents > 0 ? (admittedStudents / totalStudents) * 100 : 0,
      completionRate: totalStudents > 0 ? (completedApplications / totalStudents) * 100 : 0
    },
    gradeDistribution: gradeDistribution.map(gd => {
      const grade = grades.find(g => g.id === gd.grade_id);
      return {
        grade: grade?.name || 'Unknown',
        point: grade?.point || 0,
        count: gd._count.grade_id,
        percentage: totalStudents > 0 ? (gd._count.grade_id / totalStudents) * 100 : 0
      };
    }),
    topPerformers: topPerformers
      .filter(tp => tp.student !== null)
      .map(tp => ({
        studentId: tp.student!.reg_no,
        studentName: `${tp.student!.user_student_user_idTouser?.first_name} ${tp.student!.user_student_user_idTouser?.last_name}`,
        email: tp.student!.user_student_user_idTouser?.email,
        programme: tp.student!.programme?.name,
        cgpa: tp.cumulative_gpa
      })),
    programmeStats: programmeStats.map(ps => {
      const programme = programmes.find(p => p.id === ps.programme_id);
      return {
        programmeId: ps.programme_id,
        programmeName: programme?.name || 'Unknown',
        studentCount: ps._count.id,
        percentage: totalStudents > 0 ? (ps._count.id / totalStudents) * 100 : 0
      };
    })
  };
}

async function generateFinancialReport(institutionId: number, dateFilter?: any) {
  const [
    totalRevenue,
    monthlyRevenue,
    paymentStats,
    revenueByProgramme,
    feeBreakdown
  ] = await Promise.all([
    // Total revenue
    prisma.payment2.aggregate({
      _sum: { amount: true },
      where: {
        status: 1, // successful payments
        student: {
          user_student_user_idTouser: { institution_id: institutionId }
        }
      }
    }),

    // Monthly revenue
    prisma.payment2.aggregate({
      _sum: { amount: true },
      where: {
        status: 1,
        created_at: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        },
        student: {
          user_student_user_idTouser: { institution_id: institutionId }
        }
      }
    }),

    // Payment statistics
    prisma.payment2.groupBy({
      by: ['status'],
      where: {
        student: {
          user_student_user_idTouser: { institution_id: institutionId }
        }
      },
      _count: { id: true },
      _sum: { amount: true }
    }),

    // Revenue by programme (approximate)
    prisma.payment2.groupBy({
      by: ['student_id'],
      where: {
        status: 1,
        student: {
          user_student_user_idTouser: { institution_id: institutionId }
        }
      },
      _sum: { amount: true }
    }),

    // Fee breakdown - using payment2 table
    prisma.payment2.groupBy({
      by: ['status'],
      where: {
        student: {
          user_student_user_idTouser: { institution_id: institutionId }
        }
      },
      _sum: { amount: true },
      _count: { id: true }
    })
  ]);

  return {
    reportType: 'financial',
    summary: {
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      totalPayments: paymentStats.reduce((sum, p) => sum + p._count.id, 0),
      successfulPayments: paymentStats.find(p => p.status === 1)?._count.id || 0,
      pendingPayments: paymentStats.find(p => p.status === 0)?._count.id || 0,
      failedPayments: paymentStats.find(p => p.status === 2)?._count.id || 0
    },
    paymentStats: paymentStats.map(ps => ({
      status: ps.status === 1 ? 'Successful' : ps.status === 0 ? 'Pending' : 'Failed',
      count: ps._count.id,
      amount: ps._sum.amount || 0,
      percentage: paymentStats.reduce((sum, p) => sum + p._count.id, 0) > 0 
        ? (ps._count.id / paymentStats.reduce((sum, p) => sum + p._count.id, 0)) * 100 
        : 0
    })),
    feeBreakdown: feeBreakdown.map(fb => {
      return {
        status: fb.status === 1 ? 'Successful' : fb.status === 0 ? 'Pending' : 'Failed',
        totalAmount: fb._sum.amount || 0,
        count: fb._count.id,
                percentage: (Number(totalRevenue._sum.amount) || 0) > 0
          ? ((Number(fb._sum.amount) || 0) / (Number(totalRevenue._sum.amount) || 0)) * 100
          : 0
      };
    })
  };
}

async function generateEnrollmentReport(institutionId: number, dateFilter?: any) {
  const [
    totalEnrollments,
    enrollmentsByProgramme,
    enrollmentsByLevel,
    enrollmentsByGender,
    enrollmentTrends,
    newEnrollments
  ] = await Promise.all([
    // Total enrollments
    prisma.student.count({
      where: {
        is_deleted: false,
        user_student_user_idTouser: { institution_id: institutionId }
      }
    }),

    // Enrollments by programme
    prisma.student.groupBy({
      by: ['programme_id'],
      where: {
        is_deleted: false,
        user_student_user_idTouser: { institution_id: institutionId }
      },
      _count: { id: true }
    }),

    // Enrollments by level
    prisma.student.groupBy({
      by: ['entry_level_id'],
      where: {
        is_deleted: false,
        user_student_user_idTouser: { institution_id: institutionId }
      },
      _count: { id: true }
    }),

    // Enrollments by gender
    prisma.student.groupBy({
      by: ['gender'],
      where: {
        is_deleted: false,
        user_student_user_idTouser: { institution_id: institutionId }
      },
      _count: { id: true }
    }),

    // Enrollment trends (monthly)
    prisma.student.groupBy({
      by: ['created_at'],
      where: {
        is_deleted: false,
        user_student_user_idTouser: { institution_id: institutionId }
      },
      _count: { id: true }
    }),

    // New enrollments this month
    prisma.student.count({
      where: {
        is_deleted: false,
        created_at: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        },
        user_student_user_idTouser: { institution_id: institutionId }
      }
    })
  ]);

  // Get reference data
  const [programmes, levels] = await Promise.all([
    prisma.programme.findMany({
      where: {
        department: {
          faculty: { institution_id: institutionId }
        }
      },
      select: { id: true, name: true }
    }),
    prisma.level.findMany({
      select: { id: true, name: true }
    })
  ]);

  return {
    reportType: 'enrollment',
    summary: {
      totalEnrollments,
      newEnrollmentsThisMonth: newEnrollments,
      growthRate: totalEnrollments > 0 ? (newEnrollments / totalEnrollments) * 100 : 0
    },
    byProgramme: enrollmentsByProgramme.map(ep => {
      const programme = programmes.find(p => p.id === ep.programme_id);
      return {
        programmeId: ep.programme_id,
        programmeName: programme?.name || 'Unknown',
        enrollmentCount: ep._count.id,
        percentage: totalEnrollments > 0 ? (ep._count.id / totalEnrollments) * 100 : 0
      };
    }),
    byLevel: enrollmentsByLevel.map(el => {
      const level = levels.find(l => l.id === el.entry_level_id);
      return {
        levelId: el.entry_level_id,
        levelName: level?.name || 'Unknown',
        enrollmentCount: el._count.id,
        percentage: totalEnrollments > 0 ? (el._count.id / totalEnrollments) * 100 : 0
      };
    }),
    byGender: enrollmentsByGender.map(eg => ({
      gender: eg.gender || 'Unknown',
      enrollmentCount: eg._count.id,
      percentage: totalEnrollments > 0 ? (eg._count.id / totalEnrollments) * 100 : 0
    }))
  };
}

async function generatePerformanceReport(institutionId: number, dateFilter?: any) {
  const [
    averageGPA,
    gradeDistribution,
    topPerformers,
    performanceByProgramme,
    performanceByLevel,
    academicStanding
  ] = await Promise.all([
    // Average GPA
    prisma.student_gpa.aggregate({
      _avg: { cumulative_gpa: true },
      where: {
        student: {
          user_student_user_idTouser: { institution_id: institutionId }
        }
      }
    }),

    // Grade distribution
    prisma.student_result.groupBy({
      by: ['grade_id'],
      where: {
        student_course: {
          student: {
            user_student_user_idTouser: { institution_id: institutionId }
          }
        }
      },
      _count: { grade_id: true }
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
              select: { first_name: true, last_name: true, email: true }
            },
            programme: { select: { name: true } }
          }
        }
      }
    }),

    // Performance by programme
    prisma.student_gpa.groupBy({
      by: ['student_id'],
      where: {
        student: {
          user_student_user_idTouser: { institution_id: institutionId }
        }
      },
      _avg: { cumulative_gpa: true }
    }),

    // Performance by level
    prisma.student_gpa.groupBy({
      by: ['level_id'],
      where: {
        student: {
          user_student_user_idTouser: { institution_id: institutionId }
        }
      },
      _avg: { cumulative_gpa: true }
    }),

    // Academic standing distribution
    prisma.student_gpa.findMany({
      where: {
        student: {
          user_student_user_idTouser: { institution_id: institutionId }
        }
      },
      select: { cumulative_gpa: true }
    })
  ]);

  // Get reference data
  const [programmes, levels, grades] = await Promise.all([
    prisma.programme.findMany({
      where: {
        department: {
          faculty: { institution_id: institutionId }
        }
      },
      select: { id: true, name: true }
    }),
    prisma.level.findMany({
      select: { id: true, name: true }
    }),
    prisma.grade.findMany({
      select: { id: true, name: true, point: true }
    })
  ]);

  // Calculate academic standing
  const academicStandingStats = {
    excellent: academicStanding.filter(s => s.cumulative_gpa !== null && Number(s.cumulative_gpa) >= 4.5).length,
    good: academicStanding.filter(s => s.cumulative_gpa !== null && Number(s.cumulative_gpa) >= 3.5 && Number(s.cumulative_gpa) < 4.5).length,
    satisfactory: academicStanding.filter(s => s.cumulative_gpa !== null && Number(s.cumulative_gpa) >= 2.0 && Number(s.cumulative_gpa) < 3.5).length,
    probation: academicStanding.filter(s => s.cumulative_gpa !== null && Number(s.cumulative_gpa) < 2.0).length
  };

  return {
    reportType: 'performance',
    summary: {
      averageGPA: averageGPA._avg.cumulative_gpa || 0,
      totalStudents: academicStanding.length,
      excellentStudents: academicStandingStats.excellent,
      goodStudents: academicStandingStats.good,
      satisfactoryStudents: academicStandingStats.satisfactory,
      probationStudents: academicStandingStats.probation
    },
    gradeDistribution: gradeDistribution.map(gd => {
      const grade = grades.find(g => g.id === gd.grade_id);
      return {
        grade: grade?.name || 'Unknown',
        point: grade?.point || 0,
        count: gd._count.grade_id,
        percentage: academicStanding.length > 0 ? (gd._count.grade_id / academicStanding.length) * 100 : 0
      };
    }),
    topPerformers: topPerformers
      .filter(tp => tp.student !== null)
      .map(tp => ({
        studentId: tp.student!.reg_no,
        studentName: `${tp.student!.user_student_user_idTouser?.first_name} ${tp.student!.user_student_user_idTouser?.last_name}`,
        email: tp.student!.user_student_user_idTouser?.email,
        programme: tp.student!.programme?.name,
        cgpa: tp.cumulative_gpa
      })),
    academicStanding: academicStandingStats
  };
}

function convertToCSV(data: any): string {
  if (!data || typeof data !== 'object') return '';
  
  const flattenObject = (obj: any, prefix = ''): any => {
    let flattened: any = {};
    for (const key in obj) {
      if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(flattened, flattenObject(obj[key], `${prefix}${key}_`));
      } else {
        flattened[`${prefix}${key}`] = obj[key];
      }
    }
    return flattened;
  };
  
  const flattened = flattenObject(data);
  const headers = Object.keys(flattened);
  const values = Object.values(flattened);
  
  return [headers.join(','), values.join(',')].join('\n');
}
