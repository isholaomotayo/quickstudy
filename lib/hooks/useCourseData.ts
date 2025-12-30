import useSWR from "swr";

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const json = await response.json();

  // Unwrap the data property if it exists (for Next.js API routes)
  // This handles both old backend format and new Next.js API format
  return json.data || json;
};

// Hook for fetching course data
export function useCourseData(courseId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    courseId ? `/api/course/${courseId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  return {
    courseData: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for fetching module progress
export function useModuleProgress(moduleId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    moduleId ? `/api/module-progress/${moduleId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // Cache for 10 seconds
    }
  );

  return {
    progressData: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for updating module progress
export function useUpdateModuleProgress() {
  const updateProgress = async (moduleId: string, progressData: any) => {
    const response = await fetch(
      `/api/module-progress/${moduleId}`,
      {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(progressData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update progress: ${response.statusText}`);
    }

    return response.json();
  };

  return { updateProgress };
}
