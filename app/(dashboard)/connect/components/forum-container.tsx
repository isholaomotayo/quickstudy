"use client";

import { useState } from "react";
import { useUser } from "@/contexts/AppContext";
import { ForumPost } from "./forum-post";
import { PostDetailModal } from "./post-detail-modal";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  MessageSquare,
  TrendingUp,
  Clock,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import {
  ForumPost as ForumPostType,
  ForumScope,
} from "@/lib/hooks/useForumData";

interface ForumContainerProps {
  posts: ForumPostType[];
  loading: boolean;
  scope: ForumScope;
  onRefresh: () => void;
  onEditPost?: (post: ForumPostType) => void;
  onDeletePost?: () => void;
  onCreatePost?: () => void;
}

export function ForumContainer({
  posts,
  loading,
  scope,
  onRefresh,
  onEditPost,
  onDeletePost,
  onCreatePost,
}: ForumContainerProps) {
  const [selectedPost, setSelectedPost] = useState<ForumPostType | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "active">(
    "recent"
  );

  const sortPosts = (posts: ForumPostType[]) => {
    switch (sortBy) {
      case "popular":
        return [...posts].sort((a, b) => b.likes_count - a.likes_count);
      case "active":
        return [...posts].sort((a, b) => b.comments_count - a.comments_count);
      case "recent":
      default:
        return [...posts].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  };

  const sortedPosts = sortPosts(Array.isArray(posts) ? posts : []);
  const pinnedPosts = sortedPosts.filter((post) => post.is_pinned);
  const regularPosts = sortedPosts.filter((post) => !post.is_pinned);

  if (loading) {
    return <ForumSkeleton />;
  }

  // Show course selection message when in course view but no course selected
  if (
    (scope.type === "course" || scope.type === "timed_discussion") &&
    !scope.course_id
  ) {
    return (
      <GlassCard className="p-12 text-center bg-card border border-border">
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              Select a Course
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Choose a course from the list above to view its{" "}
              {scope.type === "timed_discussion"
                ? "timed discussions"
                : "discussion forum and posts"}
              .
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    return <EmptyState scope={scope} onCreatePost={onCreatePost} />;
  }

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <div className="flex gap-1">
            {[
              { value: "recent", label: "Recent", icon: Clock },
              { value: "popular", label: "Popular", icon: TrendingUp },
              { value: "active", label: "Active", icon: MessageSquare },
            ].map((option) => {
              const IconComponent = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSortBy(option.value as any)}
                  className={`flex items-center gap-1 text-xs ${
                    sortBy === option.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  <IconComponent className="w-3 h-3" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="flex items-center gap-1 text-muted-foreground hover:text-primary"
        >
          <RefreshCw className="w-3 h-3" />
          Refresh
        </Button>
      </div>

      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
            📌 Pinned Posts
          </h3>
          {pinnedPosts.map((post) => (
            <ForumPost
              key={post.id}
              post={post}
              onClick={() => setSelectedPost(post)}
              onEdit={onEditPost ? () => onEditPost(post) : undefined}
              onDelete={onDeletePost}
              isPinned
            />
          ))}
        </div>
      )}

      {/* Regular Posts */}
      <div className="space-y-4">
        {pinnedPosts.length > 0 && (
          <h3 className="text-lg font-medium text-foreground">
            Recent {scope.type === "timed_discussion" ? "Discussions" : "Posts"}
          </h3>
        )}

        {regularPosts.map((post) => {
          return (
            <ForumPost
              key={post.id}
              post={post}
              onClick={() => setSelectedPost(post)}
              onEdit={onEditPost ? () => onEditPost(post) : undefined}
              onDelete={onDeletePost}
            />
          );
        })}
      </div>

      {/* Load More Button */}
      {posts.length >= 10 && (
        <div className="flex justify-center">
          <Button variant="outline" className="bg-card hover:bg-muted/40">
            Load More Posts
          </Button>
        </div>
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(null)}
          scope={scope}
        />
      )}
    </div>
  );
}

function ForumSkeleton() {
  return (
    <div className="space-y-4">
      {/* Sort Controls Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
        </div>
        <Skeleton className="h-8 w-20" />
      </div>

      {/* Posts Skeleton */}
      {[...Array(5)].map((_, i) => (
        <GlassCard key={i} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function EmptyState({
  scope,
  onCreatePost,
}: {
  scope: ForumScope;
  onCreatePost?: () => void;
}) {
  const { userData } = useUser();

  // Check if user can create timed discussions (only non-students)
  const canCreateTimedDiscussion = userData?.role !== "STUDENT";

  return (
    <GlassCard className="p-12 text-center bg-card border border-border">
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-primary" />
        </div>

        <div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No {scope.type === "timed_discussion" ? "discussions" : "posts"} yet
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {scope.type === "institution" &&
              "Be the first to start a conversation in the university forum!"}
            {scope.type === "course" &&
              "Be the first to ask a question or share something with your classmates."}
            {scope.type === "timed_discussion" &&
              "No active discussions at the moment. Check back later or create a new timed discussion."}
          </p>
        </div>

        {/* Only show create button if user has permission */}
        {(scope.type !== "timed_discussion" || canCreateTimedDiscussion) && (
          <Button
            onClick={onCreatePost}
            className="bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground hover:opacity-90"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Create First{" "}
            {scope.type === "timed_discussion" ? "Discussion" : "Post"}
          </Button>
        )}

        {/* Show permission message for students in timed discussion context */}
        {scope.type === "timed_discussion" && !canCreateTimedDiscussion && (
          <div className="text-sm text-muted-foreground bg-muted/30 px-4 py-2 rounded-lg border border-border/60">
            Only faculty and staff can create timed discussions
          </div>
        )}
      </div>
    </GlassCard>
  );
}
