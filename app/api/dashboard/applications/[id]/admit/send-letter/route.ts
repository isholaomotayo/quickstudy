import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateAdmissionLetterHTML, type AdmissionLetterData } from "@/lib/admission-letter-template";
import { generatePDFFromHTML } from "@/lib/pdf-generator";

async function sendAdmissionEmail(
  to: string,
  subject: string,
  html: string,
  pdfBuffer: Buffer,
  fromEmail: string
) {
  // Convert PDF buffer to base64 for Brevo API
  const pdfBase64 = pdfBuffer.toString("base64");

  // Brevo API requires JSON format with attachment as base64
  const emailData = {
    to: [{ email: to }],
    sender: { email: fromEmail },
    subject: subject,
    htmlContent: html,
    attachments: [
      {
        name: "admission-letter.pdf",
        content: pdfBase64,
      },
    ],
  };

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo API error: ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const studentId = body.studentId;

    // Fetch student with all necessary relations
    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { id: studentId ? BigInt(studentId) : undefined },
          { user_id: BigInt(id) },
        ].filter(Boolean),
      },
      include: {
        user_student_user_idTouser: {
          include: {
            institution_user_institution_idToinstitution: true,
          },
        },
        programme: {
          include: {
            department: {
              include: {
                faculty: true,
              },
            },
          },
        },
        session: true,
        level: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const user = student.user_student_user_idTouser;
    if (!user) {
      return NextResponse.json(
        { error: "User not found for student" },
        { status: 404 }
      );
    }

    const institution = user.institution_user_institution_idToinstitution;
    if (!institution) {
      return NextResponse.json(
        { error: "Institution not found for user" },
        { status: 404 }
      );
    }

    // Prepare data for template
    const admissionData: AdmissionLetterData = {
      student: {
        name: `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Applicant",
        regNo: student.reg_no || "Pending",
        email: user.email,
        programme: student.programme?.name || "Programme",
        session: student.session?.name || "Session",
        fieldOfStudy: student.programme?.name || undefined,
        entryLevelId: student.entry_level_id ?? 0,
        loginCode: user.code || undefined,
      },
      institution: {
        logo: institution.logo || null,
        secondary_logo: institution.secondary_logo || null,
        name: institution.name,
        address: institution.address,
        email: institution.email,
        admission_mail: institution.admission_mail || null,
        vice_chancellor_name: institution.vice_chancellor_name || null,
        director_name: institution.director_name || null,
        director_credentials: institution.director_credentials || null,
        secretary_name: institution.secretary_name || null,
        secretary_signature: institution.secretary_signature || null,
        director_signature: institution.director_signature || null,
      },
      programme: {
        name: student.programme?.name || "Programme",
        department: student.programme?.department?.name || null,
        faculty: student.programme?.department?.faculty?.name || null,
      },
      frontendUrl: process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || "",
    };

    // Generate HTML email
    const htmlContent = generateAdmissionLetterHTML(admissionData);

    // Generate PDF
    const pdfBuffer = await generatePDFFromHTML(htmlContent);

    // Determine email subject
    const isPreMBA = admissionData.student.entryLevelId === 1;
    const subject = isPreMBA
      ? `OFFER OF PROVISIONAL ADMISSION (Pre-MBA) - ${institution.name}`
      : `OFFER OF PROVISIONAL ADMISSION - ${institution.name}`;

    // Determine from email
    const fromEmail = institution.admission_mail || institution.email;

    // Send email with PDF attachment
    await sendAdmissionEmail(
      user.email,
      subject,
      htmlContent,
      pdfBuffer,
      fromEmail
    );

    return NextResponse.json({
      success: true,
      message: "Admission letter sent successfully",
    });
  } catch (error) {
    console.error("Error sending admission letter:", error);
    return NextResponse.json(
      {
        error: "Failed to send admission letter",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

