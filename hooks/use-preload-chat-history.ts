import { useCallback, useEffect } from "react";
import { mutate } from "swr";

// Preload chat history for better performance
export function usePreloadChatHistory() {
  const preloadHistory = useCallback(
    async (userId: string | number, lessonId?: number, moduleId?: number) => {
      if (!userId || (!lessonId && !moduleId)) return;

      const cacheKey = `/api/ai-chat?userId=${userId}&lessonId=${
        lessonId || ""
      }&moduleId=${moduleId || ""}`;

      try {
        // Prefetch the data in the background
        const response = await fetch(cacheKey);
        if (response.ok) {
          const data = await response.json();
          // Update the SWR cache
          mutate(cacheKey, data, false); // false = don't revalidate
          console.log(
            `✅ Preloaded chat history for user ${userId}, lesson ${lessonId}, module ${moduleId}`
          );
        }
      } catch (error) {
        console.warn(`⚠️ Failed to preload chat history:`, error);
      }
    },
    []
  );

  // Preload multiple contexts at once
  const preloadMultipleHistories = useCallback(
    async (
      userId: string | number,
      contexts: Array<{ lessonId?: number; moduleId?: number }>
    ) => {
      const promises = contexts.map((context) =>
        preloadHistory(userId, context.lessonId, context.moduleId)
      );

      await Promise.allSettled(promises);
    },
    [preloadHistory]
  );

  return {
    preloadHistory,
    preloadMultipleHistories,
  };
}
