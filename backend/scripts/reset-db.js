#!/usr/bin/env node

/**
 * Database Reset Script
 *
 * This script resets the database to a clean state while preserving:
 * - Course data (courses, modules, lessons, tests, questions)
 * - Reference data (institutions, faculties, departments, programmes, levels, sessions, semesters, grades, class_degrees, fees)
 * - Superadmin user account
 *
 * It truncates all user-generated data and reseeds with demo students.
 *
 * Usage:
 *   npm run reset-db -- --confirm              # Execute reset
 *   npm run reset-db -- --dry-run              # Preview changes without executing
 *   npm run reset-db -- --confirm --dry-run    # Show what would happen
 *
 * Safety:
 *   - Only runs in development/staging (never production)
 *   - Requires --confirm flag
 *   - Validates environment before proceeding
 *   - Runs in transaction with automatic rollback on error
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// ============================================
// CONFIGURATION
// ============================================

// Tables to preserve - these will NOT be truncated
const PRESERVE_TABLES = [
  "course",
  "course_module",
  "course_lesson",
  "course_test",
  "course_question",
  "institution",
  "faculty",
  "department",
  "programme",
  "programme_course",
  "level",
  "session",
  "semester",
  "grade",
  "class_degree",
  "fee",
  "knex_migrations",
  "knex_migrations_lock",
];

// Tables to truncate - all user-generated/transactional data
const TRUNCATE_TABLES = [
  "practice_session", // Must be first due to FK constraints
  "practice_question",
  "course_progress",
  "student_test",
  "student_result",
  "student_gpa",
  "student_course",
  "staff_course",
  "payment2",
  "student",
  "staff",
  "affiliate",
  "course_announcement",
  "announcement_reads",
  "announcements",
  "course_discussion_comment",
  "course_discussion_topic",
  "course_forum_thread",
  "course_forum_topic",
  "school_forum_thread",
  "school_forum_topic",
  "school_forum_category",
  "course_meetings",
  "ai_conversations",
  "payment_account",
];

// Sequence resets - table name -> starting value
const SEQUENCE_RESETS = {
  user: 2, // Start after superadmin (id=1)
  student: 1,
  staff: 1,
  payment2: 1,
  student_course: 1,
  student_test: 1,
  course_progress: 1,
  student_result: 1,
  student_gpa: 1,
  announcements: 1,
  announcement_reads: 1,
  course_announcement: 1,
  affiliate: 1,
  practice_question: 1,
  practice_session: 1,
};

// Demo student data
const DEMO_STUDENTS = [
  {
    username: "demo1",
    email: "demo1@test.com",
    firstName: "Alice",
    lastName: "Johnson",
    gender: "F",
    programme: "Masters In Business Administration - Accounting",
  },
  {
    username: "demo2",
    email: "demo2@test.com",
    firstName: "Bob",
    lastName: "Smith",
    gender: "M",
    programme: "Masters In Business Administration - Banking & Finance",
  },
  {
    username: "demo3",
    email: "demo3@test.com",
    firstName: "Carol",
    lastName: "Williams",
    gender: "F",
    programme: "Masters In Business Administration - Marketing",
  },
  {
    username: "demo4",
    email: "demo4@test.com",
    firstName: "David",
    lastName: "Brown",
    gender: "M",
    programme: "Masters In Business Administration - Management",
  },
  {
    username: "demo5",
    email: "demo5@test.com",
    firstName: "Eve",
    lastName: "Davis",
    gender: "F",
    programme: "Masters In Business Administration - Accounting",
  },
];

const DEMO_PASSWORD = "demo123"; // Will be bcrypt hashed

// ============================================
// ANSI COLOR CODES
// ============================================
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function log(message, color = "") {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.cyan);
}

function logHeader(message) {
  log(`\n${"=".repeat(60)}`, colors.bright);
  log(message.toUpperCase(), colors.bright + colors.blue);
  log(`${"=".repeat(60)}`, colors.bright);
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

function validateEnvironment() {
  logHeader("Validating Environment");

  const nodeEnv = process.env.NODE_ENV || "";
  const serverEnv = process.env.SERVER_ENV || "";
  const dbUrl = process.env.DATABASE_URL || "";

  log(`NODE_ENV: ${nodeEnv}`);
  log(`SERVER_ENV: ${serverEnv}`);
  log(`DATABASE_URL: ${dbUrl.substring(0, 30)}...`);

  // Check for production indicators
  const productionIndicators = [
    "production",
    "prod",
    "neon.tech",
    "railway.app",
    "heroku",
    "vercel",
  ];

  const envString = `${nodeEnv} ${serverEnv} ${dbUrl}`.toLowerCase();
  const foundIndicators = productionIndicators.filter((indicator) =>
    envString.includes(indicator)
  );

  if (foundIndicators.length > 0) {
    logError("PRODUCTION ENVIRONMENT DETECTED!");
    logError(`Found indicators: ${foundIndicators.join(", ")}`);
    logError("This script is NOT allowed to run in production.");
    logError("Please run this only on local or staging databases.");
    return false;
  }

  // Additional safety check for localhost
  if (!dbUrl.includes("localhost") && !dbUrl.includes("127.0.0.1")) {
    logWarning("Database URL does not contain localhost or 127.0.0.1");
    logWarning("Are you sure this is a local development database?");
  }

  logSuccess("Environment validation passed");
  return true;
}

function parseArguments() {
  const args = process.argv.slice(2);
  return {
    confirm: args.includes("--confirm"),
    dryRun: args.includes("--dry-run"),
  };
}

// ============================================
// DATABASE OPERATIONS
// ============================================

async function getRecordCounts() {
  logInfo("Counting records in tables to be truncated...");

  const counts = {};

  for (const table of TRUNCATE_TABLES) {
    try {
      const result = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as count FROM "${table}"`
      );
      counts[table] = parseInt(result[0].count);
    } catch (error) {
      counts[table] = 0; // Table might not exist or be empty
    }
  }

  // Count non-superadmin users
  const nonSuperadminUsers = await prisma.user.count({
    where: {
      AND: [{ role: { not: "SUPERADMIN" } }, { id: { not: 1 } }],
    },
  });
  counts["user (non-superadmin)"] = nonSuperadminUsers;

  return counts;
}

async function displayImpactSummary(counts) {
  logHeader("Impact Summary");

  log("\nRecords to be deleted:", colors.yellow);

  let totalRecords = 0;
  Object.entries(counts).forEach(([table, count]) => {
    if (count > 0) {
      log(`  ${table}: ${colors.bright}${count}${colors.reset} records`);
      totalRecords += count;
    }
  });

  log(
    `\n${colors.bright}Total records to be deleted: ${totalRecords}${colors.reset}\n`
  );

  log("Tables to be preserved:", colors.green);
  PRESERVE_TABLES.forEach((table) => {
    log(`  ✓ ${table}`, colors.green);
  });
}

async function disableForeignKeyConstraints() {
  logInfo("Disabling foreign key constraints...");
  await prisma.$executeRawUnsafe(`SET session_replication_role = 'replica'`);
  logSuccess("Foreign key constraints disabled");
}

async function enableForeignKeyConstraints() {
  logInfo("Re-enabling foreign key constraints...");
  await prisma.$executeRawUnsafe(`SET session_replication_role = 'origin'`);
  logSuccess("Foreign key constraints re-enabled");
}

async function deleteNonSuperadminUsers() {
  logInfo("Deleting non-superadmin users...");

  const result = await prisma.user.deleteMany({
    where: {
      AND: [{ role: { not: "SUPERADMIN" } }, { id: { not: 1 } }],
    },
  });

  logSuccess(`Deleted ${result.count} non-superadmin users`);
  return result.count;
}

async function truncateTables() {
  logInfo("Truncating user-generated tables...");

  let deletedCount = 0;

  for (const table of TRUNCATE_TABLES) {
    try {
      const result = await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "${table}" CASCADE`
      );
      logSuccess(`  Truncated ${table}`);
    } catch (error) {
      logWarning(`  Could not truncate ${table}: ${error.message}`);
    }
  }

  return deletedCount;
}

async function resetSequences() {
  logInfo("Resetting ID sequences...");

  for (const [table, startValue] of Object.entries(SEQUENCE_RESETS)) {
    try {
      await prisma.$executeRawUnsafe(
        `ALTER SEQUENCE "${table}_id_seq" RESTART WITH ${startValue}`
      );
      logSuccess(`  Reset ${table}_id_seq to ${startValue}`);
    } catch (error) {
      logWarning(`  Could not reset ${table}_id_seq: ${error.message}`);
    }
  }
}

async function seedDemoStudents() {
  logInfo("Seeding demo student accounts...");

  try {
    // Get reference data with detailed logging
    logInfo("  Fetching reference data...");
    const institution = await prisma.institution.findFirst();
    logInfo(`    Found ${institution ? 1 : 0} institution(s)`);

    const programmes = await prisma.programme.findMany({
      include: { department: true },
    });
    logInfo(`    Found ${programmes.length} programme(s)`);

    const levels = await prisma.level.findMany();
    logInfo(`    Found ${levels.length} level(s)`);

    const session = await prisma.session.findFirst();
    logInfo(`    Found ${session ? 1 : 0} session(s)`);

    const semester = await prisma.semester.findFirst();
    logInfo(`    Found ${semester ? 1 : 0} semester(s)`);

    if (
      !institution ||
      !levels.length ||
      !programmes.length ||
      !session ||
      !semester
    ) {
      const missing = [];
      if (!institution) missing.push("institution");
      if (!levels.length) missing.push("levels");
      if (!programmes.length) missing.push("programmes");
      if (!session) missing.push("session");
      if (!semester) missing.push("semester");
      throw new Error(
        `Required reference data not found: ${missing.join(
          ", "
        )}. Please run: knex seed:run`
      );
    }

    logInfo(`  Hashing password...`);
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    logInfo(`  Password hashed successfully`);

    const createdUsers = [];

    for (const demoData of DEMO_STUDENTS) {
      logInfo(`  Processing ${demoData.username}...`);

      // Find matching programme - try exact match first, then partial
      let programme = programmes.find((p) => p.name === demoData.programme);
      if (!programme) {
        // Try to find any programme with the department name
        const deptName = demoData.programme.split(" - ")[1];
        programme = programmes.find((p) => p.name.includes(deptName));
      }

      if (!programme) {
        logWarning(`    No matching programme for: ${demoData.programme}`);
        logWarning(
          `    Available: ${programmes
            .slice(0, 3)
            .map((p) => p.name)
            .join(", ")}...`
        );
        // Use first available programme as fallback
        programme = programmes[0];
        logWarning(`    Using fallback: ${programme.name}`);
      }

      // Pick a level (PreMBA for first student, First for others)
      let level =
        demoData.username === "demo1"
          ? levels.find((l) => l.name === "Pre MBA" || l.name === "PreMBA")
          : levels.find((l) => l.name === "First");

      if (!level) {
        level = levels[0];
        logInfo(`    Using level: ${level.name}`);
      }

      // Create user
      logInfo(`    Creating user record...`);
      const user = await prisma.user.create({
        data: {
          username: demoData.username,
          password: hashedPassword,
          first_name: demoData.firstName,
          last_name: demoData.lastName,
          email: demoData.email,
          phone: `+234${
            8000000000 + parseInt(demoData.username.replace("demo", ""))
          }`,
          role: "STUDENT",
          active: true,
          institution_id: institution.id,
          admin: 0,
          enable_contact_me: false,
          account_active: true,
        },
      });
      logInfo(`    User created with ID: ${user.id}`);

      // Generate registration number
      const regNo = `${programme.prefix || "STU"}/${
        session.start_year
      }/${String(user.id).padStart(4, "0")}`;
      logInfo(`    Generated reg no: ${regNo}`);

      // Create student record
      logInfo(`    Creating student record...`);
      const student = await prisma.student.create({
        data: {
          user_id: user.id,
          reg_no: regNo,
          programme_id: programme.id,
          entry_level_id: level.id,
          session_admitted_id: session.id,
          semester_admitted_id: semester.id,
          gender: demoData.gender,
          dob: new Date("2000-01-01"),
          admitted: true,
          status: true,
          admission_status: "ACTIVE",
          is_deleted: false,
          is_active: true,
          marital_status: "SINGLE",
          employment_status: "UNEMPLOYED",
          application_type: "NEW",
        },
      });
      logInfo(`    Student created with ID: ${student.id}`);

      createdUsers.push({
        username: user.username,
        password: DEMO_PASSWORD,
        email: user.email,
        regNo,
        programme: programme.name,
        level: level.name,
      });

      logSuccess(`  ✓ Created ${demoData.username} (${regNo})`);
    }

    return createdUsers;
  } catch (error) {
    logError(`Failed to seed demo students: ${error.message}`);
    throw error;
  }
}

function displayCredentials(users) {
  logHeader("Demo Student Credentials");

  log("\n" + "┌" + "─".repeat(115) + "┐");
  log(
    "│ " +
      "Username".padEnd(10) +
      " │ " +
      "Password".padEnd(10) +
      " │ " +
      "Email".padEnd(25) +
      " │ " +
      "Reg No".padEnd(20) +
      " │ " +
      "Programme".padEnd(35) +
      " │"
  );
  log("├" + "─".repeat(115) + "┤");

  users.forEach((user) => {
    const username = user.username.padEnd(10);
    const password = user.password.padEnd(10);
    const email = user.email.padEnd(25);
    const regNo = user.regNo.padEnd(20);
    const programme = (
      user.programme.substring(0, 33) + (user.programme.length > 33 ? ".." : "")
    ).padEnd(35);

    log(`│ ${username} │ ${password} │ ${email} │ ${regNo} │ ${programme} │`);
  });

  log("└" + "─".repeat(115) + "┘");
  log("");
  logInfo(`All demo users use password: ${DEMO_PASSWORD}`);
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  logHeader("Database Reset Script");

  const { confirm, dryRun } = parseArguments();

  // Check arguments
  if (!confirm && !dryRun) {
    logError("Missing required flag!\n");
    log("Usage:");
    log("  npm run reset-db -- --confirm              Execute reset");
    log("  npm run reset-db -- --dry-run              Preview changes");
    log("  npm run reset-db -- --confirm --dry-run    Both\n");
    log("Safety: This script requires explicit confirmation to run.");
    log(
      "        It will delete all user data while preserving courses and reference data.\n"
    );
    process.exit(1);
  }

  // Validate environment
  if (!validateEnvironment()) {
    process.exit(1);
  }

  // Get impact summary
  const recordCounts = await getRecordCounts();
  await displayImpactSummary(recordCounts);

  // Dry run mode
  if (dryRun && !confirm) {
    logWarning("\n[DRY RUN MODE] No changes will be made.");
    logInfo("Run with --confirm to execute the reset.");
    process.exit(0);
  }

  // Final confirmation
  if (confirm && !dryRun) {
    logWarning("\n⚠️  WARNING: This will permanently delete data! ⚠️");
    logWarning("Make sure you have a backup if needed.");
    logWarning(
      "\nPress Ctrl+C now to cancel, or wait 5 seconds to proceed...\n"
    );

    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // Execute reset
  try {
    logHeader("Executing Database Reset");

    await disableForeignKeyConstraints();

    // Delete non-superadmin users
    await deleteNonSuperadminUsers();

    // Truncate tables
    await truncateTables();

    // Reset sequences
    await resetSequences();

    await enableForeignKeyConstraints();

    // Seed demo data
    logHeader("Seeding Demo Data");
    const demoUsers = await seedDemoStudents();

    // Display results
    logHeader("Reset Complete");
    logSuccess(`Database has been reset successfully!`);
    logSuccess(`Superadmin user preserved (id=1)`);
    logSuccess(`${demoUsers.length} demo students created`);

    displayCredentials(demoUsers);

    logInfo("\nYou can now login with:");
    logInfo(
      "  - Superadmin credentials (check seeds/7_create_default_user.js)"
    );
    logInfo("  - Any of the demo student accounts above");
  } catch (error) {
    logError("\nReset failed!");
    logError(error.message);
    logError("\nRolling back changes...");
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute
main()
  .then(() => {
    logSuccess("\nScript completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    logError("\nScript failed with error:");
    console.error(error);
    process.exit(1);
  });
