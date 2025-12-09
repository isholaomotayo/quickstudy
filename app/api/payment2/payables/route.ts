import { NextRequest } from "next/server";
import {
  createSuccessResponse,
  createAuthErrorResponse,
  authenticateUserWithPermissions,
} from "@/lib/api-auth";
import { prisma } from "@/lib/db";

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
      const fixedFees = availableFees
        .filter((fee) => !fee.monthly && !fee.semesterly && !fee.sessionly)
        .map((fee) => ({
          id: fee.id,
          name: fee.name,
          unit_price: fee.amount,
          item_id: fee.id,
        }));

      const flexibleFees = availableFees.filter(
        (fee) => fee.monthly || fee.semesterly || fee.sessionly
      );

      const flexibleDues: any = {
        full: [],
        monthly: [],
        semesterly: [],
        sessionly: [],
      };

      // Add flexible fees to each plan type
      flexibleFees.forEach((fee) => {
        ["full", "monthly", "semesterly", "sessionly"].forEach((planType) => {
          let price;

          // For 'full' plan, use the base amount; for others, use the plan-specific price
          if (planType === "full") {
            price = fee.amount;
          } else {
            price = fee[planType as keyof typeof fee];
          }

          // Convert Decimal to number and check if it's valid
          const numericPrice = price ? Number(price) : null;

          if (numericPrice && numericPrice > 0) {
            flexibleDues[planType].push({
              id: fee.id,
              name: fee.name,
              unit_price: numericPrice,
              item_id: fee.id,
              plan_type: planType,
            });
          }
        });
      });

      return createSuccessResponse({
        fixedDues: fixedFees,
        flexibleDues,
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
