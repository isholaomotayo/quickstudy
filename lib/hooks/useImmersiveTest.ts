import useSWR from 'swr';

// Fetcher function for SWR with credentials (using relative URLs)
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    // If it's a 404, return null instead of throwing for some endpoints
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Hook for fetching course test data
export function useCourseTest(courseTestId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    courseTestId ? `/api/coursetest/${courseTestId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  return {
    courseTest: data,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for fetching course questions
export function useCourseQuestions(courseTestId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    courseTestId ? `/api/coursequestion?filter=course_test_id:${courseTestId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  return {
    courseQuestions: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for fetching past attempts
export function usePastAttempts(courseTestId: string | null, userId: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    courseTestId && userId && !isNaN(userId) ? `/api/studenttest?course_test_id=${courseTestId}&user_id=${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // Cache for 10 seconds
    }
  );

  return {
    pastAttempts: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for starting a test
export function useStartTest() {
  const startTest = async (courseTestId: number) => {
    const response = await fetch(`/api/studenttest/start`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify({
        course_test_id: courseTestId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start test: ${response.statusText}`);
    }

    return response.json();
  };

  return { startTest };
}

// Hook for finishing a test
export function useFinishTest() {
  const finishTest = async (studentTestId: number, questionsAnswers: any[]) => {
    const response = await fetch(`/api/studenttest/finish`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        student_test_id: studentTestId,
        questions_answers: questionsAnswers,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to finish test: ${response.statusText}`);
    }

    return response.json();
  };

  return { finishTest };
}