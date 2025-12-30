import { User, Wallet } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PaymentClientWrapper from "./payment-client-wrapper";
import { getServerComponentApiUrl } from "@/lib/server-api-url";
import PaymentHistoryList from "./payment-history-list";

interface PaymentItem {
  id: string;
  item_id: string;
  name: string;
  unit_price: number;
  fee_plan?: string;
  semester_id?: string;
  session_id?: string;
}

interface PaymentHistory {
  id: string;
  amount: number;
  processor: string;
  reference: string;
  status: boolean;
  created_at: string;
  cart: Record<string, any>;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface PaymentData {
  paymentsHistory: PaymentHistory[];
  paymentDetails: any;
  myPayables: {
    fixedDues: PaymentItem[];
    flexibleDues: Record<string, PaymentItem[]>;
  };
  userData: any;
  isHigherAccess: boolean;
  pagingData: any;
  numFetched: number;
  error?: string;
}

async function getPaymentServerData(searchParams: {
  [key: string]: string | string[] | undefined;
}): Promise<PaymentData> {
  const cookieStore = await cookies();

  // Get auth data from cookies
  const token = cookieStore.get("token")?.value || "";
  const role = cookieStore.get("role")?.value || "";
  const userId = cookieStore.get("userId")?.value || "0";
  const userDataCookie = cookieStore.get("userData")?.value || "{}";

  let userData = {};
  try {
    userData = JSON.parse(decodeURIComponent(userDataCookie));
  } catch (e) {
    console.error("Error parsing userData cookie:", e);
  }

  // Check authorization
  const allowedRoles = ["SUPERADMIN", "HOD", "STUDENT"];
  if (!role || !allowedRoles.includes(role)) {
    redirect("/signin?logout=1");
  }

  const highRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const isHigherAccess = highRoles.includes(role);

  // Prepare headers for API calls
  const headers = {
    "Content-Type": "application/json",
    Cookie: `token=${token}; role=${role}; userId=${userId}; userData=${encodeURIComponent(
      JSON.stringify(userData)
    )}`,
  };

  try {
    // Fetch payments history (equivalent to getTableData("payment2"))
    const paymentsEndpoint = `/api/payment2?${new URLSearchParams({
      pgsize: "50",
      pg: "1",
      ...Object.fromEntries(
        Object.entries(searchParams).map(([key, value]) => [
          key,
          Array.isArray(value) ? value[0] : value || "",
        ])
      ),
    })}`;

    const paymentsUrl = await getServerComponentApiUrl(paymentsEndpoint);
    console.log("Fetching payments from:", paymentsUrl);

    const paymentsResponse = await fetch(paymentsUrl, {
      method: "GET",
      headers,
      credentials: "include",
    });

    let paymentsHistory: any[] = [];
    let pagingData: any = null;
    let numFetched = 0;

    if (paymentsResponse.ok) {
      const paymentsData = await paymentsResponse.json();

      // Handle different response structures
      if (Array.isArray(paymentsData)) {
        paymentsHistory = paymentsData;
      } else if (paymentsData && Array.isArray(paymentsData.data)) {
        paymentsHistory = paymentsData.data;
        pagingData = paymentsData.paging;
      } else if (paymentsData && Array.isArray(paymentsData.results)) {
        paymentsHistory = paymentsData.results;
        pagingData = paymentsData.paging;
      } else if (paymentsData && Array.isArray(paymentsData.payments)) {
        // This is the correct structure from the API
        paymentsHistory = paymentsData.payments;
        pagingData = paymentsData.pagination;
      }

      numFetched = paymentsHistory.length;

      // Process payment history for higher access users
      if (numFetched && isHigherAccess) {
        paymentsHistory = paymentsHistory.map((payment: any) => ({
          ...payment,
          first_name: payment.student?.user?.first_name || "",
          last_name: payment.student?.user?.last_name || "",
          username: payment.student?.user?.username || "",
          student_reg_no: payment.student?.reg_no || "",
        }));
      }
    }

    // Fetch payables for students
    let myPayables = { fixedDues: [], flexibleDues: {} };
    if (role === "STUDENT") {
      const payablesUrl = await getServerComponentApiUrl(
        `/api/payment2/payables`
      );
      console.log("Fetching payables from:", payablesUrl);

      try {
        const payablesResponse = await fetch(payablesUrl, {
          method: "GET",
          headers,
          credentials: "include",
        });

        if (payablesResponse.ok) {
          const payablesData = await payablesResponse.json();
          console.log("Payables data received:", payablesData);
          // Handle both direct response and wrapped response formats
          const actualData = payablesData?.data || payablesData;
          myPayables = {
            fixedDues: actualData?.fixedDues || [],
            flexibleDues: actualData?.flexibleDues || {},
          };
        } else {
          const errorText = await payablesResponse.text();
          console.error(
            "Error fetching payables:",
            payablesResponse.status,
            errorText
          );
        }
      } catch (error) {
        console.error("Exception fetching payables:", error);
      }
    }

    // Fetch payment details (payment account configuration)
    const paymentDetailsUrl = await getServerComponentApiUrl(
      `/api/paymentaccount`
    );

    const paymentDetailsResponse = await fetch(paymentDetailsUrl, {
      method: "GET",
      headers,
      credentials: "include",
    });

    let paymentDetails: any = null;
    if (paymentDetailsResponse.ok) {
      const paymentDetailsData = await paymentDetailsResponse.json();

      if (paymentDetailsData && paymentDetailsData.id) {
        paymentDetails = paymentDetailsData;
      } else if (
        Array.isArray(paymentDetailsData) &&
        paymentDetailsData.length > 0
      ) {
        paymentDetails = paymentDetailsData[0];
      }
    }

    return {
      paymentsHistory,
      paymentDetails,
      myPayables,
      userData,
      isHigherAccess,
      pagingData,
      numFetched,
    };
  } catch (error) {
    console.error("Error fetching payment data:", error);
    return {
      paymentsHistory: [],
      paymentDetails: null,
      myPayables: { fixedDues: [], flexibleDues: {} },
      userData,
      isHigherAccess,
      pagingData: null,
      numFetched: 0,
      error:
        error instanceof Error ? error.message : "Failed to fetch payment data",
    };
  }
}

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const paymentData = await getPaymentServerData(resolvedSearchParams);

