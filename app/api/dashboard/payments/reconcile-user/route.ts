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
 * Reconcile all payments for a specific user with Paystack
 * POST /api/dashboard/payments/reconcile-user
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user and check permissions
    const authResult = await authenticateUser(undefined, ["user_payments"]);

    if (!authResult.success) {
      return createAuthErrorResponse(authResult.error!, authResult.statusCode!);
    }

    const authUser = authResult.user!;

    const body = await request.json();
    const { userEmail } = body;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Find the student by email and institution
    const student = await prisma.student.findFirst({
      where: {
        user_student_user_idTouser: {
          email: userEmail,
          institution_id: authUser.institution_id,
        },
      },
      include: {
        user_student_user_idTouser: true,
        programme: {
          include: {
            department: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json(
        {
          error: "Student not found in this institution",
        },
        { status: 404 }
      );
    }

    // Get payment account for institution
    const paymentAccount = await prisma.payment_account.findFirst({
      where: {
        institution_id: authUser.institution_id,
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

    // Get existing payment count before reconciliation
    const existingPaymentsBefore = await prisma.payment2.findMany({
      where: {
        student_id: student.id,
        processor: "paystack",
      },
    });

    // Simple reconciliation: fetch customer and transactions from Paystack
    let reconciledCount = 0;
    const studentUser = student.user_student_user_idTouser;

    if (studentUser?.email) {
      // Fetch customer from Paystack
      const customer = await fetchPaystackCustomer(
        studentUser.email,
        sanitizedSecretKey
      );

      if (customer) {
        // Fetch successful transactions for this customer
        const transactions = await fetchPaystackTransactions(
          customer.id,
          sanitizedSecretKey
        );

        // Get existing payment references to avoid duplicates
        const existingReferences = new Set(
          existingPaymentsBefore.map((p) => p.reference).filter(Boolean)
        );

        // Process each transaction
        for (const transaction of transactions) {
          if (
            !existingReferences.has(transaction.reference) &&
            transaction.status === "success"
          ) {
            try {
              // Create new payment record
              await prisma.payment2.create({
                data: {
                  student_id: student.id,
                  amount: transaction.amount / 100, // Convert from kobo to naira
                  cart: JSON.stringify([
                    {
                      name: "Payment via Paystack (Auto-reconciled)",
                      amount: transaction.amount / 100,
                      reference: transaction.reference,
                      note: "Reconciled from Paystack",
                    },
                  ]),
                  institution_id: authUser.institution_id,
                  department_id: student.programme?.department_id || null,
                  processor: "paystack",
                  reference: transaction.reference,
                  ip: "AUTO_RECONCILED",
                  status: 1,
                  paid_at: new Date(transaction.paid_at),
                  channel: transaction.channel,
                  processor_currency: transaction.currency,
                  processor_status: transaction.status,
                  created_at: new Date(),
                  updated_at: new Date(),
                },
              });

              reconciledCount++;
            } catch (error) {
              console.error(
                `Error creating payment for reference ${transaction.reference}:`,
                error
              );
            }
          }
        }
      }
    }

    // Get payment count after reconciliation
    const existingPaymentsAfter = await prisma.payment2.findMany({
      where: {
        student_id: student.id,
        processor: "paystack",
      },
    });

    // Get the student's basic info for response
    const studentInfo = {
      id: student.id.toString(),
      name: studentUser
        ? `${studentUser.first_name} ${studentUser.last_name}`
        : "Unknown",
      email: studentUser?.email || userEmail,
      studentId: student.reg_no || student.id.toString(),
    };

    // Get reconciliation summary
    const reconciliationSummary = {
      paymentsBefore: existingPaymentsBefore.length,
      paymentsAfter: existingPaymentsAfter.length,
      newPaymentsAdded: reconciledCount,
      totalPaystackPayments: existingPaymentsAfter.length,
    };

    // Get recent payments for display (last 10)
    const recentPayments = await prisma.payment2.findMany({
      where: {
        student_id: student.id,
        processor: "paystack",
      },
      orderBy: {
        created_at: "desc",
      },
      take: 10,
    });

    const recentPaymentsData = recentPayments.map((payment) => ({
      id: payment.id.toString(),
      reference: payment.reference,
      amount: payment.amount.toString(),
      status: payment.status,
      created_at: payment.created_at,
      paid_at: payment.paid_at,
      processor_status: payment.processor_status,
    }));

    return createSuccessResponse(
      {
        success: true,
        message: `Reconciliation completed for ${studentInfo.name}. ${reconciledCount} new payments added.`,
        student: studentInfo,
        reconciliation: reconciliationSummary,
        recentPayments: recentPaymentsData,
        reconciledCount,
      },
      authUser
    );
  } catch (error) {
    console.error("User reconciliation error:", error);

    // More detailed error messages
    if (error instanceof Error && error.message.includes("duplicate")) {
      return NextResponse.json(
        {
          error: "Duplicate payment reference detected during reconciliation",
          details: error.message,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error during reconciliation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Fetch Paystack customer by email
 */
async function fetchPaystackCustomer(
  email: string,
  secretKey: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    const https = require("https");

    // Validate inputs
    if (!email || !secretKey) {
      resolve(null);
      return;
    }

    const postOptions = {
      host: "api.paystack.co",
      port: 443,
      path: `/customer/${encodeURIComponent(email)}`,
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
            console.log(`Empty response for customer: ${email}`);
            resolve(null);
            return;
          }

          const response = JSON.parse(body);
          if (res.statusCode === 200 && response.status) {
            resolve(response.data);
          } else {
            console.log(
              `Customer not found or error: ${email} - ${
                response?.message || "Unknown error"
              }`
            );
            resolve(null);
          }
        } catch (error) {
          console.error(`JSON parse error for customer ${email}:`, error);
          resolve(null);
        }
      });
    });

    req.on("error", (error: Error) => {
      console.error(`Request error for customer ${email}:`, error);
      resolve(null); // Resolve null instead of rejecting to avoid breaking the flow
    });

    req.on("timeout", () => {
      console.log(`Request timeout for customer ${email}`);
      req.destroy();
      resolve(null);
    });

    // Set a timeout for the request
    req.setTimeout(10000); // 10 seconds

    req.end();
  });
}

/**
 * Fetch Paystack transactions for a customer
 */
async function fetchPaystackTransactions(
  customerId: number,
  secretKey: string
): Promise<PaystackTransaction[]> {
  return new Promise((resolve, reject) => {
    const https = require("https");

    // Validate inputs
    if (!customerId || !secretKey) {
      resolve([]);
      return;
    }

    const postOptions = {
      host: "api.paystack.co",
      port: 443,
      path: `/transaction?customer=${customerId}&status=success&perPage=100`,
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
            console.log(
              `Empty response for transactions for customer: ${customerId}`
            );
            resolve([]);
            return;
          }

          const response = JSON.parse(body);
          if (res.statusCode === 200 && response.status) {
            resolve(response.data || []);
          } else {
            console.log(
              `Transactions not found or error for customer ${customerId}: ${
                response?.message || "Unknown error"
              }`
            );
            resolve([]);
          }
        } catch (error) {
          console.error(
            `JSON parse error for transactions for customer ${customerId}:`,
            error
          );
          resolve([]);
        }
      });
    });

    req.on("error", (error: Error) => {
      console.error(
        `Request error for transactions for customer ${customerId}:`,
        error
      );
      resolve([]); // Resolve empty array instead of rejecting to avoid breaking the flow
    });

    req.on("timeout", () => {
      console.log(
        `Request timeout for transactions for customer ${customerId}`
      );
      req.destroy();
      resolve([]);
    });

    // Set a timeout for the request
    req.setTimeout(15000); // 15 seconds for transactions (might have more data)

    req.end();
  });
}

