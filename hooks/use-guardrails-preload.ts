import { useState, useCallback, useEffect } from "react";
import {
  createGuardRails,
  createCourseDocument,
  type GuardRailsConfig,
} from "@/lib/guardrails";

interface GuardrailsCache {
  [key: string]: GuardRailsConfig | undefined;
}

// Global cache for guardrails configurations
const guardrailsCache: GuardrailsCache = {};

export function useGuardrailsPreload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Generate cache key for a lesson
  const getCacheKey = useCallback((courseData: any, lessonData: any) => {
    return `${courseData?.id || "unknown"}-${lessonData?.id || "unknown"}`;
  }, []);

  // Preload guardrails for a specific lesson
  const preloadGuardrails = useCallback(
    async (
      courseData: any,
      lessonData: any
    ): Promise<GuardRailsConfig | undefined> => {
      if (!courseData || !lessonData) return undefined;

      const cacheKey = getCacheKey(courseData, lessonData);

      // Return cached version if available
      if (guardrailsCache[cacheKey] !== undefined) {
        return guardrailsCache[cacheKey];
      }

      try {
        setIsLoading(true);
        setError(null);

        // Create course document and guardrails in the background
        const courseDocument = createCourseDocument(courseData, lessonData);
        const guardrailsConfig = createGuardRails(courseDocument, {
          strictMode: false,
          debugMode: false,
        });

        // Cache the result
        guardrailsCache[cacheKey] = guardrailsConfig;

        console.log(`✅ Preloaded guardrails for lesson ${lessonData.id}`);
        return guardrailsConfig;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create guardrails");
        setError(error);
        console.warn(
          `⚠️ Failed to preload guardrails for lesson ${lessonData.id}:`,
          error
        );

        // Cache undefined to prevent retries
        guardrailsCache[cacheKey] = undefined;
        return undefined;
      } finally {
        setIsLoading(false);
      }
    },
    [getCacheKey]
  );

  // Preload guardrails for multiple lessons
  const preloadMultipleGuardrails = useCallback(
    async (courseData: any, lessons: any[]) => {
      const promises = lessons.map((lesson) =>
        preloadGuardrails(courseData, lesson)
      );

      await Promise.allSettled(promises);
    },
    [preloadGuardrails]
  );

  // Get cached guardrails config
  const getCachedGuardrails = useCallback(
    (courseData: any, lessonData: any) => {
      const cacheKey = getCacheKey(courseData, lessonData);
      return guardrailsCache[cacheKey] || undefined;
    },
    [getCacheKey]
  );

  // Clear cache (useful for testing or when course content changes)
  const clearCache = useCallback(() => {
    Object.keys(guardrailsCache).forEach((key) => {
      delete guardrailsCache[key];
    });
  }, []);

  return {
    preloadGuardrails,
    preloadMultipleGuardrails,
    getCachedGuardrails,
    clearCache,
    isLoading,
    error,
  };
}
