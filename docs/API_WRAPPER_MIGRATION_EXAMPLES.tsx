/**
 * API Wrapper Migration Examples
 * 
 * This file demonstrates how to migrate from direct fetch() calls
 * or FetchWrapper to the new api-wrapper with feature flags.
 */

import React from "react";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api-wrapper";

// ============================================================================
// BEFORE: Direct fetch() calls
// ============================================================================

// OLD: GET request with fetch
async function getProfileOld() {
  const response = await fetch("/api/profile", {
    method: "GET",
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }
  
  const data = await response.json();
  return data;
}

// OLD: POST request with fetch
async function createCourseOld(courseData: any) {
  const response = await fetch("/api/course", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(courseData),
  });
  
  if (!response.ok) {
    throw new Error("Failed to create course");
  }
  
  return await response.json();
}

// OLD: GET with query params
async function getCoursesOld(page: number, limit: number) {
  const response = await fetch(
    `/api/course?page=${page}&limit=${limit}`,
    {
      method: "GET",
      credentials: "include",
    }
  );
  
  return await response.json();
}

// ============================================================================
// AFTER: Using api-wrapper
// ============================================================================

// NEW: GET request with api-wrapper
async function getProfileNew() {
  try {
    const response = await api.get("/api/profile");
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch profile");
  }
}

