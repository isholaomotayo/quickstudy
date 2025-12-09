const boom = require("boom");
const Payment = require("../models/Payment");
const Session = require("../models/Session");
const Semester = require("../models/Semester");
const Student = require("../models/Student");
const Institution = require("../models/Institution");
const PaymentAccount = require("../models/PaymentAccount");
const Fee = require("../models/Fee");
const crypto = require("crypto");
const Bookshelf = require("../config/connection").Bookshelf;
const payPlanTypes = ["full", "monthly", "semesterly", "sessionly"];

const serverEnv = process.env.SERVER_ENV;

exports.getMySessionsAndSemesters = async (user) => {
  const mySessions = [];
  const mySemesters = [];
  //console.log(user)

  let sessions = await Session.where("institution_id", +user.institution_id)
    .orderBy("start_date", "ASC")
    .fetchAll({
      withRelated: [
        {
          semesters: (query) => {
            query.orderBy("start_date", "ASC");
          },
        },
      ],
    });

  if (sessions.models) sessions = sessions.models;

  sessions.forEach((session) => {
    let sessionSemesters =
      session && session.relations && session.relations.semesters;
    if (sessionSemesters.models) sessionSemesters = sessionSemesters.models;

    sessionSemesters = sessionSemesters.map((semester) =>
      semester.attributes ? semester.attributes : semester
    );
    session = session.attributes;

    if (session.id == user.student.session_admitted_id || mySessions.length) {
      mySessions.push(session);
      mySemesters.push(...sessionSemesters);
    }
  });
  // console.log(mySessions, mySemesters)
  return { mySessions, mySemesters };
};

exports.stringAnswerFromSelection = (selection) => {
  let answers = [],
    answer = "";

  Object.entries(selection).forEach(([key, value]) => {
    if (value.is_answer) answers.push(key);
  });

  if (answers.length) {
    answers.sort();
    answer = answers.join("");
  }

  return answer;
};

exports.calculateTestScore = (questionsAnswers, testQuestionsById) => {
  let totalScore = 0;

  questionsAnswers.forEach((questionAnswer) => {
    let myAnswerString = exports.stringAnswerFromSelection(
        questionAnswer.selection
      ),
      testQuestion = testQuestionsById[questionAnswer.questionId];

    if ("attributes" in testQuestion) testQuestion = testQuestion.attributes;

    if (myAnswerString === testQuestion.answer) {
      totalScore += testQuestion.marks;
    }
  });

  return totalScore;
};

exports.buildJsonFieldFromPost = (postData, jsonFieldName) => {
  const fieldData = {};

  Object.entries(postData).forEach(([fieldName, fieldValue]) => {
    if (fieldName.indexOf(`${jsonFieldName}__`) !== 0) return;

    let [fieldGroupName, key, ...subField] = fieldName.split("__");
    if (!(key in fieldData)) fieldData[key] = {};

    let subFieldName = subField[0];
    if (!(subFieldName in fieldData[key]))
      fieldData[key][subFieldName] = fieldValue;

    if (subField[1]) {
      fieldData[key][subFieldName][subField[1]] = fieldValue;
    }

    delete postData[fieldName];
  });

  postData[jsonFieldName] = fieldData;

  return postData;
};

exports.checkAccess = (
  req,
  reply,
  allowedRoles = [],
  bounceTo = "/error",
  fKey = "",
  fValue = ""
) => {
  let [filterKey, filterValue] =
      fKey && fValue
        ? [fKey, fValue]
        : req.query && req.query.filter && req.query.filter.indexOf(":") > 0
        ? req.query.filter.split(":")
        : ["", ""],
    validatedUser = req.params && req.params.validatedUser,
    accessRole = validatedUser && validatedUser.role,
    url = req.raw && req.raw.url,
    asset = url && url.split("/api/")[1].split("/")[0];

  if (req.query && req.query.filter) delete req.query.filter;
  if (filterValue && /^\+?(0|[1-9]\d*)$/.test(filterValue))
    filterValue = +filterValue;
  let bounce = true;

  // Check if user is authenticated and has proper role
  if (validatedUser && accessRole && allowedRoles.indexOf(accessRole) > -1) {
    bounce = false;
    if ("APPLICANT,STUDENT".indexOf(accessRole) > -1) {
      if (asset == "user") {
        if (filterKey == "id" && +filterValue != validatedUser.id)
          bounce = true;
      }
    }
    // We can define other special bounce rules below
  }

  if (bounce) {
    // Clear cookies and return 401
    reply.clearCookie("token", { path: "/" });
    reply.clearCookie("userId", { path: "/" });
    reply.clearCookie("role", { path: "/" });
    reply.clearCookie("userData", { path: "/" });
    reply.code(401);
    reply.send({
      error: "Unauthorized request", // the http error message
      code: 401, // the Fastify error code
      message: "Unauthorized request", // the user error message
      statusCode: 401, // the http status code
    });
    // Return undefined to indicate authentication failed
    return { validatedUser: undefined, filterKey, filterValue };
  }

  return { validatedUser, filterKey, filterValue };
};

