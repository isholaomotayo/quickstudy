"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/AppContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import {
  MessageCircle,
  Heart,
  Share2,
  Flag,
  Edit,
  Trash2,
  Reply,
  MoreVertical,
  Pin,
  Clock,
  Calendar,
} from "lucide-react";
import {
  ForumPost as ForumPostType,
  ForumScope,
} from "@/lib/hooks/useForumData";
import { usePostComments } from "@/lib/hooks/useForumData";
import { formatDistanceToNow, formatDate, isAfter, isBefore } from "date-fns";
import { toast } from "sonner";
import { ConfirmationDialog } from "./confirmation-dialog";

interface Comment {
  id: number;
  body: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    role: string;
    avatar?: string;
  };
}

interface PostDetailModalProps {
  post: ForumPostType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scope: ForumScope;
}

export function PostDetailModal({
  post,
  open,
  onOpenChange,
  scope,
}: PostDetailModalProps) {
  const { userData } = useUser();
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editCommentText, setEditCommentText] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<Comment | null>(null);

  // Use SWR to fetch comments
  const {
    comments,
    isLoading: loading,
    mutate: refreshComments,
  } = usePostComments(open ? post.id : 0, scope);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      let endpoint = "";
      if (post.course_id) {
        endpoint = `/api/courseForumThread`;
      } else {
        endpoint = `/api/forumThread`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: newComment.trim(),
          user_id: userData?.id,
          course_forum_topic_id: post.course_id ? post.id : undefined,
          school_forum_topic_id: !post.course_id ? post.id : undefined,
        }),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        refreshComments(); // Refresh comments using SWR mutate
        setNewComment("");
        toast.success("Comment added successfully!", {
          description:
            "Your comment has been posted and is now visible to everyone.",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error("Failed to add comment", {
          description: errorData.message || "Please try again later.",
        });
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Network error. Please try again.", {
        description:
          "Unable to connect to the server. Please check your internet connection.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (comment: Comment) => {
    if (!editCommentText.trim()) return;

    try {
      let endpoint = "";
      if (post.course_id) {
        endpoint = `/api/courseForumThread/${comment.id}`;
      } else {
        endpoint = `/api/forumThread/${comment.id}`;
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: editCommentText.trim(),
        }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        refreshComments(); // Refresh comments using SWR mutate
        setEditingComment(null);
        setEditCommentText("");
        toast.success("Comment updated successfully!", {
          description:
            "Your comment has been updated and is now visible to everyone.",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error("Failed to update comment", {
          description: errorData.message || "Please try again later.",
        });
      }
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast.error("Network error. Please try again.", {
        description:
          "Unable to connect to the server. Please check your internet connection.",
      });
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    setCommentToDelete(comment);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      let endpoint = "";
      if (post.course_id) {
        endpoint = `/api/courseForumThread/${commentToDelete.id}`;
      } else {
        endpoint = `/api/forumThread/${commentToDelete.id}`;
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        refreshComments(); // Refresh comments using SWR mutate
        toast.success("Comment deleted successfully!", {
          description: "Your comment has been permanently removed.",
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error("Failed to delete comment", {
          description: errorData.message || "Please try again later.",
        });
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Network error. Please try again.", {
        description:
          "Unable to connect to the server. Please check your internet connection.",
      });
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            {post.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Post Content */}
          <GlassCard className="p-6">
            <div className="space-y-4">
              {/* Post Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {getInitials(
                        post.author.first_name,
                        post.author.last_name
                      )}
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
                      {post.is_pinned && (
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
                          <span className="text-blue-600">
                            #{post.category}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Post Content */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  {post.title}
                </h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
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

              {/* Post Stats */}
              <div className="flex items-center gap-4 pt-2 border-t border-white/30">
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span>{comments.length} comments</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes_count} likes</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Comments Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Comments ({comments.length})
            </h3>

            {/* Add Comment */}
            <GlassCard className="p-4">
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] bg-white/70 border-white/20 focus:bg-white/90"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={submitting || !newComment.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {submitting ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>
            </GlassCard>

            {/* Comments List */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <GlassCard key={i} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-full" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : Array.isArray(comments) && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <GlassCard key={comment.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.user.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                              {getInitials(
                                comment.user.first_name,
                                comment.user.last_name
                              )}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900 text-sm">
                                {comment.user.first_name}{" "}
                                {comment.user.last_name}
                              </span>
                              <Badge
                                variant="secondary"
                                className={`text-xs px-1 py-0.5 ${getRoleColor(
                                  comment.user.role
                                )}`}
                              >
                                {comment.user.role.charAt(0).toUpperCase() +
                                  comment.user.role.slice(1)}
                              </Badge>
                            </div>

                            <div className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(
                                new Date(comment.created_at),
                                { addSuffix: true }
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Comment Actions */}
                        <div className="flex items-center gap-1">
                          {/* Edit button - only for comment author */}
                          {Number(userData?.id) === Number(comment.user.id) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingComment(comment);
                                setEditCommentText(comment.body);
                              }}
                              className="text-gray-600 hover:text-blue-600 p-1 h-6 w-6"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}
                          {/* Delete button - for comment author or admins */}
                          {(userData?.id === comment.user.id ||
                            userData?.role === "ADMIN" ||
                            userData?.role === "SUPERADMIN") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteComment(comment)}
                              className="text-gray-600 hover:text-red-600 p-1 h-6 w-6"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Comment Content */}
                      {editingComment?.id === comment.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editCommentText}
                            onChange={(e) => setEditCommentText(e.target.value)}
                            className="min-h-[60px] bg-white/70 border-white/20 focus:bg-white/90"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEditComment(comment)}
                              disabled={!editCommentText.trim()}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingComment(null);
                                setEditCommentText("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="prose prose-sm max-w-none">
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {comment.body}
                          </p>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="p-8 text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-600">
                  No comments yet. Be the first to comment!
                </p>
              </GlassCard>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        action="delete"
        onConfirm={confirmDeleteComment}
        confirmText="Delete Comment"
        cancelText="Cancel"
      />
    </Dialog>
  );
}