// NEW: POST request with api-wrapper
async function createCourseNew(courseData: any) {
  try {
    const response = await api.post("/api/course", courseData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Failed to create course");
  }
}

// NEW: GET with query params using params option
async function getCoursesNew(page: number, limit: number) {
  try {
    const response = await api.get("/api/course", {
      params: { page, limit },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch courses");
  }
}

// ============================================================================
// React Component Examples
// ============================================================================

// BEFORE: React component with fetch
export function ProfilePageOld() {
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/profile", {
          credentials: "include",
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        
        const data = await response.json();
        setProfile(data.data); // Assuming response has {data: ...}
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, []);

  // ... rest of component
}

// AFTER: React component with api-wrapper
export function ProfilePageNew() {
  const [profile, setProfile] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await api.get("/api/profile");
        setProfile(response.data.data); // api-wrapper returns {data, status, ...}
      } catch (error: any) {
        console.error("Error:", error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, []);

  // ... rest of component
}

// ============================================================================
// CRUD Operations Examples
// ============================================================================

// GET with filters
export async function getCourseTests(courseId: number, publishedOnly: boolean = false) {
  const response = await api.get("/api/coursetest", {
    params: {
      course_id: courseId,
      published_only: publishedOnly,
    },
  });
  return response.data;
}

// POST - Create
export async function createAnnouncement(data: {
  title: string;
  message: string;
  institution_id: number;
}) {
  const response = await api.post("/api/announcements", data);
  return response.data;
}

// PUT - Update
export async function updateCourse(courseId: number, updates: any) {
  const response = await api.put(`/api/course/${courseId}`, updates);
  return response.data;
}

// DELETE
export async function deleteCourseModule(moduleId: number) {
  const response = await api.delete(`/api/coursemodule/${moduleId}`);
  return response.data;
}

// ============================================================================
// Error Handling Patterns
// ============================================================================

// Pattern 1: Try-catch with toast notifications
export async function createCourseWithToast(courseData: any) {
  try {
    const response = await api.post("/api/course", courseData);
    toast.success("Course created successfully!");
    return response.data;
  } catch (error: any) {
    toast.error(error.message || "Failed to create course");
    throw error;
  }
}

// Pattern 2: Error state management in React
export function CourseFormExample() {
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(courseData: any) {
    setLoading(true);
    setError(null);
    
    try {
      await api.post("/api/course", courseData);
      // Success handling
    } catch (error: any) {
      setError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  // ... rest of component
}

// Pattern 3: Detailed error handling
export async function submitTest(testId: number, answers: any) {
  try {
    const response = await api.put(`/api/studenttest/${testId}`, {
      questions_answers: answers,
    });
    return response.data;
  } catch (error: any) {
    // error contains: {data, status, statusText, message}
    if (error.status === 403) {
      throw new Error("Test time has expired");
    } else if (error.status === 409) {
      throw new Error("Test already submitted");
    } else {
      throw new Error(error.message || "Failed to submit test");
    }
  }
}

// ============================================================================
// Advanced Patterns
// ============================================================================

// Bulk operations
export async function bulkRegisterStudents(registrations: any[]) {
  // Supports both single and array
  const response = await api.post("/api/studentcourse", registrations);
  return response.data;
}

// Search with filters
export async function searchAnnouncements(query: string, institutionId: number) {
  const response = await api.get("/api/announcements/search", {
    params: {
      q: query,
      institution_id: institutionId,
    },
  });
  return response.data;
}

// Mark as read pattern
export async function markAnnouncementRead(announcementId: number) {
  const response = await api.post(`/api/announcements/${announcementId}/read`);
  return response.data;
}

// Get with nested data
export async function getCourseWithModules(courseId: number) {
  const response = await api.get(`/api/course/${courseId}`);
  // Response includes nested modules and lessons
  return response.data;
}

// ============================================================================
// TypeScript Type Definitions
// ============================================================================

// Define response types for better type safety
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  user?: any;
}

interface Course {
  id: number;
  name: string;
  code: string;
  description?: string;
  created_at: string;
}

// Usage with types
export async function getCoursesTyped(): Promise<Course[]> {
  const response = await api.get<ApiSuccessResponse<Course[]>>("/api/course");
  return response.data;
}

// ============================================================================
// Migration Checklist
// ============================================================================

/**
 * MIGRATION STEPS:
 * 
 * 1. Replace imports:
 *    - Remove: import fetch from "isomorphic-unfetch"
 *    - Remove: import { FetchWrapper } from "@/helpers/FetchWrapper"
 *    - Add: import { api } from "@/lib/api-wrapper"
 * 
 * 2. Replace fetch calls:
 *    - fetch(url, {method: "GET"}) → api.get(url)
 *    - fetch(url, {method: "POST", body: JSON.stringify(data)}) → api.post(url, data)
 *    - fetch(url, {method: "PUT", body: JSON.stringify(data)}) → api.put(url, data)
 *    - fetch(url, {method: "DELETE"}) → api.delete(url)
 * 
 * 3. Handle query params:
 *    - `/api/course?page=1&limit=10` → api.get("/api/course", {params: {page: 1, limit: 10}})
 * 
 * 4. Update response handling:
 *    - await response.json() → response.data
 *    - Response is already parsed JSON
 * 
 * 5. Update error handling:
 *    - Error object includes: {data, status, statusText, message}
 *    - No need to check response.ok
 * 
 * 6. Remove credentials: "include":
 *    - api-wrapper includes this automatically
 * 
 * 7. Remove Content-Type header:
 *    - api-wrapper sets application/json by default
 * 
 * 8. Test with feature flags:
 *    - Set USE_NEXTJS_* environment variables
 *    - Verify routing works correctly
 */

// ============================================================================
// Common Migration Patterns
// ============================================================================

// Pattern: API_URL prefix removal
// BEFORE:
// const response = await fetch(`${API_URL}/api/course`, {...})

// AFTER:
// const response = await api.get("/api/course")
// Note: api-wrapper handles routing automatically

// Pattern: Error checking
// BEFORE:
// if (!response.ok) throw new Error("Failed")

// AFTER:
// api-wrapper throws automatically on error

// Pattern: JSON parsing
// BEFORE:
// const data = await response.json()

// AFTER:
// const data = response.data
// Note: Already parsed

export default {
  getProfileNew,
  createCourseNew,
  getCoursesNew,
  getCourseTests,
  createAnnouncement,
  updateCourse,
  deleteCourseModule,
  bulkRegisterStudents,
  searchAnnouncements,
};
