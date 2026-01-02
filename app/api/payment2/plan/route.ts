import { NextRequest } from "next/server";
import {
  createSuccessResponse,
  createAuthErrorResponse,
  authenticateUserWithPermissions,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import { recalculateFlexibleDues, PaymentPlanType } from "@/lib/fee-calculation";

export async function POST(req: NextRequest) {
  const authResult = await authenticateUserWithPermissions();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;

  // Only students can change their payment plan
  if (user.role !== "STUDENT") {
    return createAuthErrorResponse(
      "Only students can change their payment plan",
      403
    );
  }

  try {
    const body = await req.json();
    const { fee_plan } = body;

    // Validate fee_plan
    const validPlans: PaymentPlanType[] = ["full", "monthly", "semesterly", "sessionly"];
    if (!fee_plan || !validPlans.includes(fee_plan)) {
      return createAuthErrorResponse(
        "Invalid payment plan. Must be one of: full, monthly, semesterly, sessionly",
        400
      );
    }

    // Find the student record
    const student = await prisma.student.findFirst({
      where: {
        user_id: BigInt(user.id),
      },
    });

    if (!student) {
      return createAuthErrorResponse("Student record not found", 404);
    }

    // Update student's fee_plan
    const updatedStudent = await prisma.student.update({
      where: {
        id: student.id,
      },
      data: {
        fee_plan: fee_plan,
        updated_at: new Date(),
      },
    });

    // Recalculate flexible dues based on new plan
    const payables = await recalculateFlexibleDues(
      student.id,
      fee_plan,
      user.institution_id
    );

    return createSuccessResponse({
      fee_plan: updatedStudent.fee_plan,
      payables,
      message: `Payment plan updated to ${fee_plan}`,
    });
  } catch (error) {
    console.error("Error updating payment plan:", error);
    return createAuthErrorResponse("Failed to update payment plan", 500);
  }
}




