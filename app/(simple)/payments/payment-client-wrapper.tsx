"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { processPaystack } from "@/helpers/paymentProcessors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
    Plus,
    Receipt,
    Calendar, CheckCircle,
    Clock,
    Trash2,
    ShoppingCart
} from "lucide-react";

interface PaymentItem {
  id: string;
  item_id: string;
  name: string;
  unit_price: number;
  fee_plan?: string;
  semester_id?: string;
  session_id?: string;
}

interface CartItem extends PaymentItem {
  quantity: number;
  subtotal: number;
  selections: string[];
  plan_selections: string[];
  ref_id: string;
}

interface PaymentClientWrapperProps {
  fixedDues: PaymentItem[];
  flexibleDues: Record<string, PaymentItem[]>;
  userData: any;
  paymentDetails: any;
  payment_plan_options: Record<string, { title: string }>;
}

// Cart persistence utilities
const CART_STORAGE_KEY = "payment_cart_state";
const CART_SUM_STORAGE_KEY = "payment_cart_sum";
const ACTIVE_PLAN_STORAGE_KEY = "payment_active_plan";

const saveCartToStorage = (
  cartState: Record<string, CartItem>,
  cartSum: number,
  activePlan: string
) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
      localStorage.setItem(CART_SUM_STORAGE_KEY, cartSum.toString());
      localStorage.setItem(ACTIVE_PLAN_STORAGE_KEY, activePlan);
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }
};

const loadCartFromStorage = () => {
  if (typeof window !== "undefined") {
    try {
      const cartState = localStorage.getItem(CART_STORAGE_KEY);
      const cartSum = localStorage.getItem(CART_SUM_STORAGE_KEY);
      const activePlan = localStorage.getItem(ACTIVE_PLAN_STORAGE_KEY);

      return {
        cartState: cartState ? JSON.parse(cartState) : {},
        cartSum: cartSum ? parseInt(cartSum, 10) : 0,
        activePlan: activePlan || "full",
      };
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return { cartState: {}, cartSum: 0, activePlan: "full" };
    }
  }
  return { cartState: {}, cartSum: 0, activePlan: "full" };
};

const clearCartFromStorage = () => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(CART_SUM_STORAGE_KEY);
      localStorage.removeItem(ACTIVE_PLAN_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing cart from localStorage:", error);
    }
  }
};

