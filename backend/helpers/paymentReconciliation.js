const Payment = require("../models/Payment");
const Student = require("../models/Student");
const Fee = require("../models/Fee");
const https = require("https");
const { getPaymentAccount } = require("./utils");

// Global reconciliation locks to prevent simultaneous reconciliation
const reconciliationLocks = new Set();

/**
 * Main function to silently reconcile Paystack payments for a student
 * @param {Object} student - Student model instance
 * @param {number} institutionId - Institution ID
 * @returns {number} - Number of payments reconciled
 */
async function silentlyReconcilePaystackPayments(student, institutionId) {
  const studentId = student.get("id");
  const lockKey = `reconcile_${studentId}`;

  // Check if reconciliation is already in progress for this student
  if (reconciliationLocks.has(lockKey)) {
    console.log(
      `Reconciliation already in progress for student ${studentId}, skipping`
    );
    return 0;
  }

  // Acquire lock
  reconciliationLocks.add(lockKey);

  try {
    console.log(`Starting reconciliation for student: ${studentId}`);

    // Get user email
    const userEmail = student.related("user").get("email");
    if (!userEmail) {
      console.log("No email found for student, skipping reconciliation");
      return 0;
    }

    // Get institution's payment account secret key
    let paymentAccountData;
    try {
      paymentAccountData = await getPaymentAccount(institutionId);
    } catch (error) {
      console.log(
        `Payment account error for institution ${institutionId}:`,
        error.message
      );
      return 0;
    }

    const { secret_key } = paymentAccountData;
    if (!secret_key) {
      console.log("No secret key found");
      return 0;
    }

    console.log(
      `Key decrypted, length: ${secret_key.length}, type: ${typeof secret_key}`
    );

    // Fetch customer from Paystack
    const customer = await fetchPaystackCustomer(userEmail, secret_key);

    if (!customer) {
      console.log(`No Paystack customer found for email: ${userEmail}`);
      return 0; // No customer found, skip reconciliation
    }

    console.log(
      `Found Paystack customer: ${customer.customer_code} for ${userEmail}`
    );

    // Fetch all transactions for this customer
    let allTransactions = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const transactions = await fetchPaystackTransactions(
          customer.id,
          secret_key,
          page,
          100
        );

        if (transactions && Array.isArray(transactions)) {
          allTransactions.push(...transactions);

          hasMore = transactions.length === 100;
          console.log(
            `Fetched page ${page}: ${transactions.length} transactions`
          );
        } else {
          console.log(
            `Page ${page} returned invalid data, stopping pagination`
          );
          hasMore = false;
        }

        page++;
        if (page > 100) {
          console.log("Reached maximum page limit (100), stopping");
          break; // Safety check
        }
      } catch (error) {
        console.error(
          `Error fetching page ${page} for customer ${customer.id}: ${error.message}`
        );

        // If it's an EmptyResponse, we might have reached the end
        if (error.message === "EmptyResponse") {
          console.log("Empty response received, assuming end of data");
          hasMore = false;
        } else {
          // For other errors, stop the pagination
          console.log(`Stopping pagination due to error: ${error.message}`);
          hasMore = false;
        }
      }
    }

    console.log(`Found ${allTransactions.length} transactions from Paystack`);

    // Get existing payments for this student
    const existingPayments = await Payment.where(
      "student_id",
      student.get("id")
    )
      .where("processor", "paystack")
      .fetchAll();

    const existingReferences = new Set(
      existingPayments.models.map((payment) => payment.get("reference"))
    );

    // CRITICAL: Also check for any existing payments with the same reference across all students
    // This prevents duplicate references in the entire system
    const allExistingPayments = await Payment.where(
      "processor",
      "paystack"
    ).fetchAll();

    const allExistingReferences = new Set(
      allExistingPayments.models.map((payment) => payment.get("reference"))
    );

    // --- EARLY RETURN LOGIC ---
    // If number of transactions matches number of payments and all references match, skip further processing
    const transactionReferences = new Set(
      allTransactions.map((tx) => tx.reference)
    );
    if (
      allTransactions.length === existingPayments.length &&
      allTransactions.length > 0 &&
      [...transactionReferences].every((ref) => existingReferences.has(ref))
    ) {
      console.log(
        `Early return: All ${allTransactions.length} Paystack transactions already reconciled for student ${studentId}`
      );
      return 0;
    }
    // --- END EARLY RETURN LOGIC ---

    console.log(
      `Student ${student.get("id")} has ${
        existingReferences.size
      } existing payments`
    );
    console.log(
      `System has ${allExistingReferences.size} total Paystack payments`
    );

    // Get payables data for more accurate cart reconstruction
    const userForPayables = {
      role: "STUDENT",
      student: { id: student.get("id") },
      institution_id: institutionId,
    };

    let payablesData;
    try {
      // Call listPayables directly without mock objects to avoid reply function issues
      payablesData = await getStudentPayablesForReconciliation(userForPayables);
    } catch (error) {
      console.log("Could not fetch payables data:", error.message);
      payablesData = {
        fixedDues: [],
        flexibleDues: { full: [], monthly: [], semesterly: [], sessionly: [] },
      };
    }

    // Reconcile transactions silently
    let reconciledCount = 0;
    let skippedCount = 0;

    for (const transaction of allTransactions) {
      const reference = transaction.reference;

      // CRITICAL: Skip if payment already exists ANYWHERE in the system
      if (allExistingReferences.has(reference)) {
        skippedCount++;
        continue;
      }

      // Convert amount from kobo to naira
      const amount = (transaction.amount - transaction.fees) / 100;

      // Try to reconstruct cart from metadata or payables matching
      let reconstructedCart = await reconstructCartFromTransaction(
        transaction,
        amount,
        payablesData,
        student
      );

      // Create new payment record silently
      const paymentData = {
        student_id: student.get("id"),
        amount: amount,
        cart: reconstructedCart,
        institution_id: institutionId,
        department_id: student.get("department_id"),
        processor: "paystack",
        reference: reference,
        ip: "AUTO_RECONCILED",
        status: 1, // Mark as successful
        paid_at: new Date(transaction.paid_at),
        channel: transaction.channel,
        processor_currency: transaction.currency,
        processor_status: transaction.status,
        created_at: new Date(transaction.created_at),
        updated_at: new Date(),
      };

      try {
        // CRITICAL: Triple-check for duplicates before saving.
        // Use fetch({ require: false }) to return null instead of throwing an error if not found.
        const existingPayment = await Payment.where({
          reference: reference,
        }).fetch({ require: false });

        if (existingPayment) {
          console.log(
            `Payment with reference ${reference} already exists, skipping`
          );
          skippedCount++;
          continue;
        }

        console.log(
          `Reconciliation attempt for payment: ${reference} - amount: ₦${amount}`
        );
        const result = await Payment.forge(paymentData).save();
        console.log(
          `Reconciled payment: ${reference} for ₦${amount} - DB result ${result}`
        );
        reconciledCount++;
        console.log(
          `Successfully reconciled payment: ${reference} for ₦${amount}`
        );
      } catch (error) {
        // Silently continue with other payments but log detailed error info
        console.error(
          `Silent reconciliation error for ${reference}:`,
          error.message
        );
        console.error(`Error type: ${error.name || "Unknown"}`);
        console.error(
          `Error stack: ${
            error.stack ? error.stack.split("\n")[0] : "No stack"
          }`
        );
        console.error(
          `Transaction data: ${JSON.stringify({
            reference: transaction.reference,
            amount: transaction.amount,
            status: transaction.status,
            paid_at: transaction.paid_at,
          })}`
        );

        // If it's a duplicate key error, increment skipped count
        if (
          error.message &&
          (error.message.includes("duplicate") ||
            error.message.includes("UNIQUE"))
        ) {
          console.log(
            `Duplicate payment detected for ${reference}, incrementing skip count`
          );
          skippedCount++;
        }
      }
    }

    console.log(
      `Reconciliation complete for student ${studentId}: ${reconciledCount} new payments added, ${skippedCount} skipped (duplicates)`
    );
    return reconciledCount;
  } catch (error) {
    // Silently fail - don't let reconciliation errors affect the main payment list
    console.error("Silent Paystack reconciliation error:", error.message);
    return 0;
  } finally {
    // Always release the lock
    reconciliationLocks.delete(lockKey);
    console.log(`Released reconciliation lock for student ${studentId}`);
  }
}

