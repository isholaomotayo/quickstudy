/**
 * Programme Courses Management for PROGRAMME_COORDINATOR
 *
 * This component directly reuses CourseManagement from the ops dashboard.
 * The ops component already has full CRUD functionality including:
 * - Multi-level filtering (Faculty → Department → Programme → Level)
 * - Search by course name/code/description
 * - Server-side filtering and pagination
 * - Quick stats cards (Total Courses, Active Courses, Enrollments, Departments)
 * - Create/Edit/Delete course dialogs
 * - CSV export
 * - Status management (Active/Inactive/Draft)
 *
 * Programme coordinators can filter by their programme to see only their courses.
 */

"use client";

// Direct reuse of the ops component - it already has all functionality
import OpsCourseManagement from "../../ops/components/CourseManagement";

export default function ProgrammeCoursesManagement() {
  return <OpsCourseManagement />;
}