exports.checkPaymentCurrent = async (
  reply,
  validatedUser,
  exemptRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"]
) => {
  let institution = await Institution.where({
    id: +validatedUser.institution_id,
  }).fetch();
  if (institution && institution.attributes)
    institution = institution.attributes;

  if (institution && !institution.paywall_on) return false;

  let bounce = true;

  const setUnpaidError = () => {
    reply.code(402);
    reply.send({
      error: "Payment Required", // the http error message
      code: 402, // the Fastify error code
      message: "Payment Required", // the user error message
      statusCode: 402, // the http status code
    });
  };

  if (exemptRoles.indexOf(validatedUser.role) > -1) bounce = false;
  else if (validatedUser.student) {
    // payment id 3, 12

    let currentDateTime = new Date();

    let prevPayments = await Payment.where({
      student_id: +validatedUser.student.id,
      status: 1,
    })
      .orderBy("paid_at", "DESC")
      .fetchAll();

    if (prevPayments && prevPayments.models && prevPayments.models.length) {
      prevPayments = prevPayments.models;

      let lastFeePaid = null,
        lastFeePlan = "",
        lastFeeId = 0,
        maxPayments = 1;

      prevPayments.forEach((payment) => {
        if (payment.attributes) payment = payment.attributes;

        payment.cart &&
          Object.entries(payment.cart).forEach(([feeID, lineItem]) => {
            if (lastFeePaid || !lineItem.fee_plan) return;

            lastFeePaid = payment;
            lastFeePlan = lineItem.fee_plan;
            lastFeeId = feeID;
          });
      });

      const { fid, pl, lastInstallment } = exports.getFeeCoverageFromReference(
        lastFeePaid.reference
      );

      const fee = await Fee.where({ id: +lastFeeId }).fetch();
      //console.log(lastFeePaid, lastFeePlan, lastInstallment, fee.id)

      const { mySessions, mySemesters } =
        await exports.getMySessionsAndSemesters(validatedUser);
      const myStartSession =
        (mySessions && mySessions.length && mySessions[0]) || null;

      //payPlanTypes
      if (lastFeePlan != "full") maxPayments = fee[`${lastFeePlan}_parts`];

      if (lastFeePlan == "full") bounce = false;
      else if (lastFeePlan == "monthly") {
        // Configuration - hardcoded for now, will be from program table later
        const TOTAL_PROGRAM_MONTHS = 18; // 3 semesters × 6 months

        // Get program start date from student's admission semester
        const programStartDate = await exports.getStudentProgramStartDate(
          validatedUser.student,
          myStartSession
        );

        if (!programStartDate) {
          // If we can't determine program start, default to allowing access
          bounce = false;
        } else {
          // Calculate progress and determine access
          const progressMonths = exports.monthDiff(
            programStartDate,
            currentDateTime
          );
          const cappedProgress = Math.min(progressMonths, TOTAL_PROGRAM_MONTHS);
          const minimumRequired = Math.floor(cappedProgress * 0.5);

          const allowAccess =
            lastInstallment >= minimumRequired ||
            lastInstallment >= maxPayments;

          if (allowAccess) {
            bounce = false;
          }

          // Optional: Add logging for debugging
          console.log({
            studentId: validatedUser.student.id,
            semesterAdmittedId: validatedUser.student.semester_admitted_id,
            programStartDate,
            progressMonths: cappedProgress,
            minimumRequired,
            lastInstallment,
            maxPayments,
            allowAccess: !bounce,
          });
        }
      } else if ("semesterly,sessionly".indexOf(lastFeePlan) > -1) {
        let thisSemester = await Semester.where({
          institution_id: validatedUser.institution_id,
          is_active: true,
        }).fetch({ withRelated: ["session"] });

        if (thisSemester) {
          if (thisSemester.attributes) thisSemester = thisSemester.attributes;

          if (lastFeePlan == "semesterly") {
            let semestersDue = 0;

            for (let semester of mySemesters) {
              semestersDue++;
              if (semester.id == thisSemester.id) break;
            }

            if (lastInstallment >= semestersDue) bounce = false;
          } else {
            let sessionsDue = 0;

            for (let session of mySessions) {
              sessionsDue++;
              if (session.id == thisSemester.session_id) break;
            }

            if (lastInstallment >= sessionsDue) bounce = false;
          }
        }
      }
    }

    if (bounce) setUnpaidError();
  }

  return bounce;
};

