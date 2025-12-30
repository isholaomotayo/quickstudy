import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Helper function to get the last student with a registration number for a session and year
async function getLastRegNoStudent(sessionId: number, yearString: string) {
  try {
    // Using raw query similar to the backend implementation
    const result = await prisma.$queryRaw<Array<{ reg_no: string; v: number }>>`
      SELECT reg_no,
             CAST(regexp_replace(reg_no, '[^0-9]', '', 'g') AS INT) as v
      FROM student
      WHERE reg_no IS NOT NULL
        AND reg_no != ''
        AND reg_no LIKE ${`%/${yearString}/%`}
        AND session_admitted_id = ${sessionId}
      ORDER BY v DESC
      LIMIT 1
    `;

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Error getting last registration number:", error);
    return null;
  }
}

// Format-based registration number generation
async function generateFormattedRegistrationNumber(
  programmeId: number,
  sessionId: number
): Promise<string> {
  try {
    // Get programme with its regno_format
    const programme = await prisma.programme.findUnique({
      where: { id: programmeId },
    });

    // Get session with end_year
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!programme || !session) {
      throw new Error("Programme or session not found");
    }

    const regNoFormat = programme.regno_format;
    const yearString = session.end_year;

    if (!regNoFormat) {
      console.error("Programme missing regno_format:", programme);
      throw new Error("Set RegNo format for programme in DB.");
    }

    if (!yearString) {
      console.error("Session missing end_year:", session);
      throw new Error("Set active semester, and session end_year in DB.");
    }

    console.log("Using programme format:", regNoFormat);
    console.log("Using session year:", yearString);

    // Find the position of the serial number placeholder
    const numberPos = regNoFormat.split("/").indexOf(":NN:");
    if (numberPos === -1) {
      throw new Error("RegNo format must contain :NN: placeholder");
    }

    // Format year string (last 2 digits)
    const formattedYearString = yearString.toString().slice(-2);

    // Get the last assigned student for this session and year
    const lastAssignedStudent = await getLastRegNoStudent(
      sessionId,
      formattedYearString
    );

    let lastSerialNumber = 0;

    if (lastAssignedStudent?.reg_no) {
      const regNoParts = lastAssignedStudent.reg_no.split("/");
      if (regNoParts.length > numberPos) {
        const serialNum = parseInt(regNoParts[numberPos], 10);
        if (!isNaN(serialNum)) {
          lastSerialNumber = serialNum;
        }
      }
    }

    // Generate new registration number
    const newSerialNumber = String(lastSerialNumber + 1).padStart(3, "0");
    const newRegNo = regNoFormat
      .replace(/:YY:?/g, formattedYearString) // Handle both :YY: and :YY
      .replace(/:NN:?/g, newSerialNumber); // Handle both :NN: and :NN

    console.log(`Generated registration number: ${newRegNo}`);
    return newRegNo;
  } catch (error) {
    console.error("Error generating formatted registration number:", error);
    // Fallback to simple format
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2);
    const timestamp = Date.now().toString().slice(-3);
    return `STU/${yearSuffix}/${timestamp}`;
  }
}

// Helper function to generate registration number using programme format
async function generateRegistrationNumber(
  programmeId: number,
  sessionId: number
): Promise<string> {
  try {
    console.log(
      "Generating registration number with programmeId:",
      programmeId,
      "sessionId:",
      sessionId
    );
    return await generateFormattedRegistrationNumber(programmeId, sessionId);
  } catch (error) {
    console.error("Error generating registration number:", error);
    return `STU${Date.now()}`;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { programmeId, levelId, sessionId } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Application ID is required" },
        { status: 400 }
      );
    }

    if (!programmeId || !levelId || !sessionId) {
      return NextResponse.json(
        { error: "Programme ID, Level ID and Session ID are required" },
        { status: 400 }
      );
    }

    // Get the first semester for the selected session
    const admissionSemester = await prisma.semester.findFirst({
      where: { session_id: sessionId },
      orderBy: { id: "asc" }, // Get the first semester of that session
    });

    if (!admissionSemester) {
      return NextResponse.json(
        { error: "No semester found for the selected session" },
        { status: 400 }
      );
    }

    // Generate registration number before transaction
    const registrationNumber = await generateRegistrationNumber(
      programmeId,
      sessionId
    );

    console.log(
      "Generated registration number for admission:",
      registrationNumber
    );

    // Start transaction to update both user and student records
    const result = await prisma.$transaction(async (tx) => {
      // Update user status to active (admitted)
      const updatedUser = await tx.user.update({
        where: {
          id: BigInt(id),
          role: "APPLICANT",
        },
        data: {
          active: true,
          role: "STUDENT", // Change role from APPLICANT to STUDENT
          updated_at: new Date(),
        },
      });

      // Update or create student record
      const existingStudent = await tx.student.findFirst({
        where: { user_id: BigInt(id) },
      });

      if (existingStudent) {
        // Update existing student record with registration number
        await tx.student.update({
          where: { id: existingStudent.id },
          data: {
            reg_no: registrationNumber,
            programme_id: programmeId,
            entry_level_id: levelId,
            admitted: true,
            status: true,
            admission_status: "ACTIVE",
            semester_admitted_id: admissionSemester.id,
            session_admitted_id: sessionId,
            updated_at: new Date(),
          },
        });
      } else {
        // Create new student record with registration number (shouldn't happen but just in case)
        await tx.student.create({
          data: {
            user_id: BigInt(id),
            reg_no: registrationNumber,
            programme_id: programmeId,
            entry_level_id: levelId,
            admitted: true,
            status: true,
            admission_status: "ACTIVE",
            semester_admitted_id: admissionSemester.id,
            session_admitted_id: sessionId,
          },
        });
      }

      return updatedUser;
    });

    // Send admission letter email (non-blocking)
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        process.env.FRONTEND_URL ||
        "http://localhost:3000";
      
      // Get the student ID for the send-letter route
      const studentRecord = await prisma.student.findFirst({
        where: { user_id: BigInt(id) },
      });

      if (studentRecord) {
        // Call send-letter route asynchronously (don't wait for it)
        fetch(`${baseUrl}/api/dashboard/applications/${id}/admit/send-letter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId: studentRecord.id.toString() }),
        }).catch((emailError) => {
          console.error("Failed to send admission letter:", emailError);
          // Don't fail the admission if email fails
        });
      }
    } catch (emailError) {
      console.error("Error triggering admission letter email:", emailError);
      // Don't fail the admission if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Applicant admitted successfully",
      data: {
        id: result.id.toString(),
        role: result.role,
        active: result.active,
      },
    });
  } catch (error) {
    console.error("Error admitting applicant:", error);
    return NextResponse.json(
      {
        error: "Failed to admit applicant",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
