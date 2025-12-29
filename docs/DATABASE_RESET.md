# Database Reset Script

## Overview

The database reset script (`backend/scripts/reset-db.js`) provides a safe way to reset your development database to a clean state while preserving course content and reference data.

## What Gets Preserved

The script preserves all essential reference and course data:

### ✅ Preserved Tables

- **Course Data**: `course`, `course_module`, `course_lesson`, `course_test`, `course_question`
- **Reference Data**: `institution`, `faculty`, `department`, `programme`, `programme_course`, `level`, `session`, `semester`, `grade`, `class_degree`, `fee`
- **System Tables**: `knex_migrations`, `knex_migrations_lock`
- **Superadmin User**: User with `role='SUPERADMIN'` or `id=1`

## What Gets Deleted

All user-generated and transactional data is removed:

### ❌ Truncated Tables

- User data: `student`, `staff`, non-superadmin `user` records
- Course activity: `course_progress`, `student_course`, `staff_course`
- Assessments: `student_test`, `student_result`, `student_gpa`
- Practice questions: `practice_question`, `practice_session`
- Payments: `payment2`, `payment_account`
- Forums: `course_forum_*`, `school_forum_*`, `course_discussion_*`
- Announcements: `announcements`, `announcement_reads`, `course_announcement`
- Meetings: `course_meetings`
- Other: `affiliate`, `ai_conversations`

## What Gets Seeded

After cleanup, the script seeds demo data:

### 🌱 Demo Students

- **5 demo student accounts** with credentials:
  - Usernames: `demo1`, `demo2`, `demo3`, `demo4`, `demo5`
  - Password: `demo123` (all accounts)
  - Each linked to different MBA programmes
  - Registration numbers auto-generated
  - Proper student records with admission details

## Usage

### Preview Changes (Dry Run)

```bash
npm run reset-db:preview
# OR
npm run reset-db -- --dry-run
```

This shows what will be deleted **without actually making changes**.

### Execute Reset

```bash
npm run reset-db -- --confirm
```

This will:

1. Validate environment (blocks production)
2. Show impact summary with record counts
3. Wait 5 seconds for cancellation (Ctrl+C to abort)
4. Execute the reset in a transaction
5. Display demo credentials

## Safety Features

### 🔒 Production Protection

The script will **refuse to run** if it detects:

- `NODE_ENV=production`
- `SERVER_ENV=production`
- Production database URLs (neon.tech, railway, heroku, vercel, etc.)

### 🛡️ Safety Mechanisms

- **Requires `--confirm` flag**: Won't run without explicit confirmation
- **Environment validation**: Multi-layer production detection
- **Impact preview**: Shows exactly what will be deleted
- **5-second countdown**: Time to cancel before execution
- **Transaction wrapper**: Automatic rollback on any error
- **Foreign key handling**: Properly disables/re-enables constraints

## Example Output

```
============================================================
DATABASE RESET SCRIPT
============================================================

Validating Environment
NODE_ENV: development
SERVER_ENV: development
DATABASE_URL: postgres://postgres@localhost:5432...
✓ Environment validation passed

Impact Summary

Records to be deleted:
  student: 127 records
  staff: 15 records
  user (non-superadmin): 145 records
  payment2: 89 records
  student_course: 234 records
  ...

Total records to be deleted: 1,234

Tables to be preserved:
  ✓ course
  ✓ course_module
  ✓ institution
  ...

⚠️  WARNING: This will permanently delete data! ⚠️
Make sure you have a backup if needed.

Press Ctrl+C now to cancel, or wait 5 seconds to proceed...

============================================================
EXECUTING DATABASE RESET
============================================================

ℹ Disabling foreign key constraints...
✓ Foreign key constraints disabled
ℹ Deleting non-superadmin users...
✓ Deleted 145 non-superadmin users
ℹ Truncating user-generated tables...
✓ Truncated practice_session
✓ Truncated student
...

============================================================
DEMO STUDENT CREDENTIALS
============================================================

┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Username   │ Password   │ Email                     │ Reg No               │ Programme                           │
├───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ demo1      │ demo123    │ demo1@test.com            │ MBA/2019/0002        │ Masters In Business Administrat..  │
│ demo2      │ demo123    │ demo2@test.com            │ MBA/2019/0003        │ Masters In Business Administrat..  │
│ demo3      │ demo123    │ demo3@test.com            │ MBA/2019/0004        │ Masters In Business Administrat..  │
│ demo4      │ demo123    │ demo4@test.com            │ MBA/2019/0005        │ Masters In Business Administrat..  │
│ demo5      │ demo123    │ demo5@test.com            │ MBA/2019/0006        │ Masters In Business Administrat..  │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

ℹ All demo users use password: demo123
```

## Sequence Resets

The script resets auto-increment sequences to clean values:

- `user_id_seq` → starts at 2 (after superadmin)
- `student_id_seq` → starts at 1
- Other sequences → start at 1

This ensures clean, sequential IDs for new records.

## Troubleshooting

### Script won't run

- **Check environment variables**: Ensure `NODE_ENV` is not "production"
- **Database URL**: Must point to localhost/127.0.0.1 for safety
- **Missing `--confirm` flag**: Required for execution

### Errors during execution

- Script uses transactions and will rollback on error
- Check PostgreSQL logs for constraint violations
- Ensure database is running and accessible

### Superadmin login not working

- Superadmin credentials are in `backend/db/seeds/7_create_default_user.js`
- Default: username `omotayo`, check the seed file for password hash
- If lost, re-run the seed: `knex seed:run --specific=7_create_default_user.js`

## Development Workflow

### Typical Usage Pattern

1. **During development** when you need fresh demo data:

   ```bash
   npm run reset-db:preview  # Check what will be deleted
   npm run reset-db -- --confirm  # Execute reset
   ```

2. **After migration** or schema changes:

   ```bash
   npx prisma db push  # Apply schema changes
   npm run reset-db -- --confirm  # Reset with new schema
   ```

3. **Testing with clean slate**:
   ```bash
   npm run reset-db -- --confirm
   npm run dev  # Start with fresh demo data
   ```

## Notes

- ⏱️ **Execution time**: Usually completes in 5-10 seconds
- 🔄 **Idempotent**: Can be run multiple times safely
- 📦 **Demo data**: Always creates same 5 students with same credentials
- 🎓 **Course content**: All courses, modules, lessons preserved
- 🏛️ **Institution setup**: All academic structure remains intact

## Files Modified

- `backend/scripts/reset-db.js` - Main reset script
- `package.json` - Added npm scripts
- This README

## Future Enhancements

Potential improvements:

- [ ] Interactive mode with prompts
- [ ] Custom demo data from JSON file
- [ ] Selective truncation (choose which tables)
- [ ] Backup creation before reset
- [ ] Grade seed data inclusion
- [ ] Redis cache flush integration
