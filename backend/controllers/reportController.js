const boom = require("boom");
const checkAccess = require("../helpers/utils").checkAccess;
const User = require("../models/User");
const Student = require("../models/Student");
const Payment = require("../models/Payment");
const Fee = require("../models/Fee");

const FeeStudent = require("../models/FeeStudent");
const Bookshelf = require("../config/connection").Bookshelf;
const defermentModule = require("../email/defermentModuleEmail");
const dayjs = require("dayjs");
require("dotenv").config();
dayjs().format();

exports.getAllReports = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  let admitted, applicant, completedApplication, acceptanceFeePaid;

  try {
    applicant = await Student.where({
      status: false,
    }).fetchAll({
      withRelated: [
        {
          user: (query) => {
            query.where("role", "APPLICANT");
          },
        },
      ],
    });

    applicant = applicant.filter(
      (m) => Object.entries(m.relations.user.attributes).length !== 0
    );

    admitted = await Student.where({
      admitted: true,
    }).fetchAll({
      withRelated: [
        "programme",
        {
          user: (query) => {
            query.where("role", "STUDENT");
          },
        },
      ],
    });

    admitted = admitted.filter(
      (m) => Object.entries(m.relations.user.attributes).length !== 0
    );

    completedApplication = await Student.where({
      status: true,
      admitted: false,
    }).fetchAll({
      withRelated: [
        "programme",
        {
          user: (query) => {
            query.where("role", "APPLICANT");
          },
        },
      ],
    });

    completedApplication = completedApplication.filter(
      (m) => Object.entries(m.relations.user.attributes).length !== 0
    );

    acceptanceFeePaid = await FeeStudent.where({
      fee_id: 2,
    }).fetchAll({
      withRelated: ["user", "student", "feestudentpaymentfreq"],
    });
  } catch (err) {
    throw boom.boomify(err);
  }

  const report = {
    applicant,
    admitted,
    completedApplication,
    acceptanceFeePaid,
  };

  return report;
};

exports.getReportById = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { institution_id } = req.params;
  let admitted, applicant, completedApplication, acceptanceFeePaid;

  try {
    applicant = await Student.where({
      status: false,
    }).fetchAll({
      columns: ["id", "user_id"],
      withRelated: [
        {
          user: (query) => {
            query.columns([
              "id",
              "first_name",
              "last_name",
              "email",
              "phone",
              "role",
            ]),
              query.where({
                role: "APPLICANT",
                institution_id,
              });
          },
        },
      ],
    });

    applicant = applicant.filter(
      (m) => Object.entries(m.relations.user.attributes).length !== 0
    );

    admitted = await Student.where({
      admitted: true,
    }).fetchAll({
      columns: ["id", "user_id", "programme_id"],
      withRelated: [
        "programme",
        {
          user: (query) => {
            query.columns([
              "id",
              "first_name",
              "last_name",
              "email",
              "phone",
              "role",
            ]),
              query.where({
                role: "STUDENT",
                institution_id,
              });
          },
        },
      ],
    });

    admitted = admitted.filter(
      (m) => Object.entries(m.relations.user.attributes).length !== 0
    );

    completedApplication = await Student.where({
      status: true,
      admitted: false,
    }).fetchAll({
      withRelated: [
        "programme",
        {
          user: (query) => {
            query.where({
              role: "APPLICANT",
              institution_id,
            });
          },
        },
      ],
    });

    completedApplication = completedApplication.filter(
      (m) => Object.entries(m.relations.user.attributes).length !== 0
    );

    acceptanceFeePaid = await FeeStudent.where({
      fee_id: 2,
    }).fetchAll({
      withRelated: [
        "student",
        {
          user: (query) => {
            query.where({
              institution_id,
            });
          },

          feestudentpaymentfreq: (query) => {
            query.where({
              status: 1,
            });
          },
        },
      ],
    });

    acceptanceFeePaid = acceptanceFeePaid.filter(
      (m) =>
        Object.entries(m.relations.user.attributes).length !== 0 &&
        m.relations.feestudentpaymentfreq.length !== 0
    );
  } catch (err) {
    throw boom.boomify(err);
  }

  const report = {
    applicant,
    admitted,
    completedApplication,
    acceptanceFeePaid,
  };

  return report;
};

