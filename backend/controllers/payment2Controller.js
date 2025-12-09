const boom = require("boom");
const Payment = require("../models/Payment");
const Student = require("../models/Student");
const Programme = require("../models/Programme");
const Fee = require("../models/Fee");
const https = require("https");
const url = require("url");
const crypto = require("crypto");
const {
  silentlyReconcilePaystackPayments,

  getAvailableFees,
} = require("../helpers/paymentReconciliation");
const getMySessionsAndSemesters =
  require("../helpers/utils").getMySessionsAndSemesters;
const getPaymentAccount = require("../helpers/utils").getPaymentAccount;
const serverEnv = process.env.SERVER_ENV;

const {
  checkAccess,
  setPaginationHeaders,
  generateStudentRegNo2,
  getLastRegNoStudent,
  intRange,
  ucfirst,
} = require("../helpers/utils");
const { start } = require("nprogress");

const getProcessorInfo = (processor, reference, rrr) => {
  let processors = {};
  let sha512 = crypto.createHash("sha512");
  processors.remita.secret = processors.remita.liveSecretKey;
  processors.remita.hash = sha512
    .update(
      rrr + processors.remita.apiKey + processors.remita.merchantId,
      "utf-8"
    )
    .digest("hex");
  processors.remita.url = `https://login.remita.net/remita/ecomm/${processors.remita.merchantId}/${rrr}/${processors.remita.hash}/status.reg`;

  return processors[processor];
};

const planTypes = ["full", "monthly", "semesterly", "sessionly"];

// Global reconciliation locks to prevent simultaneous reconciliation
const reconciliationLocks = new Set();

