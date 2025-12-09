import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Define types for the API responses
interface UserData {
  first_name?: string;
  last_name?: string;
  other_name?: string;
  email?: string;
  phone?: string;
  alternative_phone?: string;
  avatar?: string;
  institution_id?: string;
}

interface StudentData {
  dob?: string;
  gender?: string;
  state_origin?: string;
  lga_origin?: string;
  marital_status?: string;
  employment_status?: string;
  address?: string;
  lga_residence?: string;
  state_residence?: string;
  inst_name?: string;
  inst_type?: string;
  course_studied?: string;
  type_degree?: string;
  degree_grade?: string;
  grad_year?: string;
  programme_id?: number;
  id_card?: string;
  inst_cert?: string[];
  ref_fname?: string;
  ref_lname?: string;
  ref_phone?: string;
  ref_address?: string;
  status?: boolean;
  updated_at?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from cookies
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Get student data from backend
    const studentResponse = await fetch(
      `${process.env.API_URL}/api/student/userid/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Cookie: request.headers.get("cookie") || "",
        },
      }
    );

    if (!studentResponse.ok) {
      // If no student record exists, return empty form data
      if (studentResponse.status === 404) {
        return NextResponse.json({
          success: true,
          data: null, // No existing application
        });
      }
      throw new Error(`Backend API error: ${studentResponse.status}`);
    }

    const studentData: StudentData = await studentResponse.json();

    // Get user data for avatar
    const userResponse = await fetch(
      `${process.env.API_URL}/api/user/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Cookie: request.headers.get("cookie") || "",
        },
      }
    );

    let userData: UserData | null = null;
    if (userResponse.ok) {
      userData = await userResponse.json();
    }

    // Map database fields back to form fields
    const formData = {
      // Personal Information
      firstName: userData?.first_name || "",
      lastName: userData?.last_name || "",
      otherName: userData?.other_name || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
      alternativePhone: userData?.alternative_phone || "",
      dateOfBirth: studentData?.dob || "",
      gender: studentData?.gender?.toLowerCase() || "",
      stateOfOrigin: studentData?.state_origin || "",
      localGovernment: studentData?.lga_origin || "",
      maritalStatus: studentData?.marital_status || "",
      employmentStatus: studentData?.employment_status || "",

      // Contact Information
      address: studentData?.address || "",
      city: studentData?.lga_residence || "",
      state: studentData?.state_residence || "",

      // Academic Information
      previousInstitution: studentData?.inst_name || "",
      institutionType: studentData?.inst_type || "",
      courseStudied: studentData?.course_studied || "",
      degreeType: studentData?.type_degree || "",
      degreeGrade: studentData?.degree_grade || "",
      graduationYear: studentData?.grad_year || "",

      // Program Selection
      preferredProgram: studentData?.programme_id?.toString() || "",
      secondChoiceProgram: "", // This field doesn't exist in student table

      // Documents
      passportPhoto: userData?.avatar || "",
      identityDocument: studentData?.id_card || "",
      certificates: studentData?.inst_cert || [],

      // Reference Information
      ref_fname: studentData?.ref_fname || "",
      ref_lname: studentData?.ref_lname || "",
      ref_phone: studentData?.ref_phone || "",
      ref_address: studentData?.ref_address || "",

      // Additional Information
      institution_id: userData?.institution_id || "",

      // Application Status
      currentStep: studentData?.status ? 5 : 1, // If status is true, go to review step
      isComplete: studentData?.status || false,
      lastSaved: studentData?.updated_at || new Date().toISOString(),
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
