"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import StudentPaymentRecords from "@/components/StudentPaymentRecords";
import { ChevronDown, History } from "lucide-react";

interface PaymentHistoryItem {
  id: string;
  amount: number | string;
  processor?: string;
  reference?: string;
  status?: boolean | number;
  created_at?: string;
  cart?: Record<string, any> | string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface PaymentHistoryListProps {
  paymentsHistory: PaymentHistoryItem[];
  isHigherAccess?: boolean;
  userData?: any;
  title?: string;
}

const normalizeCart = (cart?: Record<string, any> | string) => {
  if (!cart) return {};
  if (typeof cart === "string") {
    try {
      return JSON.parse(cart);
    } catch (error) {
      console.error("Failed to parse cart:", error);
      return {};
    }
  }
  return cart;
};

const getStatusMeta = (status?: boolean | number) => {
  const normalized =
    typeof status === "number" ? status : status ? 1 : 0;

  if (normalized === 1) {
    return {
      label: "Confirmed",
      dotClass: "bg-emerald-500",
      badgeClass:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-400/50",
    };
  }

  if (normalized === 2) {
    return {
      label: "Failed",
      dotClass: "bg-rose-500",
      badgeClass:
        "bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-400/50",
    };
  }

  return {
    label: "Pending",
    dotClass: "bg-amber-500",
    badgeClass:
      "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/50",
  };
};

const formatCurrency = (amount: number | string) => {
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;
  return `₦${(numericAmount || 0).toLocaleString()}`;
};

export default function PaymentHistoryList({
  paymentsHistory,
  isHigherAccess = false,
  userData,
  title = "Payment History",
}: PaymentHistoryListProps) {
  return (
    <Card className="bg-card border border-border shadow-lg">
      <CardHeader className="space-y-1 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            {title}
          </CardTitle>
          {userData?.role === "STUDENT" && (
            <StudentPaymentRecords userData={userData} />
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {paymentsHistory?.length || 0} payment
          {paymentsHistory?.length === 1 ? "" : "s"} recorded.
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        {!paymentsHistory || paymentsHistory.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No payment history found</p>
            <p className="text-sm text-muted-foreground">
              Your completed payments will appear here.
            </p>
          </div>
        ) : (
          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {paymentsHistory.map((payment, i) => {
              const statusMeta = getStatusMeta(payment.status);
              const paymentAmount = formatCurrency(payment.amount);
              const paymentDate = payment.created_at
                ? new Date(payment.created_at).toLocaleString("en-NG", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "No date";
              const paymentReference = payment.reference || "No reference";
              const paymentProcessor = payment.processor || "Unknown";
              const cartItems = normalizeCart(payment.cart);
              const cartEntries = Object.entries(cartItems || {});

              return (
                <Collapsible key={payment.id || `payment-${i}`}>
                  <CollapsibleTrigger className="flex w-full flex-col gap-2 rounded-lg border border-border bg-muted/30 p-2 text-left transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`h-2 w-2 rounded-full ${statusMeta.dotClass}`}
                      />
                      <span className="font-semibold text-foreground">
                        {paymentAmount}
                      </span>
                      <span className="text-muted-foreground">
                        {paymentDate}
                      </span>
                      <span className="text-muted-foreground">
                        {paymentProcessor}
                      </span>
                      <span className="text-muted-foreground">
                        {paymentReference}
                      </span>
                      {isHigherAccess &&
                        payment.first_name &&
                        payment.last_name && (
                          <span className="text-muted-foreground">
                            • {payment.first_name} {payment.last_name}
                            {payment.username && ` (${payment.username})`}
                          </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge
                        className={`${statusMeta.badgeClass} px-2 py-0.5 text-xs`}
                      >
                        {statusMeta.label}
                      </Badge>
                      <span className="text-muted-foreground">
                        {cartEntries.length} item
                        {cartEntries.length === 1 ? "" : "s"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <div className="bg-card rounded-lg border border-border p-4 mt-2">
                      {cartEntries.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No item details recorded for this payment.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {cartEntries.map(([itemId, item]: [string, any]) => {
                            const quantity = Number(item?.quantity || 1);
                            const unitPrice = Number(
                              item?.unit_price || item?.unitPrice || 0
                            );
                            const lineTotal =
                              unitPrice > 0 ? unitPrice * quantity : 0;
                            const feePlan = item?.fee_plan || item?.plan;
                            return (
                              <div
                                key={itemId}
                                className="flex flex-col gap-2 rounded-md border border-border/60 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div>
                                  <p className="text-sm font-medium">
                                    {item?.name || `Item ${itemId}`}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Qty: {quantity}
                                    {feePlan && ` • Plan: ${feePlan}`}
                                  </p>
                                </div>
                                <div className="text-sm font-semibold">
                                  {lineTotal > 0
                                    ? formatCurrency(lineTotal)
                                    : "—"}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