exports.setUnpublishedError = (reply) => {
  reply.code(401);
  reply.send({
    error: "Unauthorized", // the http error message
    code: 401, // the Fastify error code
    message: "This content is unpublished by admin. You may try again later.", // the user error message
    statusCode: 401, // the http status code
  });
};

exports.getFeeCoverageFromReference = (ref) => {
  let payInfo = ref.split("-").pop(),
    feeId,
    plan0 = "",
    plan = "";

  if (payInfo.includes("sm")) {
    plan0 = "sm";
    plan = "semesterly";
  } else if (payInfo.includes("m")) {
    plan0 = "m";
    plan = "monthly";
  } else if (payInfo.includes("ss")) {
    plan0 = "ss";
    plan = "sessionly";
  }

  [feeId, payInfo] = payInfo.split(plan0);
  if (payInfo.includes(".")) payInfo = payInfo.split(".")[0];

  let lastInstallment = +payInfo;

  return { feeId, plan, lastInstallment };
};

exports.setPaginationHeaders = (reply, pagination) => {
  reply.headers({
    "x-pagination-page": pagination.page,
    "x-pagination-pagesize": pagination.pageSize,
    "x-pagination-rowcount": pagination.rowCount,
    "x-pagination-pagecount": pagination.pageCount,
  });
};

exports.dateToString = (theDate) => {
  if (typeof theDate == "string") return theDate;

  // const offset = theDate.getTimezoneOffset()
  // theDate = new Date(theDate.getTime() + (offset*60*1000))
  return theDate.toISOString().split("T")[0];
};

exports.monthlyDatesRange = (startDate, endDate, asString = false) => {
  const dates = [];
  let theDate = startDate;

  while (theDate <= endDate) {
    if (asString) {
      dates.push(exports.dateToString(theDate));
    } else {
      dates.push(theDate);
    }

    theDate.setMonth(theDate.getMonth() + 1);
  }

  return dates;
};

// exports.monthlyDatesRange2 = (startDate, endDate, asString=false) => {
//     let [startYear, startMonth, day] = startDate.split('-')
//     let [endYear, endMonth] = endDate.split('-')
//     const dates = []

//     for(let year = startYear; year <= endYear; year++) {
//         let currStartMonth = year === startYear ? +startMonth-1 : 0
//         let currEndMonth = year === endYear ? +endMonth-1 : 11
//         day = +day
//         day = Math.min(day, 28)

//         for(let j = currStartMonth; j <= currEndMonth; j = j > 12 ? j % 12 || 11 : j+1) {
//             let month = j+1
//             let displayMonth = month < 10 ? `0${month}` : month
//             let displayDay = day < 10 ? `0${day}` : day
//             const dateString = `${year}-${displayMonth}-${displayDay}`

//             if (asString) {
//                 dates.push(dateString)
//             }
//             else {
//                 let dateObj = new Date(dateString)
//                 dates.push(dateObj)
//             }
//         }
//     }

//     return dates
// }

exports.lastDayOfMonth = (monthNumber) => {
  const monthsWith30 = [4, 6, 9, 11];
  if (monthNumber == 2) return 28;
  else if (monthsWith30.indexOf() > -1) return 30;
  else return 31;
};

exports.monthName = {
  1: "January",
  2: "February",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "August",
  9: "September",
  10: "October",
  11: "November",
  12: "December",
};

exports.monthDiff = (dateFrom, dateTo) => {
  return (
    dateTo.getMonth() -
    dateFrom.getMonth() +
    12 * (dateTo.getFullYear() - dateFrom.getFullYear())
  );
};

exports.getStudentProgramStartDate = async (student, fallbackSession) => {
  if (!student.semester_admitted_id) {
    return fallbackSession ? fallbackSession.start_date : null;
  }

  try {
    const admissionSemester = await Semester.where({
      id: +student.semester_admitted_id,
    }).fetch();

    if (admissionSemester && admissionSemester.attributes) {
      return admissionSemester.attributes.start_date;
    }
  } catch (error) {
    console.error("Error fetching admission semester:", error);
  }

  // Fallback to session start date
  return fallbackSession ? fallbackSession.start_date : null;
};

