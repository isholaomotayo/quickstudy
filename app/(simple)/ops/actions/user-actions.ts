"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Validation schemas
const createUserSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([
    "ADMIN",
    "PROGRAMME_COORDINATOR",
    "HOD",
    "PROGRAMME_EXAM_OFFICER",
    "FACILITATOR",
    "ETUTOR",
    "STAFF",
    "LECTURER",
    "STUDENT",
    "APPLICANT",
    "AFFILIATE",
  ]),
  phone: z.string().optional(),
  institution_id: z.number(),
});

const updateUserSchema = z.object({
  id: z.string(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum([
    "ADMIN",
    "PROGRAMME_COORDINATOR",
    "HOD",
    "PROGRAMME_EXAM_OFFICER",
    "FACILITATOR",
    "ETUTOR",
    "STAFF",
    "LECTURER",
    "STUDENT",
    "APPLICANT",
    "AFFILIATE",
  ]),
  phone: z.string().optional(),
  active: z.boolean(),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

// Helper function to generate registration number using programme format
async function generateRegistrationNumber(
  institutionId: number,
  programmeId?: number,
  sessionId?: number
): Promise<string> {
  try {
    // If we have programme and session info, use the format-based approach
    if (programmeId && sessionId) {
      console.log(
        "Using format-based generation with programmeId:",
        programmeId,
        "sessionId:",
        sessionId
      );
      return await generateFormattedRegistrationNumber(programmeId, sessionId);
    }

    console.log(
      "Falling back to default generation - missing programmeId or sessionId"
    );

    // Fallback: Get most recent session and a default programme
    const activeSession = await prisma.session.findFirst({
      where: {
        institution_id: institutionId,
      },
      orderBy: { end_date: "desc" },
    });

    if (activeSession) {
      // Try to get a programme for this institution
      const programme = await prisma.programme.findFirst({
        where: {
          department: {
            faculty: {
              institution_id: institutionId,
            },
          },
        },
        include: {
          department: true,
        },
      });

      if (programme) {
        return await generateFormattedRegistrationNumber(
          programme.id,
          activeSession.id
        );
      }
    }

    // Final fallback to simple format
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2);

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    const instCode = institution?.code || "UNI";

    // Count existing students for this year to get next sequence
    const studentCount = await prisma.student.count({
      where: {
        reg_no: {
          contains: `/${yearSuffix}/`,
          not: null,
        },
      },
    });

    const sequence = (studentCount + 1).toString().padStart(3, "0");
    return `${instCode}/${yearSuffix}/${sequence}`;
  } catch (error) {
    console.error("Error generating registration number:", error);
    return `STU${Date.now()}`;
  }
}

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

// Format-based registration number generation (following backend pattern)
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

// Helper function to generate staff number
async function generateStaffNumber(institutionId: number): Promise<string> {
  try {
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    const instCode = institution?.code || "UNI";

    const staffCount = await prisma.staff.count({
      where: {
        staff_no: {
          not: null,
        },
      },
    });

    const sequence = (staffCount + 1).toString().padStart(4, "0");
    return `${instCode}/STF/${sequence}`;
  } catch (error) {
    console.error("Error generating staff number:", error);
    return `STF${Date.now()}`;
  }
}

export async function createUser(formData: CreateUserFormData) {
  try {
    // Validate form data
    const validatedData = createUserSchema.parse(formData);

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: validatedData.username },
          { email: validatedData.email },
        ],
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Username or email already exists",
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        username: validatedData.username,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role,
        phone: validatedData.phone,
        institution_id: validatedData.institution_id,
        active: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Create role-specific records
    if (validatedData.role === "STUDENT") {
      const regNo = await generateRegistrationNumber(
        validatedData.institution_id
      );
      await prisma.student.create({
        data: {
          user_id: user.id,
          reg_no: regNo,
          is_deleted: false,
          status: false, // Inactive by default until admission
          admitted: false,
        },
      });
    } else if (
      validatedData.role === "STAFF" ||
      validatedData.role === "HOD" ||
      validatedData.role === "LECTURER"
    ) {
      const staffNo = await generateStaffNumber(validatedData.institution_id);
      await prisma.staff.create({
        data: {
          user_id: user.id,
          staff_no: staffNo,
          title: "Mr/Ms", // Default title
          designation:
            validatedData.role === "HOD"
              ? "Head of Department"
              : validatedData.role === "LECTURER"
              ? "Lecturer"
              : "Staff",
          is_deleted: false,
        },
      });
    }

    revalidatePath("/ops");
    return {
      success: true,
      message: "User created successfully",
      user: {
        id: user.id.toString(),
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Error creating user:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        details: error.issues,
      };
    }

    return {
      success: false,
      error: "Failed to create user. Please try again.",
    };
  }
}

