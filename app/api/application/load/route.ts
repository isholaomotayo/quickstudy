import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
} from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const userId = BigInt(user.id);

    // Get student data from database
    const studentData = await prisma.student.findFirst({
      where: {
        user_id: userId,
        is_deleted: false,
      },
    });

    // If no student record exists, return empty form data
    if (!studentData) {
      return NextResponse.json({
        success: true,
        data: null, // No existing application
      });
    }

    // Get user data for avatar and other fields
    const userData = await prisma.user.findUnique({
      where: { id: parseInt(user.id) },
      select: {
        first_name: true,
        last_name: true,
        other_name: true,
        email: true,
        phone: true,
        avatar: true,
        institution_id: true,
      },
    });

    // Map database fields back to form fields
    const formData = {
      // Personal Information
      firstName: userData?.first_name || "",
      lastName: userData?.last_name || "",
      otherName: userData?.other_name || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      alternativePhone: "", // Field not available in user model
      dateOfBirth: studentData.dob ? studentData.dob.toISOString().split('T')[0] : "",
      gender: studentData.gender?.toLowerCase() || "",
      stateOfOrigin: studentData.state_origin || "",
      localGovernment: studentData.lga_origin || "",
      maritalStatus: studentData.marital_status || "",
      employmentStatus: studentData.employment_status || "",

      // Contact Information
      address: studentData.address || "",
      city: studentData.lga_residence || "",
      state: studentData.state_residence || "",

      // Academic Information
      previousInstitution: studentData.inst_name || "",
      institutionType: studentData.inst_type || "",
      courseStudied: studentData.course_studied || "",
      degreeType: studentData.type_degree || "",
      degreeGrade: studentData.degree_grade || "",
      graduationYear: studentData.grad_year || "",

      // Program Selection
      preferredProgram: studentData.programme_id?.toString() || "",
      secondChoiceProgram: "", // This field doesn't exist in student table

      // Documents
      passportPhoto: userData?.avatar || "",
      identityDocument: studentData.id_card || "",
      certificates: studentData.inst_cert || [],

      // Reference Information
      ref_fname: studentData.ref_fname || "",
      ref_lname: studentData.ref_lname || "",
      ref_phone: studentData.ref_phone || "",
      ref_address: studentData.ref_address || "",

      // Additional Information
      institution_id: userData?.institution_id?.toString() || "",

      // Application Status
      currentStep: studentData.status ? 5 : 1, // If status is true, go to review step
      isComplete: studentData.status || false,
      lastSaved: studentData.updated_at ? studentData.updated_at.toISOString() : new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: formData,
    });
  } catch (error) {
    console.error("Error loading application data:", error);
    return NextResponse.json(
      { error: "Failed to load application data" },
      { status: 500 }
    );
  }
}
