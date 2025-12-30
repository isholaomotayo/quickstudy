import { NextRequest, NextResponse } from 'next/server';


import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get('institutionId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

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

    // Get comprehensive analytics data using Prisma ORM
    let applicantCount = 0, admittedCount = 0, completedCount = 0, acceptancePaidCount = 0;
    let monthlyTrends: any[] = [], programmeStats: any[] = [], departmentStats: any[] = [], facultyStats: any[] = [];
    let genderStats: any[] = [], ageStats: any[] = [];
    let financialStats: any = { _sum: { amount: 0 }, _count: { id: 0 } };

    try {
      const results = await Promise.all([
        // Applicant count
        prisma.student.count({
          where: {
            status: false,
            is_deleted: false,
            user_student_user_idTouser: { 
              institution_id: institutionFilter,
              role: 'APPLICANT'
            }
          }
        }),

        // Admitted count
        prisma.student.count({
          where: {
            admitted: true,
            is_deleted: false,
            user_student_user_idTouser: { 
              institution_id: institutionFilter,
              role: 'STUDENT'
            }
          }
        }),

        // Completed applications count
        prisma.student.count({
          where: {
            status: true,
            admitted: false,
            is_deleted: false,
            user_student_user_idTouser: { 
              institution_id: institutionFilter,
              role: 'APPLICANT'
            }
          }
        }),

        // Acceptance fee paid count - using payment2 table
        prisma.payment2.count({
          where: {
            status: 1, // successful payments
            student: {
              user_student_user_idTouser: { institution_id: institutionFilter }
            }
          }
        }),

        // Monthly trends - using Prisma ORM
        prisma.student.groupBy({
          by: ['created_at'],
          where: {
            is_deleted: false,
            user_student_user_idTouser: { institution_id: institutionFilter }
          },
          _count: { id: true }
        }),

        // Programme distribution - using Prisma ORM
        prisma.student.groupBy({
          by: ['programme_id'],
          where: {
            is_deleted: false,
            user_student_user_idTouser: { institution_id: institutionFilter }
          },
          _count: { id: true }
        }),

        // Department distribution - using Prisma ORM
        prisma.student.groupBy({
          by: ['programme_id'],
          where: {
            is_deleted: false,
            user_student_user_idTouser: { institution_id: institutionFilter }
          },
          _count: { id: true }
        }),

        // Faculty distribution - using Prisma ORM
        prisma.student.groupBy({
          by: ['programme_id'],
          where: {
            is_deleted: false,
            user_student_user_idTouser: { institution_id: institutionFilter }
          },
          _count: { id: true }
        }),

        // Gender distribution
        prisma.student.groupBy({
          by: ['gender'],
          where: {
            is_deleted: false,
            user_student_user_idTouser: { institution_id: institutionFilter }
          },
          _count: { id: true }
        }),

        // Age distribution - simplified using Prisma ORM
        prisma.student.findMany({
          where: {
            is_deleted: false,
            user_student_user_idTouser: { institution_id: institutionFilter },
            dob: { not: null }
          },
          select: { dob: true }
        }),

        // Financial data - using payment2 table
        prisma.payment2.aggregate({
          _sum: { amount: true },
          _count: { id: true },
          where: {
            status: 1, // successful payments
            student: {
              user_student_user_idTouser: { institution_id: institutionFilter }
            }
          }
        })
      ]);

      // Extract results
      applicantCount = results[0] as number;
      admittedCount = results[1] as number;
      completedCount = results[2] as number;
      acceptancePaidCount = results[3] as number;
      const monthlyData = results[4] as any[];
      const programmeData = results[5] as any[];
      const departmentData = results[6] as any[];
      const facultyData = results[7] as any[];
      genderStats = results[8] as any[];
      const ageData = results[9] as any[];
      financialStats = results[10] as any;

      // Get reference data for better analytics
      const [programmes, departments, faculties] = await Promise.all([
        prisma.programme.findMany({
          where: {
            department: {
              faculty: { institution_id: institutionFilter }
            }
          },
          include: {
            department: {
              include: {
                faculty: true
              }
            }
          }
        }),
        prisma.department.findMany({
          where: {
            faculty: { institution_id: institutionFilter }
          },
          include: {
            faculty: true
          }
        }),
        prisma.faculty.findMany({
          where: { institution_id: institutionFilter }
        })
      ]);

      // Process monthly trends
      monthlyTrends = monthlyData.map(item => ({
        month: item.created_at,
        ongoing: item._count.id,
        completed: 0, // Will be calculated separately
        admitted: 0 // Will be calculated separately
      }));

      // Process programme stats
      programmeStats = programmeData.map(item => {
        const programme = programmes.find(p => p.id === item.programme_id);
        return {
          programme_name: programme?.name || 'Unknown',
          application_count: item._count.id
        };
      });

      // Process department stats
      departmentStats = departmentData.map(item => {
        const programme = programmes.find(p => p.id === item.programme_id);
        const department = departments.find(d => d.id === programme?.department_id);
        return {
          department_name: department?.name || 'Unknown',
          application_count: item._count.id
        };
      });

      // Process faculty stats
      facultyStats = facultyData.map(item => {
        const programme = programmes.find(p => p.id === item.programme_id);
        const department = departments.find(d => d.id === programme?.department_id);
        const faculty = faculties.find(f => f.id === department?.faculty_id);
        return {
          faculty_name: faculty?.name || 'Unknown',
          application_count: item._count.id
        };
      });

      // Process age groups
      const ageGroups = {
        '18-25': 0,
        '26-35': 0,
        '36-45': 0,
        '46+': 0
      };

      ageData.forEach(student => {
        if (student.dob) {
          const age = new Date().getFullYear() - new Date(student.dob).getFullYear();
          if (age >= 18 && age <= 25) ageGroups['18-25']++;
          else if (age >= 26 && age <= 35) ageGroups['26-35']++;
          else if (age >= 36 && age <= 45) ageGroups['36-45']++;
          else if (age > 45) ageGroups['46+']++;
        }
      });

      ageStats = Object.entries(ageGroups).map(([group, count]) => ({
        age_group: group,
        count
      }));

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Continue with default values if queries fail
    }

    // Calculate metrics
    const totalApplications = applicantCount + completedCount + admittedCount;
    const conversionRate = totalApplications > 0 ? (admittedCount / totalApplications) * 100 : 0;
    const completionRate = totalApplications > 0 ? (completedCount / totalApplications) * 100 : 0;
    const acceptanceRate = admittedCount > 0 ? (acceptancePaidCount / admittedCount) * 100 : 0;

    // Process distributions
    const processedProgrammes = programmeStats.reduce((acc, row) => {
      const progName = row.programme_name;
      if (progName && progName.trim() && progName !== 'Unknown') {
        acc[progName] = parseInt(row.application_count) || 0;
      }
      return acc;
    }, {} as Record<string, number>);

    const processedDepartments = departmentStats.reduce((acc, row) => {
      const deptName = row.department_name;
      if (deptName && deptName.trim() && deptName !== 'Unknown') {
        acc[deptName] = parseInt(row.application_count) || 0;
      }
      return acc;
    }, {} as Record<string, number>);

    const processedFaculties = facultyStats.reduce((acc, row) => {
      const facultyName = row.faculty_name;
      if (facultyName && facultyName.trim() && facultyName !== 'Unknown') {
        acc[facultyName] = parseInt(row.application_count) || 0;
      }
      return acc;
    }, {} as Record<string, number>);

    const processedGender = genderStats.reduce((acc, row) => {
      const gender = row.gender;
      if (gender && gender.trim()) {
        const genderKey = gender.toLowerCase();
        if (['male', 'female'].includes(genderKey)) {
          acc[genderKey] = row._count.id || 0;
        } else {
          acc['other'] = (acc['other'] || 0) + (row._count.id || 0);
        }
      }
      return acc;
    }, { male: 0, female: 0, other: 0 } as Record<string, number>);

    const processedAgeGroups = ageStats.reduce((acc, row) => {
      const ageGroup = row.age_group;
      if (ageGroup && ageGroup !== 'Unknown') {
        acc[ageGroup] = parseInt(row.count) || 0;
      }
      return acc;
    }, { '18-25': 0, '26-35': 0, '36-45': 0, '46+': 0 } as Record<string, number>);

    const analytics = {
      summary: {
        totalApplications,
        ongoingApplications: applicantCount,
        completedApplications: completedCount,
        admittedStudents: admittedCount,
        acceptanceFeePaid: acceptancePaidCount,
        conversionRate: parseFloat(conversionRate.toFixed(1)),
        completionRate: parseFloat(completionRate.toFixed(1)),
        acceptanceRate: parseFloat(acceptanceRate.toFixed(1)),
      },

      monthlyTrends: monthlyTrends.map((row) => ({
        month: row.month,
        ongoing: row.ongoing,
        completed: row.completed,
        admitted: row.admitted,
      })),

      distributions: {
        programmes: processedProgrammes,
        departments: processedDepartments,
        faculties: processedFaculties,
        status: {
          ongoing: applicantCount,
          completed: completedCount,
          admitted: admittedCount,
          acceptancePaid: acceptancePaidCount,
        },
      },

      demographics: {
        gender: processedGender,
        ageGroups: processedAgeGroups,
        employment: { employed: 0, unemployed: 0, other: 0 }, // Placeholder
        maritalStatus: { single: 0, married: 0, divorced: 0, other: 0 }, // Placeholder
        previousEducation: {}, // Placeholder
      },

      financial: {
        totalRevenue: parseFloat(financialStats._sum.amount || 0),
        paymentCount: parseInt(financialStats._count.id || 0),
      },
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error generating analytics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate analytics', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
