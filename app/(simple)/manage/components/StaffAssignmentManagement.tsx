/**
 * Staff Assignment Management for PROGRAMME_COORDINATOR
 *
 * This component directly reuses UserManagement from the ops dashboard.
 * The ops component already has full functionality including:
 * - Advanced filtering (Search, Role, Status, Department, Faculty)
 * - Tabbed interface (Overview, Users, Analytics)
 * - User statistics dashboard with charts
 * - Create/Edit user modals
 * - User activation/deactivation
 * - Bulk operations and pagination
 *
 * Programme coordinators can:
 * 1. Filter by role to see FACILITATOR and ETUTOR staff
 * 2. Filter by department/faculty to see available staff
 * 3. View staff details and assignments
 *
 * For actual course-to-staff assignment, this will be extended
 * or integrated with CourseManagement component.
 */

"use client";

// Direct reuse of the ops component - it already has all functionality
import OpsUserManagement from "../../ops/components/UserManagement";

export default function StaffAssignmentManagement() {
  return <OpsUserManagement />;
}
