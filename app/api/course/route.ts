import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
  hasInstitutionAccess,
} from "@/lib/api-auth";
import { hasPermission } from "@/lib/permissions-config";

/**
 * GET /api/course
 * Get all courses (filtered by user role and institution)
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const { searchParams } = new URL(request.url);
    
    const pgsize = parseInt(searchParams.get("pgsize") || "100");
    const pg = parseInt(searchParams.get("pg") || "1");
    const search = searchParams.get("search") || "";
    const programme_id = searchParams.get("programme_id");
    const level_id = searchParams.get("level_id");
    const department_id = searchParams.get("department_id");

    // Build where clause based on role
    const where: any = {};

    // Filter by institution (staff/students see their institution's courses)
    if (user.role === "STUDENT") {
      // Students see courses they're enrolled in
      const studentRecord = await prisma.student.findFirst({
        where: { user_id: parseInt(user.id) },
      });

      if (studentRecord) {
        const enrolledCourses = await prisma.student_course.findMany({
          where: { student_id: studentRecord.id },
          select: { course_id: true },
        });

        where.id = {
          in: enrolledCourses.map((sc) => sc.course_id),
        };
      }
    } else if (user.role === "LECTURER") {
      // Lecturers see courses they teach
      const staffRecord = await prisma.staff.findFirst({
        where: { user_id: parseInt(user.id) },
      });

      if (staffRecord) {
        const taughtCourses = await prisma.staff_course.findMany({
          where: { staff_id: staffRecord.id },
          select: { course_id: true },
        });

        where.id = {
          in: taughtCourses.map((sc) => sc.course_id),
        };
      }
    } else if (user.role === "HOD") {
      // HODs see courses in their department
      const staffRecord = await prisma.staff.findFirst({
        where: { user_id: parseInt(user.id) },
      });

      if (staffRecord?.department_id) {
        where.department_id = staffRecord.department_id;
      }
    } else if (user.role === "PROGRAMME_COORDINATOR" && user.programme_id) {
      where.programme_id = user.programme_id;
    }
    // ADMIN and SUPERADMIN can see all courses (no additional filter)

    // Apply search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    // Apply additional filters
    if (programme_id) where.programme_id = parseInt(programme_id);
    if (level_id) where.level_id = parseInt(level_id);
    if (department_id) where.department_id = parseInt(department_id);

    // Fetch courses with pagination
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          programme: true,
          level: true,
          department: true,
          course_module: {
            orderBy: { order: "asc" },
          },
        },
        orderBy: { created_at: "desc" },
        take: pgsize,
        skip: (pg - 1) * pgsize,
      }),
      prisma.course.count({ where }),
    ]);

    return createSuccessResponse(
      {
        courses,
        pagination: {
          total,
          page: pg,
          pageSize: pgsize,
          totalPages: Math.ceil(total / pgsize),
        },
      },
      user
    );
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch courses",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/course
 * Create a new course
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    // Check permissions
    if (!hasPermission(user.role, "courses.create")) {
      return createAuthErrorResponse("Insufficient permissions to create courses", 403);
    }

    const body = await request.json();

    const {
      code,
      name,
      units,
      description,
      programme_id,
      level_id,
      department_id,
      semester_position,
      published = true,
    } = body;

    // Validate required fields
    if (!code || !name || !units) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: code, name, units",
        },
        { status: 400 }
      );
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        code,
        name,
        units: parseInt(units),
        description,
        programme_id: programme_id ? parseInt(programme_id) : null,
        level_id: level_id ? parseInt(level_id) : null,
        department_id: department_id ? parseInt(department_id) : null,
        semester_position: semester_position ? parseInt(semester_position) : null,
        published,
      },
      include: {
        programme: true,
        level: true,
        department: true,
      },
    });

    return createSuccessResponse(course, user);
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create course",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
