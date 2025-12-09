import { NextRequest, NextResponse } from "next/server";
import { generateNewRegistrationNumber } from "@/app/(simple)/ops/actions/user-actions";

export async function POST(request: NextRequest) {
  try {
    const { studentId, institutionId } = await request.json();

    if (!studentId || !institutionId) {
      return NextResponse.json(
        { error: "Student ID and Institution ID are required" },
        { status: 400 }
      );
    }

    const result = await generateNewRegistrationNumber(
      studentId,
      institutionId
    );

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in POST /api/students/generate-reg-no:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
