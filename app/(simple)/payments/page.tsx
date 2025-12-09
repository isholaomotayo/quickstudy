import {
  ChevronDown,
  CreditCardIcon,
  History,
  User,
  Wallet,
} from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PaymentClientWrapper from "./payment-client-wrapper";
import StudentPaymentRecords from "@/components/StudentPaymentRecords";

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

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
    const paymentsUrl = `${API_URL}/api/payment2?${new URLSearchParams({
      pgsize: "50",
      pg: "1",
      ...Object.fromEntries(
        Object.entries(searchParams).map(([key, value]) => [
          key,
          Array.isArray(value) ? value[0] : value || "",
        ])
      ),
    })}`;

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
      const payablesUrl = `${API_URL}/api/payment2/payables`;
      console.log("Fetching payables from:", payablesUrl);

      const payablesResponse = await fetch(payablesUrl, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (payablesResponse.ok) {
        const payablesData = await payablesResponse.json();
        myPayables = payablesData || { fixedDues: [], flexibleDues: {} };
      }
    }

    // Fetch payment details (payment account configuration)
    const paymentDetailsUrl = `${API_URL}/api/paymentaccount`;

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
          <div className="text-red-600 text-xl font-semibold mb-4">
            Failed to Load Payment Data
          </div>
          <p className="text-gray-600 mb-4">{paymentData.error}</p>
          <Link href="/payments">
            <Button className="bg-blue-600 hover:bg-blue-700">Retry</Button>
          </Link>
        </div>
      </div>
    );
  }

  const {
    paymentsHistory,
    paymentDetails,
    myPayables,
    userData,
    isHigherAccess,
  } = paymentData;
  const iCanPay = userData?.role === "STUDENT";
  const payment_plan_options = {
    full: { title: "Full Payment" },
    monthly: { title: "Monthly Payment Plan" },
    semesterly: { title: "Semester Payment Plan" },
    sessionly: { title: "Session Payment Plan" },
  };

  return (
    <>
      {/* Simple Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 pointer-events-none">
      </div>
      <div className="relative z-10">
        <Tabs
          defaultValue={iCanPay ? "payments" : "history"}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="payments" className="gap-2">
              <Wallet className="w-4 h-4" />
              Make Payment
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              Payment History
            </TabsTrigger>
          </TabsList>
          <TabsContent value="payments" className="space-y-6">
            {iCanPay ? (
              <PaymentClientWrapper
                fixedDues={myPayables.fixedDues}
                flexibleDues={myPayables.flexibleDues}
                userData={userData}
                paymentDetails={paymentDetails}
                payment_plan_options={payment_plan_options}
              />
            ) : (
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Payment Not Available
                  </h3>
                  <p className="text-gray-600">
                    Payments are only available for students. Your current role:{" "}
                    <span className="font-semibold">{userData?.role}</span>
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                {!paymentsHistory || paymentsHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>No payment history found</p>
                    <p className="text-sm">
                      Your completed payments will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          Found {paymentsHistory.length} payment(s)
                        </p>
                        <p className="text-xs text-gray-500">
                          Click on any payment to view details
                        </p>
                      </div>
                      {userData?.role === 'STUDENT' && (
                        <StudentPaymentRecords userData={userData} />
                      )}
                    </div>
                    {paymentsHistory.map((payment, i) => {
                      const paymentAmount =
                        typeof payment.amount === "string"
                          ? parseFloat(payment.amount)
                          : typeof payment.amount === "number"
                          ? payment.amount
                          : 0;
                      const paymentStatus = Boolean(payment.status);
                      const paymentDate = payment.created_at
                        ? new Date(payment.created_at)
                        : null;
                      const paymentReference =
                        payment.reference || "No reference";
                      const paymentProcessor = payment.processor || "Unknown";

                      return (
                        <Collapsible key={payment.id || `payment-${i}`}>
                          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border hover:from-gray-100 hover:to-blue-100 transition-colors">
                            <div className="flex items-center gap-4">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  paymentStatus
                                    ? "bg-green-500"
                                    : "bg-yellow-500"
                                }`}
                              />
                              <div className="text-left">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">
                                    ₦{paymentAmount.toLocaleString()}
                                  </h4>
                                  {isHigherAccess &&
                                    payment.first_name &&
                                    payment.last_name && (
                                      <span className="text-sm text-gray-600">
                                        • {payment.first_name}{" "}
                                        {payment.last_name}
                                        {payment.username &&
                                          ` (${payment.username})`}
                                      </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {paymentDate
                                    ? paymentDate.toLocaleString("en-US", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "No date"}{" "}
                                  • {paymentProcessor} • {paymentReference}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  paymentStatus ? "default" : "secondary"
                                }
                                className={
                                  paymentStatus
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {paymentStatus ? "Confirmed" : "Pending"}
                              </Badge>
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="px-4 pb-4">
                            <div className="bg-white rounded-lg border p-4 mt-2">
                              <div className="space-y-4">
                                {payment.cart &&
                                  Object.keys(payment.cart).length > 0 && (
                                    <div className=" pt-4">
                                      <h5 className="font-medium mb-3">
                                        Cart Items:
                                      </h5>
                                      <div className="space-y-2">
                                        {Object.entries(payment.cart).map(
                                          ([itemId, item]: [string, any]) => (
                                            <div
                                              key={itemId}
                                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                                            >
                                              <div>
                                                <p className="font-medium text-sm">
                                                  {item.name}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                  Qty: {item.quantity} • ₦
                                                  {parseFloat(
                                                    item.unit_price || "0"
                                                  ).toLocaleString()}{" "}
                                                  each
                                                  {item.fee_plan &&
                                                    ` • Plan: ${item.fee_plan}`}
                                                </p>
                                              </div>
                                              <div className="text-right">
                                                <p className="font-semibold text-sm">
                                                  ₦
                                                  {(
                                                    parseFloat(
                                                      item.unit_price || "0"
                                                    ) * (item.quantity || 1)
                                                  ).toLocaleString()}
                                                </p>
                                              </div>
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