  if (paymentData.error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-destructive text-xl font-semibold mb-4">
            Failed to Load Payment Data
          </div>
          <p className="text-muted-foreground mb-4">{paymentData.error}</p>
          <Link href="/payments">
            <Button className="bg-primary text-primary-foreground hover:opacity-90">
              Retry
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const {
    paymentsHistory,
    paymentDetails,
    myPayables: rawPayables,
    userData,
    isHigherAccess,
  } = paymentData;

  // Ensure myPayables has proper structure
  const myPayables = {
    fixedDues: rawPayables?.fixedDues || [],
    flexibleDues: rawPayables?.flexibleDues || {},
  };

  const iCanPay = userData?.role === "STUDENT";
  const payment_plan_options = {
    full: { title: "Full Payment" },
    monthly: { title: "Monthly Payment Plan" },
    semesterly: { title: "Semester Payment Plan" },
    sessionly: { title: "Session Payment Plan" },
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-2xl font-semibold text-foreground">
            <Wallet className="w-6 h-6 text-primary" />
            Payments
          </div>
          <p className="text-sm text-muted-foreground">
            Build your cart, pay in seconds, and review your complete history
          </p>
        </div>

        {iCanPay ? (
          <PaymentClientWrapper
            fixedDues={myPayables.fixedDues}
            flexibleDues={myPayables.flexibleDues}
            userData={userData}
            paymentDetails={paymentDetails}
            payment_plan_options={payment_plan_options}
            paymentsHistory={paymentsHistory}
            isHigherAccess={isHigherAccess}
            showHistory
          />
        ) : (
          <div className="space-y-6">
            <Card className="bg-card border border-border shadow-lg">
              <CardContent className="p-10 text-center">
                <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Payment Not Available
                </h3>
                <p className="text-muted-foreground">
                  Payments are only available for students. Your current role:{" "}
                  <span className="font-semibold">{userData?.role}</span>
                </p>
              </CardContent>
            </Card>
            <PaymentHistoryList
              paymentsHistory={paymentsHistory}
              isHigherAccess={isHigherAccess}
              userData={userData}
              title="Payment History"
            />
          </div>
        )}
      </div>
    </>
  );
}
