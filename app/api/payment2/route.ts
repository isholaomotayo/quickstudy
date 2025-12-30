import { NextRequest } from "next/server";
import {
  createJsonResponse,
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
    const searchParams = req.nextUrl.searchParams;
    const pgsize = parseInt(searchParams.get("pgsize") || "10");
    const pg = parseInt(searchParams.get("pg") || "1");
    const status = searchParams.get("status");
    const processor = searchParams.get("processor");
    const email = searchParams.get("email");

    const skip = (pg - 1) * pgsize;

    // Build where clause based on role
    let whereClause: any = {};

    if (user.role === "STUDENT") {
      // user.id is a string, but student_id in payment2 is BigInt
      // Need to find the student record to get the actual student.id
      const student = await prisma.student.findFirst({
        where: {
          user_id: BigInt(user.id),
        },
      });

      if (student) {
        whereClause.student_id = student.id;
      } else {
        // No student record found, return empty results
        whereClause.student_id = BigInt(-1);
      }
    } else if (user.role === "STAFF") {
      whereClause.institution_id = user.institution_id;
    } else if (user.role === "HOD") {
      whereClause.department_id = BigInt(0);
    } else if (user.role === "ADMIN") {
      whereClause.institution_id = user.institution_id;
    }
    // SUPERADMIN sees all (no filter)

    // Apply additional filters
    if (status && status !== "all") {
      whereClause.status = parseInt(status);
    }
    if (processor && processor !== "all") {
      whereClause.processor = processor;
    }
    if (email) {
      // Need to join with student/user to filter by email
      whereClause.student = {
        user: {
          email: { contains: email, mode: "insensitive" as any },
        },
      };
    }

    const payments = await prisma.payment2.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            user_student_user_idTouser: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
      skip,
      take: pgsize,
    });

    const total = await prisma.payment2.count({ where: whereClause });
    const pageCount = Math.ceil(total / pgsize);

    console.log("Payment2 API Results:", {
      totalCount: total,
      paymentsReturned: payments.length,
      whereClause,
      user: {
        role: user.role,
        id: user.id,
        institution_id: user.institution_id,
      },
      firstPayment: payments[0]
        ? {
            id: payments[0].id,
            student_id: payments[0].student_id,
            amount: payments[0].amount,
            hasStudent: !!payments[0].student,
            hasUser: !!payments[0].student?.user_student_user_idTouser,
          }
        : null,
    });

    // Return data structure matching Fastify controller
    const response = createJsonResponse({
      payments,
      pagination: {
        page: pg,
        pageSize: pgsize,
        pageCount,
        rowCount: total,
      },
    });

    // Add pagination headers
    response.headers.set("X-Page", pg.toString());
    response.headers.set("X-Page-Size", pgsize.toString());
    response.headers.set("X-Page-Count", pageCount.toString());
    response.headers.set("X-Total-Count", total.toString());

    return response;
  } catch (error) {
    console.error("Error fetching payments:", error);
    return createAuthErrorResponse("Failed to fetch payments", 500);
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateUserWithPermissions();

  if (!authResult.success || !authResult.user) {
    return createAuthErrorResponse(
      authResult.error || "Unauthorized",
      authResult.statusCode || 401
    );
  }

  try {
    const body = await req.json();

    // Extract fee_plan from cart if present
    let feePlanToUpdate: string | null = null;
    if (body.cart && typeof body.cart === "object") {
      // Find the first fee_plan in the cart
      const cartItems = Object.values(body.cart) as any[];
      for (const item of cartItems) {
        if (item.fee_plan) {
          feePlanToUpdate = item.fee_plan;
          break; // Use the first fee_plan found
        }
      }
    }

    // Create the payment
    const newPayment = await prisma.payment2.create({
      data: body,
    });

    // Update student's fee_plan if a plan was specified in the cart
    // Only update if student doesn't have a plan set, or if the payment uses a different plan
    const user = authResult.user;
    if (feePlanToUpdate && user.role === "STUDENT") {
      try {
        const student = await prisma.student.findFirst({
          where: {
            user_id: BigInt(user.id),
          },
        });

        if (student) {
          // Update fee_plan if not set or if different from payment plan
          if (!student.fee_plan || student.fee_plan !== feePlanToUpdate) {
            await prisma.student.update({
              where: {
                id: student.id,
              },
              data: {
                fee_plan: feePlanToUpdate,
                updated_at: new Date(),
              },
            });
          }
        }
      } catch (updateError) {
        // Log error but don't fail the payment creation
        console.error("Error updating student fee_plan:", updateError);
      }
    }

    return createJsonResponse(newPayment);
  } catch (error) {
    console.error("Error creating payment:", error);
    return createAuthErrorResponse("Failed to create payment", 500);
  }
}
