import { translateCode } from "./language/translate";
import { toast } from "react-hot-toast";

/**
 * Handle API responses and show appropriate error messages
 * This follows the pattern used in ImmersiveQuiz.js
 *
 * @param {Response} response - The fetch response object
 * @param {string} successMessage - Message to show on success
 * @param {string} defaultErrorMessage - Default error message if no pageNotif
 * @returns {Promise<Object>} - The response data or throws error
 */
export const handleApiResponse = async (
  response,
  successMessage = null,
  defaultErrorMessage = "Operation failed"
) => {
  if (response.ok) {
    const data = await response.json();

    // Show success message if provided
    if (successMessage) {
      toast.success(successMessage);
    }

    return data;
  } else {
    // Try to get error details from response
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, use default error
      throw new Error(defaultErrorMessage);
    }

    // Check for pageNotif error code (like in ImmersiveQuiz.js)
    if (errorData.pageNotif) {
      const errorMessage = translateCode(errorData.pageNotif);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Check for other error formats
    if (errorData.message) {
      toast.error(errorData.message);
      throw new Error(errorData.message);
    }

    if (errorData.error) {
      toast.error(errorData.error);
      throw new Error(errorData.error);
    }

    // Fallback to default error
    toast.error(defaultErrorMessage);
    throw new Error(defaultErrorMessage);
  }
};

/**
 * Handle API errors in catch blocks
 *
 * @param {Error} error - The caught error
 * @param {string} defaultErrorMessage - Default error message
 */
export const handleApiError = (
  error,
  defaultErrorMessage = "An error occurred"
) => {
  console.error("API Error:", error);

  // If error already has a message (from handleApiResponse), use it
  if (error.message && error.message !== defaultErrorMessage) {
    toast.error(error.message);
  } else {
    toast.error(defaultErrorMessage);
  }
};

/**
 * Example usage for assignment submission
 */
export const submitAssignmentExample = async (assignmentData) => {
  try {
    const response = await fetch("/api/assignment/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(assignmentData),
    });

    // This will handle all the error cases automatically
    const result = await handleApiResponse(
      response,
      "Assignment submitted successfully!",
      "Failed to submit assignment"
    );

    return result;
  } catch (error) {
    // Error is already handled by handleApiResponse
    throw error;
  }
};

/**
 * Example usage for assignment grading
 */
export const gradeAssignmentExample = async (submissionId, gradeData) => {
  try {
    const response = await fetch(`/api/assignment/grade/${submissionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(gradeData),
    });

    const result = await handleApiResponse(
      response,
      "Assignment graded successfully!",
      "Failed to grade assignment"
    );

    return result;
  } catch (error) {
    throw error;
  }
};
