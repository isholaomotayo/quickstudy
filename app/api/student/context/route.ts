import { NextRequest, NextResponse } from "next/server";
import {
  getUserStudentProfiles,
  resolveStudentContext,
  setActiveStudentProfile,
} from "../../../../helpers/studentContext";

// Simple auth helper for API routes
function getAuthFromHeaders(request: NextRequest) {
  const cookies = request.cookies;
  const token = cookies.get("token")?.value;
  const role = cookies.get("role")?.value;
  const userId = cookies.get("userId")?.value;

  return token
    ? { userRole: role, userId: Number(userId), authToken: token }
    : null;
}

export async function GET(request: NextRequest) {
  try {
    const authData = getAuthFromHeaders(request);

    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = authData;

    const url = new URL(request.url);
    const requestedStudentId = url.searchParams.get("studentId");

    if (requestedStudentId) {
      // Get specific student profile

      const studentProfile = await resolveStudentContext(
        BigInt(userId),
        BigInt(requestedStudentId)
      );

      // Convert BigInt fields to strings for JSON serialization
      const serializedStudentProfile = studentProfile
        ? {
            ...studentProfile,
            id: studentProfile.id.toString(),
            user_id: studentProfile.user_id.toString(),
            user: studentProfile.user
              ? {
                  ...studentProfile.user,
                  id: studentProfile.user.id.toString(),
                }
              : undefined,
          }
        : null;

      return NextResponse.json({ student: serializedStudentProfile });
    } else {
      // Get all student profiles for user

      const studentProfiles = await getUserStudentProfiles(BigInt(userId));

      const activeStudent = await resolveStudentContext(BigInt(userId));

      // Convert BigInt fields to strings for JSON serialization
      const serializedStudentProfiles = studentProfiles.map((student) => ({
        ...student,
        id: student.id.toString(),
        user_id: student.user_id.toString(),
        user: student.user
          ? {
              ...student.user,
              id: student.user.id.toString(),
            }
          : undefined,
      }));

      const serializedActiveStudent = activeStudent
        ? {
            ...activeStudent,
            id: activeStudent.id.toString(),
            user_id: activeStudent.user_id.toString(),
            user: activeStudent.user
              ? {
                  ...activeStudent.user,
                  id: activeStudent.user.id.toString(),
                }
              : undefined,
          }
        : null;

      return NextResponse.json({
        students: serializedStudentProfiles,
        activeStudent: serializedActiveStudent,
      });
    }
  } catch (error) {
    console.error("❌ Student context API error:", error);
    console.error("❌ Error details:", error.message);
    console.error("❌ Error stack:", error.stack);
    return NextResponse.json(
      { error: `Failed to fetch student context: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authData = getAuthFromHeaders(request);
    if (!authData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = authData;
    const body = await request.json();
    const { activeStudentId } = body;

    if (!activeStudentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    const success = await setActiveStudentProfile(
      BigInt(userId),
      BigInt(activeStudentId)
    );

    if (success) {
      const updatedStudentProfiles = await getUserStudentProfiles(
        BigInt(userId)
      );
      const newActiveStudent = await resolveStudentContext(BigInt(userId));

      // Convert BigInt fields to strings for JSON serialization
      const serializedStudentProfiles = updatedStudentProfiles.map(
        (student) => ({
          ...student,
          id: student.id.toString(),
          user_id: student.user_id.toString(),
          user: student.user
            ? {
                ...student.user,
                id: student.user.id.toString(),
              }
            : undefined,
        })
      );

      const serializedActiveStudent = newActiveStudent
        ? {
            ...newActiveStudent,
            id: newActiveStudent.id.toString(),
            user_id: newActiveStudent.user_id.toString(),
            user: newActiveStudent.user
              ? {
                  ...newActiveStudent.user,
                  id: newActiveStudent.user.id.toString(),
                }
              : undefined,
          }
        : null;

      return NextResponse.json({
        message: "Active student updated successfully",
        students: serializedStudentProfiles,
        activeStudent: serializedActiveStudent,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to update active student" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Student context update API error:", error);
    return NextResponse.json(
      { error: "Failed to update student context" },
      { status: 500 }
    );
  }
}
