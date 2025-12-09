/**
 * My Courses Management for Manage Dashboard
 *
 * This component directly reuses CourseManagement from the ops dashboard.
 * The ops component already has full CRUD functionality including:
 * - Multi-level filtering (Faculty → Department → Programme → Level)
 * - Search by course name/code/description
 * - Server-side filtering and pagination
 * - Quick stats cards (Total Courses, Active Courses, Enrollments, Departments)
 * - View/Edit course details
 * - CSV export
 * - Status management (Active/Inactive/Draft)
 *
 * Staff can filter to see only courses relevant to them:
 * - FACILITATOR/ETUTOR: Can filter by programme/department to find their assigned courses
 * - HOD: Can filter by department to see department courses
 * - PROGRAMME_COORDINATOR: Can filter by programme to see programme courses
 */

"use client";

// Direct reuse of the ops component - it already has all functionality
import OpsCourseManagement from "../../ops/components/CourseManagement";

export default function MyCoursesManagement() {
  return <OpsCourseManagement />;
}