export async function updateUser(formData: UpdateUserFormData) {
  try {
    // Validate form data
    const validatedData = updateUserSchema.parse(formData);

    // Check if username or email already exists for other users
    const existingUser = await prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: BigInt(validatedData.id) } },
          {
            OR: [
              { username: validatedData.username },
              { email: validatedData.email },
            ],
          },
        ],
      },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Username or email already exists",
      };
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: BigInt(validatedData.id) },
      data: {
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        username: validatedData.username,
        email: validatedData.email,
        role: validatedData.role,
        phone: validatedData.phone,
        active: validatedData.active,
        updated_at: new Date(),
      },
    });

    revalidatePath("/ops");
    return {
      success: true,
      message: "User updated successfully",
      user: {
        id: user.id.toString(),
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("Error updating user:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        details: error.issues,
      };
    }

    return {
      success: false,
      error: "Failed to update user. Please try again.",
    };
  }
}

export async function permanentlyDeleteUser(userId: string) {
  try {
    const userIdBigInt = BigInt(userId);

    // Check if user has any child records that would prevent deletion
    const childRecords = await Promise.all([
      // Check for staff records
      prisma.staff.count({ where: { user_id: userIdBigInt } }),
      // Check for student records
      prisma.student.count({ where: { user_id: userIdBigInt } }),
      // Check for announcements
      prisma.announcements.count({ where: { user_id: userIdBigInt } }),
      // Check for course discussions
      prisma.course_discussion_topic.count({
        where: { user_id: userIdBigInt },
      }),
      // Check for forum topics
      prisma.course_forum_topic.count({ where: { user_id: userIdBigInt } }),
      // Check for course announcements
      prisma.course_announcement.count({ where: { user_id: userIdBigInt } }),
      // Check for payments through student records
      prisma.payment2.count({
        where: {
          student: {
            user_id: userIdBigInt,
          },
        },
      }),
    ]);

    const [
      staffCount,
      studentCount,
      announcementsCount,
      discussionsCount,
      forumTopicsCount,
      courseAnnouncementsCount,
      paymentsCount,
    ] = childRecords;

    const totalChildRecords = childRecords.reduce(
      (sum, count) => sum + count,
      0
    );

    if (totalChildRecords > 0) {
      const childRecordDetails: string[] = [];
      if (staffCount > 0)
        childRecordDetails.push(`${staffCount} staff record(s)`);
      if (studentCount > 0)
        childRecordDetails.push(`${studentCount} student record(s)`);
      if (announcementsCount > 0)
        childRecordDetails.push(`${announcementsCount} announcement(s)`);
      if (discussionsCount > 0)
        childRecordDetails.push(`${discussionsCount} discussion(s)`);
      if (forumTopicsCount > 0)
        childRecordDetails.push(`${forumTopicsCount} forum topic(s)`);
      if (courseAnnouncementsCount > 0)
        childRecordDetails.push(
          `${courseAnnouncementsCount} course announcement(s)`
        );
      if (paymentsCount > 0)
        childRecordDetails.push(`${paymentsCount} payment(s)`);

      return {
        success: false,
        error: "Cannot delete user with existing records",
        details: `This user has ${childRecordDetails.join(
          ", "
        )}. Please remove or transfer these records before deleting the user, or deactivate the user instead.`,
        canDeactivate: true,
      };
    }

    // If no child records, proceed with deletion
    await prisma.user.delete({
      where: { id: userIdBigInt },
    });

    revalidatePath("/ops");
    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: "Failed to delete user",
      details:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function deactivateUser(userId: string) {
  try {
    await prisma.user.update({
      where: { id: BigInt(userId) },
      data: {
        active: false,
        updated_at: new Date(),
      },
    });

    revalidatePath("/ops");
    return {
      success: true,
      message: "User deactivated successfully",
    };
  } catch (error) {
    console.error("Error deactivating user:", error);
    return {
      success: false,
      error: "Failed to deactivate user. Please try again.",
    };
  }
}

export async function toggleUserStatus(userId: string, active: boolean) {
  try {
    await prisma.user.update({
      where: { id: BigInt(userId) },
      data: {
        active,
        updated_at: new Date(),
      },
    });

    revalidatePath("/ops");
    return {
      success: true,
      message: `User ${active ? "activated" : "deactivated"} successfully`,
    };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return {
      success: false,
      error: "Failed to update user status. Please try again.",
    };
  }
}

export async function getUserById(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(userId) },
      include: {
        staff_staff_user_idTouser: true,
        student_student_user_idTouser: {
          include: {
            programme: true,
            session: true,
            semester: true,
            level: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    return {
      success: true,
      user: {
        id: user.id.toString(),
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        active: user.active,
        institution_id: user.institution_id,
        staff: user.staff_staff_user_idTouser?.map((staff) => ({
          ...staff,
          id: staff.id.toString(),
          user_id: staff.user_id?.toString() || null,
        })),
        student: user.student_student_user_idTouser?.map((student) => ({
          ...student,
          id: student.id.toString(),
          user_id: student.user_id?.toString() || null,
        })),
        created_at: user.created_at.toISOString(),
        updated_at: user.updated_at.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return {
      success: false,
      error: "Failed to fetch user data",
    };
  }
}

// Student-specific actions
const updateStudentSchema = z.object({
  studentId: z.string(),
  reg_no: z.string().optional(),
  programme_id: z.number().nullable().optional(),
  semester_admitted_id: z.number().nullable().optional(),
  session_admitted_id: z.number().nullable().optional(),
  entry_level_id: z.number().nullable().optional(),
  status: z.boolean().optional(),
  admitted: z.boolean().optional(),
  title: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
  nationality_id: z.number().nullable().optional(),
  state_origin_id: z.number().nullable().optional(),
  lga_id: z.number().nullable().optional(),
  address: z.string().optional(),
  marital_status: z.string().optional(),
  employment_status: z.string().optional(),
});

export type UpdateStudentFormData = z.infer<typeof updateStudentSchema>;

export async function updateStudentProfile(formData: UpdateStudentFormData) {
  try {
    const validatedData = updateStudentSchema.parse(formData);

    // Check if registration number is being changed and if it already exists
    if (validatedData.reg_no) {
      const existingStudent = await prisma.student.findFirst({
        where: {
          reg_no: validatedData.reg_no,
          id: { not: BigInt(validatedData.studentId) },
        },
      });

      if (existingStudent) {
        return {
          success: false,
          error: "Registration number already exists",
        };
      }
    }

    const updateData: any = { updated_at: new Date() };

    if (validatedData.reg_no !== undefined)
      updateData.reg_no = validatedData.reg_no;
    if (validatedData.programme_id !== undefined)
      updateData.programme_id = validatedData.programme_id;
    if (validatedData.semester_admitted_id !== undefined)
      updateData.semester_admitted_id = validatedData.semester_admitted_id;
    if (validatedData.session_admitted_id !== undefined)
      updateData.session_admitted_id = validatedData.session_admitted_id;
    if (validatedData.entry_level_id !== undefined)
      updateData.entry_level_id = validatedData.entry_level_id;
    if (validatedData.status !== undefined)
      updateData.status = validatedData.status;
    if (validatedData.admitted !== undefined)
      updateData.admitted = validatedData.admitted;
    if (validatedData.title !== undefined)
      updateData.title = validatedData.title;
    if (validatedData.gender !== undefined)
      updateData.gender = validatedData.gender;
    if (validatedData.dob !== undefined)
      updateData.dob = validatedData.dob ? new Date(validatedData.dob) : null;
    if (validatedData.nationality_id !== undefined)
      updateData.nationality_id = validatedData.nationality_id;
    if (validatedData.state_origin_id !== undefined)
      updateData.state_origin_id = validatedData.state_origin_id;
    if (validatedData.lga_id !== undefined)
      updateData.lga_id = validatedData.lga_id;
    if (validatedData.address !== undefined)
      updateData.address = validatedData.address;
    if (validatedData.marital_status !== undefined)
      updateData.marital_status = validatedData.marital_status;
    if (validatedData.employment_status !== undefined)
      updateData.employment_status = validatedData.employment_status;

    const student = await prisma.student.update({
      where: { id: BigInt(validatedData.studentId) },
      data: updateData,
    });

    revalidatePath("/ops");
    return {
      success: true,
      message: "Student profile updated successfully",
      student: {
        id: student.id.toString(),
        reg_no: student.reg_no,
      },
    };
  } catch (error) {
    console.error("Error updating student profile:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        details: error.issues,
      };
    }

    return {
      success: false,
      error: "Failed to update student profile. Please try again.",
    };
  }
}

export async function generateNewRegistrationNumber(
  studentId: string,
  institutionId: number
) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: BigInt(studentId) },
      include: {
        programme: true,
        session: true,
      },
    });

    if (!student) {
      return {
        success: false,
        error: "Student not found",
      };
    }

    // Use student's programme and session for generation
    const programmeId = student.programme_id;
    const sessionId = student.session_admitted_id;

    console.log(`Student data for reg generation:`, {
      studentId,
      programmeId,
      sessionId,
      programme: student.programme,
      session: student.session,
    });

    if (!programmeId || !sessionId) {
      // Try to assign defaults if missing
      let defaultProgrammeId: number | null = programmeId;
      let defaultSessionId: number | null = sessionId;

      // Get default programme for this institution if not set
      if (!defaultProgrammeId) {
        const defaultProgramme = await prisma.programme.findFirst({
          where: {
            department: {
              faculty: {
                institution_id: institutionId,
              },
            },
          },
          orderBy: { id: "asc" },
        });
        defaultProgrammeId = defaultProgramme?.id || null;
      }

      // Get current active session if not set
      if (!defaultSessionId) {
        const defaultSession = await prisma.session.findFirst({
          where: { institution_id: institutionId },
          orderBy: { end_date: "desc" },
        });
        defaultSessionId = defaultSession?.id || null;
      }

      if (!defaultProgrammeId || !defaultSessionId) {
        return {
          success: false,
          error: `Missing data: ${
            !defaultProgrammeId
              ? "No programmes found for this institution. "
              : ""
          }${
            !defaultSessionId ? "No sessions found for this institution. " : ""
          }Please set up programmes and sessions first.`,
        };
      }

      // Update student with default values
      await prisma.student.update({
        where: { id: BigInt(studentId) },
        data: {
          programme_id: defaultProgrammeId,
          session_admitted_id: defaultSessionId,
        },
      });

      console.log(
        `Assigned defaults: programme_id=${defaultProgrammeId}, session_admitted_id=${defaultSessionId}`
      );

      // Use the defaults for generation
      const newRegNo = await generateRegistrationNumber(
        institutionId,
        defaultProgrammeId,
        defaultSessionId
      );

      // Update student with the generated registration number
      await prisma.student.update({
        where: { id: BigInt(studentId) },
        data: {
          reg_no: newRegNo,
          updated_at: new Date(),
        },
      });

      revalidatePath("/ops");
      return {
        success: true,
        message:
          "Registration number generated successfully (with default programme and session assigned)",
        registration_number: newRegNo,
      };
    }

    const newRegNo = await generateRegistrationNumber(
      institutionId,
      programmeId,
      sessionId
    );

    // Check if the generated number already exists (unlikely but possible)
    const existingStudent = await prisma.student.findFirst({
      where: { reg_no: newRegNo },
    });

    if (existingStudent) {
      // Generate with current timestamp as fallback
      const fallbackRegNo = `STU${Date.now()}`;

      const updatedStudent = await prisma.student.update({
        where: { id: BigInt(studentId) },
        data: {
          reg_no: fallbackRegNo,
          updated_at: new Date(),
        },
      });

      revalidatePath("/ops");
      return {
        success: true,
        message: "New registration number generated successfully",
        registration_number: fallbackRegNo,
      };
    }

    const updatedStudent = await prisma.student.update({
      where: { id: BigInt(studentId) },
      data: {
        reg_no: newRegNo,
        updated_at: new Date(),
      },
    });

    revalidatePath("/ops");
    return {
      success: true,
      message: "New registration number generated successfully",
      registration_number: newRegNo,
    };
  } catch (error) {
    console.error("Error generating new registration number:", error);
    return {
      success: false,
      error: "Failed to generate new registration number. Please try again.",
    };
  }
}
