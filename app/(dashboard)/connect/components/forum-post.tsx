"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Heart,
  MessageCircle,
  Share2,
  Pin,
  Clock,
  Calendar,
  Eye,
  MoreVertical,
  Flag,
  Bookmark,
  Edit,
  Trash2,
} from "lucide-react";
import { ForumPost as ForumPostType } from "@/lib/hooks/useForumData";
import { formatDistanceToNow, formatDate, isAfter, isBefore } from "date-fns";
import { useUser } from "@/contexts/AppContext";
import { toast } from "sonner";
import { ConfirmationDialog } from "./confirmation-dialog";

interface ForumPostProps {
  post: ForumPostType;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isPinned?: boolean;
}

export function ForumPost({
  post,
  onClick,
  onEdit,
  onDelete,
  isPinned,
}: ForumPostProps) {
  const { userData } = useUser();
  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Optimistic update
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      const response = await fetch(`/api/forum/posts/${post.id}/like`, {
        method: liked ? "DELETE" : "POST",
        credentials: "include",
      });

      if (!response.ok) {
        // Revert on error
        setLiked(liked);
        setLikesCount(post.likes_count);
        toast.error("Failed to like post", {
          description: "Please try again later.",
        });
      } else {
        toast.success(liked ? "Post unliked" : "Post liked", {
          description: liked
            ? "You've removed your like from this post."
            : "You've liked this post!",
        });
      }
    } catch (error) {
      // Revert on error
      setLiked(liked);
      setLikesCount(post.likes_count);
      toast.error("Network error. Please try again.", {
        description: "Unable to like post due to connection issues.",
      });
    }
  };

  const handleEdit = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit();
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      let endpoint = "";
      if (post.course_id) {
        endpoint = `/api/courseForumTopic/${post.id}`;
      } else {
        endpoint = `/api/forumTopic/${post.id}`;
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        toast.success("Post deleted successfully!", {
          description: "The post has been permanently removed from the forum.",
        });
        // Trigger refresh in parent component using SWR mutate
        if (onDelete) {
          onDelete();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error("Failed to delete post", {
          description: errorData.message || "Please try again later.",
        });
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Network error. Please try again.");
    }
  };

  const canEdit = Number(userData?.id) === Number(post.author.id);
  const canDelete =
    Number(userData?.id) === Number(post.author.id) ||
    userData?.role === "ADMIN" ||
    userData?.role === "SUPERADMIN";

  // Debug logging removed for production

  const getDiscussionStatus = () => {
    if (!post.start_date || !post.end_date) return null;

    const now = new Date();
    const startDate = new Date(post.start_date);
    const endDate = new Date(post.end_date);

    if (isBefore(now, startDate)) {
      return { status: "upcoming", color: "blue", text: "Upcoming" };
    } else if (isAfter(now, endDate)) {
      return { status: "completed", color: "gray", text: "Completed" };
    } else {
      return { status: "active", color: "green", text: "Active" };
    }
  };

  const discussionStatus = getDiscussionStatus();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "superadmin":
      case "admin":
        return "bg-red-100 text-red-800";
      case "staff":
      case "faculty":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <GlassCard
        className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.01] ${
          isPinned ? "border-yellow-200 bg-yellow-50/50" : ""
        }`}
        onClick={onClick}
      >
        <div className="space-y-4">
          {/* Post Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <Avatar className="w-12 h-12">
                <AvatarImage src={post.author.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                  {getInitials(post.author.first_name, post.author.last_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900">
                    {post.author.first_name} {post.author.last_name}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-xs px-2 py-1 ${getRoleColor(
                      post.author.role
                    )}`}
                  >
                    {post.author.role.charAt(0).toUpperCase() +
                      post.author.role.slice(1)}
                  </Badge>
                  {isPinned && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Pin className="w-3 h-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                  {discussionStatus && (
                    <Badge
                      className={`
                      ${
                        discussionStatus.color === "green"
                          ? "bg-green-100 text-green-800"
                          : ""
                      }
                      ${
                        discussionStatus.color === "blue"
                          ? "bg-blue-100 text-blue-800"
                          : ""
                      }
                      ${
                        discussionStatus.color === "gray"
                          ? "bg-gray-100 text-gray-800"
                          : ""
                      }
                    `}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {discussionStatus.text}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <Calendar className="w-3 h-3" />
                  <time dateTime={post.created_at}>
                    {formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                    })}
                  </time>
                  {post.category && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600">#{post.category}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          {/* Post Content */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {post.title}
            </h3>
            <p className="text-gray-700 line-clamp-3">{post.content}</p>
          </div>

          {/* Time-bound Discussion Info */}
          {post.start_date && post.end_date && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Start:{" "}
                    {formatDate(
                      new Date(post.start_date),
                      "MMM dd, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    End:{" "}
                    {formatDate(
                      new Date(post.end_date),
                      "MMM dd, yyyy 'at' h:mm a"
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-white/50"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/30">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center gap-2 ${
                  liked ? "text-red-600" : "text-gray-600 hover:text-red-600"
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                <span>{likesCount}</span>
              </Button>

              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments_count}</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEdit}
                  className="text-gray-600 hover:text-blue-600 p-1 h-6 w-6"
                  title="Edit post"
                >
                  <Edit className="w-3 h-3" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-gray-600 hover:text-red-600 p-1 h-6 w-6"
                  title="Delete post"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-blue-600 p-1 h-6 w-6"
              >
                <Bookmark className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-blue-600 p-1 h-6 w-6"
              >
                <Share2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-orange-600 p-1 h-6 w-6"
              >
                <Flag className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Post"
        description="Are you sure you want to delete this post? This action cannot be undone."
        action="delete"
        onConfirm={confirmDelete}
        confirmText="Delete Post"
        cancelText="Cancel"
      />
    </>
  );
}
