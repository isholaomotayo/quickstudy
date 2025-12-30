"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/AppContext";
import { toast } from "sonner";
import { ForumPost } from "./forum-post";
import { CreatePostDialog } from "./create-post-dialog";
import { PostDetailModal } from "./post-detail-modal";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquarePlus,
  Search,
  BookOpen,
  Clock,
  MessageCircle,
  TrendingUp,
  Filter,
  RefreshCw,
} from "lucide-react";
import {
  ForumPost as ForumPostType,
  ForumScope,
} from "@/lib/hooks/useForumData";
import { CreatePostData } from "../types/forum";

interface EmbeddedForumProps {
  courseId: number;
  courseName: string;
  courseCode?: string;
  defaultTab?: "forum" | "discussions";
  maxPosts?: number;
  showCreateButton?: boolean;
  compact?: boolean;
}

export function EmbeddedForum({
  courseId,
  courseName,
  courseCode,
  defaultTab = "forum",
  maxPosts = 5,
  showCreateButton = true,
  compact = false,
}: EmbeddedForumProps) {
  const { userData } = useUser();
  const [activeTab, setActiveTab] = useState<"forum" | "discussions">(
    defaultTab
  );
  const [forumPosts, setForumPosts] = useState<ForumPostType[]>([]);
  const [discussions, setDiscussions] = useState<ForumPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPostType | null>(null);

  useEffect(() => {
    loadPosts();
  }, [courseId, activeTab]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const endpoint =
        activeTab === "forum"
          ? `/api/courseForumTopic/${courseId}`
          : `/api/discussionTopic/${courseId}`;

      const response = await fetch(endpoint, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Transform legacy data to new format
        const transformedPosts = data
          .map((item: Record<string, any>) => ({
            id: item.id,
            title: item.title || item.name,
            content: item.body || item.description || "",
            created_at: item.created_at,
            updated_at: item.updated_at,
            author: item.user || {
              id: item.userId || item.user_id,
              first_name: "Unknown",
              last_name: "User",
              role: "student",
            },
            category: item.category?.name || "General",
            course_id: courseId,
            start_date: item.start_date,
            end_date: item.end_date,
            comments_count: item.comments?.length || 0,
            likes_count: item.likes_count || 0,
            is_liked: false,
            is_pinned: item.is_pinned || false,
            tags: item.tags || [],
          }))
          .slice(0, maxPosts);

        if (activeTab === "forum") {
          setForumPosts(transformedPosts);
        } else {
          setDiscussions(transformedPosts);
        }
      }
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData: CreatePostData) => {
    try {
      // Validate user data first
      if (!userData?.id) {
        toast.error("User not authenticated. Please refresh and try again.");
        return;
      }

      const endpoint =
        activeTab === "forum"
          ? `/api/courseForumTopic`
          : `/api/discussionTopic`;

      // Transform data to match legacy API expectations
      const data =
        activeTab === "forum"
          ? {
              title: postData.title,
              description: postData.content,
              user_id: userData?.id,
              course_id: courseId,
              category: postData.category,
              is_pinned: postData.is_pinned || false,
              tags: postData.tags || [],
            }
          : {
              title: postData.title,
              description: postData.content,
              user_id: userData?.id,
              course_id: courseId,
              start_date: postData.start_date,
              end_date: postData.end_date,
              category: postData.category,
              is_pinned: postData.is_pinned || false,
              tags: postData.tags || [],
            };

      // Creating forum post

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        toast.success(
          `${
            activeTab === "forum" ? "Post" : "Discussion"
          } created successfully!`
        );
        loadPosts();
        setShowCreatePost(false);
      } else {
        // Handle API error response
        const errorData = await response.json().catch(() => ({}));
        console.error("API Error Response:", errorData);
        toast.error(
          errorData.message ||
            `Failed to create ${
              activeTab === "forum" ? "post" : "discussion"
            }. Please try again.`
        );
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      toast.error("Network error. Please check your connection and try again.");
    }
  };

  const currentScope: ForumScope = {
    type: activeTab === "forum" ? "course" : "timed_discussion",
    course_id: courseId,
    course_name: courseName,
  };

  // Calculate course-specific stats
  const courseStats = {
    forumPosts: forumPosts.length,
    discussions: discussions.length,
    activeDiscussions: discussions.filter((d) => {
      if (!d.start_date || !d.end_date) return false;
      const now = new Date();
      const start = new Date(d.start_date);
      const end = new Date(d.end_date);
      return start <= now && now <= end;
    }).length,
    totalParticipants: 0, // Will be updated from API
  };

  const currentPosts = activeTab === "forum" ? forumPosts : discussions;
  const filteredPosts = currentPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canCreateTimedDiscussion = userData?.role !== "STUDENT";

  if (compact) {
    return (
      <GlassCard className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">Course Discussion</h3>
              <Badge variant="secondary" className="text-xs">
                {forumPosts.length + discussions.length}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = "/connect")}
            >
              View All
            </Button>
          </div>

          {/* Recent Posts */}
          {loading ? (
            <CompactSkeleton />
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-3">
              {filteredPosts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className="p-3 bg-white/50 rounded-lg border border-white/30 hover:bg-white/70 cursor-pointer transition-colors"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {post.author.first_name.charAt(0)}
                      {post.author.last_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <span>
                          {post.author.first_name} {post.author.last_name}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{post.comments_count} comments</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No discussions yet for this course</p>
            </div>
          )}

          {/* Post Detail Modal */}
          {selectedPost && (
            <PostDetailModal
              post={selectedPost}
              open={!!selectedPost}
              onOpenChange={(open) => !open && setSelectedPost(null)}
              scope={currentScope}
            />
          )}
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            {courseName} Discussion
          </h2>
          <p className="text-sm text-gray-600">{courseCode}</p>
        </div>
        <Button
          onClick={() => (window.location.href = "/connect")}
          variant="outline"
        >
          Open Full Forum
        </Button>
      </div>

      {/* Navigation Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "forum" | "discussions")
        }
      >
        <div className="flex items-center justify-between">
          <TabsList className="bg-white/50">
            <TabsTrigger
              value="forum"
              className="flex items-center gap-2 data-[state=active]:bg-purple-500 data-[state=active]:text-white"
            >
              <BookOpen className="w-4 h-4" />
              Course Forum ({forumPosts.length})
            </TabsTrigger>
            <TabsTrigger
              value="discussions"
              className="flex items-center gap-2 data-[state=active]:bg-green-500 data-[state=active]:text-white"
            >
              <Clock className="w-4 h-4" />
              Timed Discussions ({discussions.length})
            </TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-white/70 border-white/20"
            />
          </div>
        </div>

        <TabsContent value="forum" className="space-y-4">
          {/* Create Post Button */}
          {showCreateButton && (
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-700">Course Forum Posts</h3>
              <Button
                onClick={() => setShowCreatePost(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <MessageSquarePlus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </div>
          )}

          {/* Forum Posts */}
          {loading ? (
            <ForumSkeleton />
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <ForumPost
                  key={post.id}
                  post={post}
                  onClick={() => setSelectedPost(post)}
                />
              ))}
            </div>
          ) : (
            <EmptyState type="forum" />
          )}
        </TabsContent>

        <TabsContent value="discussions" className="space-y-4">
          {/* Create Discussion Button */}
          {showCreateButton && (
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-700">Timed Discussions</h3>
              {canCreateTimedDiscussion ? (
                <Button
                  onClick={() => setShowCreatePost(true)}
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                >
                  <MessageSquarePlus className="w-4 h-4 mr-2" />
                  New Discussion
                </Button>
              ) : (
                <div className="text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                  Only faculty can create timed discussions
                </div>
              )}
            </div>
          )}

          {/* Discussions */}
          {loading ? (
            <ForumSkeleton />
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <ForumPost
                  key={post.id}
                  post={post}
                  onClick={() => setSelectedPost(post)}
                />
              ))}
            </div>
          ) : (
            <EmptyState type="discussions" />
          )}
        </TabsContent>
      </Tabs>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        onSubmit={handleCreatePost}
        scope={currentScope}
      />

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          open={!!selectedPost}
          onOpenChange={(open) => !open && setSelectedPost(null)}
          scope={currentScope}
        />
      )}
    </div>
  );
}

function CompactSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-3 bg-white/50 rounded-lg">
          <div className="flex items-start gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ForumSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <GlassCard key={i} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function EmptyState({ type }: { type: "forum" | "discussions" }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
        {type === "forum" ? (
          <BookOpen className="w-8 h-8 text-blue-600" />
        ) : (
          <Clock className="w-8 h-8 text-green-600" />
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No {type === "forum" ? "forum posts" : "discussions"} yet
      </h3>
      <p className="text-gray-600 mb-4">
        {type === "forum"
          ? "Be the first to start a discussion in this course forum!"
          : "No timed discussions have been created for this course yet."}
      </p>
    </div>
  );
}
