/**
 * Course Approval Management for Manage Dashboard
 *
 * This component reuses the CourseApprovalManagement from the ops dashboard
 * since the functionality is identical - both approve course registrations
 * with the same workflow and permissions.
 */

"use client";

// Direct reuse of the ops component
import OpsApprovalManagement from "../../ops/components/CourseApprovalManagement";

export default function CourseApprovalManagement() {
  return <OpsApprovalManagement />;
}
