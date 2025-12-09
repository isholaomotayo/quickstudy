import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
} from "@/lib/api-auth";

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

    // Fetch complete user profile from database
    const userProfile = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
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

    if (!userProfile) {
      return createAuthErrorResponse("User not found", 404);
    }

    return createSuccessResponse(userProfile, user);
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

    return createSuccessResponse(updatedUser, user);
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