exports.generateStudentRegNo2 = async (student) => {
  try {
    // Input validation
    if (!student) {
      console.error("generateStudentRegNo2: No student provided");
      return "";
    }

    // Extract student data with proper null checks
    const myProgramme = student?.relations?.programme || null;
    const mySession = student?.relations?.session || null;

    if (!myProgramme || !mySession) {
      console.error(
        "generateStudentRegNo2: Missing student programme or session relations"
      );
      return "";
    }

    const yearString = mySession.get("end_year");
    const regNoFormat = myProgramme.get("regno_format");

    if (!yearString) {
      console.error(
        "generateStudentRegNo2: Set active semester, and session end_year in DB."
      );
      return "";
    }

    if (!regNoFormat) {
      console.error(
        "generateStudentRegNo2: Set RegNo format for programme in DB."
      );
      return "";
    }

    // Find the position of the serial number placeholder
    const numberPos = regNoFormat.split("/").indexOf(":NN:");
    if (numberPos === -1) {
      console.error(
        "generateStudentRegNo2: RegNo format must contain ':NN:' placeholder"
      );
      return "";
    }

    // Get student's session
    const studentSessionAdmitted = student.get("session_admitted_id");
    if (!studentSessionAdmitted) {
      console.error(
        "generateStudentRegNo2: Student has no session_admitted_id"
      );
      return "";
    }

    // Format year string (last 2 digits)
    const formattedYearString = yearString.toString().slice(-2);

    // Get the last assigned student for this session and year
    let lastAssignedStudent = await exports.getLastRegNoStudent(
      studentSessionAdmitted,
      formattedYearString
    );

    let lastSerialNumber = 0;

    if (lastAssignedStudent?.reg_no) {
      const regNoParts = lastAssignedStudent.reg_no.split("/");
      if (regNoParts.length > numberPos) {
        const serialNum = parseInt(regNoParts[numberPos], 10);
        if (!isNaN(serialNum)) {
          lastSerialNumber = serialNum;
        }
      }
    }

    // Generate new registration number
    const newSerialNumber = String(lastSerialNumber + 1).padStart(3, "0"); // Pad with zeros for consistent format
    const newRegNo = regNoFormat
      .replace(/:YY:?/g, formattedYearString) // Handle both :YY: and :YY
      .replace(/:NN:?/g, newSerialNumber); // Handle both :NN: and :NN

    console.log(
      `generateStudentRegNo2: Generated registration number: ${newRegNo}`
    );
    return newRegNo;
  } catch (error) {
    console.error(
      "generateStudentRegNo2: Error generating registration number:",
      error
    );
    return "";
  }
};

exports.getLastRegNoStudent = async (session_id, yearString) => {
  let lastRegNoStudent;

  try {
    lastRegNoStudent = await Bookshelf.knex.raw(
      `SELECT reg_no, cast(regexp_replace("reg_no" , '[^0-9]', '', 'g') as INT) v FROM "public"."student" WHERE "reg_no" IS NOT NULL AND "reg_no" <> '' AND reg_no like '%/${yearString}/%' and session_admitted_id = ? order by v desc LIMIT 1;`,
      [session_id]
    );

    // Check if we have results
    if (
      lastRegNoStudent &&
      lastRegNoStudent.rows &&
      lastRegNoStudent.rows.length > 0
    ) {
      return lastRegNoStudent.rows[0];
    }

    return null;
  } catch (err) {
    console.error("Error getting last registration number:", err);
    return null;
  }
};

exports.intRange = (start, stop, step = 1) => {
  const a = [start];
  let b = start;

  while (b < stop) {
    a.push((b += step));
  }
  return a;
};

exports.ucfirst = (str) => {
  return str && str[0].toUpperCase() + str.slice(1);
};

exports.getInstitution = async (params) => {
  try {
    const institution = await Institution.where(params).fetch();

    return institution;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.cryptText = (text, type = "") => {
  const iv = crypto.randomBytes(16);
  if (type === "encrypt") {
    let cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(process.env.EN_KEY),
      iv
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString("hex"), encryptedData: encrypted.toString("hex") };
  } else {
    const data = JSON.parse(text);
    let ive = Buffer.from(data.iv, "hex");
    let encryptedText = Buffer.from(data.encryptedData, "hex");
    let decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(process.env.EN_KEY),
      ive
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
};

exports.getPaymentAccount = async (institution_id) => {
  if (!institution_id) {
    throw new Error("No institution id provided");
  }

  try {
    const paymentAcct = await PaymentAccount.where({
      institution_id,
    }).fetch();

    let secret_key = paymentAcct.attributes.secret_key;
    // if (serverEnv && "testing,local,staging".indexOf(serverEnv) > -1) {
    //   secret_key = paymentAcct.attributes.test_secret_key;
    // }

    secret_key = exports.cryptText(secret_key);

    return { paymentAcct, secret_key };
  } catch (err) {
    throw boom.boomify(err);
  }
};