// Get all Payments made
exports.list = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  // Silent Paystack reconciliation for students
  if (validatedUser.role === "STUDENT") {
    try {
      const student = await Student.where("id", validatedUser.student.id).fetch(
        {
          withRelated: ["user"],
        }
      );

      if (student) {
        await silentlyReconcilePaystackPayments(
          student,
          validatedUser.institution_id
        )
          .then((reconciledCount) => {
            // Update the updated_at timestamp by touching the record
            if (reconciledCount > 0) {
              const now = new Date();
              student.set("updated_at", now);
              student.save().catch((error) => {
                console.error(
                  "Could not update reconciliation timestamp:",
                  error.message
                );
              });
            }
          })
          .catch((error) => {
            // Log error silently without affecting the main response
            console.error(
              "Background Paystack reconciliation failed:",
              error.message
            );
          });
      }
    } catch (error) {
      // Silently handle any errors - don't affect the main payment list
      console.error("Error preparing Paystack reconciliation:", error.message);
    }
  }

  let query = Payment.forge().orderBy("created_at", "desc"),
    withRelated = ["student.user"],
    payments = [];

  if (validatedUser.role == "STUDENT") {
    query.where("student_id", +validatedUser.student.id);
    withRelated = [];
  } else if (validatedUser.role == "STAFF") {
    // STAFF can see all payments in their institution (same as ADMIN, but no analytics)
    query.where("institution_id", +validatedUser.institution_id);
  } else if (validatedUser.role == "HOD") {
    query.where("department_id", +validatedUser.staff.department_id);
  } else if (validatedUser.role == "ADMIN") {
    query.where("institution_id", +validatedUser.institution_id);
  } else if (validatedUser.role == "SUPERADMIN") {
    // Don't filter - SUPERADMIN sees all payments
  } else {
    // Incase we add a new role and forget to filter ;)
    throw boom.boomify("Improper access");
  }

  // Extract query parameters with better defaults for admin pages
  const {
    pgsize: rawPgsize = validatedUser.role === "ADMIN" ||
    validatedUser.role === "SUPERADMIN"
      ? 10
      : 10,
    pg = 1,
    email,
    status,
    processor,
    dateFrom,
    dateTo,
    minAmount,
    maxAmount,
    ...req_query
  } = req.query;

  // Store filter state for auto-reconciliation after we get the main results
  const hasFilters =
    email ||
    status !== "all" ||
    processor !== "all" ||
    dateFrom ||
    dateTo ||
    minAmount ||
    maxAmount;

  // Force pgsize to 10 for initial load to fix the issue
  const pgsize = 10;

  // Apply basic filters
  if (filterKey && filterValue) {
    query.where(filterKey, filterValue);
  } else if (Object.keys(req_query).length > 0) {
    query.where(req_query);
  }

  // Backend filtering for admin pages to reduce data transfer
  if (
    validatedUser.role === "ADMIN" ||
    validatedUser.role === "SUPERADMIN" ||
    validatedUser.role === "STAFF"
  ) {
    // For email filtering, we'll fetch with relations and filter in memory
    // This avoids complex joins and uses Bookshelf's relationship system
    if (
      email ||
      status !== "all" ||
      processor !== "all" ||
      dateFrom ||
      dateTo ||
      minAmount ||
      maxAmount
    ) {
      // We need to include student.user relation when filtering by email
      if (email && !withRelated.includes("student.user")) {
        withRelated = ["student.user"];
      }
    }

    // Status filter
    if (status && status !== "all") {
      query.where("status", parseInt(status));
    }

    // Processor filter
    if (processor && processor !== "all") {
      query.where("processor", processor);
    }

    // Date range filter
    if (dateFrom) {
      query.where("created_at", ">=", new Date(dateFrom));
    }

    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999); // End of day
      query.where("created_at", "<=", endDate);
    }

    // Amount range filter
    if (minAmount) {
      query.where("amount", ">=", parseFloat(minAmount));
    }

    if (maxAmount) {
      query.where("amount", "<=", parseFloat(maxAmount));
    }
  }

  try {
    payments = await query.fetchPage({
      pageSize: parseInt(pgsize),
      page: parseInt(pg),
      withRelated,
    });

    // Post-process filtering for email (using Bookshelf relationships)
    if (
      email &&
      (validatedUser.role === "ADMIN" ||
        validatedUser.role === "SUPERADMIN" ||
        validatedUser.role === "STAFF")
    ) {
      if (payments.models) {
        payments.models = payments.models.filter((payment) => {
          const student = payment.related("student");
          if (student && student.related("user")) {
            const userEmail = student.related("user").get("email");
            return (
              userEmail && userEmail.toLowerCase().includes(email.toLowerCase())
            );
          }
          return false;
        });

        // Update pagination to reflect filtered results
        if (payments.pagination) {
          payments.pagination.rowCount = payments.models.length;
        }
      }
    }

    let analytics = null;

    // For admin/superadmin only, include analytics data for the first page
    if (
      (validatedUser.role === "ADMIN" || validatedUser.role === "SUPERADMIN") &&
      parseInt(pg) === 1
    ) {
      try {
        // Build analytics query without pagination using Bookshelf relationships
        let analyticsQuery = Payment.forge().orderBy("created_at", "desc");

        // Apply the same role-based filtering for analytics
        if (validatedUser.role == "ADMIN") {
          analyticsQuery.where("institution_id", +validatedUser.institution_id);
        }

        // Apply the same non-email filters for analytics
        if (status && status !== "all") {
          analyticsQuery.where("status", parseInt(status));
        }

        if (processor && processor !== "all") {
          analyticsQuery.where("processor", processor);
        }

        if (dateFrom) {
          analyticsQuery.where("created_at", ">=", new Date(dateFrom));
        }

        if (dateTo) {
          const endDate = new Date(dateTo);
          endDate.setHours(23, 59, 59, 999);
          analyticsQuery.where("created_at", "<=", endDate);
        }

        if (minAmount) {
          analyticsQuery.where("amount", ">=", parseFloat(minAmount));
        }

        if (maxAmount) {
          analyticsQuery.where("amount", "<=", parseFloat(maxAmount));
        }

        // Fetch all matching payments for analytics with relationships if email filter needed
        const analyticsWithRelated = email ? ["student.user"] : [];
        const allPayments = await analyticsQuery.fetchAll({
          withRelated: analyticsWithRelated,
        });

        // Filter by email using Bookshelf relationships if needed
        let filteredPayments = allPayments.models;
        if (email) {
          filteredPayments = allPayments.models.filter((payment) => {
            const student = payment.related("student");
            if (student && student.related("user")) {
              const userEmail = student.related("user").get("email");
              return (
                userEmail &&
                userEmail.toLowerCase().includes(email.toLowerCase())
              );
            }
            return false;
          });
        }

        // Calculate analytics using filtered payments
        const monthlyRevenue = {};
        const statusBreakdown = { completed: 0, pending: 0 };
        let totalRevenue = 0;
        let totalPayments = filteredPayments.length;

        filteredPayments.forEach((payment) => {
          const month = new Date(payment.get("created_at")).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "short",
            }
          );

          if (!monthlyRevenue[month]) {
            monthlyRevenue[month] = { count: 0, amount: 0 };
          }

          monthlyRevenue[month].count += 1;

          if (payment.get("status") === 1) {
            const amount = parseFloat(payment.get("amount")) || 0;
            monthlyRevenue[month].amount += amount;
            totalRevenue += amount;
            statusBreakdown.completed += 1;
          } else {
            statusBreakdown.pending += 1;
          }
        });

        analytics = {
          monthlyRevenue,
          statusBreakdown,
          totalRevenue,
          totalPayments,
        };
      } catch (analyticsError) {
        console.error("Error generating analytics:", analyticsError);
        analytics = null;
      }
    }

    if (payments.pagination) setPaginationHeaders(reply, payments.pagination);

    const paginationData = payments.pagination;
    if (payments.models) payments = payments.models;

    // Auto-trigger reconciliation for filtered searches using actual results (Admin/SuperAdmin only)
    if (
      hasFilters &&
      (validatedUser.role === "ADMIN" ||
        validatedUser.role === "SUPERADMIN" ||
        validatedUser.role === "STAFF") &&
      payments &&
      payments.length > 0
    ) {
      // Run reconciliation synchronously so results are included in response
      try {
        console.log(
          `Auto-triggering reconciliation for ${payments.length} payment results...`
        );

        // Extract unique students from the search results using ORM relationships
        const uniqueStudents = new Map();

        for (const payment of payments) {
          const studentId = payment.get
            ? payment.get("student_id")
            : payment.student_id;

          if (studentId && !uniqueStudents.has(studentId)) {
            try {
              // Use ORM to fetch student with user relationship only (no institution relationship needed)
              const student = await Student.where("id", studentId).fetch({
                withRelated: ["user"],
              });

              if (student) {
                // Get institution_id from student.user since that's where it's stored
                const user = student.related("user");
                const institutionId = user ? user.get("institution_id") : null;

                if (institutionId) {
                  uniqueStudents.set(studentId, student);
                  console.log(
                    `Found student ${studentId} with institution ${institutionId} from user`
                  );
                } else {
                  console.warn(
                    `Student ${studentId} user has no institution_id, skipping`
                  );
                }
              }
            } catch (studentFetchError) {
              console.error(
                `Error fetching student ${studentId}:`,
                studentFetchError.message
              );
            }
          }
        }

        console.log(
          `Found ${uniqueStudents.size} unique students from search results`
        );

        // Limit to 5 students for performance (reduced since it's synchronous)
        const studentsToReconcile = Array.from(uniqueStudents.values()).slice(
          0,
          5
        );
        let reconciledTotal = 0;

        for (const student of studentsToReconcile) {
          try {
            // Check if reconciliation was done recently (within last 1 hour for auto-reconciliation)
            const lastUpdate = student.get("updated_at");
            const oneHourAgo = new Date();
            oneHourAgo.setHours(oneHourAgo.getHours() - 1);

            if (lastUpdate && new Date(lastUpdate) > oneHourAgo) {
              console.log(
                `Skipping auto-reconciliation for student ${student.get(
                  "id"
                )} - reconciled recently`
              );
              continue;
            }

            console.log(
              `Auto-reconciling student: ${student
                .related("user")
                .get("email")}`
            );

            // Get institution ID from user since that's where it's stored
            const userInstitutionId = student
              .related("user")
              .get("institution_id");
            const studentInstitutionId =
              validatedUser.role === "ADMIN"
                ? validatedUser.institution_id
                : userInstitutionId;

            console.log(
              `Using institution ID: ${studentInstitutionId} for student ${student.get(
                "id"
              )} (from user: ${userInstitutionId})`
            );

            // Validate institution ID before proceeding
            if (!studentInstitutionId) {
              console.error(
                `No institution ID available for student ${student.get(
                  "id"
                )}, skipping reconciliation`
              );
              continue;
            }

            const reconciledCount = await silentlyReconcilePaystackPayments(
              student,
              studentInstitutionId
            );

            if (reconciledCount > 0) {
              reconciledTotal += reconciledCount;
              // Update timestamp using ORM
              student.set("updated_at", new Date());
              await student.save();
              console.log(
                `Auto-reconciled ${reconciledCount} payments for student ${student.get(
                  "id"
                )}`
              );
            }
          } catch (reconcileError) {
            console.error(
              `Error auto-reconciling student ${student.get("id")}:`,
              reconcileError.message
            );
          }
        }

        if (reconciledTotal > 0) {
          console.log(
            `Auto-reconciliation completed: ${reconciledTotal} total payments updated across ${studentsToReconcile.length} students`
          );

          // Re-fetch payments to include newly reconciled ones
          console.log("Re-fetching payments to include reconciled results...");

          // Re-run the same query to get updated results
          const updatedPayments = await query.fetchPage({
            pageSize: parseInt(pgsize),
            page: parseInt(pg),
            withRelated,
          });

          // Apply the same post-processing for email filtering
          if (
            email &&
            (validatedUser.role === "ADMIN" ||
              validatedUser.role === "SUPERADMIN" ||
              validatedUser.role === "STAFF")
          ) {
            if (updatedPayments.models) {
              updatedPayments.models = updatedPayments.models.filter(
                (payment) => {
                  const student = payment.related("student");
                  if (student && student.related("user")) {
                    const userEmail = student.related("user").get("email");
                    return (
                      userEmail &&
                      userEmail.toLowerCase().includes(email.toLowerCase())
                    );
                  }
                  return false;
                }
              );

              // Update pagination to reflect filtered results
              if (updatedPayments.pagination) {
                updatedPayments.pagination.rowCount =
                  updatedPayments.models.length;
              }
            }
          }

          // Update payments and pagination with fresh data
          payments = updatedPayments;
          if (payments.pagination)
            setPaginationHeaders(reply, payments.pagination);

          const updatedPaginationData = payments.pagination;
          if (payments.models) payments = payments.models;

          // Return updated payments with analytics for admin users
          if (analytics) {
            return {
              payments: payments,
              pagination: updatedPaginationData,
              analytics: analytics,
            };
          }

          return payments;
        } else {
          console.log(
            "Auto-reconciliation completed: No new payments found to reconcile"
          );
        }
      } catch (autoReconcileError) {
        console.error("Auto-reconciliation error:", autoReconcileError.message);
        // Continue with original results if reconciliation fails
      }
    }

    // Return payments with analytics for admin users only
    if (analytics) {
      return {
        payments: payments,
        pagination: paginationData,
        analytics: analytics,
      };
    }

    // For STAFF and other users, return payments with pagination but no analytics
    return {
      payments: payments,
      pagination: paginationData,
    };
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.listPayables = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  const planCodes = { monthly: "m", semesterly: "sm", sessionly: "ss" };

  if (validatedUser.role == "STUDENT") {
    // Get all sessions and semesters since I joined
    const { mySessions, mySemesters } = await getMySessionsAndSemesters(
      validatedUser
    );
    const feesById = {};

    // Get all active fees for my institution
    // Future: Filter this down to my program
    let availableFees = await getAvailableFees(validatedUser.institution_id);
    availableFees.forEach((fee) => {
      feesById[fee.id] = fee;
    });

    // Get all payments I've made before
    const paidReq = { ...req, query: { ...req.query, status: 1 } };
    let completedPayments = await exports.list(paidReq, reply);

    // Extract payments array from the new response structure
    if (completedPayments && completedPayments.payments) {
      completedPayments = completedPayments.payments;
    } else if (!Array.isArray(completedPayments)) {
      completedPayments = [];
    }

    // Get expiry date of payments made for each flexible fee type
    //const expiries = getPaymentExpiries(completedPayments)

    // Get coverage of payments made for each flexible fee type
    const paidCoverage = getPaymentsCoverage(completedPayments, feesById);

    const flexibleFees = availableFees.filter((fee) => {
      return fee.monthly || fee.semesterly || fee.sessionly ? true : false;
    });
    let fixedDues = availableFees.filter((fee) => {
      return !(fee.monthly || fee.semesterly || fee.sessionly) ? true : false;
    });
    fixedDues = fixedDues.map((fixedDue) => {
      const { id, name, amount } = fixedDue;
      return { id, name, unit_price: amount, item_id: id };
    });
    const flexibleDues = {};

    let myJoinDate = mySemesters[0].start_date;
    if (typeof myJoinDate == "string") myJoinDate = new Date(myJoinDate);

    planTypes.forEach((planType) => {
      if (!(planType in flexibleDues)) flexibleDues[planType] = [];
      flexibleFees.forEach((fee) => {
        let dueItems = [],
          id = fee.id,
          item_id = "",
          name = "",
          unit_price = fee[planType],
          maxLength = planType == "full" ? 1 : fee[`${planType}_parts`],
          coverage = (paidCoverage[id] && paidCoverage[id][planType]) || 0;

        if (coverage >= maxLength) return; // Payment is complete

        if (planType == "full") {
          name = fee.name;
          dueItems = [{ id, name, unit_price: fee.amount, item_id: id }];
        } else {
          if (!unit_price) return;

          let planPaySequence = intRange(coverage + 1, maxLength),
            period = planType.slice(0, -2);

          dueItems = planPaySequence.map((seq) => {
            let seqStr = seq < 10 ? `0${seq}` : seq;
            name = `${fee.name}: ${ucfirst(period)} ${seq}/${maxLength}`;
            item_id = `${id}${planCodes[planType]}${seqStr}`;
            return { id, name, unit_price, item_id };
          });
        }

        flexibleDues[planType].push(...dueItems);
      });
    });

    return { fixedDues, flexibleDues };
  }
};