exports.getWeeklyReports = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  let toDate = dayjs();
  let fromDate = dayjs("2020-07-03T11:19:43.616Z");

  if (Object.entries(req.query).length === 2) {
    toDate = dayjs(req.query.endDate);
    fromDate = dayjs(req.query.startDate);
  }

  const openApplications = {
      title: "Open Applications",
      description:
        "The number of people who have started the application process but have not completed the process.",
    },
    completedApplication = {
      title: "Completed Application",
      description: "number of completed applications.",
    },
    paidTuition = {
      title: "Paid Tuition",
      description: "The number of students who paid tuition.",
    },
    totalAffiliates = {
      title: "Total Affiliates",
      description: "The total number of affiliates on the portal.",
    },
    totalApplications = {
      title: "Total Applications-Referral Code",
      description:
        "The total number of applications that were started using a referral code.",
    },
    referralCompletedApplications = {
      title: "Completed Applications-Referral Code",
      description:
        "The total number of applications that were completed using a referral code.",
    },
    affiliateAcceptance = {
      title: "Acceptance Fee Paid-Referral Code",
      description:
        "How many of the applicants that came in through affiliates have paid acceptance fee.",
    },
    affiliateAdmitted = {
      title: "Admitted Students-Referral Code",
      description:
        "How many of the applicants that came in through affiliates have been admitted.",
    },
    totalAcceptanceFeePaid = {
      title: "Acceptance Fee Paid",
      description: "Total number of students who have paid acceptance fee.",
    },
    affiliateTuitionPaid = {
      title: "Tuition Fee Paid-Referral Code",
      description:
        "How many of the applicants that came in through affiliates have paid tuition.",
    };
  try {
    openApplications.value = await Bookshelf.knex("student")
      .join("user", "student.user_id", "user.id")
      .count(`user.id`, `user.first_name`)
      .where({
        status: false,
      })
      .andWhere("user.institution_id", "=", validatedUser.institution_id)
      .whereBetween("student.created_at", [fromDate, toDate])
      .then((data) => +data[0].count);

    totalAffiliates.value = await Bookshelf.knex
      .table("affiliate")
      .count("*")
      .whereBetween("created_at", [fromDate, toDate])
      .then((data) => +data[0].count);

    referralCompletedApplications.value = await Bookshelf.knex("student")
      .join("user", "student.user_id", "user.id")
      .count(`user.id`, `user.first_name`)
      .where(`user.referral_code`, ">", '""')
      .andWhere("user.institution_id", "=", validatedUser.institution_id)
      .andWhere(`user.referral_code`, "<>", "UNN")
      .andWhere("student.status", "=", "true")
      .whereBetween("student.created_at", [fromDate, toDate])
      .then((data) => +data[0].count);

    completedApplication.value = await Bookshelf.knex("student")
      .join("user", "student.user_id", "user.id")
      .count("*")
      .where({
        status: true,
      })
      .andWhere("user.institution_id", "=", validatedUser.institution_id)
      .whereBetween("student.created_at", [fromDate, toDate])
      .then((data) => +data[0].count);

    totalApplications.value = await Bookshelf.knex("student")
      .join("user", "student.user_id", "user.id")
      .count(`*`)
      .where(function () {
        this.where(`user.referral_code`, ">", '""')
          .andWhere(`user.referral_code`, "<>", "UNN")
          .andWhere("user.institution_id", "=", validatedUser.institution_id);
      })
      .whereBetween("student.created_at", [fromDate, toDate])
      .then((data) => +data[0].count);

    affiliateAdmitted.value = await Bookshelf.knex("student")
      .join("user", "student.user_id", "user.id")
      .count(`*`)
      .where(function () {
        this.where(`user.referral_code`, ">", '""')
          .where({
            status: true,
            admitted: true,
          })
          .andWhere(`user.referral_code`, "<>", "UNN")
          .andWhere("user.institution_id", "=", validatedUser.institution_id);
      })
      .whereBetween("student.created_at", [fromDate, toDate])
      .then((data) => +data[0].count);

    totalAcceptanceFeePaid.value = await Bookshelf.knex
      .raw(
        `select cart -> '2' as "acceptance" from payment2 WHERE cart -> '2' is NOT NULL AND "created_at" BETWEEN  '${fromDate}' AND '${toDate}'`
      )
      .then((data) => +data.rowCount);

    paidTuition.value = await Bookshelf.knex
      .raw(
        `
      SELECT DISTINCT student_id FROM payment2  WHERE (cart -> '12' IS NOT NULL OR cart -> '3' IS NOT NULL) AND payment2."created_at" BETWEEN  '${fromDate}' AND '${toDate}'
      `
      )
      .then((data) => +data.rowCount);

    affiliateAcceptance.value = await Bookshelf.knex
      .raw(
        `SELECT DISTINCT s.id, u.email FROM payment2 JOIN student s ON s.id = payment2.student_id  JOIN "user" u ON u.id = s.user_id WHERE (cart -> '2' IS NOT NULL) AND ("referral_code" > '""' AND "referral_code" <> 'UNN') AND payment2."created_at" BETWEEN  '${fromDate}' AND '${toDate}'`
      )
      .then((data) => +data.rowCount);

    affiliateTuitionPaid.value = await Bookshelf.knex
      .raw(
        `SELECT  DISTINCT s.id, u.email FROM payment2 JOIN student s ON s.id = payment2.student_id  JOIN "user" u ON u.id = s.user_id WHERE (cart -> '12' IS NOT NULL OR cart -> '3' IS NOT NULL) AND ("referral_code" > '""' AND "referral_code" <> 'UNN') AND payment2."created_at" BETWEEN  '${fromDate}' AND '${toDate}';`
      )
      .then((data) => +data.rowCount);
  } catch (e) {
    boom.boomify(e);
  }

  return [
    totalApplications,
    openApplications,
    totalAffiliates,
    referralCompletedApplications,
    totalAcceptanceFeePaid,
    paidTuition,
    completedApplication,
    affiliateAdmitted,
    affiliateAcceptance,
    affiliateTuitionPaid,
  ];
};

