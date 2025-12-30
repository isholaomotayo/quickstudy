import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const userId = searchParams.get('userId');
    
    if (!studentId && !userId) {
      return NextResponse.json(
        { error: 'Student ID or User ID is required' },
        { status: 400 }
      );
    }

    // Build where clause
    let whereClause: any = {};
    if (studentId) {
      whereClause = { student_id: BigInt(studentId) };
    } else if (userId) {
      whereClause = { 
        student: {
          user_student_user_idTouser: {
            id: BigInt(userId)
          }
        }
      };
    }

    // Fetch student payments and information
    // Optimization: Limit fields to only what's needed and add pagination
    const [payments, studentInfo] = await Promise.all([
      prisma.payment2.findMany({
        where: whereClause,
        select: {
          id: true,
          reference: true,
          amount: true,
          status: true,
          processor: true,
          processor_currency: true,
          created_at: true,
          updated_at: true,
          paid_at: true,
          cart: true,
          student_id: true,
          student: {
            select: {
              id: true,
              user_student_user_idTouser: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  phone: true,
                  username: true,
                  avatar: true,
                },
              },
              programme: {
                select: {
                  name: true,
                  department: {
                    select: {
                      name: true,
                      faculty: {
                        select: {
                          name: true,
                          institution: {
                            select: {
                              name: true,
                              phone: true,
                              email: true,
                              support_mail: true,
                              logo: true,
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        take: 100, // Pagination: limit to 100 most recent payments
      }),
      // Get student info if using userId
      userId ? prisma.student.findFirst({
        where: {
          user_student_user_idTouser: {
            id: BigInt(userId)
          }
        },
        select: {
          id: true,
          user_student_user_idTouser: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone: true,
              username: true,
              avatar: true,
            },
          },
          programme: {
            select: {
              name: true,
              department: {
                select: {
                  name: true,
                  faculty: {
                    select: {
                      name: true,
                      institution: {
                        select: {
                          name: true,
                          phone: true,
                          support_mail: true,
                          logo: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        }
      }) : null
    ]);

    if (payments.length === 0 && !studentInfo) {
      return NextResponse.json(
        { error: 'No payments found for this student' },
        { status: 404 }
      );
    }

    // Use the first payment's student info or fetched student info
    const student = payments[0]?.student || studentInfo;
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student information not found' },
        { status: 404 }
      );
    }

    // Process payments data
    const processedPayments = payments.map(payment => {
      let cartItems: any[] = [];
      if (payment.cart) {
        try {
          const cart = typeof payment.cart === 'string' ? JSON.parse(payment.cart) : payment.cart;
          cartItems = Object.entries(cart).map(([feeId, item]: [string, any]) => ({
            feeId,
            name: item.name || 'Unknown Item',
            quantity: item.quantity || 1,
            unit_price: Number(item.unit_price || 0),
            total: (item.quantity || 1) * Number(item.unit_price || 0),
            fee_plan: item.fee_plan || 'full',
          }));
        } catch (error) {
          console.error('Error parsing cart data:', error);
        }
      }

      return {
        id: payment.id,
        reference: payment.reference,
        amount: Number(payment.amount),
        status: payment.status,
        paymentMethod: payment.processor || 'Unknown',
        currency: payment.processor_currency || 'NGN',
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
        paidAt: payment.paid_at,
        items: cartItems,
        itemCount: cartItems.length,
        subtotal: cartItems.reduce((sum, item) => sum + item.total, 0),
      };
    });

    // Calculate summary statistics
    const summary = {
      totalPayments: payments.length,
      totalAmount: processedPayments.reduce((sum, p) => sum + p.amount, 0),
      paidPayments: processedPayments.filter(p => p.status === 1).length,
      paidAmount: processedPayments.filter(p => p.status === 1).reduce((sum, p) => sum + p.amount, 0),
      pendingPayments: processedPayments.filter(p => p.status === 0).length,
      pendingAmount: processedPayments.filter(p => p.status === 0).reduce((sum, p) => sum + p.amount, 0),
      failedPayments: processedPayments.filter(p => p.status === 2).length,
    };

    // Generate verification data for QR code
    const verificationData = {
      studentId: student.id.toString(),
      userId: student.user_student_user_idTouser?.id?.toString(),
      studentName: `${student.user_student_user_idTouser?.first_name || ''} ${student.user_student_user_idTouser?.last_name || ''}`.trim(),
      email: student.user_student_user_idTouser?.email,
      totalPayments: summary.totalPayments,
      totalPaid: summary.paidAmount,
      generatedAt: new Date().toISOString(),
      programme: student.programme?.name,
      department: student.programme?.department?.name,
      faculty: student.programme?.department?.faculty?.name,
      institution: student.programme?.department?.faculty?.institution?.name,
    };

    // Create verification hash
    const verificationHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(verificationData))
      .digest('hex');

    // Prepare response data
    const recordsData = {
      student: {
        id: student.id.toString(),
        userId: student.user_student_user_idTouser?.id?.toString(),
        name: `${student.user_student_user_idTouser?.first_name || ''} ${student.user_student_user_idTouser?.last_name || ''}`.trim(),
        email: student.user_student_user_idTouser?.email,
        phone: student.user_student_user_idTouser?.phone,
        username: student.user_student_user_idTouser?.username,
        programme: student.programme?.name,
        department: student.programme?.department?.name,
        faculty: student.programme?.department?.faculty?.name,
      },
      institution: {
        name: student.programme?.department?.faculty?.institution?.name || 'Institution',
        phone: student.programme?.department?.faculty?.institution?.phone,
        email: student.programme?.department?.faculty?.institution?.email || student.programme?.department?.faculty?.institution?.support_mail,
        logo_url: student.programme?.department?.faculty?.institution?.logo,
      },
      payments: processedPayments,
      summary,
      verification: {
        hash: verificationHash,
        data: verificationData,
        qrData: JSON.stringify({
          type: 'student_payment_verification',
          hash: verificationHash,
          studentId: verificationData.studentId,
          studentName: verificationData.studentName,
          totalPayments: verificationData.totalPayments,
          totalPaid: verificationData.totalPaid,
          generatedAt: verificationData.generatedAt,
          verifyUrl: `${request.nextUrl.origin}/verify?hash=${verificationHash}&studentId=${verificationData.studentId}`,
        }),
      },
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(recordsData);
  } catch (error) {
    console.error('Error generating payment records:', error);
    return NextResponse.json(
      { error: 'Failed to generate payment records', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}