exports.get = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const payment = await Payment.where("id", req.params.id).fetch({
      withRelated: ["student.user", "department", "institution"],
    });

    return payment;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.add = async (req, reply) => {
  const allowedRoles = ["STUDENT"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  const clientData = req.body;
  if (!(clientData.processor && clientData.reference)) throw "improper request";

  let payment;
  const rrr = clientData.rrr;

  delete clientData.rrr;

  const preSave = await preSavePayData(clientData, validatedUser);

  const { secret_key } = await getPaymentAccount(+validatedUser.institution_id);

  const processorInfo = getProcessorInfo(
    clientData.processor,
    clientData.reference,
    rrr || null
  );

  const processorUrlParts = url.parse(processorInfo.url, true);

  const postOptions = {
    host: processorUrlParts.host,
    port: 443,
    path: processorUrlParts.path,
    method: "GET",
  };

  if (clientData.processor == "paystack") {
    postOptions.headers = {
      Authorization: ` Bearer ${secret_key}`,
    };
  }

  https.get(postOptions, (res) => {
    res.setEncoding("utf8");
    let body = "",
      processorResponseData = {};

    res.on("data", (data) => {
      body += data;
    });

    res.on("end", async () => {
      body = JSON.parse(body);

      // Translate each processor's response to our DB's format
      if (clientData.processor == "paystack") {
        const {
          ip_address: ip,
          currency: processor_currency,
          channel,
          created_at,
          paid_at: paid_at_str,
          gateway_response,
          message,
          amount,
          reference: processor_reference,
          status: processor_status,
        } = (body && body.data) || {};

        const paid_at =
          processor_status == "success" ? new Date(paid_at_str) : null;

        if (processor_reference) {
          processorResponseData = {
            ip,
            status: processor_status == "success" ? 1 : 0,
            paid_at,
            channel,
            processor_currency,
            processor_status,
          };
        }
      } else if (clientData.processor == "remita") {
        const {
          // ip_address: ip,
          // channel,
          amount,
          message,
          orderID,

          paymentDate: paid_at_str,

          RRR: processor_reference,
          status: processor_status,
        } = body || {};

        const paid_at = processor_status == "01" ? new Date(paid_at_str) : null;

        if (processor_reference) {
          processorResponseData = {
            ip: "REMITA",
            status: processor_status == "01" ? 1 : 0,
            paid_at,
            channel: "RemitaRRR: " + processor_reference,
            processor_currency: "NGN",
            processor_status,
          };
        }
      }

      if (processorResponseData && processorResponseData.processor_status) {
        payment = await completeSavedPayment(
          clientData.reference,
          validatedUser,
          processorResponseData
        );
      }

      return payment;
    });
  });
};

exports.update = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const payment = await Payment.where("id", req.params.id).fetch();
    if (payment) {
      payment.set(req.body);
      await payment.save();
    }

    return payment;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.loadRegNos = async (req, reply) => {
  const session_id = 3,
    studentIDRegNos = {},
    regNoFormat = "PG/MBA/DL/20/"; // shortcut since we know the problem only happened this session

  let student,
    updatedStudents = [],
    lastSerialNumber = 0,
    numUpdated = 0;

  let lastRegNoStudent = await getLastRegNoStudent(session_id);
  if (lastRegNoStudent) {
    lastSerialNumber = +lastRegNoStudent.get("reg_no").split("/").slice(-1)[0];
  }

  // Fetch all payment records that include acceptance fees
  const paymentsStructure = await new Payment()
    .query((qb) => {
      qb.whereRaw(`CAST(cart AS text) ilike '%acceptance fee%'`),
        qb.where("status", "=", 1);
    })
    .orderBy("paid_at", "asc")
    .fetchAll({
      withRelated: ["student"],
    });

  const payments = paymentsStructure.models;

  for (let payment of payments) {
    student =
      (payment && payment.relations && payment.relations.student) || null;
    studentAttribs = student.attributes;
    if (studentAttribs.session_admitted_id != session_id) continue; // shortcut since we know the problem only happened during session id 3
    if (!!studentAttribs.reg_no) continue;
    if (studentAttribs.id in studentIDRegNos) continue; // ensure unique

    studentIDRegNos[studentAttribs.id] = regNoFormat + (lastSerialNumber + 1);

    lastSerialNumber++;
  }

  // for (let student_id in studentIDRegNos) {
  //   let myRegNo = studentIDRegNos[student_id]
  //   let updatedStudent = await Student
  //     .where("id", student_id)
  //     .save({reg_no: myRegNo}, {patch: true})

  //     if (updatedStudent && updatedStudent.get("reg_no") == myRegNo) updatedStudents.push(updatedStudent)
  // }

  let notif = updatedStudents.length + " updated";
  console.log(notif);
  //console.log(updatedStudents.models, studentIDRegNos)
  return [notif, studentIDRegNos];
};

exports.reconcileAll = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  let reconciledCount = 0;
  let processedStudents = 0;
  const errors = [];

  try {
    // Get students with payment activity (last 90 days instead of 30) to expand scope
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Use Bookshelf to find students with payments
    let studentsQuery = Student.forge();

    if (validatedUser.role === "ADMIN") {
      studentsQuery = studentsQuery.where(
        "institution_id",
        validatedUser.institution_id
      );
    }

    // Get all students and then filter those with payment activity using Bookshelf
    const allStudents = await studentsQuery.fetchAll({
      withRelated: ["user"],
    });

    // Get all payments (not just paystack) to identify which students have payment activity
    let paymentsQuery = Payment.forge().where(
      "created_at",
      ">=",
      ninetyDaysAgo.toISOString()
    );
    // Removed processor filter to include all payment processors

    if (validatedUser.role === "ADMIN") {
      paymentsQuery = paymentsQuery.where(
        "institution_id",
        validatedUser.institution_id
      );
    }

    const recentPayments = await paymentsQuery.fetchAll();
    const studentIdsWithRecentPayments = new Set(
      recentPayments.models.map((payment) => payment.get("student_id"))
    );

    // Filter students to only those with payment activity
    const studentsWithRecentPayments = allStudents.models.filter((student) =>
      studentIdsWithRecentPayments.has(student.get("id"))
    );

    const maxStudents = 25; // Reduced to 25 for better reliability
    const limitedStudents = studentsWithRecentPayments.slice(0, maxStudents);

    console.log(
      `Starting limited reconciliation for ${limitedStudents.length} students (limited from ${studentsWithRecentPayments.length} total with payment activity in last 90 days)`
    );

    // Process students one by one with longer delays to respect rate limits
    for (const student of limitedStudents) {
      try {
        processedStudents++;
        const studentInstitutionId =
          validatedUser.role === "ADMIN"
            ? validatedUser.institution_id
            : student.get("institution_id");

        // Check if reconciliation was done recently (within last 2 hours instead of 12)
        const lastUpdate = student.get("updated_at");
        const twoHoursAgo = new Date();
        twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);

        if (lastUpdate && new Date(lastUpdate) > twoHoursAgo) {
          console.log(
            `Skipping student ${student.get("id")} - reconciled recently`
          );
          continue;
        }

        console.log(`Processing student ${student.get("id")}...`);

        const reconciled = await silentlyReconcilePaystackPayments(
          student,
          studentInstitutionId
        );

        if (reconciled > 0) {
          reconciledCount += reconciled;
          // Update timestamp
          const now = new Date();
          student.set("updated_at", now);
          try {
            await student.save();
          } catch (updateError) {
            console.error(
              `Could not update timestamp for student ${student.get("id")}:`,
              updateError.message
            );
          }
        }

        // Longer delay between each student to respect rate limits (5 seconds)
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } catch (error) {
        const errorMsg = `Failed to reconcile student ${student.get("id")}: ${
          error.message
        }`;
        console.error(errorMsg);
        errors.push(errorMsg);

        // Continue with next student even if one fails
        continue;
      }
    }

    const summary = {
      processedStudents,
      reconciledPayments: reconciledCount,
      errors: errors.length,
      totalStudentsFound: studentsWithRecentPayments.length,
      limitApplied: studentsWithRecentPayments.length > maxStudents,
      errorDetails: errors.slice(0, 3), // Return first 3 errors only
    };

    console.log("Limited reconciliation completed:", summary);

    return {
      success: true,
      message: `Reconciliation completed. Processed ${processedStudents} students with recent payments, reconciled ${reconciledCount} payments.`,
      summary,
    };
  } catch (error) {
    console.error("Reconciliation failed:", error);

    return {
      success: false,
      message: `Reconciliation failed: ${error.message}`,
      summary: {
        processedStudents,
        reconciledPayments: reconciledCount,
        errors: errors.length + 1,
        errorDetails: [...errors, error.message].slice(0, 3),
      },
    };
  }
};