/**
 * Function to fetch Paystack customer by email
 * @param {string} email - Customer email
 * @param {string} secretKey - Paystack secret key
 * @returns {Object|null} - Customer object or null
 */
async function fetchPaystackCustomer(email, secretKey) {
  return new Promise((resolve, reject) => {
    console.log(`Fetching Paystack customer for: ${email}`);

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

    const req = https.request(postOptions, (res) => {
      res.setEncoding("utf8");
      let body = "";

      res.on("data", (data) => {
        body += data;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(body);
          if (res.statusCode === 200 && response.status) {
            resolve(response.data);
          } else {
            // No customer found is not an error for reconciliation
            resolve(null);
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Function to fetch Paystack transactions for a customer
 * @param {number} customerId - Customer ID
 * @param {string} secretKey - Paystack secret key
 * @param {number} page - Page number
 * @param {number} perPage - Items per page
 * @returns {Array} - Array of transactions
 */
async function fetchPaystackTransactions(
  customerId,
  secretKey,
  page = 1,
  perPage = 100
) {
  return new Promise((resolve, reject) => {
    const postOptions = {
      host: "api.paystack.co",
      port: 443,
      path: `/transaction?customer=${customerId}&page=${page}&perPage=${perPage}&status=success`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(postOptions, (res) => {
      res.setEncoding("utf8");
      let body = "";

      res.on("data", (data) => {
        body += data;
      });

      res.on("end", () => {
        try {
          console.log(
            `Paystack API response status: ${res.statusCode}, body length: ${body.length}`
          );

          if (!body || body.trim() === "") {
            console.log(
              `Empty response from Paystack for customer ${customerId}, page ${page}, resolving with empty array.`
            );
            resolve([]); // Resolve with an empty array, not an error.
            return;
          }

          const response = JSON.parse(body);

          if (res.statusCode === 200 && response.status) {
            console.log(
              `Successfully fetched ${
                response.data ? response.data.length : 0
              } transactions for customer ${customerId}, page ${page}`
            );
            resolve(response.data || []);
          } else {
            console.log(
              `Paystack API error for customer ${customerId}: ${
                response.message || "Unknown error"
              }, status code: ${res.statusCode}`
            );
            reject(
              new Error(
                response.message ||
                  `Failed to fetch transactions: HTTP ${res.statusCode}`
              )
            );
          }
        } catch (error) {
          console.log(
            `JSON parse error for customer ${customerId}, page ${page}: ${error.message}`
          );
          console.log(
            `Raw response body: ${body.substring(0, 500)}${
              body.length > 500 ? "..." : ""
            }`
          );
          reject(new Error(`ParseError: ${error.message}`));
        }
      });
    });

    req.on("error", (error) => {
      console.log(
        `Network error fetching transactions for customer ${customerId}, page ${page}: ${error.message}`
      );
      reject(new Error(`NetworkError: ${error.message}`));
    });

    req.on("timeout", () => {
      console.log(`Request timeout for customer ${customerId}, page ${page}`);
      reject(new Error("RequestTimeout"));
    });

    // Set a timeout for the request
    req.setTimeout(30000); // 30 seconds

    req.end();
  });
}

/**
 * Get available fees for institution
 * @param {number} institution_id - Institution ID
 * @returns {Array} - Array of available fees
 */
async function getAvailableFees(institution_id) {
  let availableFees = await Fee.where({
    institution_id: +institution_id,
    active: true,
  })
    .orderBy("id", "ASC")
    .fetchAll();

  if (availableFees.models) availableFees = availableFees.models;
  availableFees = availableFees.map((fee) =>
    fee.attributes ? fee.attributes : fee
  );

  return availableFees;
}

/**
 * Simple helper function to get fees for reconciliation - no complex calculations
 * @param {Object} validatedUser - User object with role and student info
 * @returns {Object} - Payables data structure
 */
async function getStudentPayablesForReconciliation(validatedUser) {
  try {
    if (validatedUser.role == "STUDENT") {
      // Just get all active fees for the institution - keep it simple
      let availableFees = await getAvailableFees(validatedUser.institution_id);

      // Convert to simple payables structure
      let fixedDues = [];
      let flexibleDues = {
        full: [],
        monthly: [],
        semesterly: [],
        sessionly: [],
      };

      availableFees.forEach((fee) => {
        const {
          id,
          name,
          amount,
          monthly,
          semesterly,
          sessionly,
          monthly_parts,
          semesterly_parts,
          sessionly_parts,
        } = fee;

        // Fixed fees (no installment options)
        if (!monthly && !semesterly && !sessionly) {
          fixedDues.push({
            id,
            item_id: `fee_${id}`,
            name,
            unit_price: amount,
          });
        } else {
          // Flexible fees with installment options
          // Full payment
          flexibleDues.full.push({
            id,
            item_id: `fee_${id}_full`,
            name: `${name} (Full Payment)`,
            unit_price: amount,
          });

          // Monthly installments
          if (monthly && monthly_parts > 0) {
            const monthlyAmount = amount / monthly_parts;
            flexibleDues.monthly.push({
              id,
              item_id: `fee_${id}_monthly`,
              name: `${name}: Monthly Payment`,
              unit_price: monthlyAmount,
            });
          }

          // Semesterly installments
          if (semesterly && semesterly_parts > 0) {
            const semesterlyAmount = amount / semesterly_parts;
            flexibleDues.semesterly.push({
              id,
              item_id: `fee_${id}_semesterly`,
              name: `${name}: Semesterly Payment`,
              unit_price: semesterlyAmount,
            });
          }

          // Sessionly installments
          if (sessionly && sessionly_parts > 0) {
            const sessionlyAmount = amount / sessionly_parts;
            flexibleDues.sessionly.push({
              id,
              item_id: `fee_${id}_sessionly`,
              name: `${name}: Sessionly Payment`,
              unit_price: sessionlyAmount,
            });
          }
        }
      });

      console.log(
        `Simple payables fetch: ${fixedDues.length} fixed fees, ${
          Object.values(flexibleDues).flat().length
        } flexible fees`
      );

      return { fixedDues, flexibleDues };
    }
  } catch (error) {
    console.error("Error in getStudentPayablesForReconciliation:", error);
    throw error;
  }
}

/**
 * Reconstruct cart from transaction data and payables matching
 * @param {Object} transaction - Paystack transaction object
 * @param {number} amount - Transaction amount in Naira
 * @param {Object} payablesData - Student payables data
 * @param {Object} student - Student model instance
 * @returns {string} - JSON string of reconstructed cart
 */
async function reconstructCartFromTransaction(
  transaction,
  amount,
  payablesData,
  student
) {
  try {
    // First try to get cart from metadata if available
    if (transaction.metadata && transaction.metadata.cart_items) {
      console.log(
        `Cart reconstructed from metadata for ${transaction.reference}`
      );
      return transaction.metadata.cart_items;
    }

    // Try to find matching fee combinations from payables
    const matchingCombinations = await findPossibleFeeCombinationsFromPayables(
      amount,
      payablesData,
      student,
      transaction
    );

    if (matchingCombinations.length > 0) {
      const bestMatch = matchingCombinations[0];
      console.log(
        `Cart reconstructed from payables matching for ${transaction.reference}: ${bestMatch.description}`
      );
      return JSON.stringify(bestMatch.cart);
    }

    // Fallback cart structure
    console.log(
      `Using fallback cart for ${transaction.reference} - no fee combinations found within ±1% range`
    );
    return JSON.stringify([
      {
        name: "Payment via Paystack (Auto-reconciled - Fallback)",
        amount: amount,
        reference: transaction.reference,
        note: "Original cart structure could not be determined with 1% accuracy. Future payments will include metadata for precise reconciliation.",
        estimated_processor_fee: (amount * 0.015 + 100).toFixed(2),
        fallback_reason: "No fee combinations found within ±1% tolerance",
      },
    ]);
  } catch (error) {
    console.error(`Error reconstructing cart: ${error.message}`);
    return JSON.stringify([
      {
        name: "Payment via Paystack (Reconciliation Error)",
        amount: amount,
        reference: transaction.reference,
        error: error.message,
      },
    ]);
  }
}

/**
 * Function to find possible fee combinations using payables data structure
 * @param {number} targetAmount - Target amount to match
 * @param {Object} payablesData - Payables data structure
 * @param {Object} student - Student model instance
 * @returns {Array} - Array of possible combinations sorted by best match
 */
async function findPossibleFeeCombinationsFromPayables(
  targetAmount,
  payablesData,
  student,
  transaction = null
) {
  const combinations = [];

  // Use actual processor fee from transaction if available, otherwise estimate
  const estimatedProcessorFee = transaction?.fees
    ? transaction.fees / 100
    : targetAmount * 0.015 + 100;
  const estimatedOriginalAmount = targetAmount;

  // Allow 1% variation to account for fee calculation differences and combinations
  const variationPercent = 0.01; // 1%
  const minAmount = estimatedOriginalAmount * (1 - variationPercent);
  const maxAmount = estimatedOriginalAmount * (1 + variationPercent);

  console.log(`Paystack amount: ₦${targetAmount}`);
  console.log(`Estimated processor fee: ₦${estimatedProcessorFee.toFixed(2)}`);
  console.log(
    `Estimated original amount: ₦${estimatedOriginalAmount.toFixed(2)}`
  );
  console.log(
    `Search range: ₦${minAmount.toFixed(2)} - ₦${maxAmount.toFixed(2)} (±1%)`
  );

  // Get student's existing payments to avoid suggesting already paid fees
  const existingPayments = await Payment.where("student_id", student.get("id"))
    .where("status", 1)
    .fetchAll();

  const paidItems = new Set();
  existingPayments.models.forEach((payment) => {
    const cart = payment.get("cart");
    if (cart && typeof cart === "object") {
      Object.values(cart).forEach((lineItem) => {
        if (lineItem.item_id) {
          paidItems.add(lineItem.item_id);
        }
      });
    }
  });

  console.log(`Paid items to exclude: ${Array.from(paidItems).join(", ")}`);

  // Create a comprehensive list of all available fees
  const allAvailableFees = [];

  // Add fixed fees
  payablesData.fixedDues.forEach((fee) => {
    if (!paidItems.has(fee.item_id)) {
      allAvailableFees.push({
        id: fee.id,
        item_id: fee.item_id,
        name: fee.name,
        unit_price: parseFloat(fee.unit_price),
        fee_plan: null, // Fixed fees don't have plans
      });
    }
  });

  // Add flexible fees for each plan
  Object.entries(payablesData.flexibleDues).forEach(([planType, fees]) => {
    fees.forEach((fee) => {
      if (!paidItems.has(fee.item_id)) {
        allAvailableFees.push({
          id: fee.id,
          item_id: fee.item_id,
          name: fee.name,
          unit_price: parseFloat(fee.unit_price),
          fee_plan: planType === "full" ? null : planType,
        });
      }
    });
  });

  console.log(`Available fees for matching: ${allAvailableFees.length}`);

  // Helper function to check if amount is within acceptable range
  const isWithinRange = (amount) => amount >= minAmount && amount <= maxAmount;

  // Try single fee matches first (highest score)
  allAvailableFees.forEach((fee) => {
    if (isWithinRange(fee.unit_price)) {
      const cart = {};
      cart[fee.id] = {
        quantity: 1,
        name: fee.name,
        unit_price: fee.unit_price,
        item_id: fee.item_id,
      };

      if (fee.fee_plan) {
        cart[fee.id].fee_plan = fee.fee_plan;
      }

      const matchPercent = Math.abs(
        ((fee.unit_price - estimatedOriginalAmount) / estimatedOriginalAmount) *
          100
      );
      combinations.push({
        score: 100 - matchPercent, // Higher score for closer matches
        cart: cart,
        description: `Single fee: ${fee.name} (₦${
          fee.unit_price
        }) - ${matchPercent.toFixed(1)}% variation`,
      });
    }
  });

  // Try two-fee combinations
  for (let i = 0; i < allAvailableFees.length; i++) {
    for (let j = i + 1; j < allAvailableFees.length; j++) {
      const fee1 = allAvailableFees[i];
      const fee2 = allAvailableFees[j];

      const combinedAmount = fee1.unit_price + fee2.unit_price;
      if (isWithinRange(combinedAmount)) {
        const cart = {};

        cart[fee1.id] = {
          quantity: 1,
          name: fee1.name,
          unit_price: fee1.unit_price,
          item_id: fee1.item_id,
        };

        if (fee1.fee_plan) cart[fee1.id].fee_plan = fee1.fee_plan;

        cart[fee2.id] = {
          quantity: 1,
          name: fee2.name,
          unit_price: fee2.unit_price,
          item_id: fee2.item_id,
        };

        if (fee2.fee_plan) cart[fee2.id].fee_plan = fee2.fee_plan;

        const matchPercent = Math.abs(
          ((combinedAmount - estimatedOriginalAmount) /
            estimatedOriginalAmount) *
            100
        );

        combinations.push({
          score: 99 - matchPercent, // Slightly lower base score for combinations
          cart: cart,
          description: `Two fees: ${fee1.name} + ${
            fee2.name
          } (₦${combinedAmount}) - ${matchPercent.toFixed(1)}% variation`,
        });
      }
    }
  }

  // Try three-fee combinations
  for (let i = 0; i < allAvailableFees.length; i++) {
    for (let j = i + 1; j < allAvailableFees.length; j++) {
      for (let k = j + 1; k < allAvailableFees.length; k++) {
        const fee1 = allAvailableFees[i];
        const fee2 = allAvailableFees[j];
        const fee3 = allAvailableFees[k];

        const combinedAmount =
          fee1.unit_price + fee2.unit_price + fee3.unit_price;
        if (isWithinRange(combinedAmount)) {
          const cart = {};

          cart[fee1.id] = {
            quantity: 1,
            name: fee1.name,
            unit_price: fee1.unit_price,
            item_id: fee1.item_id,
          };

          if (fee1.fee_plan) cart[fee1.id].fee_plan = fee1.fee_plan;

          cart[fee2.id] = {
            quantity: 1,
            name: fee2.name,
            unit_price: fee2.unit_price,
            item_id: fee2.item_id,
          };

          if (fee2.fee_plan) cart[fee2.id].fee_plan = fee2.fee_plan;

          cart[fee3.id] = {
            quantity: 1,
            name: fee3.name,
            unit_price: fee3.unit_price,
            item_id: fee3.item_id,
          };

          if (fee3.fee_plan) cart[fee3.id].fee_plan = fee3.fee_plan;

          const matchPercent = Math.abs(
            ((combinedAmount - estimatedOriginalAmount) /
              estimatedOriginalAmount) *
              100
          );

          combinations.push({
            score: 98 - matchPercent, // Even lower base score for three-fee combinations
            cart: cart,
            description: `Three fees: ${fee1.name} + ${fee2.name} + ${
              fee3.name
            } (₦${combinedAmount}) - ${matchPercent.toFixed(1)}% variation`,
          });
        }
      }
    }
  }

  // Sort by score (best matches first)
  combinations.sort((a, b) => b.score - a.score);

  if (combinations.length > 0) {
    console.log(
      `Found ${combinations.length} possible combinations within ±1% range. Best match: ${combinations[0].description}`
    );
  } else {
    console.log(
      `No combinations found within ±1% range for ₦${targetAmount} (estimated original: ₦${estimatedOriginalAmount.toFixed(
        2
      )})`
    );
  }

  return combinations;
}

module.exports = {
  silentlyReconcilePaystackPayments,
  fetchPaystackCustomer,
  fetchPaystackTransactions,
  getStudentPayablesForReconciliation,
  reconstructCartFromTransaction,
  findPossibleFeeCombinationsFromPayables,
  getAvailableFees,
};
