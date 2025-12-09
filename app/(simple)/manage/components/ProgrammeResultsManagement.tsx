/**
 * Programme Results Management for Manage Dashboard
 *
 * This component directly reuses ResultsManagement from the ops dashboard.
 * The ops component already handles role-based scoping and has full functionality
 * including CSV upload, grade entry, GPA calculation, and results management.
 */

"use client";

// Direct reuse of the ops component - it already has all functionality
import OpsResultsManagement from "../../ops/components/ResultsManagement";

export default function ProgrammeResultsManagement() {
  return <OpsResultsManagement />;
}