async function preSavePayData(payData, user) {
  const programme = await Programme.where(
    "id",
    +user.student.programme_id
  ).fetch();

  payData.student_id = user.student.id;
  payData.institution_id = user.institution_id;
  payData.department_id = (programme && programme.get("department_id")) || null;

  if (payData.cart) {
    // Cart format: {"3":{"quantity":4, "fee_plan": "monthly"}, ...}
    const feesById = {};
    let availableFees = await getAvailableFees(user.institution_id);

    availableFees.forEach((fee) => {
      feesById[fee.id] = fee;
    });

    // Add name, unit_price to each cart item
    Object.entries(payData.cart).forEach(([feeID, lineItem]) => {
      if (feeID in feesById) {
        let fee = feesById[feeID];
        if (fee.attributes) fee = fee.attributes;

        lineItem["name"] = fee.name;
        lineItem["unit_price"] = lineItem.fee_plan
          ? fee[lineItem.fee_plan]
          : fee.amount;
      }
      payData.cart[feeID] = lineItem;
    });

    payData.status = 0; // Just to be sure
  }

  try {
    const newPayment = await Payment.forge(payData).save();
    //console.log("NewPayment: ", newPayment);

    return newPayment;
  } catch (err) {
    throw boom.boomify(err);
  }
}

