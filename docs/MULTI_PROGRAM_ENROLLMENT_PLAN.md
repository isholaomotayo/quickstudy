# Multi-Program Enrollment System - Implementation Plan

**Date:** December 10, 2025
**Status:** Planning Phase
**Priority:** High

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current System Analysis](#current-system-analysis)
3. [Proposed Architecture](#proposed-architecture)
4. [Database Schema Changes](#database-schema-changes)
5. [Backend Services & Helpers](#backend-services--helpers)
6. [API Routes](#api-routes)
7. [UI Components](#ui-components)
8. [Payment Integration](#payment-integration)
9. [Migration Strategy](#migration-strategy)
10. [Implementation Timeline](#implementation-timeline)
11. [Testing Strategy](#testing-strategy)
12. [Success Criteria](#success-criteria)

---

## Executive Summary

### Problem Statement
The current system restricts students to a single program enrollment by creating multiple `student` records per user. This approach leads to:
- Inconsistent state management
- Complex data integrity challenges
- Difficult user experience when switching between programs
- Fragmented student data across multiple records

### Solution
Implement a single-student, multi-program enrollment architecture where:
- One user maintains **one student record**
- Students can enroll in **multiple programs simultaneously**
- Each program enrollment is tracked independently via a junction table
- Courses are grouped by program and level in the UI
- Compulsory courses are auto-enrolled upon admission
- Payments are tracked per program enrollment

### Key Benefits
- Clean, maintainable architecture
- Single source of truth for student data
- Seamless program switching in UI
- Independent level progression per program
- Clear payment tracking per program
- Better user experience

---

## Current System Analysis

### Existing Architecture
```
user (APPLICANT/STUDENT)
  └─ student (multiple records per user)
      ├─ programme_id (single program)
      ├─ status (marks active program)
      ├─ application_type (NEW or ADDITIONAL)
      └─ admission details
```

### Current Issues
1. **Multiple student records per user** - Creates data fragmentation
2. **Status field confusion** - `status` and `is_active` fields overlap
3. **Hard program switching** - Requires changing active student record
4. **Course registration complexity** - Manual approval workflow
5. **Payment tracking** - Difficult to attribute to specific programs

### Current Database Fields (Student Table)
- `id` - Student record ID
- `user_id` - Link to user
- `programme_id` - Single program (limitation)
- `status` - Active program indicator
- `is_active` - System activity indicator
- `application_type` - NEW or ADDITIONAL
- `session_admitted_id`, `semester_admitted_id`, `entry_level_id` - Admission details
- `reg_no` - Registration number

---

## Proposed Architecture

### New Architecture
```
user (STUDENT)
  └─ student (ONE record)
      └─ student_programme (multiple program enrollments)
          ├─ programme_id (specific program)
          ├─ status (PENDING/APPROVED/REJECTED)
          ├─ is_active_selection (UI selection)
          ├─ admission details per program
          ├─ student_course (courses for this program)
          ├─ payment2 (payments for this program)
          └─ course_progress (progress for this program)
```

### Key Principles
1. **Single Student Record** - One `student` record per user
2. **Junction Table** - `student_programme` links students to multiple programs
3. **Independent Tracking** - Each program tracks its own level, courses, payments
4. **Active Selection** - One program is "active" for UI display at a time
5. **Auto-Enrollment** - Compulsory courses enrolled automatically on admission
6. **Elective Selection** - Students manually select elective courses

---

## Database Schema Changes

### 1. Create `student_programme` Junction Table

**Purpose:** Link students to multiple programs with independent tracking

```prisma
model student_programme {
  id                    BigInt    @id @default(autoincrement())
  student_id            BigInt
  programme_id          Int

  // Application status
  status                String    @default("PENDING") @db.VarChar(50) // PENDING, APPROVED, REJECTED
  is_active_selection   Boolean   @default(false) // Which program is currently selected in UI
  application_type      String    @default("NEW") @db.VarChar(50) // NEW or ADDITIONAL

  // Admission details (per program)
  session_admitted_id   Int?
  semester_admitted_id  Int?
  entry_level_id        Int?
  admitted              Boolean   @default(false)
  reg_no                String?   @db.VarChar(255) // Program-specific registration number

  // Timestamps
  applied_at            DateTime  @default(now()) @db.Timestamptz(6)
  approved_at           DateTime? @db.Timestamptz(6)
  rejected_at           DateTime? @db.Timestamptz(6)
  rejection_reason      String?
  created_at            DateTime  @default(now()) @db.Timestamptz(6)
  updated_at            DateTime  @default(now()) @db.Timestamptz(6)

  // Relations
  student               student   @relation(fields: [student_id], references: [id], onDelete: Cascade)
  programme             programme @relation(fields: [programme_id], references: [id], onDelete: Cascade)
  session               session?  @relation(fields: [session_admitted_id], references: [id])
  semester              semester? @relation(fields: [semester_admitted_id], references: [id])
  level                 level?    @relation(fields: [entry_level_id], references: [id])

  // Reverse relations
  student_course        student_course[]
  payments              payment2[]
  course_progress       course_progress[]

  @@unique([student_id, programme_id], name: "unique_student_programme")
  @@index([student_id, is_active_selection], name: "idx_student_active_programme")
  @@index([programme_id, status], name: "idx_programme_status")
  @@index([status], name: "idx_status")
}
```

**Migration SQL:**
```sql
CREATE TABLE student_programme (
  id BIGSERIAL PRIMARY KEY,
  student_id BIGINT NOT NULL,
  programme_id INT NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
  is_active_selection BOOLEAN DEFAULT false NOT NULL,
  application_type VARCHAR(50) DEFAULT 'NEW' NOT NULL,
  session_admitted_id INT,
  semester_admitted_id INT,
  entry_level_id INT,
  admitted BOOLEAN DEFAULT false NOT NULL,
  reg_no VARCHAR(255),
  applied_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES student(id) ON DELETE CASCADE,
  CONSTRAINT fk_programme FOREIGN KEY (programme_id) REFERENCES programme(id) ON DELETE CASCADE,
  CONSTRAINT fk_session FOREIGN KEY (session_admitted_id) REFERENCES session(id),
  CONSTRAINT fk_semester FOREIGN KEY (semester_admitted_id) REFERENCES semester(id),
  CONSTRAINT fk_level FOREIGN KEY (entry_level_id) REFERENCES level(id),
  CONSTRAINT unique_student_programme UNIQUE (student_id, programme_id)
);

CREATE INDEX idx_student_active_programme ON student_programme(student_id, is_active_selection);
CREATE INDEX idx_programme_status ON student_programme(programme_id, status);
CREATE INDEX idx_status ON student_programme(status);
```

---

### 2. Modify `programme_course` Table

**Purpose:** Distinguish compulsory vs. elective courses per program

**Add field:**
```prisma
model programme_course {
  // ... existing fields ...
  course_type String @default("COMPULSORY") @db.VarChar(50) // COMPULSORY or ELECTIVE
}
```

**Migration SQL:**
```sql
ALTER TABLE programme_course
ADD COLUMN course_type VARCHAR(50) DEFAULT 'COMPULSORY' NOT NULL;

-- Create index for filtering
CREATE INDEX idx_programme_course_type ON programme_course(programme_id, course_type);
```

---

### 3. Modify `student_course` Table

**Purpose:** Link course enrollments to specific program enrollment

**Add field:**
```prisma
model student_course {
  // ... existing fields ...
  student_programme_id BigInt?
  student_programme    student_programme? @relation(fields: [student_programme_id], references: [id], onDelete: Cascade)

  @@index([student_programme_id], name: "idx_student_programme")
}
```

**Migration SQL:**
```sql
ALTER TABLE student_course
ADD COLUMN student_programme_id BIGINT;

ALTER TABLE student_course
ADD CONSTRAINT fk_student_programme
FOREIGN KEY (student_programme_id)
REFERENCES student_programme(id)
ON DELETE CASCADE;

CREATE INDEX idx_student_programme ON student_course(student_programme_id);
```

---

### 4. Modify `payment2` Table

**Purpose:** Track payments per program enrollment

**Add field:**
```prisma
model payment2 {
  // ... existing fields ...
  student_programme_id BigInt?
  student_programme    student_programme? @relation(fields: [student_programme_id], references: [id])

  @@index([student_programme_id], name: "idx_payment_programme")
}
```

**Migration SQL:**
```sql
ALTER TABLE payment2
ADD COLUMN student_programme_id BIGINT;

ALTER TABLE payment2
ADD CONSTRAINT fk_student_programme
FOREIGN KEY (student_programme_id)
REFERENCES student_programme(id);

CREATE INDEX idx_payment_programme ON payment2(student_programme_id);
```

---

### 5. Modify `course_progress` Table

**Purpose:** Track progress per program enrollment

**Add field:**
```prisma
model course_progress {
  // ... existing fields ...
  student_programme_id BigInt?
  student_programme    student_programme? @relation(fields: [student_programme_id], references: [id], onDelete: Cascade)

  @@index([student_programme_id], name: "idx_progress_programme")
}
```

**Migration SQL:**
```sql
ALTER TABLE course_progress
ADD COLUMN student_programme_id BIGINT;

ALTER TABLE course_progress
ADD CONSTRAINT fk_student_programme
FOREIGN KEY (student_programme_id)
REFERENCES student_programme(id)
ON DELETE CASCADE;

CREATE INDEX idx_progress_programme ON course_progress(student_programme_id);
```

---

### 6. Modify `student` Table

**Purpose:** Add relation to `student_programme` (keep legacy fields for compatibility)

**Add relation:**
```prisma
model student {
  // ... existing fields ...
  student_programmes student_programme[]

  // NOTE: Keep programme_id, entry_level_id, session_admitted_id, semester_admitted_id
  // for backward compatibility but mark as DEPRECATED in code comments
}
```

**Notes:**
- No migration needed (only adding reverse relation)
- Legacy fields remain for backward compatibility
- Will be gradually deprecated in favor of `student_programme`

---

## Backend Services & Helpers

### 1. Create `helpers/studentProgrammeContext.ts`

**Purpose:** Core service for managing program enrollments

**Key Functions:**

#### `getUserProgrammeEnrollments(studentId: BigInt)`
```typescript
/**
 * Get all program enrollments for a student
 * @returns Array of student_programme records with programme details
 */
export async function getUserProgrammeEnrollments(studentId: bigint) {
  return await prisma.student_programme.findMany({
    where: { student_id: studentId },
    include: {
      programme: {
        select: {
          id: true,
          name: true,
          prefix: true,
          years: true,
          department: {
            select: {
              id: true,
              name: true,
              faculty: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      session: { select: { id: true, name: true } },
      semester: { select: { id: true, name: true } },
      level: { select: { id: true, name: true } },
    },
    orderBy: [
      { is_active_selection: 'desc' },
      { created_at: 'asc' }
    ],
  });
}
```

#### `getActiveProgrammeEnrollment(studentId: BigInt)`
```typescript
/**
 * Get the currently active/selected program enrollment
 * @returns Active student_programme record or first approved enrollment
 */
export async function getActiveProgrammeEnrollment(studentId: bigint) {
  const enrollments = await getUserProgrammeEnrollments(studentId);

  // Return active selection or first approved enrollment
  return enrollments.find(e => e.is_active_selection)
    || enrollments.find(e => e.status === 'APPROVED')
    || enrollments[0]
    || null;
}
```

#### `setActiveProgrammeEnrollment(studentId: BigInt, studentProgrammeId: BigInt)`
```typescript
/**
 * Switch the active program selection
 * @returns Updated student_programme record
 */
export async function setActiveProgrammeEnrollment(
  studentId: bigint,
  studentProgrammeId: bigint
) {
  // Verify enrollment belongs to student
  const enrollment = await prisma.student_programme.findFirst({
    where: {
      id: studentProgrammeId,
      student_id: studentId,
    },
  });

  if (!enrollment) {
    throw new Error('Programme enrollment not found or access denied');
  }

  // Transaction: deactivate all, activate target
  return await prisma.$transaction(async (tx) => {
    // Deactivate all enrollments for this student
    await tx.student_programme.updateMany({
      where: { student_id: studentId },
      data: { is_active_selection: false },
    });

    // Activate target enrollment
    return await tx.student_programme.update({
      where: { id: studentProgrammeId },
      data: {
        is_active_selection: true,
        updated_at: new Date(),
      },
    });
  });
}
```

#### `applyForProgramme(studentId: BigInt, programmeId: number)`
```typescript
/**
 * Create new program application
 * @returns New student_programme record
 */
export async function applyForProgramme(studentId: bigint, programmeId: number) {
  // Check if already enrolled/applied
  const existing = await prisma.student_programme.findFirst({
    where: {
      student_id: studentId,
      programme_id: programmeId,
    },
  });

  if (existing) {
    throw new Error('You already have an application/enrollment for this program');
  }

  // Get existing enrollments to determine application type
  const enrollments = await getUserProgrammeEnrollments(studentId);
  const applicationType = enrollments.length > 0 ? 'ADDITIONAL' : 'NEW';

  // Create new enrollment
  return await prisma.student_programme.create({
    data: {
      student_id: studentId,
      programme_id: programmeId,
      status: 'PENDING',
      application_type: applicationType,
      is_active_selection: enrollments.length === 0, // First enrollment is active
      applied_at: new Date(),
    },
    include: {
      programme: true,
    },
  });
}
```

#### `approveProgrammeEnrollment(studentProgrammeId: BigInt, admissionDetails)`
```typescript
/**
 * Approve program enrollment and trigger auto-enrollment
 * @param admissionDetails { sessionId, semesterId, levelId }
 */
export async function approveProgrammeEnrollment(
  studentProgrammeId: bigint,
  admissionDetails: {
    sessionId: number;
    semesterId: number;
    levelId: number;
  }
) {
  const { sessionId, semesterId, levelId } = admissionDetails;

  return await prisma.$transaction(async (tx) => {
    // Get enrollment
    const enrollment = await tx.student_programme.findUnique({
      where: { id: studentProgrammeId },
      include: { programme: true },
    });

    if (!enrollment) {
      throw new Error('Programme enrollment not found');
    }

    // Generate registration number
    const regNo = await generateRegistrationNumber(
      enrollment.programme,
      sessionId,
      tx
    );

    // Update enrollment
    const updated = await tx.student_programme.update({
      where: { id: studentProgrammeId },
      data: {
        status: 'APPROVED',
        admitted: true,
        session_admitted_id: sessionId,
        semester_admitted_id: semesterId,
        entry_level_id: levelId,
        reg_no: regNo,
        approved_at: new Date(),
      },
    });

    // Auto-enroll in compulsory courses
    await autoEnrollCompulsoryCourses(studentProgrammeId, levelId, tx);

    return updated;
  });
}
```

#### `rejectProgrammeEnrollment(studentProgrammeId: BigInt, reason: string)`
```typescript
/**
 * Reject program enrollment
 */
export async function rejectProgrammeEnrollment(
  studentProgrammeId: bigint,
  reason: string
) {
  return await prisma.student_programme.update({
    where: { id: studentProgrammeId },
    data: {
      status: 'REJECTED',
      rejected_at: new Date(),
      rejection_reason: reason,
    },
  });
}
```

#### `calculateCurrentLevel(studentProgrammeId: BigInt)`
```typescript
/**
 * Calculate current level based on admission date and semesters elapsed
 */
export async function calculateCurrentLevel(studentProgrammeId: bigint) {
  const enrollment = await prisma.student_programme.findUnique({
    where: { id: studentProgrammeId },
    include: {
      student: {
        select: { user_id: true },
      },
    },
  });

  if (!enrollment || !enrollment.semester_admitted_id || !enrollment.entry_level_id) {
    throw new Error('Enrollment not found or missing admission details');
  }

  // Get current active semester
  const currentSemester = await prisma.semester.findFirst({
    where: { is_active: true },
  });

  if (!currentSemester) {
    throw new Error('No active semester found');
  }

  // Calculate level progression (2 semesters = 1 level)
  const semestersDifference = Number(currentSemester.id) - enrollment.semester_admitted_id;
  const levelsProgressed = Math.floor(semestersDifference / 2);
  const calculatedLevelId = enrollment.entry_level_id + levelsProgressed;

  // Validate against actual levels
  const validLevels = await prisma.level.findMany();
  const validLevelIds = validLevels.map(l => Number(l.id));

  const finalLevelId = validLevelIds.includes(calculatedLevelId)
    ? calculatedLevelId
    : validLevelIds.reduce((closest, levelId) =>
        Math.abs(levelId - calculatedLevelId) < Math.abs(closest - calculatedLevelId)
          ? levelId
          : closest
      );

  return {
    levelId: finalLevelId,
    levelDisplay: finalLevelId * 100,
    currentSemesterId: Number(currentSemester.id),
    semesterName: currentSemester.name,
  };
}
```

---

### 2. Create `services/autoEnrollmentService.ts`

**Purpose:** Auto-enrollment for compulsory courses

#### `autoEnrollCompulsoryCourses(studentProgrammeId, levelId, tx?)`
```typescript
/**
 * Auto-enroll student in all compulsory courses for their current level
 * @param tx Optional transaction client
 */
export async function autoEnrollCompulsoryCourses(
  studentProgrammeId: bigint,
  levelId: number,
  tx?: any
) {
  const prismaClient = tx || prisma;

  // Get enrollment details
  const enrollment = await prismaClient.student_programme.findUnique({
    where: { id: studentProgrammeId },
    include: { student: true },
  });

  if (!enrollment) {
    throw new Error('Programme enrollment not found');
  }

  // Get current active semester
  const currentSemester = await prismaClient.semester.findFirst({
    where: { is_active: true },
  });

  if (!currentSemester) {
    throw new Error('No active semester found');
  }

  // Get all compulsory courses for this program and level
  const compulsoryCourses = await prismaClient.programme_course.findMany({
    where: {
      programme_id: enrollment.programme_id,
      level_id: levelId,
      course_type: 'COMPULSORY',
    },
    include: {
      course: true,
    },
  });

  // Enroll in each course
  const enrollments = [];
  for (const pc of compulsoryCourses) {
    // Check if already enrolled
    const existing = await prismaClient.student_course.findFirst({
      where: {
        student_id: enrollment.student_id,
        course_id: pc.course_id,
        student_programme_id: studentProgrammeId,
      },
    });

    if (!existing) {
      const enrolled = await prismaClient.student_course.create({
        data: {
          student_id: enrollment.student_id,
          course_id: pc.course_id!,
          student_programme_id: studentProgrammeId,
          semester_id: Number(currentSemester.id),
          level_id: levelId,
          units: pc.course!.units,
          approval_status: true, // Auto-approved for compulsory
          cleared: false,
        },
      });

      enrollments.push(enrolled);
    }
  }

  return enrollments;
}
```

#### `getAvailableElectives(studentProgrammeId, levelId)`
```typescript
/**
 * Get available elective courses for selection
 */
export async function getAvailableElectives(
  studentProgrammeId: bigint,
  levelId: number
) {
  const enrollment = await prisma.student_programme.findUnique({
    where: { id: studentProgrammeId },
  });

  if (!enrollment) {
    throw new Error('Programme enrollment not found');
  }

  // Get elective courses
  const electives = await prisma.programme_course.findMany({
    where: {
      programme_id: enrollment.programme_id,
      level_id: levelId,
      course_type: 'ELECTIVE',
    },
    include: {
      course: {
        select: {
          id: true,
          code: true,
          name: true,
          units: true,
          description: true,
        },
      },
      level: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Get already enrolled courses
  const enrolled = await prisma.student_course.findMany({
    where: {
      student_id: enrollment.student_id,
      student_programme_id: studentProgrammeId,
      level_id: levelId,
    },
    select: {
      course_id: true,
    },
  });

  const enrolledCourseIds = enrolled.map(e => e.course_id);

  // Filter out enrolled courses
  return electives.filter(e => !enrolledCourseIds.includes(e.course_id));
}
```

#### `enrollStudentInCourse(studentProgrammeId, courseId)`
```typescript
/**
 * Enroll student in a single course (typically elective)
 */
export async function enrollStudentInCourse(
  studentProgrammeId: bigint,
  courseId: number
) {
  const enrollment = await prisma.student_programme.findUnique({
    where: { id: studentProgrammeId },
  });

  if (!enrollment || enrollment.status !== 'APPROVED') {
    throw new Error('Programme enrollment not approved');
  }

  // Get course details and verify it's an elective for this program
  const programmeCourse = await prisma.programme_course.findFirst({
    where: {
      programme_id: enrollment.programme_id,
      course_id: courseId,
      course_type: 'ELECTIVE',
    },
    include: {
      course: true,
    },
  });

  if (!programmeCourse) {
    throw new Error('Course not found or not an elective for this program');
  }

  // Get current semester
  const currentSemester = await prisma.semester.findFirst({
    where: { is_active: true },
  });

  if (!currentSemester) {
    throw new Error('No active semester found');
  }

  // Check if already enrolled
  const existing = await prisma.student_course.findFirst({
    where: {
      student_id: enrollment.student_id,
      course_id: courseId,
      student_programme_id: studentProgrammeId,
    },
  });

  if (existing) {
    throw new Error('Already enrolled in this course');
  }

  // Create enrollment
  return await prisma.student_course.create({
    data: {
      student_id: enrollment.student_id,
      course_id: courseId,
      student_programme_id: studentProgrammeId,
      semester_id: Number(currentSemester.id),
      level_id: programmeCourse.level_id!,
      units: programmeCourse.course!.units,
      approval_status: false, // Pending approval for electives
      cleared: false,
    },
  });
}
```

#### `removeStudentFromCourse(studentCourseId, studentId)`
```typescript
/**
 * Unenroll student from course (only electives)
 */
export async function removeStudentFromCourse(
  studentCourseId: bigint,
  studentId: bigint
) {
  // Get course enrollment
  const enrollment = await prisma.student_course.findFirst({
    where: {
      id: studentCourseId,
      student_id: studentId,
    },
    include: {
      course: true,
      student_programme: true,
    },
  });

  if (!enrollment) {
    throw new Error('Course enrollment not found');
  }

  // Check if it's an elective
  const programmeCourse = await prisma.programme_course.findFirst({
    where: {
      programme_id: enrollment.student_programme?.programme_id,
      course_id: enrollment.course_id,
    },
  });

  if (programmeCourse?.course_type === 'COMPULSORY') {
    throw new Error('Cannot unenroll from compulsory courses');
  }

  // Delete enrollment
  return await prisma.student_course.delete({
    where: { id: studentCourseId },
  });
}
```

---

## API Routes

### 1. Student Programme Management APIs

#### `GET /api/student/programmes`
**Purpose:** List all program enrollments for authenticated student

**Response:**
```typescript
{
  success: true,
  enrollments: [
    {
      id: "1",
      programme: {
        id: 1,
        name: "MBA",
        prefix: "MBA",
        department: {...},
        faculty: {...}
      },
      status: "APPROVED",
      is_active_selection: true,
      application_type: "NEW",
      admitted: true,
      reg_no: "MBA/24/001",
      entry_level: { id: 1, name: "Level 100" },
      current_level: { id: 1, name: "Level 100" },
      session: { id: 1, name: "2024/2025" },
      semester: { id: 1, name: "First Semester" },
      applied_at: "2024-01-01T00:00:00Z",
      approved_at: "2024-01-15T00:00:00Z"
    }
  ],
  active_enrollment: {...}
}
```

---

#### `POST /api/student/programmes`
**Purpose:** Apply for additional program

**Request:**
```typescript
{
  programme_id: 2
}
```

**Response:**
```typescript
{
  success: true,
  message: "Application submitted successfully",
  enrollment: {
    id: "2",
    programme: {...},
    status: "PENDING",
    application_type: "ADDITIONAL"
  }
}
```

---

#### `GET /api/student/programmes/[id]`
**Purpose:** Get specific program enrollment details

**Response:**
```typescript
{
  success: true,
  enrollment: {
    id: "1",
    programme: {...},
    status: "APPROVED",
    courses_count: 12,
    compulsory_courses: 10,
    elective_courses: 2,
    total_payments: 50000,
    pending_payments: 0
  }
}
```

---

#### `PUT /api/student/programmes/[id]`
**Purpose:** Update program enrollment (limited to non-sensitive fields)

**Request:**
```typescript
{
  // Future: could include preferences, notes, etc.
}
```

---

#### `DELETE /api/student/programmes/[id]`
**Purpose:** Withdraw from program (soft delete or status change)

**Response:**
```typescript
{
  success: true,
  message: "Withdrawn from programme successfully"
}
```

---

#### `POST /api/student/programmes/[id]/activate`
**Purpose:** Switch active program selection

**Response:**
```typescript
{
  success: true,
  message: "Active programme switched successfully",
  active_enrollment: {...}
}
```

---

### 2. Admin Programme Approval APIs

#### `GET /api/dashboard/programme-enrollments`
**Purpose:** List all program enrollments with filters

**Query Parameters:**
- `status` - Filter by PENDING/APPROVED/REJECTED
- `programme_id` - Filter by programme
- `application_type` - Filter by NEW/ADDITIONAL
- `page`, `limit` - Pagination

**Response:**
```typescript
{
  success: true,
  enrollments: [...],
  pagination: {
    total: 100,
    page: 1,
    limit: 20,
    total_pages: 5
  },
  statistics: {
    total: 100,
    pending: 25,
    approved: 70,
    rejected: 5
  }
}
```

---

#### `POST /api/dashboard/programme-enrollments/[id]/approve`
**Purpose:** Approve program enrollment and trigger auto-enrollment

**Request:**
```typescript
{
  session_id: 1,
  semester_id: 1,
  level_id: 1
}
```

**Response:**
```typescript
{
  success: true,
  message: "Programme enrollment approved",
  enrollment: {...},
  auto_enrolled_courses: 10
}
```

---

#### `POST /api/dashboard/programme-enrollments/[id]/reject`
**Purpose:** Reject program enrollment

**Request:**
```typescript
{
  reason: "Does not meet admission requirements"
}
```

**Response:**
```typescript
{
  success: true,
  message: "Programme enrollment rejected"
}
```

---

### 3. Course Management APIs

#### `GET /api/student/courses`
**Purpose:** Get courses for active program enrollment

**Query Parameters:**
- `student_programme_id` - Optional: specific program (defaults to active)
- `level_id` - Optional: filter by level
- `course_type` - Optional: filter by COMPULSORY/ELECTIVE

**Response:**
```typescript
{
  success: true,
  programme: {...},
  current_level: { id: 1, name: "Level 100" },
  courses_by_level: {
    "100": {
      compulsory: [
        {
          id: 1,
          code: "MBA501",
          name: "Organizational Behavior",
          units: 3,
          enrolled: true,
          enrollment_id: "123",
          approval_status: true
        }
      ],
      elective: [
        {
          id: 2,
          code: "MBA502",
          name: "Advanced Marketing",
          units: 2,
          enrolled: false
        }
      ]
    }
  }
}
```

---

#### `POST /api/student/courses/enroll`
**Purpose:** Enroll in elective course

**Request:**
```typescript
{
  student_programme_id: "1",
  course_id: 5
}
```

**Response:**
```typescript
{
  success: true,
  message: "Enrolled in course successfully (pending approval)",
  enrollment: {...}
}
```

---

#### `DELETE /api/student/courses/[id]/unenroll`
**Purpose:** Unenroll from elective course

**Response:**
```typescript
{
  success: true,
  message: "Unenrolled from course successfully"
}
```

---

### 4. Modified Existing APIs

#### `GET /api/student/dashboard`
**Changes:**
- Use active `student_programme` instead of `student.programme_id`
- Calculate level from active enrollment
- Filter courses by active program

---

#### `GET /api/course-register`
**Changes:**
- Get active `student_programme`
- Filter `programme_course` by active programme
- Show compulsory courses as read-only
- Show electives as selectable

---

#### `GET /api/student/context`
**Changes:**
- Return all `student_programme` enrollments
- Include active enrollment
- Include programme switching capability

---

#### `GET /api/dashboard/courses`
**Changes:**
- Add `programme_id` filter
- Support multi-program course display for admins

---

## UI Components

### 1. Programme Selector Component

**File:** `app/(dashboard)/components/ProgrammeSelector.tsx`

**Features:**
- Dropdown showing all enrolled programmes
- Display: Programme name + status badge (APPROVED/PENDING/REJECTED)
- Click to switch active programme
- Badge showing "Active" for current selection
- Link to "Apply for Additional Programme"

**Design:**
```typescript
interface ProgrammeSelectorProps {
  enrollments: StudentProgramme[];
  activeEnrollment: StudentProgramme;
  onProgrammeChange: (enrollmentId: string) => void;
}

export function ProgrammeSelector({
  enrollments,
  activeEnrollment,
  onProgrammeChange
}: ProgrammeSelectorProps) {
  return (
    <div className="programme-selector">
      <Select
        value={activeEnrollment?.id}
        onValueChange={onProgrammeChange}
      >
        {enrollments.map(enrollment => (
          <SelectItem key={enrollment.id} value={enrollment.id}>
            <div className="flex items-center justify-between">
              <span>{enrollment.programme.name}</span>
              {enrollment.is_active_selection && (
                <Badge>Active</Badge>
              )}
              <Badge variant={getStatusVariant(enrollment.status)}>
                {enrollment.status}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </Select>

      <Link href="/profile/programs/apply">
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Apply for Additional Programme
        </Button>
      </Link>
    </div>
  );
}
```

---

### 2. Course Display Component (Grouped by Level)

**File:** `app/(dashboard)/courses/components/ProgrammeCoursesDisplay.tsx`

**Hierarchy:**
```
Selected Programme: [Programme Selector]
  └─ Level 100
     ├─ Compulsory Courses (10 courses, 30 units)
     │  ├─ MBA501 - Organizational Behavior (3 units) [Auto-enrolled ✓]
     │  ├─ MBA502 - Financial Management (4 units) [Auto-enrolled ✓]
     │  └─ ...
     └─ Elective Courses (Choose 2 from 5)
        ├─ MBA511 - Advanced Marketing (2 units) [Enrolled]
        ├─ MBA512 - Data Analytics (3 units) [Available] [+ Enroll]
        └─ ...
  └─ Level 200
     └─ [Same structure]
```

**Design:**
```typescript
interface ProgrammeCoursesDisplayProps {
  studentProgrammeId: string;
  courses: GroupedCourses;
  currentLevel: Level;
  onEnrollElective: (courseId: number) => void;
  onUnenrollElective: (enrollmentId: string) => void;
}

export function ProgrammeCoursesDisplay({
  studentProgrammeId,
  courses,
  currentLevel,
  onEnrollElective,
  onUnenrollElective
}: ProgrammeCoursesDisplayProps) {
  return (
    <div className="space-y-6">
      {Object.entries(courses).map(([levelId, levelCourses]) => (
        <Card key={levelId}>
          <CardHeader>
            <CardTitle>Level {levelId}</CardTitle>
            {Number(levelId) === currentLevel.id && (
              <Badge>Current Level</Badge>
            )}
          </CardHeader>

          <CardContent>
            {/* Compulsory Courses */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">
                Compulsory Courses
                ({levelCourses.compulsory.length} courses, {totalUnits} units)
              </h3>
              <div className="space-y-2">
                {levelCourses.compulsory.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    type="compulsory"
                    enrolled={course.enrolled}
                    approvalStatus={course.approval_status}
                  />
                ))}
              </div>
            </div>

            {/* Elective Courses */}
            {levelCourses.elective.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">
                  Elective Courses
                  (Choose {electiveRequirement} from {levelCourses.elective.length})
                </h3>
                <div className="space-y-2">
                  {levelCourses.elective.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      type="elective"
                      enrolled={course.enrolled}
                      onEnroll={() => onEnrollElective(course.id)}
                      onUnenroll={() => onUnenrollElective(course.enrollment_id!)}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

---

### 3. Updated Components

#### `app/(dashboard)/profile/programs/page.tsx`
**Changes:**
- Fetch `student_programme` enrollments instead of multi-student records
- Show status (PENDING/APPROVED/REJECTED) for each enrollment
- Display active programme clearly
- "Apply for Additional Programme" button
- Switch programme functionality

**Design:**
```typescript
export default function ProgramsPage() {
  const [enrollments, setEnrollments] = useState<StudentProgramme[]>([]);
  const [activeEnrollment, setActiveEnrollment] = useState<StudentProgramme | null>(null);

  // Fetch enrollments
  useEffect(() => {
    fetchProgrammeEnrollments();
  }, []);

  const handleSwitchProgramme = async (enrollmentId: string) => {
    await api.post(`/api/student/programmes/${enrollmentId}/activate`);
    // Refresh data
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Active Programme Card */}
      {activeEnrollment && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Currently Active Programme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">
                  {activeEnrollment.programme.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {activeEnrollment.programme.department.name}
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge>{activeEnrollment.status}</Badge>
                  <Badge variant="outline">{activeEnrollment.application_type}</Badge>
                </div>
              </div>
              <Button onClick={() => router.push('/student')}>
                View Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Programmes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Programme Enrollments</CardTitle>
            <Link href="/profile/programs/apply">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Apply for Additional Programme
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {enrollments.map(enrollment => (
              <ProgrammeEnrollmentCard
                key={enrollment.id}
                enrollment={enrollment}
                isActive={enrollment.is_active_selection}
                onSwitch={() => handleSwitchProgramme(enrollment.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

#### `app/(simple)/course-register/course-registration-client.tsx`
**Changes:**
- Get active `student_programme`
- Filter courses by active programme
- Separate compulsory (read-only, auto-enrolled) from electives (selectable)
- Show approval status for electives

**Updated Logic:**
```typescript
// Get active programme enrollment
const activeEnrollment = await getActiveProgrammeEnrollment(studentId);

// Get current level
const currentLevel = await calculateCurrentLevel(activeEnrollment.id);

// Get courses for this programme and level
const programmeCourses = await prisma.programme_course.findMany({
  where: {
    programme_id: activeEnrollment.programme_id,
    level_id: currentLevel.levelId,
  },
  include: {
    course: true,
  },
  orderBy: [
    { course_type: 'asc' }, // COMPULSORY first
    { course: { code: 'asc' } }
  ]
});

// Get student's enrolled courses
const enrolledCourses = await prisma.student_course.findMany({
  where: {
    student_id: studentId,
    student_programme_id: activeEnrollment.id,
    level_id: currentLevel.levelId,
  },
});

// Group by course type
const groupedCourses = {
  compulsory: programmeCourses.filter(pc => pc.course_type === 'COMPULSORY'),
  elective: programmeCourses.filter(pc => pc.course_type === 'ELECTIVE'),
};
```

---

#### `app/(dashboard)/course-viewer/page.tsx`
**Changes:**
- Ensure course access checks active programme
- Show programme context in breadcrumbs
- Verify student is enrolled in course via `student_course.student_programme_id`

**Access Control:**
```typescript
// Verify course access
const activeEnrollment = await getActiveProgrammeEnrollment(studentId);

const courseAccess = await prisma.student_course.findFirst({
  where: {
    student_id: studentId,
    course_id: courseId,
    student_programme_id: activeEnrollment.id,
    approval_status: true, // Must be approved
  },
});

if (!courseAccess) {
  return <AccessDenied message="You are not enrolled in this course" />;
}
```

---

#### `app/(simple)/ops/components/ProgrammeEnrollmentsManagement.tsx`
**Purpose:** Replace `AdditionalApplicationsManagement`

**Features:**
- List all programme enrollments (NEW and ADDITIONAL)
- Filter by status, programme, application type
- Approve enrollments with admission details (session, semester, level)
- Reject enrollments with reason
- View student details
- Statistics dashboard

**Design similar to:** `AdditionalApplicationsManagement.tsx` but using `student_programme` table

---

## Payment Integration

### 1. Payment Tracking

**Link payments to programme enrollments:**
```typescript
// When creating a payment
const payment = await prisma.payment2.create({
  data: {
    student_id: studentId,
    student_programme_id: activeEnrollmentId, // NEW FIELD
    amount: totalAmount,
    cart: feeItems,
    // ... other fields
  },
});
```

**Display payments grouped by programme:**
```typescript
// Get payments for specific programme
const programmePayments = await prisma.payment2.findMany({
  where: {
    student_id: studentId,
    student_programme_id: studentProgrammeId,
  },
  orderBy: { created_at: 'desc' },
});
```

---

### 2. Fee Calculation

**Calculate fees per programme enrollment:**
```typescript
export async function calculateProgrammeFees(studentProgrammeId: bigint) {
  const enrollment = await prisma.student_programme.findUnique({
    where: { id: studentProgrammeId },
  });

  if (!enrollment) {
    throw new Error('Programme enrollment not found');
  }

  // Get current level
  const levelInfo = await calculateCurrentLevel(studentProgrammeId);

  // Get fees for this programme, level, and session
  const fees = await prisma.fee.findMany({
    where: {
      active: true,
      OR: [
        { programme_id: enrollment.programme_id },
        { level_id: levelInfo.levelId },
        { session_id: enrollment.session_admitted_id },
      ],
    },
  });

  // Calculate total
  const total = fees.reduce((sum, fee) => sum + Number(fee.amount || 0), 0);

  return {
    fees,
    total,
    level: levelInfo,
  };
}
```

---

### 3. Course Access Control

**Block course access for programmes with unpaid fees:**
```typescript
export async function checkCourseAccess(
  studentId: bigint,
  courseId: number
) {
  // Get active programme
  const activeEnrollment = await getActiveProgrammeEnrollment(studentId);

  if (!activeEnrollment || activeEnrollment.status !== 'APPROVED') {
    return { allowed: false, reason: 'Programme not approved' };
  }

  // Check if enrolled in course
  const courseEnrollment = await prisma.student_course.findFirst({
    where: {
      student_id: studentId,
      course_id: courseId,
      student_programme_id: activeEnrollment.id,
      approval_status: true,
    },
  });

  if (!courseEnrollment) {
    return { allowed: false, reason: 'Not enrolled in this course' };
  }

  // Check payment status
  const totalFees = await calculateProgrammeFees(activeEnrollment.id);
  const totalPaid = await prisma.payment2.aggregate({
    where: {
      student_id: studentId,
      student_programme_id: activeEnrollment.id,
      status: 1, // Paid
    },
    _sum: { amount: true },
  });

  const amountPaid = Number(totalPaid._sum.amount || 0);
  const isPaid = amountPaid >= totalFees.total;

  if (!isPaid) {
    return {
      allowed: false,
      reason: 'Outstanding fees',
      amountDue: totalFees.total - amountPaid
    };
  }

  return { allowed: true };
}
```

---

## Migration Strategy

### Phase 1: Initial Data Migration

Since there are **no existing multi-student records**, the migration is straightforward:

**Step 1: Create `student_programme` entries for existing students**
```sql
-- For each student with a programme_id, create a student_programme record
INSERT INTO student_programme (
  student_id,
  programme_id,
  status,
  is_active_selection,
  application_type,
  session_admitted_id,
  semester_admitted_id,
  entry_level_id,
  admitted,
  reg_no,
  applied_at,
  approved_at,
  created_at,
  updated_at
)
SELECT
  id,
  programme_id,
  'APPROVED' as status,
  true as is_active_selection, -- First/only programme is active
  COALESCE(application_type, 'NEW') as application_type,
  session_admitted_id,
  semester_admitted_id,
  entry_level_id,
  admitted,
  reg_no,
  created_at as applied_at,
  created_at as approved_at, -- Assume already approved
  created_at,
  updated_at
FROM student
WHERE programme_id IS NOT NULL
  AND is_deleted = false;
```

---

**Step 2: Update `student_course` records to link to `student_programme`**
```sql
-- Link existing student_course records to newly created student_programme
UPDATE student_course sc
SET student_programme_id = sp.id
FROM student_programme sp
WHERE sc.student_id = sp.student_id
  AND sc.student_programme_id IS NULL;
```

---

**Step 3: Update `payment2` records to link to `student_programme`**
```sql
-- Link existing payments to student_programme
UPDATE payment2 p
SET student_programme_id = sp.id
FROM student_programme sp
INNER JOIN student s ON sp.student_id = s.id
WHERE p.student_id = s.id
  AND p.student_programme_id IS NULL;
```

---

**Step 4: Update `course_progress` records to link to `student_programme`**
```sql
-- Link existing course progress to student_programme
UPDATE course_progress cp
SET student_programme_id = sp.id
FROM student_programme sp
WHERE cp.student_id = sp.student_id
  AND cp.student_programme_id IS NULL;
```

---

### Phase 2: Backward Compatibility

**Keep legacy fields in `student` table:**
- `programme_id` - Mark as deprecated in code comments
- `entry_level_id` - Mark as deprecated
- `session_admitted_id` - Mark as deprecated
- `semester_admitted_id` - Mark as deprecated

**Create compatibility helper:**
```typescript
/**
 * Get student's programme (backward compatible)
 * @deprecated Use getActiveProgrammeEnrollment instead
 */
export async function getStudentProgramme(studentId: bigint) {
  // Try new approach first
  const enrollment = await getActiveProgrammeEnrollment(studentId);
  if (enrollment) {
    return enrollment.programme_id;
  }

  // Fallback to legacy field
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { programme_id: true },
  });

  return student?.programme_id || null;
}
```

---

### Phase 3: Gradual Deprecation

**Timeline:**
- **Weeks 1-2:** Deploy new system alongside legacy support
- **Weeks 3-6:** Monitor usage, ensure all new code uses new approach
- **Month 2-3:** Update all legacy code references to use new approach
- **Month 4:** Remove backward compatibility layer
- **Month 5:** Remove deprecated fields from schema

---

## Implementation Timeline

### Week 1: Database Schema & Migrations
**Tasks:**
- Create Prisma schema for `student_programme` table
- Add `course_type` to `programme_course`
- Add `student_programme_id` to `student_course`, `payment2`, `course_progress`
- Write migration SQL scripts
- Test migrations on development database
- Create rollback scripts

**Deliverables:**
- Prisma schema updated
- Migration files created
- Database successfully migrated locally

---

### Week 2: Backend Services & Helpers
**Tasks:**
- Create `helpers/studentProgrammeContext.ts`
- Implement all helper functions (getUserProgrammeEnrollments, getActiveProgrammeEnrollment, etc.)
- Create `services/autoEnrollmentService.ts`
- Implement auto-enrollment logic
- Write unit tests for all functions

**Deliverables:**
- Helper functions implemented and tested
- Auto-enrollment service working
- Unit test coverage > 80%

---

### Week 3: API Routes - Student APIs
**Tasks:**
- Implement `/api/student/programmes` (GET, POST)
- Implement `/api/student/programmes/[id]` (GET, PUT, DELETE)
- Implement `/api/student/programmes/[id]/activate`
- Implement `/api/student/courses` (GET)
- Implement `/api/student/courses/enroll` (POST)
- Implement `/api/student/courses/[id]/unenroll` (DELETE)
- Write API integration tests

**Deliverables:**
- All student-facing APIs working
- API tests passing
- Postman collection created

---

### Week 4: API Routes - Admin APIs & Modifications
**Tasks:**
- Implement `/api/dashboard/programme-enrollments` (GET)
- Implement `/api/dashboard/programme-enrollments/[id]/approve` (POST)
- Implement `/api/dashboard/programme-enrollments/[id]/reject` (POST)
- Update `/api/student/dashboard` to use active programme
- Update `/api/course-register` to filter by active programme
- Update `/api/student/context` to include enrollments
- Write API integration tests

**Deliverables:**
- All admin APIs working
- Existing APIs updated
- API tests passing

---

### Week 5: UI Components - Student UI
**Tasks:**
- Create `ProgrammeSelector` component
- Create `ProgrammeCoursesDisplay` component
- Create `CourseCard` component
- Update `/profile/programs` page
- Update `/course-register` page
- Update `/course-viewer` page to check programme access
- Implement programme switching flow

**Deliverables:**
- Programme selector working
- Course display grouped by level and type
- Programme switching functional
- UI/UX polished

---

### Week 6: UI Components - Admin UI & Testing
**Tasks:**
- Create `ProgrammeEnrollmentsManagement` component
- Replace `AdditionalApplicationsManagement`
- Implement approval/rejection workflow
- Add programme enrollment statistics dashboard
- End-to-end testing
- Bug fixes
- Documentation

**Deliverables:**
- Admin programme management working
- All features tested end-to-end
- Bug fixes completed
- User documentation created

---

### Week 7: Payment Integration & Polish
**Tasks:**
- Update payment creation to link to `student_programme_id`
- Implement per-programme fee calculation
- Create payment history grouped by programme
- Implement course access control based on payments
- Update payment UI to show programme context
- Final testing and bug fixes

**Deliverables:**
- Payment tracking per programme working
- Fee calculation accurate
- Course access control functional
- All tests passing

---

### Week 8: Deployment & Monitoring
**Tasks:**
- Deploy to staging environment
- User acceptance testing
- Performance testing
- Deploy to production
- Monitor logs and errors
- Provide support for early adopters
- Gather feedback

**Deliverables:**
- System deployed to production
- Monitoring in place
- Support documentation created
- Feedback collected

---

## Testing Strategy

### 1. Unit Tests

**Backend Functions:**
- `getUserProgrammeEnrollments()` - Returns correct enrollments
- `getActiveProgrammeEnrollment()` - Returns active or first approved
- `setActiveProgrammeEnrollment()` - Switches active correctly
- `applyForProgramme()` - Creates application correctly
- `approveProgrammeEnrollment()` - Approves and auto-enrolls
- `calculateCurrentLevel()` - Calculates level accurately
- `autoEnrollCompulsoryCourses()` - Enrolls in all compulsory courses
- `getAvailableElectives()` - Returns only available electives

---

### 2. Integration Tests

**API Endpoints:**
- `GET /api/student/programmes` - Returns user's enrollments
- `POST /api/student/programmes` - Creates application
- `POST /api/student/programmes/[id]/activate` - Switches active
- `GET /api/student/courses` - Returns courses for active programme
- `POST /api/student/courses/enroll` - Enrolls in elective
- `POST /api/dashboard/programme-enrollments/[id]/approve` - Approves enrollment
- `POST /api/dashboard/programme-enrollments/[id]/reject` - Rejects enrollment

---

### 3. End-to-End Tests

**User Flows:**

#### Flow 1: Single Programme Enrollment
1. User applies to programme (status = PENDING)
2. Admin approves application
3. System auto-enrolls in compulsory courses
4. User selects electives
5. User accesses course content
6. **Expected:** All steps succeed, user can access courses

---

#### Flow 2: Multi-Programme Enrollment
1. User enrolled in Programme A
2. User applies to Programme B (status = PENDING)
3. Admin approves Programme B
4. System auto-enrolls in Programme B compulsory courses
5. User switches to Programme B
6. User sees only Programme B courses
7. User switches back to Programme A
8. User sees only Programme A courses
9. **Expected:** Programme switching works correctly, courses filtered properly

---

#### Flow 3: Payment Integration
1. User enrolled in Programme A
2. System calculates fees for Programme A
3. User makes payment for Programme A
4. Payment linked to Programme A enrollment
5. User can access Programme A courses
6. User enrolls in Programme B
7. Payment for Programme A doesn't grant access to Programme B
8. User must pay for Programme B separately
9. **Expected:** Payments tracked separately per programme

---

#### Flow 4: Level Progression
1. User admitted to Programme A at Level 100
2. System auto-enrolls in Level 100 compulsory courses
3. Time passes (2 semesters)
4. User level calculated as Level 200
5. User can access Level 200 courses
6. **Expected:** Level progression works independently per programme

---

### 4. Edge Cases

**Test Scenarios:**

#### Scenario 1: No Programme Enrollments
- **Setup:** User with no programme enrollments
- **Expected:** Show empty state, prompt to apply

---

#### Scenario 2: All Pending Enrollments
- **Setup:** User with only PENDING enrollments
- **Expected:** Show pending status, no course access

---

#### Scenario 3: Mixed Enrollments
- **Setup:** User with APPROVED, PENDING, and REJECTED enrollments
- **Expected:** Can access APPROVED programmes only

---

#### Scenario 4: Switching During Active Session
- **Setup:** User viewing course content from Programme A
- **Action:** Switch to Programme B
- **Expected:** Redirect to Programme B dashboard, access to Programme A content blocked

---

#### Scenario 5: Compulsory Course Unenroll Attempt
- **Setup:** User enrolled in compulsory course
- **Action:** Attempt to unenroll
- **Expected:** Error message, enrollment remains

---

#### Scenario 6: Duplicate Programme Application
- **Setup:** User already enrolled/applied to Programme A
- **Action:** Apply to Programme A again
- **Expected:** Error message, no duplicate created

---

#### Scenario 7: Auto-Enrollment Failure
- **Setup:** Programme with no compulsory courses defined
- **Action:** Approve programme enrollment
- **Expected:** Approval succeeds, auto-enrollment skipped gracefully

---

## Success Criteria

### Technical Success Criteria

✅ **Database Schema**
- `student_programme` table created with all relationships
- `course_type` field added to `programme_course`
- `student_programme_id` added to related tables
- Migrations run successfully without errors
- Data integrity maintained

✅ **Backend Services**
- All helper functions implemented and tested
- Auto-enrollment service working correctly
- Level calculation accurate
- Error handling robust

✅ **API Routes**
- All student APIs functional (programme management, course enrollment)
- All admin APIs functional (approval, rejection)
- Existing APIs updated to use new schema
- API response times < 500ms
- API error handling comprehensive

✅ **UI Components**
- Programme selector component working
- Course display grouped correctly
- Programme switching seamless
- Course enrollment UI intuitive
- Admin programme management functional

✅ **Payment Integration**
- Payments linked to programme enrollments
- Fee calculation per programme accurate
- Course access control based on payments working
- Payment history grouped by programme

✅ **Testing**
- Unit test coverage > 80%
- Integration tests passing
- End-to-end tests passing
- Edge cases handled

---

### User Experience Success Criteria

✅ **Students**
- Can view all programme enrollments in one place
- Can switch between programmes easily
- See courses grouped by level and type clearly
- Understand which courses are compulsory vs elective
- Know payment status per programme
- Can apply for additional programmes without confusion

✅ **Admins**
- Can view all programme enrollments (NEW and ADDITIONAL)
- Can approve/reject enrollments efficiently
- See auto-enrollment confirmation after approval
- Can track student progress across programmes
- Have clear statistics dashboard

---

### Business Success Criteria

✅ **Data Integrity**
- No duplicate programme enrollments
- Student data consistent across all programmes
- Payment tracking accurate
- Course progress tracked separately per programme

✅ **Scalability**
- System handles 1000+ concurrent users
- Database queries optimized
- API response times acceptable
- UI responsive

✅ **Maintainability**
- Code well-documented
- Architecture clean and logical
- Easy to add new features
- Backward compatibility maintained

---

## Appendix

### A. Database Relationships Diagram

```
user
  └─ student (ONE record)
      └─ student_programme (MANY enrollments)
          ├─ programme
          ├─ session
          ├─ semester
          ├─ level
          ├─ student_course (MANY courses)
          │   └─ course
          ├─ payment2 (MANY payments)
          └─ course_progress (MANY progress records)
              └─ course
```

---

### B. Status Flow Diagram

```
Programme Enrollment Status Flow:

PENDING
  ├─→ APPROVED (via admin approval)
  │   └─→ Auto-enroll in compulsory courses
  └─→ REJECTED (via admin rejection)
```

---

### C. Course Enrollment Flow

```
Student enrolled in Programme
  └─→ Programme approved (status = APPROVED)
      └─→ Auto-enroll in COMPULSORY courses
          ├─→ Course enrollment created (approval_status = true)
          └─→ Student can access course content

      └─→ Display ELECTIVE courses
          ├─→ Student selects elective
          └─→ Course enrollment created (approval_status = false)
              └─→ Admin approves
                  └─→ approval_status = true
                      └─→ Student can access course content
```

---

### D. Key Files Reference

**Backend:**
- `prisma/schema.prisma` - Database schema
- `helpers/studentProgrammeContext.ts` - Programme enrollment helpers
- `services/autoEnrollmentService.ts` - Auto-enrollment logic
- `lib/api-auth.ts` - Authentication helpers

**API Routes:**
- `app/api/student/programmes/route.ts` - Student programme APIs
- `app/api/student/courses/route.ts` - Student course APIs
- `app/api/dashboard/programme-enrollments/route.ts` - Admin approval APIs

**UI Components:**
- `app/(dashboard)/components/ProgrammeSelector.tsx` - Programme selector
- `app/(dashboard)/courses/components/ProgrammeCoursesDisplay.tsx` - Course display
- `app/(dashboard)/profile/programs/page.tsx` - Programme management page
- `app/(simple)/ops/components/ProgrammeEnrollmentsManagement.tsx` - Admin UI

**Types:**
- `types/student-programme.ts` - TypeScript types for programme enrollments

---

### E. Environment Variables

No new environment variables required for this feature.

---

### F. External Dependencies

No new external dependencies required. Using existing:
- Prisma
- Next.js
- React
- TypeScript

---

## Conclusion

This plan provides a comprehensive roadmap for implementing a single-student, multi-programme enrollment system. The phased approach ensures minimal disruption while delivering significant architectural improvements and user experience enhancements.

**Next Steps:**
1. Review and approve this plan
2. Set up project board for tracking
3. Begin Week 1 implementation (Database Schema)
4. Schedule weekly check-ins to monitor progress

**Questions or Concerns:**
Please raise any questions or concerns before implementation begins.

---

**Document Version:** 1.0
**Last Updated:** December 10, 2025
**Author:** Development Team
**Status:** Ready for Implementation
