// Forum Types for the Connect/Discussion Board feature

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "SUPERADMIN" | "ADMIN" | "STAFF" | "FACULTY" | "STUDENT";
  avatar?: string;
  username?: string;
}

export interface ForumPost {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  author: User;
  category?: string;
  course_id?: number;
  start_date?: string;
  end_date?: string;
  comments_count: number;
  likes_count: number;
  is_liked: boolean;
  is_pinned: boolean;
  tags?: string[];
  // Additional metadata
  views_count?: number;
  last_activity?: string;
}

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  author: User;
  post_id: number;
  parent_id?: number; // For replies
  replies: Comment[];
  likes_count: number;
  is_liked: boolean;
  is_edited?: boolean;
}

export interface ForumScope {
  type: "institution" | "course" | "timed_discussion";
  course_id?: number;
  course_name?: string;
  course_code?: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
  description?: string;
  instructor_id?: number;
  instructor?: User;
}

export interface ForumCategory {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  scope: "institution" | "course";
}

export interface CreatePostData {
  title: string;
  content: string;
  category: string;
  course_id?: number;
  start_date?: string;
  end_date?: string;
  tags?: string[];
  is_pinned?: boolean;
}

export interface CreateCommentData {
  content: string;
  post_id: number;
  parent_id?: number;
}

export interface ForumStats {
  total_posts: number;
  total_comments: number;
  active_discussions: number;
  today_posts: number;
  weekly_posts: number;
  top_contributors: User[];
}

export interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Filter and sort options
export type SortOption = "recent" | "popular" | "active" | "oldest";

export interface ForumFilters {
  search?: string;
  category?: string;
  author_id?: number;
  date_range?: {
    start: string;
    end: string;
  };
  is_pinned?: boolean;
  has_comments?: boolean;
}

// Discussion status for timed discussions
export type DiscussionStatus = "upcoming" | "active" | "completed" | "cancelled";

export interface TimedDiscussion extends ForumPost {
  start_date: string;
  end_date: string;
  status: DiscussionStatus;
  max_participants?: number;
  current_participants?: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationData;
}

// Error types
export interface ForumError {
  code: string;
  message: string;
  details?: any;
}

// Notification types for real-time updates
export interface ForumNotification {
  id: string;
  type: "new_post" | "new_comment" | "mention" | "like" | "reply";
  post_id: number;
  comment_id?: number;
  actor: User;
  created_at: string;
  is_read: boolean;
}

// Permissions
export interface ForumPermissions {
  can_create_post: boolean;
  can_edit_post: boolean;
  can_delete_post: boolean;
  can_pin_post: boolean;
  can_moderate: boolean;
  can_view_analytics: boolean;
  can_manage_categories: boolean;
}

// Search result types
export interface SearchResult {
  type: "post" | "comment" | "user";
  id: number;
  title?: string;
  content: string;
  author: User;
  created_at: string;
  relevance_score: number;
  highlight?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
  took_ms: number;
}