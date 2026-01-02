"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { EmbeddedForum } from "./embedded-forum";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageCircle,
  Clock,
  BookOpen,
  ChevronRight,
  Users,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ForumPost } from "../types/forum";

interface CourseForumWidgetProps {
  courseId: number;
  courseName: string;
  courseCode?: string;
  // Widget display mode
  mode?: "summary" | "full" | "tabs";
  showHeader?: boolean;
  maxItems?: number;
}

interface ForumSummary {
  forum_posts_count: number;
  discussions_count: number;
  recent_activity: Array<{
    id: number;
    title: string;
    type: "forum" | "discussion";
    author: string;
    created_at: string;
    comments_count: number;
  }>;
  active_discussions: Array<{
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    participants: number;
  }>;
}

export function CourseForumWidget({
  courseId,
  courseName,
  courseCode,
  mode = "summary",
  showHeader = true,
  maxItems = 5,
}: CourseForumWidgetProps) {
  const router = useRouter();
  const [summary, setSummary] = useState<ForumSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForumSummary();
  }, [courseId]);

  const loadForumSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/forum-summary`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      } else {
        // Fallback: load data from individual endpoints
        const [forumResponse, discussionResponse] = await Promise.all([
          fetch(`/api/courseForumTopic/${courseId}`, {
            credentials: "include",
          }),
          fetch(`/api/discussionTopic/${courseId}`, { credentials: "include" }),
        ]);

        const forumPosts = forumResponse.ok ? await forumResponse.json() : [];
        const discussions = discussionResponse.ok
          ? await discussionResponse.json()
          : [];

        // Create summary from individual responses
        const recentActivity = [
          ...forumPosts.map((post: ForumPost) => ({
            id: post.id,
            title: post.title,
            type: "forum" as const,
            author:
              `${post.author?.first_name || ""} ${
                post.author?.last_name || ""
              }`.trim() || "Unknown",
            created_at: post.created_at,
            comments_count: post.comments_count || 0,
          })),
          ...discussions.map((discussion: any) => ({
            id: discussion.id,
            title: discussion.title,
            type: "discussion" as const,
            author:
              `${discussion.user?.first_name || ""} ${
                discussion.user?.last_name || ""
              }`.trim() || "Unknown",
            created_at: discussion.created_at,
            comments_count: discussion.comments?.length || 0,
          })),
        ].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setSummary({
          forum_posts_count: forumPosts.length,
          discussions_count: discussions.length,
          recent_activity: recentActivity.slice(0, maxItems),
          active_discussions: discussions
            .filter((d: any) => {
              const now = new Date();
              const start = new Date(d.start_date);
              const end = new Date(d.end_date);
              return start <= now && now <= end;
            })
            .slice(0, 3),
        });
      }
    } catch (error) {
      console.error("Failed to load forum summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (mode === "full") {
    return (
      <EmbeddedForum
        courseId={courseId}
        courseName={courseName}
        courseCode={courseCode}
        defaultTab="forum"
        maxPosts={maxItems}
        showCreateButton={true}
        compact={false}
      />
    );
  }

  if (mode === "tabs") {
    return (
      <EmbeddedForum
        courseId={courseId}
        courseName={courseName}
        courseCode={courseCode}
        defaultTab="forum"
        maxPosts={maxItems}
        showCreateButton={true}
        compact={true}
      />
    );
  }

  // Summary mode (default)
  return (
    <GlassCard className="p-6">
      <div className="space-y-6">
        {/* Header */}
        {showHeader && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Course Discussion
                </h3>
                <p className="text-sm text-gray-600">{courseCode}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                router.push(`/connect?course=${courseId}&courseName=${encodeURIComponent(courseName)}`)
              }
              className="text-blue-600 hover:text-blue-700"
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}

        {loading ? (
          <ForumSummarySkeleton />
        ) : !summary ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Unable to load forum data</p>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-lg font-semibold text-blue-800">
                      {summary.forum_posts_count}
                    </div>
                    <div className="text-sm text-blue-600">Forum Posts</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-lg font-semibold text-green-800">
                      {summary.discussions_count}
                    </div>
                    <div className="text-sm text-green-600">Discussions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Discussions */}
            {summary.active_discussions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <h4 className="font-medium text-gray-800">
                    Active Discussions
                  </h4>
                  <Badge className="bg-orange-100 text-orange-800">
                    {summary.active_discussions.length}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {summary.active_discussions.map((discussion) => (
                    <div
                      key={discussion.id}
                      className="p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 cursor-pointer transition-colors"
                      onClick={() =>
                        router.push(`/connect?course=${courseId}&discussion=${discussion.id}&courseName=${encodeURIComponent(courseName)}`)
                      }
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm text-gray-900 line-clamp-1">
                          {discussion.title}
                        </h5>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="w-3 h-3" />
                          {discussion.participants}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Ends{" "}
                          {formatDistanceToNow(new Date(discussion.end_date), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {summary.recent_activity.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Recent Activity
                </h4>

                <div className="space-y-2">
                  {summary.recent_activity.map((activity) => (
                    <div
                      key={`${activity.type}-${activity.id}`}
                      className="p-3 bg-white/50 border border-white/30 rounded-lg hover:bg-white/70 cursor-pointer transition-colors"
                      onClick={() =>
                        router.push(`/connect?course=${courseId}&${activity.type}=${activity.id}&courseName=${encodeURIComponent(courseName)}`)
                      }
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center ${
                            activity.type === "forum"
                              ? "bg-purple-100 text-purple-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {activity.type === "forum" ? (
                            <BookOpen className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm text-gray-900 line-clamp-1">
                            {activity.title}
                          </h5>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                            <span>by {activity.author}</span>
                            <span>•</span>
                            <span>
                              {formatDistanceToNow(
                                new Date(activity.created_at),
                                { addSuffix: true }
                              )}
                            </span>
                            {activity.comments_count > 0 && (
                              <>
                                <span>•</span>
                                <span>{activity.comments_count} comments</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {summary.recent_activity.length === 0 &&
              summary.active_discussions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No discussions yet</p>
                  <p className="text-sm">
                    Be the first to start a conversation in this course!
                  </p>
                </div>
              )}
          </>
        )}
      </div>
    </GlassCard>
  );
}

function ForumSummarySkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-5 h-5" />
              <div className="space-y-1">
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 bg-white/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Skeleton className="w-6 h-6 rounded" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
