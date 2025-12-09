/**
 * My Students Management for Manage Dashboard
 *
 * This component directly reuses UserManagement from the ops dashboard.
 * The ops component already has full functionality including:
 * - Advanced filtering (Search, Role, Status, Department, Faculty)
 * - Tabbed interface (Overview, Users, Analytics)
 * - User statistics dashboard with charts
 * - Create/Edit/Delete/View user modals
 * - Student profile management
 * - User activation/deactivation
 * - Bulk operations and pagination
 *
 * Users can filter by role="STUDENT" to see only students.
 * The component automatically scopes by institution_id.
 */

"use client";

// Direct reuse of the ops component - it already has all functionality
import OpsUserManagement from "../../ops/components/UserManagement";

export default function MyStudentsManagement() {
  return <OpsUserManagement />;
}
