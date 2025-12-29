"use client";

import useSWR from "swr";

// Fetcher function for SWR
const fetcher = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const jsonResponse = await response.json();

    // Check if the response is in the expected API format with success wrapper
    if (
      jsonResponse &&
      typeof jsonResponse === "object" &&
      "success" in jsonResponse
    ) {
      // If it's an error response, throw the error
      if (!jsonResponse.success) {
        throw new Error(
          jsonResponse.error || jsonResponse.message || "API request failed"
        );
      }
      // Return the actual data for successful responses
      return jsonResponse.data;
    }

    // Return the response as-is if it's not in the wrapper format
    return jsonResponse;
  } catch (error) {
    console.error("Fetcher error for URL:", url, error);
    throw error;
  }
};

// Overview data hook - Single API call for all overview data
export function useOverviewData(institutionId?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/overview?institutionId=${institutionId || ""}`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Dashboard data hook (keeping for backward compatibility)
export function useDashboardData(institutionId?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/stats?institutionId=${institutionId || ""}`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// User stats hook
export function useUserStats(institutionId?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/user-stats?institutionId=${institutionId || ""}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Course stats hook
export function useCourseStats() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/dashboard/course-stats",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Financial stats hook
export function useFinancialStats(institutionId?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/financial-stats?institutionId=${institutionId || ""}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Academic stats hook
export function useAcademicStats(institutionId?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/academic-stats?institutionId=${institutionId || ""}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Staff stats hook
export function useStaffStats(staffId?: bigint) {
  const { data, error, isLoading, mutate } = useSWR(
    staffId ? `/api/dashboard/staff-stats?staffId=${staffId}` : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Student stats hook
export function useStudentStats(userId?: bigint) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/dashboard/student-stats?userId=${userId}` : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Recent activity hook
export function useRecentActivity(institutionId?: number, limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/recent-activity?institutionId=${
      institutionId || ""
    }&limit=${limit}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Users data hook
export function useUsersData(
  institutionId?: number,
  search?: string,
  role?: string,
  status?: string,
  limit: number = 50
) {
  const params = new URLSearchParams();
  if (institutionId) params.append("institutionId", institutionId.toString());
  if (search) params.append("search", search);
  if (role) params.append("role", role);
  if (status) params.append("status", status);
  params.append("limit", limit.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/users?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Courses data hook
export function useCoursesData(
  search?: string,
  faculty?: string,
  department?: string,
  programme?: string,
  level?: string,
  status?: string,
  limit: number = 50,
  page: number = 1
) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (faculty) params.append("faculty", faculty);
  if (department) params.append("department", department);
  if (programme) params.append("programme", programme);
  if (level) params.append("level", level);
  if (status) params.append("status", status);
  params.append("limit", limit.toString());
  params.append("page", page.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/courses?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Departments data hook
export function useDepartmentsData(institutionId?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/departments?institutionId=${institutionId || ""}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Faculties data hook
export function useFacultiesData(institutionId?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/faculties?institutionId=${institutionId || ""}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Applications data hook
export function useApplicationsData(
  institutionId?: number,
  status?: string,
  limit: number = 50,
  type?: string
) {
  const params = new URLSearchParams();
  if (institutionId) params.append("institutionId", institutionId.toString());
  if (status) params.append("status", status);
  if (type) params.append("type", type);
  params.append("limit", limit.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/applications?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Payments data hook
export function usePaymentsData(
  institutionId?: number,
  status?: number,
  limit: number = 50,
  search?: string
) {
  const params = new URLSearchParams();
  if (institutionId) params.append("institutionId", institutionId.toString());
  if (status !== undefined) params.append("status", status.toString());
  if (search) params.append("search", search);
  params.append("limit", limit.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/payments?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Financial data hook
export function useFinancialData(institutionId?: number, period?: string) {
  const params = new URLSearchParams();
  if (institutionId) params.append("institutionId", institutionId.toString());
  if (period) params.append("period", period);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/financial?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Academic data hook
export function useAcademicData(institutionId?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/academic?institutionId=${institutionId || ""}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// System data hook
export function useSystemData() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/dashboard/system",
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Settings data hook
export function useSettingsData(institutionId?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/settings?institutionId=${institutionId || ""}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Programmes data hook - using existing API pattern like other hooks
export function useProgrammesData(
  institutionId?: number,
  departmentId?: number
) {
  const params = new URLSearchParams();
  if (institutionId) params.append("institutionId", institutionId.toString());
  if (departmentId) params.append("departmentId", departmentId.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/programmes?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Levels data hook
export function useLevelsData(institutionId?: number) {
  const params = new URLSearchParams();
  if (institutionId) params.append("institutionId", institutionId.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/levels?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// ============================================
// NEW HOOKS FOR OPS DASHBOARD COMPONENTS
// ============================================

// Student Results data hook - for results management component
export function useStudentResultsData(
  institutionId?: number,
  departmentId?: number,
  semesterId?: number,
  courseId?: number,
  page: number = 1,
  limit: number = 50
) {
  const params = new URLSearchParams();
  if (institutionId) params.append("institutionId", institutionId.toString());
  if (departmentId) params.append("departmentId", departmentId.toString());
  if (semesterId) params.append("semesterId", semesterId.toString());
  if (courseId) params.append("courseId", courseId.toString());
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/student-results?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Grade Definitions data hook - for academic management component
export function useGradeDefinitionsData(
  institutionId?: number,
  page: number = 1,
  limit: number = 50
) {
  const params = new URLSearchParams();
  if (institutionId) params.append("institutionId", institutionId.toString());
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/grades?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Academic Events data hook - for academic management component
export function useAcademicEventsData(
  institutionId?: number,
  departmentId?: number,
  type?: string,
  status?: string,
  startDate?: string,
  endDate?: string,
  page: number = 1,
  limit: number = 20
) {
  const params = new URLSearchParams();
  if (institutionId) params.append("institutionId", institutionId.toString());
  if (departmentId) params.append("departmentId", departmentId.toString());
  if (type) params.append("type", type);
  if (status) params.append("status", status);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/academic-events?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Student Performance data hook - for academic management component
export function useStudentPerformanceData(
  institutionId?: number,
  departmentId?: number,
  programmeId?: number,
  levelId?: number,
  academicStanding?: string,
  searchTerm?: string,
  page: number = 1,
  limit: number = 50
) {
  const params = new URLSearchParams();
  if (institutionId) params.append("institutionId", institutionId.toString());
  if (departmentId) params.append("departmentId", departmentId.toString());
  if (programmeId) params.append("programmeId", programmeId.toString());
  if (levelId) params.append("levelId", levelId.toString());
  if (academicStanding) params.append("academicStanding", academicStanding);
  if (searchTerm) params.append("search", searchTerm);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/student-performance?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Analytics data hook - for reports and analytics component
export function useAnalyticsData(
  institutionId?: number,
  timeRange: string = "30",
  includeChartData: boolean = false
) {
  const params = new URLSearchParams();
  if (institutionId) params.append("institutionId", institutionId.toString());
  params.append("timeRange", timeRange);
  params.append("includeChartData", includeChartData.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/analytics?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 120000, // Refresh every 2 minutes (analytics data changes less frequently)
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Reports data hook - for reports generation
export function useReportsData(
  institutionId?: number,
  reportType?: string,
  startDate?: string,
  endDate?: string,
  departmentId?: string,
  format: string = "json"
) {
  const params = new URLSearchParams();
  if (institutionId) params.append("institutionId", institutionId.toString());
  if (reportType) params.append("type", reportType);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (departmentId) params.append("departmentId", departmentId);
  params.append("format", format);

  const { data, error, isLoading, mutate } = useSWR(
    reportType ? `/api/reports?${params.toString()}` : null,
    fetcher,
    {
      refreshInterval: 0, // Don't auto-refresh reports (they're generated on demand)
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Institution Settings data hook - for settings configuration component
export function useInstitutionData(institutionId?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    institutionId ? `/api/institution/${institutionId}` : null,
    fetcher,
    {
      refreshInterval: 0, // Settings don't change frequently
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Results Management hooks - for bulk upload functionality
export function useCourseSearch(searchTerm?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    searchTerm && searchTerm.length >= 2
      ? `/api/courses/search?q=${encodeURIComponent(searchTerm)}`
      : null,
    fetcher,
    {
      refreshInterval: 0, // Search results don't need auto-refresh
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

export function useSemestersByCourse(courseId?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    courseId ? `/api/courses/${courseId}/semesters` : null,
    fetcher,
    {
      refreshInterval: 0, // Semesters don't change frequently
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

export function useStudentsBySemester(courseId?: number, semesterId?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    courseId && semesterId
      ? `/api/courses/${courseId}/students?semesterId=${semesterId}`
      : null,
    fetcher,
    {
      refreshInterval: 0, // Student lists are relatively static
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Grade configuration hook
export function useGradeConfig() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/grades/config",
    fetcher,
    {
      refreshInterval: 0, // Grade config doesn't change frequently
      revalidateOnFocus: false,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Simple Grades hook for CRUD operations on the grade table
export function useGrades(institutionId?: number) {
  const { data, error, isLoading, mutate } = useSWR(
    institutionId ? `/api/grades?institutionId=${institutionId}` : null,
    fetcher,
    {
      refreshInterval: 0, // Don't auto-refresh grade management
      revalidateOnFocus: false,
    }
  );

  // Create grade function
  const createGrade = async (gradeData: {
    name: string;
    weight?: number;
    minScore?: number;
    maxScore?: number;
    point: number;
  }) => {
    const response = await fetch("/api/grades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...gradeData,
        institutionId: institutionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create grade");
    }

    const result = await response.json();
    mutate(); // Refresh the data
    return result;
  };

  // Update grade function
  const updateGrade = async (
    id: number,
    gradeData: {
      name: string;
      weight?: number;
      minScore?: number;
      maxScore?: number;
      point: number;
    }
  ) => {
    const response = await fetch("/api/grades", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        ...gradeData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update grade");
    }

    const result = await response.json();
    mutate(); // Refresh the data
    return result;
  };

  // Delete grade function
  const deleteGrade = async (id: number) => {
    const response = await fetch(`/api/grades?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete grade");
    }

    const result = await response.json();
    mutate(); // Refresh the data
    return result;
  };

  return {
    data,
    error,
    isLoading,
    mutate,
    createGrade,
    updateGrade,
    deleteGrade,
  };
}

// Fees data hook
export function useFeesData(
  institutionId?: number,
  page: number = 1,
  limit: number = 50
) {
  const params = new URLSearchParams();
  if (institutionId) params.append("institutionId", institutionId.toString());
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/dashboard/fees?${params.toString()}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