/**
 * Get reconciliation status for a user
 * GET /api/dashboard/payments/reconcile-user?email=user@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userDataCookie = cookieStore.get("userData");

    if (!userDataCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userData = JSON.parse(userDataCookie.value);

    if (!userData.institution_id) {
      return NextResponse.json(
        { error: "Institution not found" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get("email");

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Find the student by email and institution using Prisma
    const student = await prisma.student.findFirst({
      where: {
        user_student_user_idTouser: {
          email: userEmail,
          institution_id: userData.institution_id,
        },
      },
      include: {
        user_student_user_idTouser: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        {
          error: "Student not found in this institution",
        },
        { status: 404 }
      );
    }

    // Get payment statistics using Prisma
    const allPayments = await prisma.payment2.findMany({
      where: {
        student_id: student.id,
        processor: "paystack",
      },
    });

    const successfulPayments = allPayments.filter((p) => p.status === 1);
    const pendingPayments = allPayments.filter((p) => p.status === 0);
    const failedPayments = allPayments.filter((p) => p.status === 2);

    const totalRevenue = successfulPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount.toString() || "0"),
      0
    );

    const finalUser = student.user_student_user_idTouser;
    const studentInfo = {
      id: student.id.toString(),
      name: finalUser
        ? `${finalUser.first_name} ${finalUser.last_name}`
        : "Unknown",
      email: finalUser?.email || userEmail,
      studentId: student.reg_no || student.id.toString(),
    };

    return NextResponse.json({
      student: studentInfo,
      paymentStats: {
        total: allPayments.length,
        successful: successfulPayments.length,
        pending: pendingPayments.length,
        failed: failedPayments.length,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Get reconciliation status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
