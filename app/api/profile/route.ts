import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createJsonResponse,
} from "@/lib/api-auth";
import { resolveStudentContext } from "@/helpers/studentContext";

/**
 * GET /api/profile
 * Get the currently authenticated user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const userId = BigInt(user.id);

    // Fetch complete user profile from database
    const userProfile = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
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
        institution_user_institution_idToinstitution: true,
      },
    });

    if (!userProfile) {
      return createAuthErrorResponse("User not found", 404);
    }

    // Get active student profile
    let studentProfile: any = null;
    if (user.role === "STUDENT") {
      const activeStudentId = await resolveStudentContext(userId);

      if (activeStudentId) {
        // Fetch full student record with all necessary data
        const student = await prisma.student.findUnique({
          where: { id: activeStudentId.id },
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
            level: true,
            session: true,
            semester: true,
          },
        });

        if (student) {
          // Get course counts
          const studentCourseCount = await prisma.student_course.count({
            where: { student_id: student.id },
          });

          const approvedCourseCount = await prisma.student_course.count({
            where: {
              student_id: student.id,
              approval_status: true,
            },
          });

          // Get current semester
          const currentSemester = await prisma.semester.findFirst({
            where: {
              institution_id: userProfile.institution_id,
              is_active: true,
            },
            orderBy: { id: "desc" },
          });

          studentProfile = {
            id: student.id.toString(),
            reg_no: student.reg_no,
            gender: student.gender,
            dob: student.dob,
            address: student.address,
            marital_status: student.marital_status,
            employment_status: student.employment_status,
            state_origin: student.state_origin,
            lga_origin: student.lga_origin,
            state_residence: student.state_residence,
            lga_residence: student.lga_residence,
            status: student.status,
            admitted: student.admitted,
            admission_status: student.admission_status,
            created_at: student.created_at,
            updated_at: student.updated_at,
            registered_courses_count: studentCourseCount,
            approved_courses_count: approvedCourseCount,
            programme: student.programme
              ? {
                  id: student.programme.id,
                  name: student.programme.name,
                  prefix: student.programme.prefix,
                  years: student.programme.years,
                  department: student.programme.department
                    ? {
                        id: student.programme.department.id,
                        name: student.programme.department.name,
                        faculty: student.programme.department.faculty
                          ? {
                              id: student.programme.department.faculty.id,
                              name: student.programme.department.faculty.name,
                            }
                          : null,
                      }
                    : null,
                }
              : null,
            level: student.level
              ? {
                  id: student.level.id,
                  name: student.level.name,
                }
              : null,
            current_semester: currentSemester
              ? {
                  id: currentSemester.id,
                  name: currentSemester.name,
                  start_date: currentSemester.start_date,
                  end_date: currentSemester.end_date,
                }
              : null,
            semester: student.semester
              ? {
                  id: student.semester.id,
                  name: student.semester.name,
                }
              : null,
          };
        }
      }
    }

    // Format staff profile
    let staffProfile: any = null;
    if (
      ["STAFF", "HOD", "LECTURER"].includes(user.role) &&
      userProfile.staff_staff_user_idTouser?.[0]
    ) {
      const staff = userProfile.staff_staff_user_idTouser[0];
      staffProfile = {
        id: staff.id.toString(),
        title: staff.title,
        department: staff.department
          ? {
              id: staff.department.id,
              name: staff.department.name,
              faculty: staff.department.faculty
                ? {
                    id: staff.department.faculty.id,
                    name: staff.department.faculty.name,
                  }
                : null,
            }
          : null,
      };
    }

    // Format institution profile
    const institution = userProfile.institution_user_institution_idToinstitution
      ? {
          id: userProfile.institution_user_institution_idToinstitution.id,
          name: userProfile.institution_user_institution_idToinstitution.name,
          code: userProfile.institution_user_institution_idToinstitution.code,
          logo: userProfile.institution_user_institution_idToinstitution.logo,
          email: userProfile.institution_user_institution_idToinstitution.email,
          phone: userProfile.institution_user_institution_idToinstitution.phone,
          address:
            userProfile.institution_user_institution_idToinstitution.address,
          website:
            userProfile.institution_user_institution_idToinstitution.website,
          motto: userProfile.institution_user_institution_idToinstitution.motto,
          id_card:
            userProfile.institution_user_institution_idToinstitution.id_card,
        }
      : null;

    // Format user profile with only necessary fields
    const formattedProfile = {
      user: {
        id: userProfile.id.toString(),
        username: userProfile.username,
        first_name: userProfile.first_name,
        last_name: userProfile.last_name,
        other_name: userProfile.other_name,
        email: userProfile.email,
        phone: userProfile.phone,
        avatar: userProfile.avatar,
        role: userProfile.role,
        active: userProfile.active,
        created_at: userProfile.created_at,
        updated_at: userProfile.updated_at,
      },
      student: studentProfile,
      staff: staffProfile,
      institution: institution,
    };

    // Return directly without wrapping to match Fastify behavior
    return createJsonResponse(formattedProfile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user profile",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile
 * Update the currently authenticated user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const body = await request.json();

    // Extract updatable fields
    const {
      first_name,
      last_name,
      other_name,
      email,
      phone,
      avatar,
      // Add other updatable fields as needed
    } = body;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(user.id) },
      data: {
        ...(first_name !== undefined && { first_name }),
        ...(last_name !== undefined && { last_name }),
        ...(other_name !== undefined && { other_name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(avatar !== undefined && { avatar }),
        updated_at: new Date(),
      },
      include: {
        staff_staff_user_idTouser: {
          include: {
            department: true,
          },
        },
        student_student_user_idTouser: {
          include: {
            programme: true,
            level: true,
          },
        },
        institution_user_institution_idToinstitution: true,
      },
    });

    // Return directly without wrapping to match Fastify behavior
    return createJsonResponse(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user profile",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
