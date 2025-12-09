import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import {
  authenticateUser,
  createAuthErrorResponse,
  createSuccessResponse,
  hasInstitutionAccess,
} from "@/lib/api-auth";

const prisma = new PrismaClient();

// Decrypt function for encrypted secret keys
function decryptText(encryptedText: string): string {
  try {
    const data = JSON.parse(encryptedText);
    const ive = Buffer.from(data.iv, "hex");
    const encryptedData = Buffer.from(data.encryptedData, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(process.env.EN_KEY || ""),
      ive
    );
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt secret key");
  }
}

interface PaystackTransaction {
  reference: string;
  status: string;
  amount: number;
  paid_at: string;
  fees: number;
  channel: string;
  currency: string;
}

/**
 * Sync pending payments with Paystack status
 * POST /api/dashboard/payments/sync-pending
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user and check permissions
    const authResult = await authenticateUser(undefined, [
      "user_payments",
    ]);

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const user = authResult.user!;

    const body = await request.json();
    const { userEmail } = body;

    // Build query for pending payments
    const whereCondition: any = {
      institution_id: user.institution_id,
      status: 0,
      processor: "paystack",
    };

    // If userEmail is provided, filter by that user
    if (userEmail) {
      const targetStudent = await prisma.student.findFirst({
        where: {
          user_student_user_idTouser: {
            email: userEmail,
            institution_id: user.institution_id,
          },
        },
        include: {
          user_student_user_idTouser: true,
        },
      });

      if (!targetStudent) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      whereCondition.student_id = targetStudent.id;
    }

    const pendingPayments = await prisma.payment2.findMany({
      where: whereCondition,
      include: {
        student: {
          include: {
            user_student_user_idTouser: true,
          },
        },
      },
    });

    if (!pendingPayments.length) {
      return NextResponse.json({
        message: "No pending payments found",
        updated: 0,
        payments: [],
      });
    }

    // Get payment account for institution
    const paymentAccount = await prisma.payment_account.findFirst({
      where: {
        institution_id: user.institution_id,
      },
    });

    if (!paymentAccount?.secret_key) {
      return NextResponse.json(
        {
          error: "Payment gateway not configured",
        },
        { status: 400 }
      );
    }

    // Decrypt the secret key from database
    let secretKey: string;
    try {
      secretKey = decryptText(paymentAccount.secret_key);
    } catch (decryptError) {
      console.error(
        "Failed to decrypt payment account secret key:",
        decryptError
      );
      return NextResponse.json(
        {
          error:
            "Invalid payment gateway configuration - failed to decrypt secret key",
        },
        { status: 400 }
      );
    }

    // Sanitize the decrypted secret key to remove any invalid characters for HTTP headers
    const sanitizedSecretKey = secretKey.replace(/[\r\n\t\s]/g, "").trim();

    // Basic validation - ensure we have a non-empty key
    if (!sanitizedSecretKey) {
      return NextResponse.json(
        {
          error: "Invalid payment gateway configuration - empty secret key",
        },
        { status: 400 }
      );
    }

    const syncResults: Array<{
      reference: string;
      oldStatus?: number | null;
      newStatus?: any;
      status?: number | null;
      paystackStatus?: string;
      amount: string;
      updated: boolean;
      reason?: string;
      error?: string;
    }> = [];
    let updatedCount = 0;

    // Process each pending payment
    for (const payment of pendingPayments) {
      try {
        const reference = payment.reference;
        if (!reference) continue;

        // Fetch transaction from Paystack using reference
        const transaction = await fetchPaystackTransactionByReference(
          reference,
          sanitizedSecretKey
        );

        if (transaction) {
          const shouldUpdate = shouldUpdatePaymentStatus(payment, transaction);

          if (shouldUpdate.update) {
            // Update payment status
            await prisma.payment2.update({
              where: { id: payment.id },
              data: {
                status: shouldUpdate.newStatus,
                processor_status: transaction.status,
                paid_at:
                  transaction.status === "success"
                    ? new Date(transaction.paid_at)
                    : null,
                updated_at: new Date(),
              },
            });

            updatedCount++;
            syncResults.push({
              reference,
              oldStatus: payment.status,
              newStatus: shouldUpdate.newStatus,
              paystackStatus: transaction.status,
              amount: payment.amount.toString(),
              updated: true,
            });
          } else {
            syncResults.push({
              reference,
              status: payment.status,
              paystackStatus: transaction.status,
              amount: payment.amount.toString(),
              updated: false,
              reason: "No status change needed",
            });
          }
        } else {
          syncResults.push({
            reference,
            status: payment.status,
            paystackStatus: "not_found",
            amount: payment.amount.toString(),
            updated: false,
            reason: "Transaction not found on Paystack",
          });
        }
      } catch (error) {
        console.error(`Error syncing payment ${payment.reference}:`, error);
        syncResults.push({
          reference: payment.reference || "unknown",
          status: payment.status,
          amount: payment.amount.toString(),
          updated: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return createSuccessResponse(
      {
        message: `Sync completed. ${updatedCount} payments updated.`,
        updated: updatedCount,
        total: pendingPayments.length,
        results: syncResults,
      },
      user
    );
  } catch (error) {
    console.error("Payment sync error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Fetch a single transaction from Paystack by reference
 */
async function fetchPaystackTransactionByReference(
  reference: string,
  secretKey: string
): Promise<PaystackTransaction | null> {
  return new Promise((resolve, reject) => {
    const https = require("https");

    // Validate inputs
    if (!reference || !secretKey) {
      resolve(null);
      return;
    }

    const postOptions = {
      host: "api.paystack.co",
      port: 443,
      path: `/transaction/verify/${encodeURIComponent(reference)}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(postOptions, (res: any) => {
      res.setEncoding("utf8");
      let body = "";

      res.on("data", (data: string) => {
        body += data;
      });

      res.on("end", () => {
        try {
          if (!body || body.trim() === "") {
            console.log(`Empty response for transaction: ${reference}`);
            resolve(null);
            return;
          }

          const response = JSON.parse(body);
          if (res.statusCode === 200 && response.status) {
            resolve(response.data);
          } else {
            console.log(
              `Transaction not found or error: ${reference} - ${
                response.message || "Unknown error"
              }`
            );
            resolve(null);
          }
        } catch (error) {
          console.error(
            `JSON parse error for transaction ${reference}:`,
            error
          );
          resolve(null);
        }
      });
    });

    req.on("error", (error: Error) => {
      console.error(`Request error for transaction ${reference}:`, error);
      resolve(null); // Resolve null instead of rejecting to avoid breaking the loop
    });

    req.on("timeout", () => {
      console.log(`Request timeout for transaction ${reference}`);
      req.destroy();
      resolve(null);
    });

    // Set a timeout for the request
    req.setTimeout(10000); // 10 seconds

    req.end();
  });
}

/**
 * Determine if payment status should be updated based on Paystack status
 */
function shouldUpdatePaymentStatus(
  payment: any,
  transaction: PaystackTransaction
) {
  const currentStatus = payment.status;
  const paystackStatus = transaction.status;

  // Status mapping: 0 = pending, 1 = successful, 2 = failed
  if (paystackStatus === "success" && currentStatus !== 1) {
    return { update: true, newStatus: 1 };
  }

  if (paystackStatus === "failed" && currentStatus !== 2) {
    return { update: true, newStatus: 2 };
  }

  if (paystackStatus === "abandoned" && currentStatus !== 2) {
    return { update: true, newStatus: 2 };
  }

  return { update: false, newStatus: currentStatus };
}
