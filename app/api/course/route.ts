import { NextRequest } from "next/server";
import {
  createJsonResponse,
  createAuthErrorResponse,
  authenticateUserWithPermissions,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authResult = await authenticateUserWithPermissions();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;

  try {
    const searchParams = req.nextUrl.searchParams;
    const pgsize = parseInt(searchParams.get("pgsize") || "100");
    const pg = parseInt(searchParams.get("pg") || "1");
    const search = searchParams.get("search");

    const skip = (pg - 1) * pgsize;

    // Build where clause based on role
    let whereClause: any = {};
    let includeCourses = true;

    if (user.role === "STUDENT") {
      // Get student record
      const student = await prisma.student.findFirst({
        where: {
          user_id: BigInt(user.id),
        },
      });

      if (!student) {
        return createJsonResponse([]);
      }

      // Students see only their enrolled courses
      const studentCourses = await prisma.student_course.findMany({
        where: {
          student_id: student.id,
        },
        include: {
          course: true,
        },
        skip,
        take: pgsize,
      });

      // Filter to only published courses and handle null courses
      const publishedCourses = studentCourses
        .filter((sc) => sc.course && sc.course.published)
        .map((sc) => sc.course!);

      // Get progress data for student
      const courseProgresses = await prisma.course_progress.findMany({
        where: {
          student_id: student.id,
        },
      });

      // Create progress map
      const progressMap = new Map();
      courseProgresses.forEach((progress) => {
        progressMap.set(Number(progress.course_id), {
          completion_percentage: progress.completion_percentage || 0,
          total_lessons: progress.total_lessons || 0,
          completed_lessons: progress.completed_lessons || 0,
          status: progress.status,
          total_time_minutes: progress.total_time_minutes || 0,
          last_accessed_at: progress.last_accessed_at,
        });
      });

      // Add progress data to courses
      const coursesWithProgress = publishedCourses.map((course) => {
        const progress = progressMap.get(Number(course.id)) || {
          completion_percentage: 0,
          total_lessons: 0,
          completed_lessons: 0,
          status: "not_started",
          total_time_minutes: 0,
          last_accessed_at: null,
        };

        return {
          ...course,
          completion_percentage: progress.completion_percentage,
          total_lessons: progress.total_lessons,
          completed_lessons: progress.completed_lessons,
          student_enrolled: progress.status !== "not_started",
          student_completed: progress.status === "completed",
          has_result: progress.status === "completed",
          enrollment_status:
            progress.status === "completed"
              ? "completed"
              : progress.status === "not_started"
              ? "not_enrolled"
              : "enrolled",
        };
      });

      return createJsonResponse(coursesWithProgress);
    } else if (user.role === "STAFF") {
      // Get staff record
      const staff = await prisma.staff.findFirst({
        where: {
          user_id: BigInt(user.id),
        },
      });

      if (!staff) {
        return createJsonResponse([]);
      }

      // Staff see courses they're assigned to
      const staffCourses = await prisma.staff_course.findMany({
        where: {
          staff_id: staff.id,
        },
        include: {
          course: true,
        },
        skip,
        take: pgsize,
        orderBy: {
          id: "desc",
        },
      });

      return createJsonResponse(staffCourses.map((sc) => sc.course));
    } else if (user.role === "HOD") {
      // Get staff record for HOD
      const staff = await prisma.staff.findFirst({
        where: {
          user_id: BigInt(user.id),
        },
      });

      // HOD sees courses in their department
      whereClause = {
        department_id: staff?.department_id || 0,
      };
    } else if (user.role === "ADMIN") {
      // Admin sees all courses in their institution
      whereClause = {
        institution_id: user.institution_id,
      };
    }
    // SUPERADMIN sees all courses (no filter)

    // Apply search if provided
    if (search && includeCourses) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" as any } },
        { code: { contains: search, mode: "insensitive" as any } },
      ];
    }

    // Fetch courses for non-STUDENT roles
    if (includeCourses) {
      const courses = await prisma.course.findMany({
        where: whereClause,
        skip,
        take: pgsize,
        orderBy: {
          code: "desc",
        },
      });

      const total = await prisma.course.count({ where: whereClause });
      const pageCount = Math.ceil(total / pgsize);

      return createJsonResponse(courses);
    }

    return createJsonResponse([]);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return createAuthErrorResponse("Failed to fetch courses", 500);
  }
}
