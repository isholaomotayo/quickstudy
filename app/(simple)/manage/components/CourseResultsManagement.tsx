/**
 * Course Results Management for Manage Dashboard (FACILITATOR/ETUTOR)
 *
 * This component directly reuses ResultsManagement from the ops dashboard.
 * The ops component already has full functionality including:
 * - CSV bulk upload with validation
 * - Course selection with async search
 * - Semester selection
 * - Student filtering
 * - Template download
 * - Grade validation
 * - GPA recalculation
 * - Result view/edit/delete
 * - Analytics and grade distribution
 *
 * The component automatically scopes data by user role and institution.
 */

"use client";

// Direct reuse of the ops component - it already has all functionality
import OpsResultsManagement from "../../ops/components/ResultsManagement";

export default function CourseResultsManagement() {
  return <OpsResultsManagement />;
}