async function completeSavedPayment(reference, user, processorRespData) {
  let feePlan = "",
    hasAcceptanceFee = false;

  //console.log(55550000, reference, user, processorRespData)

  let savedPayment = await Payment.where({
    student_id: user.student.id,
    reference: reference,
  }).fetch();
  //console.log(55551111, savedPayment, Object.values(savedPayment.attributes.cart));

  if (savedPayment && savedPayment.attributes && savedPayment.attributes.cart) {
    for (let lineItem of Object.values(savedPayment.attributes.cart)) {
      if (lineItem["name"].toLowerCase().includes("acceptance fee"))
        hasAcceptanceFee = true;
      if (lineItem["fee_plan"]) feePlan = lineItem["fee_plan"];

      if (hasAcceptanceFee && feePlan) break; // Break early if ever this happens
    }
  }

  try {
    savedPayment.set(processorRespData);
    const completedPayment = await savedPayment.save();
    //console.log(5555533333, completedPayment);

    let student = await Student.where("id", user.student.id).fetch({
      withRelated: ["programme", "session"],
    });

    const isNewFeePlan = feePlan && feePlan != student.attributes.fee_plan;
    const needsRegNo = hasAcceptanceFee && !student.attributes.reg_no;
    //console.log(55554444, feePlan, isNewFeePlan, hasAcceptanceFee, needsRegNo, user.student)

    if (isNewFeePlan || needsRegNo) {
      let updateData = {};

      if (isNewFeePlan) updateData.fee_plan = feePlan;

      if (needsRegNo) updateData.reg_no = await generateStudentRegNo2(student);

      student.set(updateData);

      await student.save();
    }

    return completedPayment;
  } catch (err) {
    throw boom.boomify(err);
  }
}

