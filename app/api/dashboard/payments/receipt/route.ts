import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    
    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Fetch payment data with student information
    const payment = await prisma.payment2.findUnique({
      where: { id: parseInt(paymentId) },
      include: {
        student: {
          include: {
            user_student_user_idTouser: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
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
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Parse cart data
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

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
    const total = Number(payment.amount);

    // Generate description from cart items
    const description = cartItems.length > 0 
      ? cartItems.map(item => item.name).join(', ')
      : 'Payment';

    // Prepare receipt data
    const receiptData = {
      receipt: {
        id: payment.id,
        reference: payment.reference,
        date: payment.created_at,
        paidDate: payment.paid_at || payment.updated_at,
        status: payment.status,
        amount: total,
        currency: payment.processor_currency || 'NGN',
        paymentMethod: payment.processor || 'Unknown',
        channel: payment.channel,
        description: description,
      },
      student: {
        id: payment.student?.user_student_user_idTouser?.id?.toString(),
        name: `${payment.student?.user_student_user_idTouser?.first_name || ''} ${payment.student?.user_student_user_idTouser?.last_name || ''}`.trim(),
        email: payment.student?.user_student_user_idTouser?.email,
        phone: payment.student?.user_student_user_idTouser?.phone,
        programme: payment.student?.programme?.name,
        department: payment.student?.programme?.department?.name,
        faculty: payment.student?.programme?.department?.faculty?.name,
      },
      institution: {
        name: payment.student?.programme?.department?.faculty?.institution?.name || 'Institution',
        phone: payment.student?.programme?.department?.faculty?.institution?.phone,
        email: payment.student?.programme?.department?.faculty?.institution?.email || payment.student?.programme?.department?.faculty?.institution?.support_mail,
        logo_url: payment.student?.programme?.department?.faculty?.institution?.logo,
      },
      items: cartItems,
      summary: {
        subtotal,
        total,
        itemCount: cartItems.length,
      },
    };

    return NextResponse.json(receiptData);
  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json(
      { error: 'Failed to generate receipt', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}