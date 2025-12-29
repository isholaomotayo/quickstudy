"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/AppContext";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ForumNavigation } from "./components/forum-navigation";
import { ForumContainer } from "./components/forum-container";
import { CreatePostDialog } from "./components/create-post-dialog";
import { SearchFilters } from "./components/search-filters";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { toast } from "sonner";
import {
  useForumPosts,
  ForumPost,
  ForumScope,
  useForumStats,
} from "@/lib/hooks/useForumData";

export default function ForumClient() {
  const { userData } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Extract primitive URL params so effects don't depend on unstable searchParams object
  const courseParam = searchParams?.get("course") || null;
  const tabParam = searchParams?.get("tab") || null;
  const courseNameParam = searchParams?.get("courseName") || null;

  // Check if we're in course-only mode (for content filtering, but allow tab switching)
  const isSpecificCourse = searchParams?.get("course");
  const courseOnlyMode = Boolean(isSpecificCourse);

  // Initialize currentScope based on URL parameters
  const getInitialScope = (): ForumScope => {
    const courseId = courseParam;
    const tab = tabParam;
    const courseName = courseNameParam;

    if (courseId) {
      return {
        type: tab === "discussions" ? "timed_discussion" : "course",
        course_id: parseInt(courseId),
        course_name: courseName ? decodeURIComponent(courseName) : `Course ${courseId}`, // Use URL param if available
      };
    }

    return { type: "institution" };
  };

  const [currentScope, setCurrentScope] = useState<ForumScope>(
    getInitialScope()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  // Use SWR to fetch forum posts
  const {
    posts,
    isLoading: loading,
    isError,
    mutate: refreshPosts,
  } = useForumPosts(currentScope);

  // Use SWR to fetch forum statistics
  const { stats: forumStats } = useForumStats();


  // Update course name from API response
  useEffect(() => {
    if (posts && posts.length > 0 && currentScope.course_id) {
      const firstPost = posts[0];
      const courseName = firstPost.course?.name;
      if (courseName && currentScope.course_name !== courseName) {
        setCurrentScope((prev) => ({
          ...prev,
          course_name: courseName,
        }));
      }
    }
  }, [posts, currentScope.course_id, currentScope.course_name]);

  // Sync state from URL parameter changes, but only when they differ from current state
  useEffect(() => {
    const courseId = courseParam;
    const tab = tabParam;
    const courseName = courseNameParam;

    if (courseId) {
      // If course is specified in URL, switch to that course
      const desiredType: ForumScope["type"] =
        tab === "discussions" ? "timed_discussion" : "course";
      const parsedCourseId = parseInt(courseId);
      const displayName = courseName ? decodeURIComponent(courseName) : `Course ${courseId}`;

      const isSameType = currentScope.type === desiredType;
      const isSameCourse = currentScope.course_id === parsedCourseId;
      const isSameName = currentScope.course_name === displayName;

      if (!isSameType || !isSameCourse || !isSameName) {
        const scope: ForumScope = {
          type: desiredType,
          course_id: parsedCourseId,
          course_name: displayName,
        };
        setCurrentScope(scope);
      }
    }
  }, [courseParam, tabParam, courseNameParam]);

  // Helper to keep URL in sync with selected scope
  const syncUrlWithScope = (scope: ForumScope) => {
    const params = new URLSearchParams(
      Array.from(searchParams?.entries?.() || [])
    );
    if (scope.type === "institution") {
      params.delete("course");
      params.delete("tab");
      params.delete("courseName");
    } else if (scope.course_id) {
      params.set("course", String(scope.course_id));
      params.set(
        "tab",
        scope.type === "timed_discussion" ? "discussions" : "forum"
      );
      if (scope.course_name && scope.course_name !== `Course ${scope.course_id}`) {
        params.set("courseName", encodeURIComponent(scope.course_name));
      } else {
        params.delete("courseName"); // Don't include generic name
      }
    } else {
      // No course selected yet; avoid writing partial state that could trigger resets
      return;
    }
    const query = params.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`);
  };

  // SWR will automatically refetch when currentScope changes

  const handleScopeChange = (newScope: ForumScope) => {
    setCurrentScope(newScope);
    syncUrlWithScope(newScope);
  };

  const handleEditPost = (post: any) => {
    // Only allow editing if user is the author
    if (Number(userData?.id) !== Number(post.author.id)) {
      toast.error("You can only edit your own posts");
      return;
    }
    setEditingPost(post);
    setShowCreatePost(true);
  };

  const handleDeletePost = () => {
    // This will be called after a post is deleted to refresh the posts list
    refreshPosts();
  };

  const handleCreatePost = async (postData: any) => {
    try {
      // Validate user data first
      if (!userData?.id) {
        toast.error("User not authenticated. Please refresh and try again.");
        return;
      }

      let endpoint = "";
      let method = "POST";
      // Transform data to match legacy API expectations
      let data: any = {};

      if (editingPost) {
        // Editing existing post
        method = "PUT";
        switch (currentScope.type) {
          case "institution":
            endpoint = `/api/forumTopic/${editingPost.id}`;
            break;
          case "course":
            endpoint = `/api/courseForumTopic/${editingPost.id}`;
            break;
          case "timed_discussion":
            endpoint = `/api/discussionTopic/${editingPost.id}`;
            break;
        }
      } else {
        // Creating new post
        switch (currentScope.type) {
          case "institution":
            endpoint = `/api/forumTopic`;
            break;
          case "course":
            endpoint = `/api/courseForumTopic`;
            break;
          case "timed_discussion":
            endpoint = `/api/discussionTopic`;
            break;
        }
      }

      // Prepare data based on scope type
      switch (currentScope.type) {
        case "institution":
          data = {
            title: postData.title,
            body: postData.content,
            user_id: userData.id,
            category: postData.category,
            is_pinned: postData.is_pinned || false,
            tags: postData.tags || [],
          };
          break;
        case "course":
          data = {
            title: postData.title,
            description: postData.content,
            user_id: userData.id,
            course_id: currentScope.course_id,
            category: postData.category,
            is_pinned: postData.is_pinned || false,
            tags: postData.tags || [],
          };
          break;
        case "timed_discussion":
          data = {
            title: postData.title,
            body: postData.content,
            user_id: userData.id,
            course_id: currentScope.course_id,
            start_date: postData.start_date,
            end_date: postData.end_date,
            category: postData.category,
            is_pinned: postData.is_pinned || false,
            tags: postData.tags || [],
          };
          break;
      }

      // Debug logging

      const response = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        toast.success(
          `${editingPost ? "Post updated" : "Post created"} successfully!`,
          {
            description: editingPost
              ? `Your ${
                  currentScope.type === "institution"
                    ? "forum post"
                    : currentScope.type === "course"
                    ? "course post"
                    : "timed discussion"
                } has been updated and is now visible to everyone.`
              : `Your ${
                  currentScope.type === "institution"
                    ? "forum post"
                    : currentScope.type === "course"
                    ? "course post"
                    : "timed discussion"
                } has been published and is now visible to everyone.`,
          }
        );
        refreshPosts(); // Refresh posts using SWR mutate
        setShowCreatePost(false);
        setEditingPost(null);
      } else {
        // Handle API error response
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error Response:", errorData);
        toast.error(
          `Failed to ${editingPost ? "update" : "create"} ${
            currentScope.type === "institution"
              ? "forum post"
              : currentScope.type === "course"
              ? "course post"
              : "timed discussion"
          }`,
          {
            description: errorData.message || "Please try again later.",
          }
        );
      }
    } catch (error) {
      console.error(
        `Failed to ${editingPost ? "update" : "create"} post:`,
        error
      );
      toast.error(
        "Network error. Please check your connection and try again.",
        {
          description:
            "Unable to connect to the server. Please check your internet connection.",
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Forum Navigation */}
      <ForumNavigation
        currentScope={currentScope}
        onScopeChange={handleScopeChange}
        courseOnly={courseOnlyMode} // Hide university tab in course-specific views
        courseId={isSpecificCourse ? parseInt(isSpecificCourse) : undefined}
        courseName={courseNameParam ? decodeURIComponent(courseNameParam) : undefined}
        posts={posts}
      />

      {/* Search and Filters */}
      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        scope={currentScope}
        courseStats={
          courseOnlyMode
            ? {
                forumPosts: posts.filter((p) => p.course_id && !p.start_date)
                  .length,
                discussions: posts.filter((p) => p.course_id && p.start_date)
                  .length,
                activeDiscussions: posts.filter(
                  (p) =>
                    p.course_id &&
                    p.start_date &&
                    new Date(p.start_date) <= new Date() &&
                    new Date(p.end_date || "") >= new Date()
                ).length,
                totalParticipants: 0, // Will be updated from API
              }
            : undefined
        }
        forumStats={
          currentScope.type === "institution" ? forumStats : undefined
        }
      />

      {/* Create Post Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">
          {currentScope.type === "institution" && "University Forum"}
          {currentScope.type === "course" &&
            (currentScope.course_id
              ? `${currentScope.course_name} Discussion`
              : "Course Forums")}
          {currentScope.type === "timed_discussion" &&
            (currentScope.course_id
              ? `${currentScope.course_name} Timed Discussions`
              : "Timed Discussions")}
        </h2>

        {/* Only show create button if user has permission and course is selected */}
        {(currentScope.type !== "timed_discussion" ||
          userData?.role !== "STUDENT") &&
          ((currentScope.type !== "course" &&
            currentScope.type !== "timed_discussion") ||
            currentScope.course_id) && (
            <Button
              onClick={() => setShowCreatePost(true)}
              size="sm"
              className="bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground hover:opacity-90"
            >
              <MessageSquarePlus className="w-3 h-3 mr-1" />
              New{" "}
              {currentScope.type === "timed_discussion" ? "Discussion" : "Post"}
            </Button>
          )}

        {/* Show message when no course is selected */}
        {(currentScope.type === "course" ||
          currentScope.type === "timed_discussion") &&
          !currentScope.course_id && (
            <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/60">
              Please select a course to create a{" "}
              {currentScope.type === "timed_discussion" ? "discussion" : "post"}
            </div>
          )}

        {/* Show permission message for students trying to create timed discussions */}
        {currentScope.type === "timed_discussion" &&
          userData?.role === "STUDENT" && (
            <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/60">
              Only faculty and staff can create timed discussions
            </div>
          )}
      </div>

      {/* Forum Posts Container */}
      <ForumContainer
        posts={posts}
        loading={loading}
        scope={currentScope}
        onRefresh={refreshPosts}
        onEditPost={handleEditPost}
        onDeletePost={handleDeletePost}
        onCreatePost={() => setShowCreatePost(true)}
      />

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        onSubmit={handleCreatePost}
        scope={currentScope}
        editingPost={editingPost}
      />
    </div>
  );
}
