import { NextRequest, NextResponse } from "next/server";
import { updateStudentProfile } from "@/app/(simple)/ops/actions/user-actions";

export async function PATCH(request: NextRequest) {
  try {
    const formData = await request.json();

    const result = await updateStudentProfile(formData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in PATCH /api/students/profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
