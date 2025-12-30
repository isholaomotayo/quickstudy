import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";


export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const resultId = parseInt(id);

    if (isNaN(resultId)) {
      return NextResponse.json({ error: "Invalid result ID" }, { status: 400 });
    }

    const result = await prisma.student_result.findUnique({
      where: { id: resultId },
      include: {
        student_course: {
          include: {
            student: {
              include: {
                user_student_user_idTouser: {
                  select: {
                    first_name: true,
                    last_name: true,
                    other_name: true,
                  },
                },
              },
            },
            course: {
              select: {
                id: true,
                name: true,
                code: true,
                units: true,
                department: {
                  select: {
                    name: true,
                    code: true,
                  },
                },
              },
            },
            semester: {
              select: {
                id: true,
                name: true,
                session: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        grade: {
          select: {
            id: true,
            name: true,
            point: true,
            min_score: true,
            max_score: true,
          },
        },
      },
    });

    if (!result) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    // Transform data for frontend
    const studentCourse = result.student_course;
    const student = studentCourse?.student;
    const course = studentCourse?.course;
    const semester = studentCourse?.semester;
    const user = student?.user_student_user_idTouser;

    const transformedResult = {
      id: result.id.toString(),
      studentName: user
        ? `${user.last_name || ""}, ${user.first_name || ""} ${
            user.other_name || ""
          }`.trim()
        : "Unknown Student",
      studentId: student?.reg_no || "Unknown",
      studentUserId: student?.user_id?.toString() || null,
      course: course
        ? {
            id: course.id,
            name: course.name,
            code: course.code,
            units: course.units,
            department: course.department?.name || "Unknown Department",
          }
        : null,
      semester: semester
        ? {
            id: semester.id,
            name: semester.name,
            session: semester.session?.name,
          }
        : null,
      score: parseFloat(result.score || "0"),
      camark: result.ca_mark,
      exam_score: result.exam_score,
      grade: result.grade
        ? {
            id: result.grade.id,
            letter: result.grade.name,
            point: result.grade.point,
            minScore: result.grade.min_score,
            maxScore: result.grade.max_score,
          }
        : null,
      publish: result.publish,
      createdAt: result.created_at?.toISOString(),
      updatedAt: result.updated_at?.toISOString(),
      createdBy: result.created_by?.toString(),
      updatedBy: result.updated_by?.toString(),
    };

    return NextResponse.json({
      success: true,
      data: transformedResult,
    });
  } catch (error) {
    console.error("Error fetching result:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch result",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const resultId = parseInt(id);
    const body = await request.json();

    if (isNaN(resultId)) {
      return NextResponse.json({ error: "Invalid result ID" }, { status: 400 });
    }

    const { score, ca_mark, exam_score, publish } = body;

    // Validate required fields
    if (score === undefined || score === null) {
      return NextResponse.json({ error: "Score is required" }, { status: 400 });
    }

    // Check if result exists
    const existingResult = await prisma.student_result.findUnique({
      where: { id: resultId },
    });

    if (!existingResult) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    // Update the result
    const updatedResult = await prisma.student_result.update({
      where: { id: resultId },
      data: {
        score: score.toString(),
        ca_mark: ca_mark ? parseFloat(ca_mark) : null,
        exam_score: exam_score ? parseFloat(exam_score) : null,
        publish: publish || false,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Result updated successfully",
      data: updatedResult,
    });
  } catch (error) {
    console.error("Error updating result:", error);
    return NextResponse.json(
      {
        error: "Failed to update result",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const resultId = parseInt(id);

    if (isNaN(resultId)) {
      return NextResponse.json({ error: "Invalid result ID" }, { status: 400 });
    }

    // Check if result exists
    const existingResult = await prisma.student_result.findUnique({
      where: { id: resultId },
    });

    if (!existingResult) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    // Delete the result
    await prisma.student_result.delete({
      where: { id: resultId },
    });

    return NextResponse.json({
      success: true,
      message: "Result deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting result:", error);
    return NextResponse.json(
      {
        error: "Failed to delete result",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