async function saveToDB(payData, user) {
  // This function is no longer used.
  // Now using: preSavePayData and completeSavedPayment
  let myFeePlan = "",
    hasAcceptanceFee = false;
  let studentDepartmentId = await Student.where("id", user.student.id).fetch({
    withRelated: ["programme"],
  });

  studentDepartmentId =
    studentDepartmentId.relations.programme.attributes.department_id;

  // {"3":{"quantity":4, "fee_plan": "monthly"}, ...}
  payData.student_id = user.student.id;
  payData.institution_id = user.institution_id;
  payData.department_id =
    (!!studentDepartmentId && studentDepartmentId) || null;

  if (payData.cart) {
    const feesById = {};
    let availableFees = await getAvailableFees(user.institution_id);

    availableFees.forEach((fee) => {
      feesById[fee.id] = fee;
    });

    // Add name, unit_price to each cart item
    Object.entries(payData.cart).forEach(([feeID, lineItem]) => {
      if (feeID in feesById) {
        let fee = feesById[feeID];
        if (fee.attributes) fee = fee.attributes;
        if (fee.name.toLowerCase().includes("acceptance fee"))
          hasAcceptanceFee = true;

        lineItem["name"] = fee.name;
        lineItem["unit_price"] = lineItem.fee_plan
          ? fee[lineItem.fee_plan]
          : fee.amount;
      }
      payData.cart[feeID] = lineItem;
    });
  }

  try {
    const newPayment = await Payment.forge(payData).save();
    // console.log(newPayment);

    const isNewFeePlan = myFeePlan && myFeePlan != user.student.fee_plan;
    const needsRegNo = hasAcceptanceFee && !user.student.reg_no;
    //console.log(isNewFeePlan, hasAcceptanceFee, user.student, isNewFeePlan, needsRegNo)

    if (isNewFeePlan || needsRegNo) {
      const student = await Student.where("id", user.student.id).fetch({
        withRelated: ["programme"],
      });

      let updateData = {};

      if (student) {
        if (isNewFeePlan) updateData.fee_plan = myFeePlan;

        if (needsRegNo)
          updateData.reg_no = await generateStudentRegNo2(student);
        student.set(updateData);
        await student.save();
      }
    }

    return newPayment;
  } catch (err) {
    throw boom.boomify(err);
  }
}

