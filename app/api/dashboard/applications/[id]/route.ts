import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    // First try to find as a student (for ADDITIONAL applications)
    let studentApplication = await prisma.student.findUnique({
      where: {
        id: BigInt(id),
        is_deleted: false,
        application_type: "ADDITIONAL",
      },
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
        level: true,
        semester: true,
        session: true,
      },
    });

    if (studentApplication) {
      // This is an ADDITIONAL application
      const user = studentApplication.user_student_user_idTouser;

      const applicationData = {
        id: studentApplication.id.toString(),
        // Personal Information
        firstName: user?.first_name || "",
        lastName: user?.last_name || "",
        otherName: user?.other_name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        avatar: user?.avatar || "",
        active: user?.active || false,
        status: studentApplication.status
          ? "approved"
          : studentApplication.admitted === false
          ? "pending"
          : "approved",
        applicationDeclinedReason: null,
        createdAt: studentApplication.created_at,
        updatedAt: studentApplication.updated_at,

        // Student Details
        student: {
          id: studentApplication.id.toString(),
          regNo: studentApplication.reg_no,
          title: studentApplication.title,
          gender: studentApplication.gender,
          dateOfBirth: studentApplication.dob,
          maritalStatus: studentApplication.marital_status,
          employmentStatus: studentApplication.employment_status,
          address: studentApplication.address,

          // Reference Information
          refFirstName: studentApplication.ref_fname,
          refLastName: studentApplication.ref_lname,
          refPhone: studentApplication.ref_phone,
          refAddress: studentApplication.ref_address,

          // Academic History
          institutionName: studentApplication.inst_name,
          institutionType: studentApplication.inst_type,
          courseStudied: studentApplication.course_studied,
          degreeType: studentApplication.type_degree,
          degreeGrade: studentApplication.degree_grade,
          graduationYear: studentApplication.grad_year,

          // Documents
          idCard: studentApplication.id_card,
          institutionCertificates: studentApplication.inst_cert,

          // Programme and Level
          programmeId: studentApplication.programme_id,
          programme: studentApplication.programme,
          entryLevelId: studentApplication.entry_level_id,
          level: studentApplication.level,

          // Admission Details
          admitted: studentApplication.admitted,
          semesterAdmittedId: studentApplication.semester_admitted_id,
          sessionAdmittedId: studentApplication.session_admitted_id,
          admissionStatus: studentApplication.admission_status,

          status: studentApplication.status,
          createdAt: studentApplication.created_at,
          updatedAt: studentApplication.updated_at,
        },
      };

      return NextResponse.json({ application: applicationData });
    }

    // If not found as student, try to find as user (for NEW applications)
    const application = await prisma.user.findUnique({
      where: {
        id: BigInt(id),
        role: "APPLICANT",
      },
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
            level: true,
            semester: true,
            session: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const student = application.student_student_user_idTouser?.[0];

    const applicationData = {
      id: application.id.toString(),
      // Personal Information
      firstName: application.first_name,
      lastName: application.last_name,
      otherName: application.other_name,
      email: application.email,
      phone: application.phone,
      avatar: application.avatar,
      active: application.active,
      status: application.active
        ? "approved"
        : application.application_declined_reason
        ? "rejected"
        : "pending",
      applicationDeclinedReason: application.application_declined_reason,
      createdAt: application.created_at,
      updatedAt: application.updated_at,

      // Student Details
      student: student
        ? {
            id: student.id.toString(),
            regNo: student.reg_no,
            title: student.title,
            gender: student.gender,
            dateOfBirth: student.dob,
            maritalStatus: student.marital_status,
            employmentStatus: student.employment_status,
            address: student.address,

            // Reference Information
            refFirstName: student.ref_fname,
            refLastName: student.ref_lname,
            refPhone: student.ref_phone,
            refAddress: student.ref_address,

            // Academic History
            institutionName: student.inst_name,
            institutionType: student.inst_type,
            courseStudied: student.course_studied,
            degreeType: student.type_degree,
            degreeGrade: student.degree_grade,
            graduationYear: student.grad_year,

            // Documents
            idCard: student.id_card,
            institutionCertificates: student.inst_cert,

            // Programme and Level
            programmeId: student.programme_id,
            programme: student.programme,
            entryLevelId: student.entry_level_id,
            level: student.level,

            // Admission Details
            admitted: student.admitted,
            semesterAdmittedId: student.semester_admitted_id,
            sessionAdmittedId: student.session_admitted_id,
            admissionStatus: student.admission_status,

            status: student.status,
            createdAt: student.created_at,
            updatedAt: student.updated_at,
          }
        : null,
    };

    return NextResponse.json({ application: applicationData });
  } catch (error) {
    console.error("Error fetching application details:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch application details",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
