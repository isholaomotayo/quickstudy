/**
 * Example Usage of API Wrapper
 * This demonstrates how to migrate from FetchWrapper to the new api-wrapper
 */

import { api } from "@/lib/api-wrapper";

// ============================================
// Example 1: Fetch User Profile
// ============================================

// OLD WAY (FetchWrapper.js):
// const response = await fetch(`${process.env.API_URL}/api/profile`, {
//   credentials: "include"
// });
// const data = await response.json();

// NEW WAY (api-wrapper.ts):
async function getUserProfile() {
  try {
    const response = await api.get("/api/profile");
    return response.data; // Prisma user object
  } catch (error: any) {
    console.error("Error:", error.message);
    throw error;
  }
}

// ============================================
// Example 2: Update User Profile
// ============================================

// NEW WAY:
async function updateProfile(updates: { first_name?: string; last_name?: string }) {
  try {
    const response = await api.put("/api/profile", updates);
    return response.data;
  } catch (error: any) {
    console.error("Error:", error.message);
    throw error;
  }
}

// ============================================
// Example 3: Fetch Courses (with filters)
// ============================================

// NEW WAY:
async function getCourses(filters?: {
  search?: string;
  programme_id?: number;
  level_id?: number;
  pgsize?: number;
  pg?: number;
}) {
  try {
    const response = await api.get("/api/course", { params: filters });
    return response.data;
  } catch (error: any) {
    console.error("Error:", error.message);
    throw error;
  }
}

// ============================================
// Example 4: Create a Course
// ============================================

// NEW WAY:
async function createCourse(courseData: {
  code: string;
  name: string;
  units: number;
  description?: string;
  programme_id?: number;
  level_id?: number;
  department_id?: number;
}) {
  try {
    const response = await api.post("/api/course", courseData);
    return response.data;
  } catch (error: any) {
    if (error.status === 403) {
      throw new Error("You don't have permission to create courses");
    }
    throw error;
  }
}

// ============================================
// Example 5: Get Course with Full Details
// ============================================

// NEW WAY:
async function getCourseDetails(courseId: number) {
  try {
    const response = await api.get(`/api/course/${courseId}`);
    // Response includes:
    // - course data
    // - course.programme
    // - course.level
    // - course.department
    // - course.course_module[] (with lessons)
    // - course.staff_course[] (with staff details)
    return response.data;
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error("Course not found");
    }
    throw error;
  }
}

// ============================================
// Example 6: Create Course Module
// ============================================

// NEW WAY:
async function createModule(moduleData: {
  course_id: number;
  name: string;
  order: number;
  description?: string;
  published?: boolean;
}) {
  try {
    const response = await api.post("/api/coursemodule", moduleData);
    return response.data;
  } catch (error: any) {
    console.error("Error:", error.message);
    throw error;
  }
}

// ============================================
// Example 7: Create Course Lesson
// ============================================

// NEW WAY:
async function createLesson(lessonData: {
  course_module_id: number;
  name: string;
  order: number;
  description?: string;
  content?: string;
}) {
  try {
    const response = await api.post("/api/courselesson", lessonData);
    return response.data;
  } catch (error: any) {
    console.error("Error:", error.message);
    throw error;
  }
}

// ============================================
// Example 8: Usage in React Component
// ============================================

// "use client";
// import { useState, useEffect } from "react";
// import { api } from "@/lib/api-wrapper";
//
// export default function CoursesPage() {
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//
//   useEffect(() => {
//     async function loadCourses() {
//       try {
//         const response = await api.get("/api/course", {
//           params: { pgsize: 50, pg: 1 }
//         });
//         setCourses(response.data.courses);
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadCourses();
//   }, []);
//
//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;
//
//   return (
//     <div>
//       {courses.map((course) => (
//         <div key={course.id}>
//           <h3>{course.name} ({course.code})</h3>
//           <p>{course.description}</p>
//         </div>
//       ))}
//     </div>
//   );
// }

// ============================================
// Example 9: Usage with SWR (Future)
// ============================================

// import useSWR from "swr";
// import { api } from "@/lib/api-wrapper";
//
// const fetcher = (url: string) => api.get(url).then(res => res.data);
//
// export function useCourses() {
//   const { data, error, isLoading } = useSWR("/api/course", fetcher);
//   return {
//     courses: data?.courses || [],
//     isLoading,
//     error
//   };
// }

// ============================================
// Example 10: Check Which Backend is Used
// ============================================

import { getAPIBackend } from "@/lib/api-wrapper";

function checkBackend() {
  console.log("Profile API:", getAPIBackend("/api/profile")); // "nextjs" or "fastify"
  console.log("Course API:", getAPIBackend("/api/course")); // "nextjs" or "fastify"
  console.log("Forum API:", getAPIBackend("/api/forum")); // "nextjs" or "fastify"
}

// ============================================
// Notes on Prisma Response Format
// ============================================

// Prisma returns camelCase fields (matching schema):
// - created_at (not createdAt)
// - updated_at (not updatedAt)
// - course_id (not courseId)
//
// Relations are nested objects:
// course.course_module[] (not courseModules)
// user.staff_staff_user_idTouser[] (Prisma relation name)
//
// Adjust frontend components to handle these field names directly.
// No transformation layer - work with Prisma format as-is.

export {
  getUserProfile,
  updateProfile,
  getCourses,
  createCourse,
  getCourseDetails,
  createModule,
  createLesson,
  checkBackend,
};
