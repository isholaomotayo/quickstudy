import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  authenticateUser,
  createAuthErrorResponse,
} from "@/lib/api-auth";

// Simple in-memory storage for demo (use database in production)
const applicationStorage = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, formData } = body;

    if (!sessionId || !formData) {
      return NextResponse.json(
        { error: "Session ID and form data are required" },
        { status: 400 }
      );
    }

    // Authenticate user
    const authResult = await authenticateUser();

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;
    const userId = BigInt(user.id);

    // Save progress with timestamp in memory storage
    applicationStorage.set(sessionId, {
      ...formData,
      savedAt: new Date().toISOString(),
    });

    // Also save to student table as draft (status: false)
    try {
      // Prepare student data - only include fields that have valid values
      const studentData: any = {
        user_id: userId,
        status: false, // Set to false for draft/progress saving
        updated_by: userId,
      };

      // Only add fields that have valid values
      if (formData.gender && formData.gender.trim() !== "") {
        studentData.gender = formData.gender.toUpperCase();
      }
      if (formData.dateOfBirth && formData.dateOfBirth.trim() !== "") {
        studentData.dob = new Date(formData.dateOfBirth);
      }
      if (formData.address && formData.address.trim() !== "") {
        studentData.address = formData.address;
      }
      if (formData.stateOfOrigin && formData.stateOfOrigin.trim() !== "") {
        studentData.state_origin = formData.stateOfOrigin;
      }
      if (formData.localGovernment && formData.localGovernment.trim() !== "") {
        studentData.lga_origin = formData.localGovernment;
      }
      if (formData.state && formData.state.trim() !== "") {
        studentData.state_residence = formData.state;
      }
      if (formData.city && formData.city.trim() !== "") {
        studentData.lga_residence = formData.city;
      }
      if (formData.maritalStatus && formData.maritalStatus.trim() !== "") {
        studentData.marital_status = formData.maritalStatus.toUpperCase();
      }
      if (
        formData.employmentStatus &&
        formData.employmentStatus.trim() !== ""
      ) {
        studentData.employment_status = formData.employmentStatus;
      }
      if (
        formData.identityDocument &&
        formData.identityDocument.trim() !== ""
      ) {
        studentData.id_card = formData.identityDocument;
      }
      if (
        formData.certificates &&
        Array.isArray(formData.certificates) &&
        formData.certificates.length > 0
      ) {
        studentData.inst_cert = formData.certificates;
      }
      if (formData.graduationYear && formData.graduationYear.trim() !== "") {
        studentData.grad_year = formData.graduationYear;
      }
      if (formData.degreeGrade && formData.degreeGrade.trim() !== "") {
        studentData.degree_grade = formData.degreeGrade;
      }
      if (formData.degreeType && formData.degreeType.trim() !== "") {
        studentData.type_degree = formData.degreeType;
      }
      if (formData.courseStudied && formData.courseStudied.trim() !== "") {
        studentData.course_studied = formData.courseStudied;
      }
      if (formData.institutionType && formData.institutionType.trim() !== "") {
        studentData.inst_type = formData.institutionType;
      }
      if (
        formData.previousInstitution &&
        formData.previousInstitution.trim() !== ""
      ) {
        studentData.inst_name = formData.previousInstitution;
      }
      if (
        formData.preferredProgram &&
        formData.preferredProgram !== "" &&
        !isNaN(parseInt(formData.preferredProgram))
      ) {
        studentData.programme_id = parseInt(formData.preferredProgram);
      }
      if (formData.ref_fname && formData.ref_fname.trim() !== "") {
        studentData.ref_fname = formData.ref_fname;
      }
      if (formData.ref_lname && formData.ref_lname.trim() !== "") {
        studentData.ref_lname = formData.ref_lname;
      }
      if (formData.ref_phone && formData.ref_phone.trim() !== "") {
        studentData.ref_phone = formData.ref_phone;
      }
      if (formData.ref_address && formData.ref_address.trim() !== "") {
        studentData.ref_address = formData.ref_address;
      }

      // Check if student record already exists
      const existingStudent = await prisma.student.findFirst({
        where: {
          user_id: userId,
          is_deleted: false,
        },
      });

      if (existingStudent) {
        // Update existing student record
        await prisma.student.update({
          where: { id: existingStudent.id },
          data: studentData,
        });
      } else {
        // Create new student record
        studentData.created_by = userId;
        await prisma.student.create({
          data: studentData,
        });
      }

      // Update user avatar if passport photo is provided
      if (formData.passportPhoto && formData.passportPhoto.trim() !== "") {
        try {
          await prisma.user.update({
            where: { id: parseInt(user.id) },
            data: {
              avatar: formData.passportPhoto,
            },
          });
        } catch (avatarError) {
          console.error("Error updating user avatar:", avatarError);
          // Continue even if avatar update fails
        }
      }
    } catch (studentError) {
      console.error("Error saving to student table:", studentError);
      // Continue even if student table save fails
    }

    return NextResponse.json({
      success: true,
      message: "Progress saved successfully",
      savedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving application progress:", error);
    return NextResponse.json(
      { error: "Failed to save progress" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const savedData = applicationStorage.get(sessionId);

    if (!savedData) {
      return NextResponse.json(
        { error: "No saved data found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: savedData,
    });
  } catch (error) {
    console.error("Error retrieving application progress:", error);
    return NextResponse.json(
      { error: "Failed to retrieve progress" },
      { status: 500 }
    );
  }
}
