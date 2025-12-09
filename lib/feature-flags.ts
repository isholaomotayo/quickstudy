/**
 * Feature Flags for Incremental API Migration
 * Controls routing between legacy Fastify APIs and new Next.js API routes
 */

export interface FeatureFlags {
  // Phase 1: Core APIs
  USE_NEXTJS_PROFILE: boolean;
  USE_NEXTJS_COURSES: boolean;
  USE_NEXTJS_COURSE_MODULES: boolean;
  USE_NEXTJS_COURSE_LESSONS: boolean;

  // Phase 2: Announcements
  USE_NEXTJS_ANNOUNCEMENTS: boolean;

  // Phase 3: Forum & Connect
  USE_NEXTJS_FORUM: boolean;
  USE_NEXTJS_DISCUSSION: boolean;

  // Phase 4: Student Course & Assessments
  USE_NEXTJS_STUDENT_COURSE: boolean;
  USE_NEXTJS_ASSESSMENTS: boolean;
  USE_NEXTJS_TESTS: boolean;

  // Additional APIs
  USE_NEXTJS_RESULTS: boolean;
  USE_NEXTJS_PAYMENTS: boolean;
  USE_NEXTJS_CALENDAR: boolean;
}

/**
 * Get feature flag value from environment with fallback to default
 */
function getFlag(key: string, defaultValue: boolean = false): boolean {
  const envValue = process.env[key];
  if (envValue === undefined) return defaultValue;
  return envValue === "true" || envValue === "1";
}

/**
 * Feature flags configuration
 * Set environment variables to enable Next.js APIs, otherwise falls back to Fastify
 */
export const featureFlags: FeatureFlags = {
  // Phase 1: Core APIs
  USE_NEXTJS_PROFILE: getFlag("USE_NEXTJS_PROFILE", false),
  USE_NEXTJS_COURSES: getFlag("USE_NEXTJS_COURSES", false),
  USE_NEXTJS_COURSE_MODULES: getFlag("USE_NEXTJS_COURSE_MODULES", false),
  USE_NEXTJS_COURSE_LESSONS: getFlag("USE_NEXTJS_COURSE_LESSONS", false),

  // Phase 2: Announcements
  USE_NEXTJS_ANNOUNCEMENTS: getFlag("USE_NEXTJS_ANNOUNCEMENTS", false),

  // Phase 3: Forum & Connect
  USE_NEXTJS_FORUM: getFlag("USE_NEXTJS_FORUM", false),
  USE_NEXTJS_DISCUSSION: getFlag("USE_NEXTJS_DISCUSSION", false),

  // Phase 4: Student Course & Assessments
  USE_NEXTJS_STUDENT_COURSE: getFlag("USE_NEXTJS_STUDENT_COURSE", false),
  USE_NEXTJS_ASSESSMENTS: getFlag("USE_NEXTJS_ASSESSMENTS", false),
  USE_NEXTJS_TESTS: getFlag("USE_NEXTJS_TESTS", false),

  // Additional APIs
  USE_NEXTJS_RESULTS: getFlag("USE_NEXTJS_RESULTS", false),
  USE_NEXTJS_PAYMENTS: getFlag("USE_NEXTJS_PAYMENTS", false),
  USE_NEXTJS_CALENDAR: getFlag("USE_NEXTJS_CALENDAR", false),
};

/**
 * Check if a specific feature flag is enabled
 */
export function isFeatureEnabled(flag: keyof FeatureFlags): boolean {
  return featureFlags[flag];
}

/**
 * Get all enabled features
 */
export function getEnabledFeatures(): Array<keyof FeatureFlags> {
  return (Object.keys(featureFlags) as Array<keyof FeatureFlags>).filter(
    (key) => featureFlags[key]
  );
}

/**
 * Development mode - enable all Next.js APIs
 */
export function enableAllFeatures(): void {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.ENABLE_ALL_NEXTJS_APIS === "true"
  ) {
    Object.keys(featureFlags).forEach((key) => {
      featureFlags[key as keyof FeatureFlags] = true;
    });
  }
}

// Auto-enable all features if configured
enableAllFeatures();
