import { prisma } from "@/lib/db";

export type PaymentPlanType = "full" | "monthly" | "semesterly" | "sessionly";

export interface FeeCalculationResult {
  totalAmount: number;
  installmentAmount: number;
  totalInstallments: number;
  paidAmount: number;
  paidInstallments: number;
  remainingAmount: number;
  remainingInstallments: number;
}

/**
 * Calculate the amount for a specific payment plan type
 */
export function calculateFlexibleFeeAmount(
  fee: {
    amount: any;
    monthly?: any;
    semesterly?: any;
    sessionly?: any;
  },
  planType: PaymentPlanType
): number | null {
  if (planType === "full") {
    return fee.amount ? Number(fee.amount) : null;
  }

  const planField = planType as "monthly" | "semesterly" | "sessionly";
  const planAmount = fee[planField];
  return planAmount ? Number(planAmount) : null;
}

/**
 * Get the number of installments for a specific plan type
 */
export function getInstallmentParts(
  fee: {
    monthly_parts?: number | null;
    semesterly_parts?: number | null;
    sessionly_parts?: number | null;
  },
  planType: PaymentPlanType
): number {
  if (planType === "full") {
    return 1; // Full payment is a single installment
  }

  const partsField = `${planType}_parts` as
    | "monthly_parts"
    | "semesterly_parts"
    | "sessionly_parts";
  return fee[partsField] || 0;
}

/**
 * Analyze payment history for a specific fee
 * Returns total amount paid and number of installments paid
 */
export async function analyzePaymentHistory(
  studentId: bigint,
  feeId: bigint
): Promise<{ totalPaid: number; installmentsPaid: number; paymentDetails: any[] }> {
  try {
    // Get fee details once (needed for calculating amounts)
    const fee = await prisma.fee.findUnique({
      where: { id: feeId },
    });

    if (!fee) {
      return { totalPaid: 0, installmentsPaid: 0, paymentDetails: [] };
    }

    // Get all successful payments for this student
    const payments = await prisma.payment2.findMany({
      where: {
        student_id: studentId,
        status: 1, // Only successful payments
      },
      select: {
        id: true,
        amount: true,
        cart: true,
        created_at: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    let totalPaid = 0;
    let installmentsPaid = 0;
    const paymentDetails: any[] = [];

    // Parse cart JSON to find payments for this specific fee
    for (const payment of payments) {
      if (!payment.cart) continue;

      let cartData: any;
      try {
        // Handle both string and object cart formats
        cartData =
          typeof payment.cart === "string"
            ? JSON.parse(payment.cart)
            : payment.cart;
      } catch (e) {
        console.error("Error parsing payment cart:", e);
        continue;
      }

      // Check if this payment includes the fee
      const feeIdStr = feeId.toString();
      if (cartData[feeIdStr]) {
        const feePayment = cartData[feeIdStr];
        const quantity = feePayment.quantity || 1;
        const feePlan = feePayment.fee_plan;

        // Calculate amount paid for this fee in this payment
        // Use the fee plan that was used at the time of payment
        let installmentAmount = 0;
        if (feePlan === "full" || !feePlan) {
          installmentAmount = fee.amount ? Number(fee.amount) : 0;
        } else {
          const planField = feePlan as "monthly" | "semesterly" | "sessionly";
          const planAmount = fee[planField];
          installmentAmount = planAmount ? Number(planAmount) : 0;
        }

        const amountPaid = installmentAmount * quantity;
        totalPaid += amountPaid;
        installmentsPaid += quantity;

        paymentDetails.push({
          paymentId: payment.id,
          amount: amountPaid,
          quantity,
          feePlan,
          date: payment.created_at,
        });
      }
    }

    return {
      totalPaid,
      installmentsPaid,
      paymentDetails,
    };
  } catch (error) {
    console.error("Error analyzing payment history:", error);
    return { totalPaid: 0, installmentsPaid: 0, paymentDetails: [] };
  }
}

/**
 * Get total amount paid for a specific fee
 */
export async function getTotalPaidForFee(
  studentId: bigint,
  feeId: bigint
): Promise<number> {
  const analysis = await analyzePaymentHistory(studentId, feeId);
  return analysis.totalPaid;
}

/**
 * Calculate remaining installments for a flexible fee
 */
export async function getRemainingInstallments(
  studentId: bigint,
  feeId: bigint,
  planType: PaymentPlanType
): Promise<FeeCalculationResult> {
  // Get fee details
  const fee = await prisma.fee.findUnique({
    where: { id: feeId },
  });

  if (!fee) {
    throw new Error(`Fee with id ${feeId} not found`);
  }

  // Calculate total amount and installments for the plan
  const installmentAmount = calculateFlexibleFeeAmount(fee, planType);
  const totalInstallments = getInstallmentParts(fee, planType);

  if (!installmentAmount || installmentAmount <= 0) {
    return {
      totalAmount: 0,
      installmentAmount: 0,
      totalInstallments: 0,
      paidAmount: 0,
      paidInstallments: 0,
      remainingAmount: 0,
      remainingInstallments: 0,
    };
  }

  const totalAmount = installmentAmount * totalInstallments;

  // Get payment history
  const paymentHistory = await analyzePaymentHistory(studentId, feeId);
  const paidAmount = paymentHistory.totalPaid;
  const paidInstallments = paymentHistory.installmentsPaid;

  // Calculate remaining
  const remainingAmount = Math.max(0, totalAmount - paidAmount);
  const remainingInstallments = Math.max(0, totalInstallments - paidInstallments);

  return {
    totalAmount,
    installmentAmount,
    totalInstallments,
    paidAmount,
    paidInstallments,
    remainingAmount,
    remainingInstallments,
  };
}

/**
 * Recalculate flexible dues for a student based on their payment plan
 */
export async function recalculateFlexibleDues(
  studentId: bigint,
  newPlan: PaymentPlanType,
  institutionId: number
): Promise<{
  fixedDues: any[];
  flexibleDues: Record<string, any[]>;
}> {
  // Get all active fees for the institution
  const availableFees = await prisma.fee.findMany({
    where: {
      institution_id: institutionId,
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

  const flexibleDues: Record<string, any[]> = {
    full: [],
    monthly: [],
    semesterly: [],
    sessionly: [],
  };

  // Process each flexible fee
  for (const fee of flexibleFees) {
    // Calculate for each plan type
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
        const calculation = await getRemainingInstallments(
          studentId,
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
      }
    }
  }

  return {
    fixedDues: fixedFees,
    flexibleDues,
  };
}