export default function PaymentClientWrapper({
  fixedDues = [],
  flexibleDues = {},
  userData,
  paymentDetails,
  payment_plan_options,
}: PaymentClientWrapperProps) {
  const [mounted, setMounted] = useState(false);
  const [cartState, setCartState] = useState<Record<string, CartItem>>({});
  const [cartSum, setCartSum] = useState(0);
  const [activePayPlan, setActivePayPlan] = useState(
    userData?.fee_plan || "full"
  );

  // Load cart from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const {
      cartState: savedCart,
      cartSum: savedSum,
      activePlan: savedPlan,
    } = loadCartFromStorage();

    // Only restore if the saved plan matches current user's plan or if no user plan is set
    if (!userData?.fee_plan || savedPlan === userData.fee_plan) {
      setCartState(savedCart);
      setCartSum(savedSum);
      setActivePayPlan(savedPlan);
    } else {
      // Clear saved cart if user's plan changed
      clearCartFromStorage();
    }
  }, [userData?.fee_plan]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      saveCartToStorage(cartState, cartSum, activePayPlan);
    }
  }, [cartState, cartSum, activePayPlan, mounted]);

  const addToCart = (due: PaymentItem, rowID: string, duePlan?: string) => {
    const feeID = due.id;
    const item_id = due.item_id;
    const feeName = due.name;
    const unit_price = Number(due.unit_price);
    const fee_plan = duePlan || activePayPlan;

    let lineItem = cartState[feeID] && { ...cartState[feeID] };

    if (!(lineItem && lineItem.fee_plan === fee_plan)) {
      lineItem = {
        id: feeID,
        item_id: item_id,
        name: feeName,
        quantity: 0,
        subtotal: 0,
        fee_plan: fee_plan,
        unit_price,
        selections: [],
        plan_selections: [],
        ref_id: "",
      };
    }

    if (!lineItem.selections.includes(rowID)) {
      lineItem.quantity += 1;
      lineItem.subtotal = lineItem.unit_price * lineItem.quantity;
      setCartSum((prevSum) => prevSum + unit_price);
      lineItem.selections.push(rowID);

      if (feeID !== item_id) lineItem.plan_selections.push(item_id);
    }

    if (lineItem.plan_selections.length) {
      let plan_selections = lineItem.plan_selections;
      plan_selections.sort();
      lineItem.ref_id = plan_selections[0];
      if (plan_selections.length > 1)
        lineItem.ref_id += "-" + plan_selections[plan_selections.length - 1];
    }

    setCartState({
      ...cartState,
      [feeID]: { ...lineItem },
    });
    toast.success(`Added ${feeName.toUpperCase()} to cart!`);
  };

  const removeFromCart = (feeID: string) => {
    const lineItem = cartState[feeID];
    if (lineItem) {
      setCartSum((prevSum) => prevSum - lineItem.subtotal);
      const newCartState = { ...cartState };
      delete newCartState[feeID];
      setCartState(newCartState);
      toast.success("Item removed from cart");
    }
  };

  const clearCart = () => {
    setCartState({});
    setCartSum(0);
    clearCartFromStorage();
    toast.success("Cart cleared");
  };

  const handlePlanChange = (plan: string) => {
    // Clear cart when plan changes
    setCartState({});
    setCartSum(0);
    setActivePayPlan(plan);
    clearCartFromStorage();
    toast.success(`Switched to ${payment_plan_options[plan]?.title}`);
  };

  const rowInState = (feeID: string, rowID: string): boolean => {
    return !!(
      cartState[feeID] &&
      cartState[feeID].selections &&
      cartState[feeID].selections.includes(rowID)
    );
  };

  const getButtonEnabled = (
    due: PaymentItem,
    rowID: string,
    lastRowItem: PaymentItem | null
  ): boolean => {
    const addedToCart = rowInState(due.id, rowID);

    if (addedToCart) return false;

    let [rowvar, rowPos] = rowID.split("-");
    const newFeeType =
      rowPos === "0" || (lastRowItem && lastRowItem.id !== due.id);
    const prevRowPos = +rowPos - 1;

    if (newFeeType) return true;

    const prevRowID = `${rowvar}-${prevRowPos}`;
    return rowInState(due.id, prevRowID);
  };

  const randomInteger = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const makePostData = (processor: string) => {
    let refStr = `${randomInteger(1000, 9999)}.${userData?.id}`;
    const postData = {
      amount: Number(cartSum),
      cart: {} as Record<string, any>,
      processor,
      reference: "",
    };

    Object.entries(cartState).forEach(([feeID, lineItem]) => {
      const { quantity, fee_plan, ref_id } = lineItem;
      if (!quantity) return;
      refStr += `.${feeID}`;

      postData.cart[feeID] = { quantity };
      if (fee_plan) postData.cart[feeID].fee_plan = fee_plan;
      if (ref_id) refStr += `-${ref_id}`;
    });

    postData.reference = refStr;
    return postData;
  };

  const savePayment = async (postData: any) => {
    const saveEndpoint = `/api/payment2`;

    if (!Object.keys(postData.cart).length) return "no_items_selected";

    try {
      const response = await fetch(saveEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        credentials: "include",
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const result = await response.json();

        if (result && result.pageNotif) {
          return result.pageNotif;
        } else if (result && result.id) {
          return result;
        }
      }
    } catch (error) {
      console.error("Payment save error:", error);
    }

    return "payment_failed";
  };

  const paymentSuccessFxn = async (payData: any) => {
    clearCart();
    toast.success("Payment successful!");
    await savePayment(payData);
  };

  const paymentFailureFxn = (payData: any, error?: string) => {
    savePayment(payData);
    clearCart();
    toast.error(error || "Payment failed");
  };

  const payWithPaystack = async () => {
    if (!Object.keys(cartState).length) {
      toast.error("Please add items to cart");
      return;
    }

    // Check if PaystackPop is available
    if (typeof window === "undefined" || !window.PaystackPop) {
      toast.error(
        "Payment system is not ready. Please refresh the page and try again."
      );
      return;
    }

    const postData = makePostData("paystack");

    try {
      await processPaystack(
        postData,
        userData,
        paymentSuccessFxn,
        paymentFailureFxn,
        paymentDetails?.public_key ||
          process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
      );
    } catch (error) {
      console.error("Payment initialization error:", error);
      toast.error(
        error.message || "Failed to initialize payment. Please try again."
      );
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Payment Cart */}
      <div className="lg:col-span-4 space-y-6">
        <Card className="bg-card border border-border shadow-xl sticky top-24 py-0">
          <CardHeader className="bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-15" />
              Payment Cart
              {Object.keys(cartState).length > 0 && (
                <span className="text-sm bg-primary-foreground/20 px-2 py-1 rounded-full">
                  {Object.keys(cartState).length} item
                  {Object.keys(cartState).length !== 1 ? "s" : ""}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Object.keys(cartState).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Your cart is empty</p>
                  <p className="text-xs">Add items from the payment list</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {Object.entries(cartState).map(([feeID, lineItem], i) => (
                      <div
                        key={`cart_item_${i}`}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/60"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">
                            {lineItem.name.split(":")[0]}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            Qty: {lineItem.quantity} • Plan: {lineItem.fee_plan}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            ₦{lineItem.subtotal.toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(feeID)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-emerald-600 dark:text-emerald-300">
                      ₦{cartSum.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={payWithPaystack}
                      disabled={!Object.keys(cartState).length}
                      className="w-full bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground hover:opacity-90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      size="lg"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Make Payment
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="w-full"
                      size="sm"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Items */}
      <div className="lg:col-span-8 space-y-6">
        {/* Fixed Fees */}
        <Card className="bg-card border border-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary" />
              Fixed Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!fixedDues || fixedDues.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No fixed fees available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fixedDues.map((due, i) => {
                  const rowID = `i-${i}`;
                  const addedToCart = rowInState(due.id, rowID);
                  return (
                    <div
                      key={rowID}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/60"
                    >
                      <div>
                        <h4 className="font-medium">{due.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          ₦{due.unit_price.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => addToCart(due, rowID)}
                        disabled={addedToCart}
                        variant={addedToCart ? "secondary" : "default"}
                        size="sm"
                        className={
                          addedToCart ? "" : "bg-primary hover:opacity-90"
                        }
                      >
                        {addedToCart ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Flexible Fees */}
        <Card className="bg-card border border-border shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Flexible Fees
              </CardTitle>
              <Select value={activePayPlan} onValueChange={handlePlanChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(payment_plan_options).map(
                    ([plan, planDetails]) => (
                      <SelectItem key={plan} value={plan}>
                        {planDetails.title}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {!flexibleDues[activePayPlan] ||
            flexibleDues[activePayPlan].length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  No flexible fees available for{" "}
                  {payment_plan_options[activePayPlan]?.title}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {(() => {
                  let lastRowItem: PaymentItem | null = null;
                  return flexibleDues[activePayPlan]?.map((due, i) => {
                    const rowID = `j-${i}`;
                    const addedToCart = rowInState(due.id, rowID);
                    const buttonEnabled = getButtonEnabled(
                      due,
                      rowID,
                      lastRowItem
                    );
                    lastRowItem = due;

                    return (
                      <div
                        key={rowID}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/60"
                      >
                        <div>
                          <h4 className="font-medium">{due.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ₦{due.unit_price.toLocaleString()}
                          </p>
                        </div>
                        <Button
                          onClick={() => addToCart(due, rowID, activePayPlan)}
                          disabled={addedToCart || !buttonEnabled}
                          variant={addedToCart ? "secondary" : "default"}
                          size="sm"
                          className={
                            addedToCart
                              ? ""
                              : "bg-primary hover:opacity-90 disabled:opacity-50"
                          }
                        >
                          {addedToCart ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Added
                            </>
                          ) : !buttonEnabled ? (
                            <>
                              <Clock className="w-4 h-4 mr-2" />
                              Pay Previous First
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Cart
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