exports.getAnalytics = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];

  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  const { institution_id } = req.params;
  const { startDate, endDate } = req.query;

  console.log("Analytics endpoint called with:", {
    institution_id,
    startDate,
    endDate,
  });

  try {
    // Get raw data counts only (no full objects)
    const applicantCount = await Student.where({
      status: false,
    })
      .query((qb) => {
        qb.join("user", "student.user_id", "user.id")
          .where("user.institution_id", institution_id)
          .where("user.role", "APPLICANT");

        if (startDate && endDate) {
          qb.whereBetween("student.created_at", [startDate, endDate]);
        }
      })
      .count();

    const admittedCount = await Student.where({
      admitted: true,
    })
      .query((qb) => {
        qb.join("user", "student.user_id", "user.id")
          .where("user.institution_id", institution_id)
          .where("user.role", "STUDENT");

        if (startDate && endDate) {
          qb.whereBetween("student.created_at", [startDate, endDate]);
        }
      })
      .count();

    const completedCount = await Student.where({
      status: true,
      admitted: false,
    })
      .query((qb) => {
        qb.join("user", "student.user_id", "user.id")
          .where("user.institution_id", institution_id)
          .where("user.role", "APPLICANT");

        if (startDate && endDate) {
          qb.whereBetween("student.created_at", [startDate, endDate]);
        }
      })
      .count();

    const acceptancePaidCount = await FeeStudent.where({
      fee_id: 2,
    })
      .query((qb) => {
        qb.join("student", "fee_student.student_id", "student.id")
          .join("user", "student.user_id", "user.id")
          .join(
            "fee_student_payment_frequency",
            "fee_student.id",
            "fee_student_payment_frequency.fee_student_id"
          )
          .where("user.institution_id", institution_id)
          .where("fee_student_payment_frequency.status", 1);

        if (startDate && endDate) {
          qb.whereBetween("fee_student.created_at", [startDate, endDate]);
        }
      })
      .count();

    // Calculate metrics
    const totalApplications =
      parseInt(applicantCount) +
      parseInt(completedCount) +
      parseInt(admittedCount);
    const conversionRate =
      totalApplications > 0
        ? ((parseInt(admittedCount) / totalApplications) * 100).toFixed(1)
        : 0;
    const completionRate =
      totalApplications > 0
        ? ((parseInt(completedCount) / totalApplications) * 100).toFixed(1)
        : 0;
    const acceptanceRate =
      parseInt(admittedCount) > 0
        ? (
            (parseInt(acceptancePaidCount) / parseInt(admittedCount)) *
            100
          ).toFixed(1)
        : 0;

    // Debug queries to understand data structure
    const sampleStudents = await Bookshelf.knex.raw(
      `
      SELECT s.id, s.programme_id, s.gender, s.dob, s.employment_status, s.marital_status, u.institution_id, p.name as programme_name
      FROM student s
      JOIN "user" u ON s.user_id = u.id
      LEFT JOIN programme p ON s.programme_id = p.id
      WHERE u.institution_id = ?
      LIMIT 5
    `,
      [institution_id]
    );

    // Check available columns in student table
    const studentColumns = await Bookshelf.knex.raw(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'student' 
      ORDER BY ordinal_position
    `);

    // Check what programmes exist for this institution
    const availableProgrammes = await Bookshelf.knex.raw(
      `
      SELECT p.id, p.name, COUNT(s.id) as student_count
      FROM programme p
      LEFT JOIN student s ON p.id = s.programme_id
      LEFT JOIN "user" u ON s.user_id = u.id
      WHERE u.institution_id = ? OR u.institution_id IS NULL
      GROUP BY p.id, p.name
      LIMIT 10
    `,
      [institution_id]
    );

    // Monthly trends data
    const monthlyTrends = await Bookshelf.knex.raw(
      `
      SELECT 
        DATE_TRUNC('month', student.created_at) as month,
        COUNT(CASE WHEN student.status = false THEN 1 END) as ongoing,
        COUNT(CASE WHEN student.status = true AND student.admitted = false THEN 1 END) as completed,
        COUNT(CASE WHEN student.admitted = true THEN 1 END) as admitted
      FROM student
      JOIN "user" ON student.user_id = "user".id
      WHERE "user".institution_id = ?
      ${startDate && endDate ? `AND student.created_at BETWEEN ? AND ?` : ""}
      GROUP BY DATE_TRUNC('month', student.created_at)
      ORDER BY month
    `,
      startDate && endDate
        ? [institution_id, startDate, endDate]
        : [institution_id]
    );

    // Programme distribution - include all students, not just completed/admitted
    const programmeStats = await Bookshelf.knex.raw(
      `
      SELECT 
        p.name as programme_name,
        COUNT(*) as application_count
      FROM student s
      JOIN "user" u ON s.user_id = u.id
      LEFT JOIN programme p ON s.programme_id = p.id
      WHERE u.institution_id = ? 
      AND p.name IS NOT NULL
      ${startDate && endDate ? `AND s.created_at BETWEEN ? AND ?` : ""}
      GROUP BY p.name
      ORDER BY application_count DESC
      LIMIT 10
    `,
      startDate && endDate
        ? [institution_id, startDate, endDate]
        : [institution_id]
    );

    // Department distribution - include all students
    const departmentStats = await Bookshelf.knex.raw(
      `
      SELECT 
        d.name as department_name,
        COUNT(*) as application_count
      FROM student s
      JOIN "user" u ON s.user_id = u.id
      LEFT JOIN programme p ON s.programme_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      WHERE u.institution_id = ? 
      AND d.name IS NOT NULL
      ${startDate && endDate ? `AND s.created_at BETWEEN ? AND ?` : ""}
      GROUP BY d.name
      ORDER BY application_count DESC
    `,
      startDate && endDate
        ? [institution_id, startDate, endDate]
        : [institution_id]
    );

    // Faculty distribution - include all students
    const facultyStats = await Bookshelf.knex.raw(
      `
      SELECT 
        f.name as faculty_name,
        COUNT(*) as application_count
      FROM student s
      JOIN "user" u ON s.user_id = u.id
      LEFT JOIN programme p ON s.programme_id = p.id
      LEFT JOIN department d ON p.department_id = d.id
      LEFT JOIN faculty f ON d.faculty_id = f.id
      WHERE u.institution_id = ? 
      AND f.name IS NOT NULL
      ${startDate && endDate ? `AND s.created_at BETWEEN ? AND ?` : ""}
      GROUP BY f.name
      ORDER BY application_count DESC
    `,
      startDate && endDate
        ? [institution_id, startDate, endDate]
        : [institution_id]
    );

    // Demographics - include all students
    const genderStats = await Bookshelf.knex.raw(
      `
      SELECT 
        LOWER(s.gender) as gender,
        COUNT(*) as count
      FROM student s
      JOIN "user" u ON s.user_id = u.id
      WHERE u.institution_id = ? 
      AND s.gender IS NOT NULL
      AND s.gender != ''
      ${startDate && endDate ? `AND s.created_at BETWEEN ? AND ?` : ""}
      GROUP BY LOWER(s.gender)
    `,
      startDate && endDate
        ? [institution_id, startDate, endDate]
        : [institution_id]
    );

    // Age groups - include all students
    const ageStats = await Bookshelf.knex.raw(
      `
      SELECT 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(s.dob)) BETWEEN 18 AND 25 THEN '18-25'
          WHEN EXTRACT(YEAR FROM AGE(s.dob)) BETWEEN 26 AND 35 THEN '26-35'
          WHEN EXTRACT(YEAR FROM AGE(s.dob)) BETWEEN 36 AND 45 THEN '36-45'
          WHEN EXTRACT(YEAR FROM AGE(s.dob)) > 45 THEN '46+'
          ELSE 'Unknown'
        END as age_group,
        COUNT(*) as count
      FROM student s
      JOIN "user" u ON s.user_id = u.id
      WHERE u.institution_id = ? 
      AND s.dob IS NOT NULL
      ${startDate && endDate ? `AND s.created_at BETWEEN ? AND ?` : ""}
      GROUP BY age_group
    `,
      startDate && endDate
        ? [institution_id, startDate, endDate]
        : [institution_id]
    );

    // Employment status - include all students
    let employmentStats = { rows: [] };
    try {
      employmentStats = await Bookshelf.knex.raw(
        `
        SELECT 
          LOWER(s.employment_status) as employment_status,
          COUNT(*) as count
        FROM student s
        JOIN "user" u ON s.user_id = u.id
        WHERE u.institution_id = ? 
        AND s.employment_status IS NOT NULL
        AND s.employment_status != ''
        ${startDate && endDate ? `AND s.created_at BETWEEN ? AND ?` : ""}
        GROUP BY LOWER(s.employment_status)
      `,
        startDate && endDate
          ? [institution_id, startDate, endDate]
          : [institution_id]
      );
    } catch (error) {
      console.log(
        "Employment status column not found in student table:",
        error.message
      );
      employmentStats = { rows: [] };
    }

    // Marital status - include all students
    let maritalStats = { rows: [] };
    try {
      maritalStats = await Bookshelf.knex.raw(
        `
        SELECT 
          LOWER(s.marital_status) as marital_status,
          COUNT(*) as count
        FROM student s
        JOIN "user" u ON s.user_id = u.id
        WHERE u.institution_id = ? 
        AND s.marital_status IS NOT NULL
        AND s.marital_status != ''
        ${startDate && endDate ? `AND s.created_at BETWEEN ? AND ?` : ""}
        GROUP BY LOWER(s.marital_status)
      `,
        startDate && endDate
          ? [institution_id, startDate, endDate]
          : [institution_id]
      );
    } catch (error) {
      console.log(
        "Marital status column not found in student table:",
        error.message
      );
      maritalStats = { rows: [] };
    }

    // Previous education - include all students
    // Note: Check if this column exists in your database schema
    let educationStats = { rows: [] };
    try {
      educationStats = await Bookshelf.knex.raw(
        `
        SELECT 
          s.previous_education,
          COUNT(*) as count
        FROM student s
        JOIN "user" u ON s.user_id = u.id
        WHERE u.institution_id = ? 
        AND s.previous_education IS NOT NULL
        AND s.previous_education != ''
        ${startDate && endDate ? `AND s.created_at BETWEEN ? AND ?` : ""}
        GROUP BY s.previous_education
        ORDER BY count DESC
      `,
        startDate && endDate
          ? [institution_id, startDate, endDate]
          : [institution_id]
      );
    } catch (error) {
      console.log(
        "Previous education column not found in student table:",
        error.message
      );
      // Set empty result if column doesn't exist
      educationStats = { rows: [] };
    }

    // Financial data
    const financialStats = await Bookshelf.knex.raw(
      `
      SELECT 
        COUNT(*) as payment_count,
        SUM(fs.total_amount) as total_revenue
      FROM fee_student fs
      JOIN fee_student_payment_frequency fspf ON fs.id = fspf.fee_student_id
      JOIN student s ON fs.student_id = s.id
      JOIN "user" u ON s.user_id = u.id
      WHERE fs.fee_id = 2 
      AND u.institution_id = ?
      AND fspf.status = 1
      ${startDate && endDate ? `AND fs.created_at BETWEEN ? AND ?` : ""}
    `,
      startDate && endDate
        ? [institution_id, startDate, endDate]
        : [institution_id]
    );

    // Process the data into the correct objects BEFORE creating analytics object
    const processedProgrammes = programmeStats.rows.reduce((acc, row) => {
      const progName = row.programme_name;
      if (progName && progName.trim()) {
        acc[progName] = parseInt(row.application_count) || 0;
      }
      return acc;
    }, {});

    const processedDepartments = departmentStats.rows.reduce((acc, row) => {
      const deptName = row.department_name;
      if (deptName && deptName.trim()) {
        acc[deptName] = parseInt(row.application_count) || 0;
      }
      return acc;
    }, {});

    const processedFaculties = facultyStats.rows.reduce((acc, row) => {
      const facultyName = row.faculty_name;
      if (facultyName && facultyName.trim()) {
        acc[facultyName] = parseInt(row.application_count) || 0;
      }
      return acc;
    }, {});

    const processedGender = genderStats.rows.reduce(
      (acc, row) => {
        const gender = row.gender;
        if (gender && gender.trim()) {
          const genderKey = gender.toLowerCase();
          if (["male", "female"].includes(genderKey)) {
            acc[genderKey] = parseInt(row.count) || 0;
          } else {
            acc["other"] = (acc["other"] || 0) + (parseInt(row.count) || 0);
          }
        }
        return acc;
      },
      { male: 0, female: 0, other: 0 }
    );

    const processedAgeGroups = ageStats.rows.reduce(
      (acc, row) => {
        const ageGroup = row.age_group;
        if (ageGroup && ageGroup !== "Unknown") {
          acc[ageGroup] = parseInt(row.count) || 0;
        }
        return acc;
      },
      { "18-25": 0, "26-35": 0, "36-45": 0, "46+": 0 }
    );

    const processedEmployment = employmentStats.rows.reduce(
      (acc, row) => {
        const status = row.employment_status;
        if (status && status.trim()) {
          const statusKey = status.toLowerCase();
          if (["employed", "unemployed"].includes(statusKey)) {
            acc[statusKey] = parseInt(row.count) || 0;
          } else {
            acc["other"] = (acc["other"] || 0) + (parseInt(row.count) || 0);
          }
        }
        return acc;
      },
      { employed: 0, unemployed: 0, other: 0 }
    );

    const processedMarital = maritalStats.rows.reduce(
      (acc, row) => {
        const status = row.marital_status;
        if (status && status.trim()) {
          const statusKey = status.toLowerCase();
          if (["single", "married", "divorced"].includes(statusKey)) {
            acc[statusKey] = parseInt(row.count) || 0;
          } else {
            acc["other"] = (acc["other"] || 0) + (parseInt(row.count) || 0);
          }
        }
        return acc;
      },
      { single: 0, married: 0, divorced: 0, other: 0 }
    );

    const processedEducation = educationStats.rows.reduce((acc, row) => {
      const education = row.previous_education;
      if (education && education.trim()) {
        acc[education] = parseInt(row.count) || 0;
      }
      return acc;
    }, {});

    const analytics = {
      summary: {
        totalApplications,
        ongoingApplications: parseInt(applicantCount),
        completedApplications: parseInt(completedCount),
        admittedStudents: parseInt(admittedCount),
        acceptanceFeePaid: parseInt(acceptancePaidCount),
        conversionRate: parseFloat(conversionRate),
        completionRate: parseFloat(completionRate),
        acceptanceRate: parseFloat(acceptanceRate),
      },

      monthlyTrends: monthlyTrends.rows.map((row) => ({
        month: row.month,
        ongoing: parseInt(row.ongoing),
        completed: parseInt(row.completed),
        admitted: parseInt(row.admitted),
      })),

      distributions: {
        programmes: processedProgrammes,
        departments: processedDepartments,
        faculties: processedFaculties,
        status: {
          ongoing: parseInt(applicantCount),
          completed: parseInt(completedCount),
          admitted: parseInt(admittedCount),
          acceptancePaid: parseInt(acceptancePaidCount),
        },
      },

      demographics: {
        gender: processedGender,
        ageGroups: processedAgeGroups,
        employment: processedEmployment,
        maritalStatus: processedMarital,
        previousEducation: processedEducation,
      },

      financial: {
        totalRevenue: parseFloat(financialStats.rows[0]?.total_revenue || 0),
        paymentCount: parseInt(financialStats.rows[0]?.payment_count || 0),
      },
    };

    return analytics;
  } catch (err) {
    console.error("Analytics error:", err);
    throw boom.boomify(err);
  }
};
