import useSWR from "swr";

// Fetcher function for SWR
const fetcher = async (url: string) => {
  try {
    const response = await fetch(url, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Get error details from response body if available
      let errorMessage = `Failed to fetch from ${url}: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage += ` - ${errorData.message}`;
        }
      } catch {
        // If response body is not JSON, use the status text
      }

      console.warn("Fetch error:", errorMessage);

      // For 404 errors, return empty array instead of throwing
      if (response.status === 404) {
        console.warn(`Resource not found at ${url}, returning empty data`);
        return [];
      }

      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Network errors or other fetch failures
    if (error instanceof Error && error.message.includes("fetch")) {
      console.warn(`Network error fetching ${url}:`, error);
      throw new Error(
        `Network error: Unable to connect to ${url}. Please check if the server is running.`
      );
    }
    throw error;
  }
};

export interface ForumPost {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
    avatar?: string;
  };
  course?: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  };
  category?: string;
  course_id?: number;
  start_date?: string;
  end_date?: string;
  comments_count: number;
  likes_count: number;
  is_liked: boolean;
  is_pinned: boolean;
  tags?: string[];
}

export interface ForumScope {
  type: "institution" | "course" | "timed_discussion";
  course_id?: number;
  course_name?: string;
}

// Hook for fetching forum posts based on scope
export function useForumPosts(scope: ForumScope) {
  const getEndpoint = () => {
    if (!scope) return null;

    switch (scope.type) {
      case "institution":
        return `/api/forumTopic`;
      case "course":
        // If no specific course is selected, get all course forums user can participate in
        return scope.course_id
          ? `/api/courseForumTopic/${scope.course_id}`
          : `/api/courseForumTopic`;
      case "timed_discussion":
        // If no specific course is selected, get all course discussions user can participate in
        return scope.course_id
          ? `/api/discussionTopic/${scope.course_id}`
          : `/api/discussionTopic`;
      default:
        console.warn("Unknown forum scope type:", scope.type);
        return null;
    }
  };

  const endpoint = getEndpoint();

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000, // Cache for 10 seconds
    errorRetryCount: 2,
    errorRetryInterval: 5000,
    onError: (err) => {
      console.warn(
        `Unable to fetch forum posts (${scope.type}, course_id: ${scope.course_id}):`,
        err.message
      );
    },
    shouldRetryOnError: false,
  });

  // Transform the data to include course information from the API response
  const transformedPosts: ForumPost[] = Array.isArray(data)
    ? data.map((post: Record<string, any>) => ({
        id: post.id,
        title: post.title,
        content: post.body || post.description || post.content,
        created_at: post.created_at,
        updated_at: post.updated_at,
        author: {
          id: post.user?.id || post.author?.id,
          first_name: post.user?.first_name || post.author?.first_name,
          last_name: post.user?.last_name || post.author?.last_name,
          role: post.user?.role || post.author?.role,
          avatar: post.user?.avatar || post.author?.avatar,
        },
        course: post.course, // Include the course data from API response
        course_id: post.course?.id || post.course_id,
        category: post.category,
        start_date: post.start_date,
        end_date: post.end_date,
        comments_count: post.comments_count || post.thread?.length || 0,
        likes_count: post.likes_count || 0,
        is_liked: post.is_liked || false,
        is_pinned: post.is_pinned || false,
        tags: post.tags,
      }))
    : [];

  return {
    posts: transformedPosts,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for fetching comments for a specific post
export function usePostComments(postId: number, scope: ForumScope) {
  const getCommentsEndpoint = () => {
    if (!postId || !scope) {
      console.warn("Missing postId or scope for comments fetch");
      return null;
    }

    switch (scope.type) {
      case "institution":
        return `/api/forumThread/${postId}`;
      case "course":
        return `/api/courseForumThread/${postId}`;
      case "timed_discussion":
        return `/api/discussionTopic/${postId}/comments`;
      default:
        console.warn("Unknown forum scope type for comments:", scope.type);
        return null;
    }
  };

  const endpoint = getCommentsEndpoint();

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000, // Cache for 5 seconds
    errorRetryCount: 2,
    errorRetryInterval: 5000,
    onError: (err) => {
      console.warn(
        `Unable to fetch comments (postId: ${postId}):`,
        err.message
      );
    },
    shouldRetryOnError: false,
  });

  // Transform thread data to match comment structure
  const transformedComments = Array.isArray(data)
    ? data.map((thread: Record<string, any>) => ({
        id: thread.id,
        body: thread.body,
        created_at: thread.created_at,
        updated_at: thread.updated_at,
        user: thread.user || {
          id: thread.user_id,
          first_name: "Unknown",
          last_name: "User",
          role: "student",
        },
      }))
    : [];

  return {
    comments: transformedComments,
    isLoading,
    isError: error,
    mutate,
  };
}

// Hook for fetching forum statistics
export function useForumStats() {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/forumStats`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
      errorRetryCount: 1,
      errorRetryInterval: 10000,
      onError: (err) => {
        console.warn("Forum stats unavailable:", err.message);
      },
      shouldRetryOnError: false,
    }
  );

  return {
    stats: data || {
      today: 0,
      thisWeek: 0,
      totalMembers: 0,
      totalPosts: 0,
    },
    isLoading,
    isError: error,
    mutate,
  };
}
