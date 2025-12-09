# Future Session Admission Feature Plan

This document outlines the plan to implement a feature that allows admitting students into a future academic session and displaying a specific screen for them until their session begins.

## 1. Modify Admission Screen

- **File to modify:** `app/(simple)/ops/components/ViewApplicationModal.tsx` (and potentially `ApplicationManagement.tsx`).
- **Change:** Add a "Session to Admit" dropdown/select input to the admission section of the application view modal.
- **Data:** The dropdown should be populated with a list of academic sessions. A new function will be needed in `app/(simple)/ops/actions/departments.ts` (or a more appropriate actions file) to fetch all sessions.
- **Action:** The `admitStudent` action in `app/(simple)/ops/actions/user-actions.ts` needs to be updated to accept the selected `sessionId`.

## 2. Update Database Schema

- **File to modify:** `prisma/schema.prisma`
- **Change:** The `Student` model (or equivalent) needs a new field, `sessionAdmittedId` (Int, nullable) to store the ID of the session the student is admitted into. This may require a new relation to the `Session` model.

## 3. Update Admission Logic

- **File to modify:** `app/(simple)/ops/actions/user-actions.ts`
- **Change:** The `admitStudent` server action will be modified to take `sessionAdmittedId` as an argument and save it to the new student record.

## 4. Create a "Holding" Screen for Future Students

- **New File:** Create a new component, e.g., `components/FutureStudentLanding.tsx`.
- **Content:** This component will display a message to the student, informing them that their session has not yet started and they cannot access academic features. It should show the session they are admitted for and when it is expected to start.

## 5. Implement Conditional Rendering for Students

- **File to modify:** `components/ApplicantNavLayout.tsx` or a similar layout file for logged-in students.
- **Logic:**
  - Fetch the current academic session.
  - Fetch the logged-in student's data, including `sessionAdmittedId`.
  - If `student.sessionAdmittedId` is greater than `currentSession.id`, render the `FutureStudentLanding.tsx` component instead of the regular student dashboard/navigation.

## 6. Migration

- After updating the Prisma schema, a new migration needs to be generated and applied.
- Run `npx prisma migrate dev --name add_session_admitted_id_to_student`.
