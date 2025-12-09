import "server-only";
import { prisma } from "@/lib/db";

// Comprehensive Overview Data - Single API call for overview tab
export async function getOverviewData(institutionId?: number) {
  try {
    const [
      // Dashboard Stats
      totalUsers,
      totalStudents,
      totalStaff,
      totalCourses,
      totalProgrammes,
      totalRevenue,
      totalApplications,
      pendingCourseApprovals,
      activeSessions,

      // User Stats
      activeUsers,
      newUsersThisMonth,
      usersByRole,

      // Course Stats
      activeCourses,
      coursesByDepartment,
      totalEnrollments,

      // Financial Stats
      monthlyRevenue,
      pendingPayments,
      paymentsByStatus,

      // Academic Stats
      studentsByProgramme,
      averageGPAAgg,
      graduationCount,

      // Recent Activity
      recentUsers,
      recentPayments,
    ] = await Promise.all([
      // Dashboard Stats
      prisma.user.count({
        where: institutionId ? { institution_id: institutionId } : undefined,
      }),
      prisma.student.count({
        where: {
          is_deleted: false,
          user_student_user_idTouser: institutionId
            ? { institution_id: institutionId }
            : undefined,
        },
      }),
      prisma.staff.count({
        where: {
          is_deleted: false,
          user_staff_user_idTouser: institutionId
            ? { institution_id: institutionId }
            : undefined,
        },
      }),
      prisma.course.count(),
      prisma.programme.count(),
      prisma.payment2.aggregate({
        _sum: { amount: true },
        where: { status: 1 },
      }),
      prisma.user.count({
        where: {
          ...(institutionId ? { institution_id: institutionId } : {}),
          role: "APPLICANT",
        },
      }),
      prisma.student_course.count({
        where: { approval_status: false },
      }),
      prisma.session.count(),

      // User Stats
      prisma.user.count({
        where: {
          ...(institutionId ? { institution_id: institutionId } : {}),
          active: true,
        },
      }),
      prisma.user.count({
        where: {
          ...(institutionId ? { institution_id: institutionId } : {}),
          created_at: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.user.groupBy({
        by: ["role"],
        where: institutionId ? { institution_id: institutionId } : undefined,
        _count: { role: true },
      }),

      // Course Stats
      prisma.course.count({ where: { published: true } }),
      prisma.course.groupBy({
        by: ["programme_id"],
        _count: { programme_id: true },
      }),
      prisma.student_course.count(),

      // Financial Stats
      prisma.payment2.aggregate({
        _sum: { amount: true },
        where: {
          status: 1,
          created_at: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.payment2.count({ where: { status: 0 } }),
      prisma.payment2.groupBy({
        by: ["status"],
        _count: { status: true },
        _sum: { amount: true },
      }),

      // Academic Stats
      prisma.student.groupBy({
        by: ["programme_id"],
        where: institutionId
          ? { user_student_user_idTouser: { institution_id: institutionId } }
          : undefined,
        _count: { programme_id: true },
      }),
      prisma.student_gpa.aggregate({ _avg: { cumulative_gpa: true } }),
      prisma.student.count({ where: { admitted: true } }),

      // Recent Activity
      prisma.user.findMany({
        where: institutionId ? { institution_id: institutionId } : undefined,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          created_at: true,
        },
        orderBy: { created_at: "desc" },
        take: 5,
      }),
      prisma.payment2.findMany({
        select: { id: true, amount: true, status: true, created_at: true },
        orderBy: { created_at: "desc" },
        take: 5,
      }),
    ]);

    // Process course department data
    const programmeIds = [
      ...new Set(
        coursesByDepartment
          .map((group) => group.programme_id)
          .filter((id): id is number => typeof id === "number")
      ),
    ];
    const programmes = programmeIds.length
      ? await prisma.programme.findMany({
          where: { id: { in: programmeIds } },
          include: { department: { select: { name: true } } },
        })
      : [];
    const programmeMap = new Map(
      programmes.map((prog) => [prog.id, prog.department?.name || "Unknown"])
    );

    // Process student programme data
    const studentProgrammeIds = [
      ...new Set(
        studentsByProgramme
          .map((group) => group.programme_id)
          .filter((id): id is number => typeof id === "number")
      ),
    ];
    const studentProgrammes = studentProgrammeIds.length
      ? await prisma.programme.findMany({
          where: { id: { in: studentProgrammeIds } },
          select: { id: true, name: true },
        })
      : [];
    const studentProgrammeMap = new Map(
      studentProgrammes.map((prog) => [prog.id, prog.name])
    );

    const result = {
      // Dashboard Stats
      dashboardStats: {
        totalUsers,
        totalStudents,
        totalStaff,
        totalCourses,
        totalProgrammes,
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        totalApplications,
        pendingCourseApprovals,
        activeSessions,
      },

      // User Stats
      userStats: {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        usersByRole: usersByRole.map((group) => ({
          role: group.role,
          count: group._count.role,
        })),
      },

      // Course Stats
      courseStats: {
        totalCourses,
        activeCourses,
        coursesByDepartment: coursesByDepartment.map((group) => ({
          department:
            group.programme_id != null
              ? programmeMap.get(group.programme_id) || "Unknown"
              : "Unknown",
          count: group._count.programme_id,
        })),
        totalEnrollments,
      },

      // Financial Stats
      financialStats: {
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
        pendingPayments,
        paymentsByStatus: paymentsByStatus.map((group) => ({
          status: group.status === 1 ? "Completed" : "Pending",
          count: group._count.status,
          amount: Number(group._sum.amount || 0),
        })),
      },

      // Academic Stats
      academicStats: {
        totalStudents,
        studentsByProgramme: studentsByProgramme.map((group) => ({
          programme:
            group.programme_id != null
              ? studentProgrammeMap.get(group.programme_id) || "Unknown"
              : "Unknown",
          count: group._count.programme_id,
        })),
        averageGPA: Number(averageGPAAgg._avg.cumulative_gpa ?? 0),
        graduationRate:
          totalStudents > 0 ? (graduationCount / totalStudents) * 100 : 0,
      },

      // Recent Activity
      recentActivity: {
        recentUsers: recentUsers.map((u) => ({
          id: u.id.toString(),
          username: u.username,
          email: u.email,
          role: u.role,
          created_at: u.created_at,
        })),
        recentPayments: recentPayments.map((p) => ({
          id: p.id.toString(),
          amount: Number(p.amount),
          status: p.status ?? "",
          created_at: p.created_at,
        })),
      },
    };

    return result;
  } catch (error) {
    console.error("Error fetching overview data:", error);
    throw new Error(
      `Failed to fetch overview data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Dashboard Statistics (keeping for backward compatibility)
export async function getDashboardStats(institutionId?: number) {
  try {
    const [
      totalUsers,
      totalStudents,
      totalStaff,
      totalCourses,
      totalProgrammes,
      totalRevenue,
      pendingApplications,
      pendingCourseApprovals,
      activeSessions,
    ] = await Promise.all([
      prisma.user.count({
        where: institutionId ? { institution_id: institutionId } : undefined,
      }),
      prisma.student.count({
        where: {
          is_deleted: false,
          user_student_user_idTouser: institutionId
            ? { institution_id: institutionId }
            : undefined,
        },
      }),
      prisma.staff.count({
        where: {
          is_deleted: false,
          user_staff_user_idTouser: institutionId
            ? { institution_id: institutionId }
            : undefined,
        },
      }),
      prisma.course.count(),
      prisma.programme.count(),
      prisma.payment2.aggregate({
        _sum: { amount: true },
        where: { status: 1 },
      }),
      prisma.user.count({
        where: {
          ...(institutionId ? { institution_id: institutionId } : {}),
          role: "APPLICANT",
        },
      }),
      prisma.student_course.count({
        where: { approval_status: false },
      }),
      prisma.session.count(),
    ]);

    const result = {
      totalUsers,
      totalStudents,
      totalStaff,
      totalCourses,
      totalProgrammes,
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      totalApplications: pendingApplications,
      pendingCourseApprovals,
      totalSessions: activeSessions,
    };

    return result;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error(
      `Failed to fetch dashboard statistics: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Comprehensive Users Data - Single API call for users tab
export async function getUsersData(
  institutionId?: number,
  search?: string,
  role?: string,
  status?: string,
  limit?: number
) {
  try {
    const whereClause: Record<string, any> = {};

    if (institutionId) {
      whereClause.institution_id = institutionId;
    }

    if (search) {
      whereClause.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { first_name: { contains: search, mode: "insensitive" } },
        { last_name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (status === "active") {
      whereClause.active = true;
    } else if (status === "inactive") {
      whereClause.active = false;
    }

    const [
      users,
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      usersByRole,
      departments,
      faculties,
    ] = await Promise.all([
      // Users with relations
      prisma.user.findMany({
        where: whereClause,
        include: {
          staff_staff_user_idTouser: {
            include: {
              department: {
                include: {
                  faculty: true,
                },
              },
            },
          },
          student_student_user_idTouser: {
            include: {
              programme: {
                include: {
                  department: {
                    include: {
                      faculty: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: limit || 50,
      }),

      // User stats
      prisma.user.count({
        where: institutionId ? { institution_id: institutionId } : undefined,
      }),
      prisma.user.count({
        where: {
          ...(institutionId ? { institution_id: institutionId } : {}),
          active: true,
        },
      }),
      prisma.user.count({
        where: {
          ...(institutionId ? { institution_id: institutionId } : {}),
          created_at: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.user.groupBy({
        by: ["role"],
        where: institutionId ? { institution_id: institutionId } : undefined,
        _count: { role: true },
      }),

      // Departments with user counts
      prisma.department.findMany({
        include: {
          faculty: true,
          _count: {
            select: {
              staff: true,
            },
          },
        },
      }),

      // Faculties with user counts
      prisma.faculty.findMany({
        include: {
          department: {
            include: {
              _count: {
                select: {
                  staff: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const result = {
      users: users.map((user) => ({
        id: user.id.toString(),
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        active: user.active,
        created_at: user.created_at,
        institution_id: user.institution_id,
        department:
          user.staff_staff_user_idTouser?.[0]?.department?.name ||
          user.student_student_user_idTouser?.[0]?.programme?.department
            ?.name ||
          "N/A",
        faculty:
          user.staff_staff_user_idTouser?.[0]?.department?.faculty?.name ||
          user.student_student_user_idTouser?.[0]?.programme?.department
            ?.faculty?.name ||
          "N/A",
        student_reg_no: user.student_student_user_idTouser?.[0]?.reg_no || null,
        staff_no: user.staff_staff_user_idTouser?.[0]?.staff_no || null,
      })),

      stats: {
        totalUsers,
        activeUsers,
        newUsersThisMonth,
        usersByRole: usersByRole.map((group) => ({
          role: group.role,
          count: group._count.role,
        })),
      },

      departments: departments.map((dept) => ({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        faculty: dept.faculty
          ? {
              id: dept.faculty.id,
              name: dept.faculty.name,
            }
          : null,
        userCount: dept._count.staff,
      })),

      faculties: faculties.map((faculty) => ({
        id: faculty.id,
        name: faculty.name,
        userCount: faculty.department.reduce(
          (total, dept) => total + dept._count.staff,
          0
        ),
      })),
    };

    return result;
  } catch (error) {
    console.error("Error fetching users data:", error);
    throw new Error(
      `Failed to fetch users data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// User Statistics (keeping for backward compatibility)
export async function getUserStats(institutionId?: number) {
  try {
    const userScopedWhere = institutionId
      ? { institution_id: institutionId }
      : undefined;
    const studentScopedWhere = institutionId
      ? { user_student_user_idTouser: { institution_id: institutionId } }
      : undefined;
    const staffScopedWhere = institutionId
      ? { user_staff_user_idTouser: { institution_id: institutionId } }
      : undefined;

    const [totalUsers, activeUsers, newUsersThisMonth, usersByRole] =
      await Promise.all([
        prisma.user.count({ where: userScopedWhere }),
        prisma.user.count({ where: { ...userScopedWhere, active: true } }),
        prisma.user.count({
          where: {
            ...userScopedWhere,
            created_at: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        prisma.user.groupBy({
          by: ["role"],
          where: userScopedWhere,
          _count: { role: true },
        }),
      ]);

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      usersByRole: usersByRole.map((group) => ({
        role: group.role,
        count: group._count.role,
      })),
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw new Error("Failed to fetch user statistics");
  }
}

// Course Statistics
export async function getCourseStats() {
  try {
    const [totalCourses, activeCourses, coursesByDepartment, totalEnrollments] =
      await Promise.all([
        prisma.course.count(),
        prisma.course.count({ where: { published: true } }),
        prisma.course.groupBy({
          by: ["programme_id"],
          _count: { programme_id: true },
        }),
        prisma.student_course.count(),
      ]);

    const programmeIds = [
      ...new Set(
        coursesByDepartment
          .map((group) => group.programme_id)
          .filter((id): id is number => typeof id === "number")
      ),
    ];
    const programmes = programmeIds.length
      ? await prisma.programme.findMany({
          where: { id: { in: programmeIds } },
          include: { department: { select: { name: true } } },
        })
      : [];
    const programmeMap = new Map(
      programmes.map((prog) => [prog.id, prog.department?.name || "Unknown"])
    );

    return {
      totalCourses,
      activeCourses,
      coursesByDepartment: coursesByDepartment.map((group) => ({
        department:
          group.programme_id != null
            ? programmeMap.get(group.programme_id) || "Unknown"
            : "Unknown",
        count: group._count.programme_id,
      })),
      totalEnrollments,
    };
  } catch (error) {
    console.error("Error fetching course stats:", error);
    throw new Error("Failed to fetch course statistics");
  }
}

// Financial Statistics
export async function getFinancialStats(institutionId?: number) {
  try {
    const [totalRevenue, monthlyRevenue, pendingPayments, paymentsByStatus] =
      await Promise.all([
        prisma.payment2.aggregate({
          _sum: { amount: true },
          where: { status: 1 },
        }),
        prisma.payment2.aggregate({
          _sum: { amount: true },
          where: {
            status: 1,
            created_at: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            },
          },
        }),
        prisma.payment2.count({ where: { status: 0 } }),
        prisma.payment2.groupBy({
          by: ["status"],
          _count: { status: true },
          _sum: { amount: true },
        }),
      ]);

    return {
      totalRevenue: Number(totalRevenue._sum.amount || 0),
      monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
      pendingPayments,
      paymentsByStatus: paymentsByStatus.map((group) => ({
        status: group.status === 1 ? "Completed" : "Pending",
        count: group._count.status,
        amount: Number(group._sum.amount || 0),
      })),
    };
  } catch (error) {
    console.error("Error fetching financial stats:", error);
    throw new Error("Failed to fetch financial statistics");
  }
}

// Academic Statistics
export async function getAcademicStats(institutionId?: number) {
  try {
    const studentScopedWhere = institutionId
      ? { user_student_user_idTouser: { institution_id: institutionId } }
      : undefined;

    const [totalStudents, studentsByProgramme, averageGPAAgg, graduationCount] =
      await Promise.all([
        prisma.student.count({ where: studentScopedWhere }),
        prisma.student.groupBy({
          by: ["programme_id"],
          where: studentScopedWhere,
          _count: { programme_id: true },
        }),
        prisma.student_gpa.aggregate({ _avg: { cumulative_gpa: true } }),
        prisma.student.count({
          where: { ...(studentScopedWhere ?? {}), admitted: true },
        }),
      ]);

    const programmeIds = [
      ...new Set(
        studentsByProgramme
          .map((group) => group.programme_id)
          .filter((id): id is number => typeof id === "number")
      ),
    ];
    const programmes = programmeIds.length
      ? await prisma.programme.findMany({
          where: { id: { in: programmeIds } },
          select: { id: true, name: true },
        })
      : [];
    const programmeMap = new Map(
      programmes.map((prog) => [prog.id, prog.name])
    );

    return {
      totalStudents,
      studentsByProgramme: studentsByProgramme.map((group) => ({
        programme:
          group.programme_id != null
            ? programmeMap.get(group.programme_id) || "Unknown"
            : "Unknown",
        count: group._count.programme_id,
      })),
      averageGPA: Number(averageGPAAgg._avg.cumulative_gpa ?? 0),
      graduationRate:
        totalStudents > 0 ? (graduationCount / totalStudents) * 100 : 0,
    };
  } catch (error) {
    console.error("Error fetching academic stats:", error);
    throw new Error("Failed to fetch academic statistics");
  }
}

// Staff Statistics
export async function getStaffStats(staffId: bigint) {
  try {
    const [assignedCourses, totalStudents, pendingGrades, courseCompletion] =
      await Promise.all([
        prisma.staff_course.count({ where: { staff_id: BigInt(staffId) } }),
        prisma.student_course.count({
          where: {
            course: {
              course_progress: {
                some: {
                  student: {
                    student_course: {
                      some: {
                        course: {
                          staff_course: { some: { staff_id: BigInt(staffId) } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        prisma.student_result.count({
          where: {
            approved: false,
            student_course: {
              course: { staff_course: { some: { staff_id: BigInt(staffId) } } },
            },
          },
        }),
        prisma.course.count({
          where: {
            staff_course: { some: { staff_id: BigInt(staffId) } },
            course_progress: { some: {} },
          },
        }),
      ]);

    const totalAssignedCourses = await prisma.staff_course.count({
      where: { staff_id: BigInt(staffId) },
    });

    return {
      assignedCourses,
      totalStudents,
      pendingGrades,
      courseCompletion:
        totalAssignedCourses > 0
          ? (courseCompletion / totalAssignedCourses) * 100
          : 0,
    };
  } catch (error) {
    console.error("Error fetching staff stats:", error);
    throw new Error("Failed to fetch staff statistics");
  }
}

// Student Statistics
export async function getStudentStats(userId: bigint) {
  try {
    const [myCourses, pendingResults, completedCourses] = await Promise.all([
      prisma.student_course.count({
        where: {
          student: { user_student_user_idTouser: { id: userId } },
        },
      }),
      prisma.student_result.count({
        where: {
          approved: false,
          student_course: {
            student: { user_student_user_idTouser: { id: userId } },
          },
        },
      }),
      prisma.course_progress.count({
        where: {
          student: { user_student_user_idTouser: { id: userId } },
          completion_percentage: { gte: 100 },
        },
      }),
    ]);

    return {
      myCourses,
      pendingResults,
      completedCourses,
    };
  } catch (error) {
    console.error("Error fetching student stats:", error);
    throw new Error("Failed to fetch student statistics");
  }
}

// Recent Activity
export async function getRecentActivity(
  institutionId?: number,
  limit: number = 10
) {
  try {
    const userScopedWhere = institutionId
      ? { institution_id: institutionId }
      : undefined;

    const [recentUsers, recentPayments] = await Promise.all([
      prisma.user.findMany({
        where: userScopedWhere,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          created_at: true,
        },
        orderBy: { created_at: "desc" },
        take: limit,
      }),
      prisma.payment2.findMany({
        select: { id: true, amount: true, status: true, created_at: true },
        orderBy: { created_at: "desc" },
        take: limit,
      }),
    ]);

    return {
      recentUsers: recentUsers.map((u) => ({
        id: u.id.toString(),
        username: u.username,
        email: u.email,
        role: u.role,
        created_at: u.created_at,
      })),
      recentPayments: recentPayments.map((p) => ({
        id: p.id.toString(),
        amount: Number(p.amount),
        status: p.status ?? "",
        created_at: p.created_at,
      })),
    };
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw new Error("Failed to fetch recent activity");
  }
}

// Course Data
export async function getCoursesData(
  search?: string,
  faculty?: string,
  department?: string,
  programme?: string,
  level?: string,
  status?: string,
  limit: number = 50
) {
  try {
    const whereClause: Record<string, any> = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Faculty filter (by ID for better performance)
    if (faculty) {
      whereClause.department = {
        faculty: {
          id: parseInt(faculty),
        },
      };
    }

    // Department filter (by ID for better performance)
    if (department) {
      whereClause.department = {
        ...whereClause.department,
        id: parseInt(department),
      };
    }

    // Programme and Level filters (both use programme_course)
    if (programme || level) {
      const programmeCourseConditions: any = {};

      if (programme) {
        programmeCourseConditions.programme = {
          id: parseInt(programme),
        };
      }

      if (level) {
        programmeCourseConditions.level = {
          id: parseInt(level),
        };
      }

      // If both programme and level are specified, we need to find a course that has
      // the same programme_course record with both the programme and level
      whereClause.programme_course = {
        some: programmeCourseConditions,
      };
    }

    // Status filter
    if (status) {
      whereClause.published = status === "published";
    }

    // Debug logging
    console.log("getCoursesData called with params:", {
      search,
      faculty,
      department,
      programme,
      level,
      status,
      limit,
    });
    console.log("Generated whereClause:", JSON.stringify(whereClause, null, 2));

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            faculty: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        programme_course: {
          include: {
            programme: {
              select: {
                id: true,
                name: true,
              },
            },
            level: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            student_course: true,
          },
        },
      },
      take: limit,
      orderBy: {
        created_at: "desc",
      },
    });

    const result = courses.map((course) => ({
      id: course.id,
      code: course.code,
      name: course.name,
      description: course.description,
      units: course.units,
      published: course.published,
      created_at: course.created_at,
      department: course.department,
      programme_course: course.programme_course,
      _count: course._count,
    }));

    return result;
  } catch (error) {
    console.error("Error fetching courses data:", error);
    throw new Error(
      `Failed to fetch courses data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Department Data with User Counts
export async function getDepartmentsWithUserCounts(institutionId?: number) {
  try {
    const departments = await prisma.department.findMany({
      where: institutionId
        ? {
            faculty: {
              institution_id: institutionId,
            },
          }
        : undefined,
      select: {
        id: true,
        name: true,
        code: true,
        description: true,
        faculty_id: true,
        faculty: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        try {
          const [staffCount, programmes] = await Promise.all([
            prisma.staff.count({
              where: {
                department_id: dept.id,
                is_deleted: false,
              },
            }),
            prisma.programme.findMany({
              where: {
                department_id: dept.id,
              },
              select: {
                id: true,
                name: true,
                description: true,
                years: true,
                _count: {
                  select: {
                    student: {
                      where: {
                        is_deleted: false,
                      },
                    },
                  },
                },
              },
            }),
          ]);

          const studentCount = programmes.reduce(
            (acc, prog) => acc + (prog._count?.student || 0),
            0
          );

          return {
            id: dept.id,
            name: dept.name,
            code: dept.code,
            description: dept.description,
            faculty_id: dept.faculty_id,
            faculty: dept.faculty,
            programme: programmes,
            userCount: staffCount + studentCount,
            staffCount: staffCount,
            studentCount: studentCount,
            programmeCount: programmes.length,
          };
        } catch (error) {
          console.error(`Error processing department ${dept.name}:`, error);
          return {
            id: dept.id,
            name: dept.name,
            code: dept.code,
            description: dept.description,
            faculty_id: dept.faculty_id,
            faculty: dept.faculty,
            programme: [],
            userCount: 0,
            staffCount: 0,
            studentCount: 0,
            programmeCount: 0,
          };
        }
      })
    );

    return departmentsWithCounts;
  } catch (error) {
    console.error("Error fetching departments with user counts:", error);
    throw new Error(
      `Failed to fetch departments data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Faculty Data with User Counts
export async function getFacultiesWithUserCounts(institutionId?: number) {
  try {
    const faculties = await prisma.faculty.findMany({
      where: {
        institution_id: institutionId,
      },
      include: {
        department: {
          include: {
            staff: {
              select: {
                id: true,
              },
            },
            programme: {
              include: {
                student: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return faculties.map((faculty) => ({
      id: faculty.id,
      name: faculty.name,
      departmentCount: faculty.department.length,
      userCount: faculty.department.reduce(
        (acc, dept) =>
          acc +
          dept.staff.length +
          dept.programme.reduce(
            (progAcc, prog) => progAcc + prog.student.length,
            0
          ),
        0
      ),
      staffCount: faculty.department.reduce(
        (acc, dept) => acc + dept.staff.length,
        0
      ),
      studentCount: faculty.department.reduce(
        (acc, dept) =>
          acc +
          dept.programme.reduce(
            (progAcc, prog) => progAcc + prog.student.length,
            0
          ),
        0
      ),
    }));
  } catch (error) {
    console.error("Error fetching faculties with user counts:", error);
    throw new Error("Failed to fetch faculties data");
  }
}

// Applications Data
export async function getApplicationsData(
  institutionId?: number,
  status?: string,
  limit?: number,
  type?: string
) {
  try {
    if (type === "ADDITIONAL") {
      // For ADDITIONAL applications, query student table directly
      const studentWhereClause: any = {
        is_deleted: false,
        application_type: "ADDITIONAL",
        ...(institutionId
          ? {
              user_student_user_idTouser: {
                institution_id: institutionId,
              },
            }
          : {}),
      };

      const [
        applications,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
      ] = await Promise.all([
        prisma.student.findMany({
          where: studentWhereClause,
          include: {
            user_student_user_idTouser: true,
            programme: {
              include: {
                department: {
                  include: {
                    faculty: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { status: "asc" }, // false (pending) comes before true (approved)
            { created_at: "desc" },
          ],
          take: limit || 50,
        }),
        prisma.student.count({
          where: studentWhereClause,
        }),
        prisma.student.count({
          where: {
            ...studentWhereClause,
            status: false, // pending
          },
        }),
        prisma.student.count({
          where: {
            ...studentWhereClause,
            status: true, // approved
          },
        }),
        prisma.student.count({
          where: {
            ...studentWhereClause,
            admitted: false, // rejected
          },
        }),
      ]);
      return {
        applications: applications.map((student) => ({
          id: student.id.toString(),
          studentName:
            `${student.ref_fname || ""} ${student.ref_lname || ""}`.trim() ||
            `${student.user_student_user_idTouser?.first_name || ""} ${
              student.user_student_user_idTouser?.last_name || ""
            }`.trim(),
          email: student.user_student_user_idTouser?.email || "",
          phone: student.user_student_user_idTouser?.phone || "",
          program: student.programme?.name || "N/A",
          department: student.programme?.department?.name || "N/A",
          faculty: student.programme?.department?.faculty?.name || "N/A",
          status: student.status
            ? "approved"
            : student.admitted === false
            ? "pending"
            : "approved",
          submittedDate: student.created_at,
          reviewDate: student.updated_at,
          documents: [],
        })),
        statistics: {
          total: totalApplications,
          pending: pendingApplications,
          approved: approvedApplications,
          rejected: rejectedApplications,
        },
      };
    }

    // For NEW applications, use the original user-based query
    const whereClause: any = {
      ...(institutionId ? { institution_id: institutionId } : {}),
      role: "APPLICANT",
      student_student_user_idTouser: {
        some: {
          is_deleted: false,
          application_type: "NEW",
        },
      },
    };

    const [
      applications,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
    ] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          student_student_user_idTouser: {
            include: {
              programme: {
                include: {
                  department: {
                    include: {
                      faculty: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: limit || 50,
      }),
      prisma.user.count({
        where: {
          ...(institutionId ? { institution_id: institutionId } : {}),
          role: "APPLICANT",
        },
      }),
      prisma.user.count({
        where: {
          ...(institutionId ? { institution_id: institutionId } : {}),
          role: "APPLICANT",
          active: false,
        },
      }),
      prisma.user.count({
        where: {
          ...(institutionId ? { institution_id: institutionId } : {}),
          role: "APPLICANT",
          active: true,
        },
      }),
      prisma.user.count({
        where: {
          ...(institutionId ? { institution_id: institutionId } : {}),
          role: "APPLICANT",
          application_declined_reason: { not: null },
        },
      }),
    ]);

    return {
      applications: applications.map((app) => ({
        id: app.id.toString(),
        studentName: app.student_student_user_idTouser?.[0]
          ? `${app.student_student_user_idTouser[0].ref_fname || ""} ${
              app.student_student_user_idTouser[0].ref_lname || ""
            }`.trim() || `${app.first_name} ${app.last_name}`
          : `${app.first_name} ${app.last_name}`,
        email: app.email,
        phone: app.phone,
        program:
          app.student_student_user_idTouser?.[0]?.programme?.name || "N/A",
        department:
          app.student_student_user_idTouser?.[0]?.programme?.department?.name ||
          "N/A",
        faculty:
          app.student_student_user_idTouser?.[0]?.programme?.department?.faculty
            ?.name || "N/A",
        status: app.active
          ? "approved"
          : app.application_declined_reason
          ? "rejected"
          : "pending",
        submittedDate: app.created_at,
        reviewDate: app.updated_at,
        documents: [], // TODO: Add document tracking
      })),
      statistics: {
        total: totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications,
      },
    };
  } catch (error) {
    console.error("Error fetching applications data:", error);
    throw new Error(
      `Failed to fetch applications data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Payments Data
export async function getPaymentsData(
  institutionId?: number,
  status?: number,
  limit?: number,
  search?: string
) {
  try {
    const whereClause: any = {};

    if (status !== undefined) {
      whereClause.status = status;
    }

    // Add search functionality
    if (search) {
      whereClause.OR = [
        {
          reference: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          student: {
            user_student_user_idTouser: {
              first_name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          student: {
            user_student_user_idTouser: {
              last_name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
        {
          student: {
            user_student_user_idTouser: {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      ];
    }

    const [
      payments,
      totalPayments,
      pendingPayments,
      completedPayments,
      failedPayments,
      totalRevenue,
    ] = await Promise.all([
      prisma.payment2.findMany({
        where: whereClause,
        include: {
          student: {
            include: {
              user_student_user_idTouser: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: limit || 50,
      }),
      prisma.payment2.count(),
      prisma.payment2.count({ where: { status: 0 } }), // Pending
      prisma.payment2.count({ where: { status: 1 } }), // Completed
      prisma.payment2.count({ where: { status: 2 } }), // Failed
      prisma.payment2.aggregate({
        _sum: { amount: true },
        where: { status: 1 }, // Only completed payments
      }),
    ]);

    return {
      payments: payments.map((payment) => {
        // Handle cart data - it might be a string that needs parsing
        let cartData: any = null;
        if (payment.cart) {
          try {
            // If cart is a string, parse it
            if (typeof payment.cart === "string") {
              cartData = JSON.parse(payment.cart);
            } else {
              // If it's already an object, use it directly
              cartData = payment.cart;
            }

            // Ensure unit_price is a number for each cart item
            if (cartData && typeof cartData === "object") {
              Object.keys(cartData).forEach((key) => {
                const item = cartData[key];
                if (item && typeof item === "object") {
                  // Convert unit_price to number if it exists (it comes as string from DB)
                  if (item.unit_price !== undefined) {
                    item.unit_price = Number(item.unit_price);
                  }
                }
              });
            }
          } catch (error) {
            console.error(
              "Error parsing cart data for payment",
              payment.id,
              error
            );
            cartData = null;
          }
        }

        return {
          id: payment.id,
          userId: payment.student?.user_student_user_idTouser?.id?.toString(),
          userName: payment.student?.user_student_user_idTouser
            ? `${payment.student.user_student_user_idTouser.first_name} ${payment.student.user_student_user_idTouser.last_name}`
            : "Unknown",
          userEmail:
            payment.student?.user_student_user_idTouser?.email || "Unknown",
          amount: Number(payment.amount),
          currency: payment.processor_currency || "NGN",
          status: payment.status,
          paymentMethod: payment.processor || "Unknown",
          reference: payment.reference,
          description: `Payment for ${
            payment.student?.user_student_user_idTouser?.first_name || "Student"
          }`,
          createdAt: payment.created_at,
          updatedAt: payment.updated_at,
          cart: cartData || {},
        };
      }),
      statistics: {
        total: totalPayments,
        pending: pendingPayments,
        completed: completedPayments,
        failed: failedPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
    };
  } catch (error) {
    console.error("Error fetching payments data:", error);
    throw new Error(
      `Failed to fetch payments data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Financial Data
export async function getFinancialData(
  institutionId?: number,
  period?: string
) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      monthlyRevenue,
      yearlyRevenue,
      totalRevenue,
      monthlyPayments,
      yearlyPayments,
      totalPayments,
      pendingAmount,
      paymentMethods,
    ] = await Promise.all([
      prisma.payment2.aggregate({
        _sum: { amount: true },
        where: {
          status: 1,
          created_at: { gte: startOfMonth },
        },
      }),
      prisma.payment2.aggregate({
        _sum: { amount: true },
        where: {
          status: 1,
          created_at: { gte: startOfYear },
        },
      }),
      prisma.payment2.aggregate({
        _sum: { amount: true },
        where: { status: 1 },
      }),
      prisma.payment2.count({
        where: {
          status: 1,
          created_at: { gte: startOfMonth },
        },
      }),
      prisma.payment2.count({
        where: {
          status: 1,
          created_at: { gte: startOfYear },
        },
      }),
      prisma.payment2.count({ where: { status: 1 } }),
      prisma.payment2.aggregate({
        _sum: { amount: true },
        where: { status: 0 },
      }),
      prisma.payment2.groupBy({
        by: ["processor"],
        _sum: { amount: true },
        where: { status: 1 },
      }),
    ]);

    return {
      overview: {
        monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
        yearlyRevenue: Number(yearlyRevenue._sum.amount || 0),
        totalRevenue: Number(totalRevenue._sum.amount || 0),
        monthlyPayments: monthlyPayments,
        yearlyPayments: yearlyPayments,
        totalPayments: totalPayments,
        pendingAmount: Number(pendingAmount._sum.amount || 0),
      },
      paymentMethods: paymentMethods.map((method) => ({
        method: method.processor || "Unknown",
        amount: Number(method._sum?.amount || 0),
      })),
    };
  } catch (error) {
    console.error("Error fetching financial data:", error);
    throw new Error(
      `Failed to fetch financial data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Academic Data
export async function getAcademicData(institutionId?: number) {
  try {
    const [
      totalStudents,
      activeStudents,
      averageGPA,
      graduationCount,
      courseCompletions,
      studentsByProgramme,
      gpaDistribution,
    ] = await Promise.all([
      prisma.student.count({
        where: {
          is_deleted: false,
          user_student_user_idTouser: institutionId
            ? { institution_id: institutionId }
            : undefined,
        },
      }),
      prisma.student.count({
        where: {
          is_deleted: false,
          user_student_user_idTouser: {
            ...(institutionId ? { institution_id: institutionId } : {}),
            active: true,
          },
        },
      }),
      prisma.student_gpa.aggregate({
        _avg: { cumulative_gpa: true },
      }),
      prisma.student.count({
        where: {
          is_deleted: false,
          admitted: true,
          user_student_user_idTouser: institutionId
            ? { institution_id: institutionId }
            : undefined,
        },
      }),
      prisma.student_course.count({
        where: { cleared: true },
      }),
      prisma.student.groupBy({
        by: ["programme_id"],
        _count: { id: true },
        where: {
          is_deleted: false,
          user_student_user_idTouser: institutionId
            ? { institution_id: institutionId }
            : undefined,
        },
      }),
      prisma.student_gpa.groupBy({
        by: ["cumulative_gpa"],
        _count: { id: true },
      }),
    ]);

    return {
      overview: {
        totalStudents,
        activeStudents,
        averageGPA: Number(averageGPA._avg?.cumulative_gpa || 0),
        graduationCount,
        courseCompletions,
      },
      studentsByProgramme,
      gpaDistribution,
    };
  } catch (error) {
    console.error("Error fetching academic data:", error);
    throw new Error(
      `Failed to fetch academic data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Reports Data
export async function getReportsData(
  institutionId?: number,
  reportType?: string,
  dateRange?: string
) {
  try {
    // This is a placeholder for reports data
    // In a real implementation, this would generate various report types
    const reports = [
      {
        id: 1,
        name: "Student Enrollment Report",
        type: "enrollment",
        description: "Comprehensive student enrollment statistics",
        lastGenerated: new Date(),
        status: "ready",
      },
      {
        id: 2,
        name: "Financial Report",
        type: "financial",
        description: "Revenue and payment analysis",
        lastGenerated: new Date(),
        status: "ready",
      },
      {
        id: 3,
        name: "Academic Performance Report",
        type: "academic",
        description: "Student GPA and graduation statistics",
        lastGenerated: new Date(),
        status: "ready",
      },
    ];

    return {
      reports,
      availableTypes: ["enrollment", "financial", "academic", "user", "course"],
    };
  } catch (error) {
    console.error("Error fetching reports data:", error);
    throw new Error(
      `Failed to fetch reports data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Department Management Functions
export async function getProgrammesData(
  institutionId?: number,
  departmentId?: number
) {
  try {
    console.log(
      `Getting programmes for institutionId: ${institutionId}, departmentId: ${departmentId}`
    );

    const whereClause: any = {};

    // Add department filter if provided
    if (departmentId) {
      whereClause.department_id = departmentId;
    }

    // Add institution filter if provided
    if (institutionId) {
      whereClause.department = {
        faculty: {
          institution_id: institutionId,
        },
      };
    }

    const programmes = await prisma.programme.findMany({
      where: whereClause,
      include: {
        department: {
          select: {
            id: true,
            name: true,
            faculty: {
              select: {
                id: true,
                name: true,
                institution_id: true,
              },
            },
          },
        },
        course: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            student: true,
            programme_course: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log(
      `Found ${programmes.length} programmes with filters:`,
      whereClause
    );
    return programmes;
  } catch (error) {
    console.error("Error fetching programmes data:", error);
    throw new Error(
      `Failed to fetch programmes data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function createDepartment(
  name: string,
  code: string,
  description: string,
  facultyId: number
) {
  try {
    const department = await prisma.department.create({
      data: {
        name,
        code,
        description,
        faculty_id: facultyId,
      },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            institution_id: true,
          },
        },
      },
    });

    return department;
  } catch (error) {
    console.error("Error creating department:", error);
    throw new Error(
      `Failed to create department: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function updateDepartment(
  id: number,
  name: string,
  code: string,
  description: string,
  facultyId: number
) {
  try {
    const department = await prisma.department.update({
      where: { id },
      data: {
        name,
        code,
        description,
        faculty_id: facultyId,
      },
      include: {
        faculty: {
          select: {
            id: true,
            name: true,
            institution_id: true,
          },
        },
      },
    });
    return department;
  } catch (error) {
    console.error("Error updating department:", error);
    throw new Error(
      `Failed to update department: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function deleteDepartment(id: number) {
  try {
    await prisma.department.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    throw new Error(
      `Failed to delete department: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function createProgramme(
  name: string,
  description: string,
  departmentId: number,
  years: number = 4,
  prefix?: string,
  regnoFormat?: string
) {
  try {
    const programme = await prisma.programme.create({
      data: {
        name,
        description,
        department_id: departmentId,
        years,
        prefix,
        regno_format: regnoFormat,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            faculty: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return programme;
  } catch (error) {
    console.error("Error creating programme:", error);
    throw new Error(
      `Failed to create programme: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export async function createCourse(
  name: string,
  code: string,
  description: string,
  units: number = 3,
  departmentId: number,
  programmes?: number[],
  levelId?: number,
  semesterPosition?: number
) {
  try {
    // Create the course first
    const course = await prisma.course.create({
      data: {
        name,
        code,
        description,
        units,
        department_id: departmentId,
      },
    });

    // If programmes are specified, add the course to those programmes
    if (programmes && programmes.length > 0) {
      await prisma.programme_course.createMany({
        data: programmes.map((programmeId: number) => ({
          course_id: course.id,
          programme_id: programmeId,
          level_id: levelId,
          units,
          semester_position: semesterPosition || 1,
        })),
      });
    }

    // Return the course with related data
    const courseWithRelations = await prisma.course.findUnique({
      where: { id: course.id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        programme_course: {
          include: {
            programme: {
              select: {
                id: true,
                name: true,
              },
            },
            level: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return courseWithRelations;
  } catch (error) {
    console.error("Error creating course:", error);
    throw new Error(
      `Failed to create course: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// System Data
export async function getSystemData() {
  try {
    const [totalUsers, activeUsers, totalSessions, systemHealth] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { active: true } }),
        prisma.session.count(),
        // System health would typically come from monitoring tools
        Promise.resolve({
          status: "healthy",
          uptime: 99.9,
          responseTime: 150,
          errorRate: 0.1,
        }),
      ]);

    return {
      overview: {
        totalUsers,
        activeUsers,
        totalSessions,
      },
      health: systemHealth,
    };
  } catch (error) {
    console.error("Error fetching system data:", error);
    throw new Error(
      `Failed to fetch system data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Settings Data
export async function getSettingsData(institutionId?: number) {
  try {
    // This would typically fetch from a settings table
    // For now, returning default settings
    const settings = {
      general: {
        institutionName: "Default Institution",
        timezone: "Africa/Lagos",
        language: "en",
        dateFormat: "DD/MM/YYYY",
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordPolicy: "strong",
      },
      features: {
        enablePayments: true,
        enableNotifications: true,
        enableReports: true,
        enableAnalytics: true,
      },
    };

    return settings;
  } catch (error) {
    console.error("Error fetching settings data:", error);
    throw new Error(
      `Failed to fetch settings data: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
