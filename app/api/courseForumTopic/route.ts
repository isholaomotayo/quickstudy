import { NextRequest, NextResponse } from "next/server";
import {
  createJsonResponse,
  createAuthErrorResponse,
  authenticateUser,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";

// GET all course forum topics or topics for a specific course
export async function GET(req: NextRequest) {
  const authResult = await authenticateUser();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;

  // Role check: STUDENT, STAFF, HOD, ADMIN, SUPERADMIN
  const allowedRoles = ["STUDENT", "STAFF", "HOD", "ADMIN", "SUPERADMIN", "LECTURER"];
  if (!allowedRoles.includes(user.role)) {
    return createAuthErrorResponse("Insufficient permissions", 403);
  }

  try {
    const { searchParams } = new URL(req.url);
    const course_id = searchParams.get("course_id");

    let topics;

    if (user.role === "STUDENT") {
      // Get student record
      const student = await prisma.student.findFirst({
        where: { user_id: BigInt(user.id) },
      });

      if (!student) {
        return createJsonResponse([]);
      }

      // Get enrolled courses
      const studentCourses = await prisma.student_course.findMany({
        where: { student_id: student.id },
        select: { course_id: true },
      });

      if (studentCourses.length === 0) {
        return createJsonResponse([]);
      }

      const courseIds = studentCourses.map((sc) => sc.course_id);

      // Get forum topics for enrolled courses
      topics = await prisma.course_forum_topic.findMany({
        where: {
          course_id: {
            in: courseIds,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          course_forum_thread: true,
        },
        orderBy: { created_at: "desc" },
      });
    } else {
      // For staff/admin, return all topics
      topics = await prisma.course_forum_topic.findMany({
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          course_forum_thread: true,
        },
        orderBy: { created_at: "desc" },
      });
    }

    return createJsonResponse(topics);
  } catch (error) {
    console.error("Error fetching course forum topics:", error);
    return createAuthErrorResponse("Failed to fetch course forum topics", 500);
  }
}

// POST create a new course forum topic
export async function POST(req: NextRequest) {
  const authResult = await authenticateUser();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;

  // Role check
  const allowedRoles = ["STUDENT", "STAFF", "HOD", "ADMIN", "SUPERADMIN", "LECTURER"];
  if (!allowedRoles.includes(user.role)) {
    return createAuthErrorResponse("Insufficient permissions", 403);
  }

  try {
    const body = await req.json();
    const { title, description, user_id, course_id } = body;

    if (!title || !course_id) {
      return createAuthErrorResponse("Title and course_id are required", 400);
    }

    const newForumTopic = await prisma.course_forum_topic.create({
      data: {
        title,
        description,
        user_id: BigInt(user_id || user.id),
        course_id: Number(course_id),
      },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        course_forum_thread: true,
      },
    });

    return createJsonResponse(newForumTopic, 201);
  } catch (error) {
    console.error("Error creating course forum topic:", error);
    return createAuthErrorResponse("Failed to create course forum topic", 500);
  }
}
