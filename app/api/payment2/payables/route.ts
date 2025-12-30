import { NextRequest } from "next/server";
import {
  createSuccessResponse,
  createAuthErrorResponse,
  authenticateUserWithPermissions,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";
import {
  recalculateFlexibleDues,
  calculateFlexibleFeeAmount,
  getInstallmentParts,
  getRemainingInstallments,
  PaymentPlanType,
} from "@/lib/fee-calculation";

export async function GET(req: NextRequest) {
  const authResult = await authenticateUserWithPermissions();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  const user = authResult.user;

  try {
    if (user.role === "STUDENT") {
      // Find the student record
      const student = await prisma.student.findFirst({
        where: {
          user_id: BigInt(user.id),
        },
      });

      if (!student) {
        return createSuccessResponse({
          fixedDues: [],
          flexibleDues: {
            full: [],
            monthly: [],
            semesterly: [],
            sessionly: [],
          },
        });
      }

      // Get student's current fee_plan (default to "full" if not set)
      const studentPlan = (student.fee_plan || "full") as PaymentPlanType;

      // Get all active fees for student's institution
      const availableFees = await prisma.fee.findMany({
        where: {
          institution_id: user.institution_id,
          active: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      // Separate fixed and flexible fees
      // A fee is flexible only if it has at least one installment plan with a value > 0
      const fixedFees = availableFees
        .filter((fee) => {
          const hasMonthly = fee.monthly && Number(fee.monthly) > 0;
          const hasSemesterly = fee.semesterly && Number(fee.semesterly) > 0;
          const hasSessionly = fee.sessionly && Number(fee.sessionly) > 0;
          return !hasMonthly && !hasSemesterly && !hasSessionly;
        })
        .map((fee) => ({
          id: fee.id.toString(),
          name: fee.name,
          unit_price: fee.amount ? Number(fee.amount) : 0,
          item_id: fee.id.toString(),
        }));

      const flexibleFees = availableFees.filter((fee) => {
        const hasMonthly = fee.monthly && Number(fee.monthly) > 0;
        const hasSemesterly = fee.semesterly && Number(fee.semesterly) > 0;
        const hasSessionly = fee.sessionly && Number(fee.sessionly) > 0;
        return hasMonthly || hasSemesterly || hasSessionly;
      });

      const flexibleDues: any = {
        full: [],
        monthly: [],
        semesterly: [],
        sessionly: [],
      };

      // Process flexible fees with payment history consideration
      for (const fee of flexibleFees) {
        for (const planType of [
          "full",
          "monthly",
          "semesterly",
          "sessionly",
        ] as PaymentPlanType[]) {
          const installmentAmount = calculateFlexibleFeeAmount(fee, planType);
          const totalInstallments = getInstallmentParts(fee, planType);

          if (installmentAmount && installmentAmount > 0 && totalInstallments > 0) {
            // Get remaining installments for this fee and plan
            try {
              const calculation = await getRemainingInstallments(
                student.id,
                fee.id,
                planType
              );

              // Only include if there are remaining installments
              if (calculation.remainingInstallments > 0) {
                flexibleDues[planType].push({
                  id: fee.id.toString(),
                  name: fee.name,
                  unit_price: calculation.installmentAmount,
                  item_id: fee.id.toString(),
                  plan_type: planType,
                  total_amount: calculation.totalAmount,
                  paid_amount: calculation.paidAmount,
                  remaining_amount: calculation.remainingAmount,
                  total_installments: calculation.totalInstallments,
                  paid_installments: calculation.paidInstallments,
                  remaining_installments: calculation.remainingInstallments,
                });
              }
            } catch (error) {
              console.error(
                `Error calculating installments for fee ${fee.id}, plan ${planType}:`,
                error
              );
              // Fallback to simple calculation if history analysis fails
              flexibleDues[planType].push({
                id: fee.id.toString(),
                name: fee.name,
                unit_price: installmentAmount,
                item_id: fee.id.toString(),
                plan_type: planType,
              });
            }
          }
        }
      }

      return createSuccessResponse({
        fixedDues: fixedFees,
        flexibleDues,
        studentPlan, // Include student's current plan in response
      });
    } else {
      // For non-student roles, return all fees
      const fees = await prisma.fee.findMany({
        where: {
          institution_id: user.institution_id,
          active: true,
        },
        orderBy: {
          name: "asc",
        },
      });

      return createSuccessResponse({
        fees,
      });
    }
  } catch (error) {
    console.error("Error fetching payables:", error);
    return createAuthErrorResponse("Failed to fetch payables", 500);
  }
}