function getPaymentExpiries(payments, asString = false) {
  // Generate max payment expiry for each flexible fee type
  const expiries = {};

  payments.forEach((payment) => {
    if (payment.attributes) payment = payment.attributes;

    payment.cart &&
      Object.entries(payment.cart).forEach(([feeID, lineItem]) => {
        if (!lineItem.fee_plan) return;

        if (!(feeID in expiries)) expiries[feeID] = asString ? "" : null;
        if (lineItem.expiry) {
          if (!expiries[feeID] || expiries[feeID] < lineItem.expiry) {
            expiries[feeID] = asString
              ? lineItem.expiry
              : new Date(lineItem.expiry);
          }
        }
      });
  });

  return expiries;
}

function getPaymentsCoverage(payments, feesById) {
  // Generate max payment expiry for each flexible fee type
  const coverage = {};
  const paidQtys = {};

  payments.forEach((payment) => {
    if (payment.attributes) payment = payment.attributes;

    payment.cart &&
      Object.entries(payment.cart).forEach(([feeID, lineItem]) => {
        if (!lineItem.fee_plan) return;

        if (!(feeID in paidQtys)) paidQtys[feeID] = {};
        if (!(feeID in coverage)) coverage[feeID] = {};

        if (!paidQtys[feeID][lineItem.fee_plan])
          paidQtys[feeID][lineItem.fee_plan] = 0;
        paidQtys[feeID][lineItem.fee_plan] += lineItem.quantity;
      });
  });

  payments.forEach((payment) => {
    if (payment.attributes) payment = payment.attributes;
    payment.cart &&
      Object.entries(payment.cart).forEach(([feeID, lineItem]) => {
        if (!lineItem.fee_plan) return;

        let fee = feesById[feeID],
          mthParts = fee.monthly_parts,
          semParts = fee.semesterly_parts,
          sesParts = fee.sessionly_parts,
          semMths = (mthParts && semParts && mthParts / semParts) || 0,
          sesMths = (mthParts && sesParts && mthParts / sesParts) || 0;

        // console.log(11111111, mthParts, semParts, sesParts, semMths, sesMths)

        // Translate summed paid fees coverage into each plan's equivalent
        let feePaidQtys = paidQtys[feeID];
        coverage[feeID].monthly =
          (feePaidQtys.monthly || 0) +
          ((feePaidQtys.semesterly && semMths * feePaidQtys.semesterly) || 0) +
          ((feePaidQtys.sessionly && sesMths * feePaidQtys.sessionly) || 0) +
          ((feePaidQtys.full && mthParts * feePaidQtys.full) || 0);

        coverage[feeID].semesterly =
          (feePaidQtys.semesterly || 0) +
          ((feePaidQtys.monthly && semMths && feePaidQtys.monthly / semMths) ||
            0) +
          ((feePaidQtys.sessionly && 2 * feePaidQtys.sessionly) || 0) +
          ((feePaidQtys.full && 4 * feePaidQtys.full) || 0);

        coverage[feeID].sessionly =
          (feePaidQtys.sessionly || 0) +
          ((feePaidQtys.monthly && sesMths && feePaidQtys.monthly / sesMths) ||
            0) +
          ((feePaidQtys.semesterly && feePaidQtys.semesterly / 2) || 0) +
          ((feePaidQtys.full && 2 * feePaidQtys.full) || 0);

        coverage[feeID].full =
          (feePaidQtys.full || 0) +
          ((feePaidQtys.monthly &&
            mthParts &&
            feePaidQtys.monthly / mthParts) ||
            0) +
          ((feePaidQtys.semesterly &&
            semParts &&
            feePaidQtys.semesterly / semParts) ||
            0) +
          ((feePaidQtys.sessionly &&
            sesParts &&
            feePaidQtys.sessionly / sesParts) ||
            0);

        coverage[feeID].monthly = Math.trunc(coverage[feeID].monthly);
        coverage[feeID].semesterly = Math.trunc(coverage[feeID].semesterly);
        coverage[feeID].sessionly = Math.trunc(coverage[feeID].sessionly);
        coverage[feeID].full = Math.trunc(coverage[feeID].full);
      });
  });

  return coverage;
}
