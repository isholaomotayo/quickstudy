"use client";

import React, { useState } from "react";
import { useUser } from "@/contexts/AppContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Calendar as CalendarIcon,
  Clock,
  Pin,
  Hash,
  X,
} from "lucide-react";
import { ForumScope } from "@/lib/hooks/useForumData";
import { CreatePostData, ForumPost } from "../types/forum";
import { format } from "date-fns";
import { cn } from "@/lib/utils.js";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePostData) => Promise<void>;
  scope: ForumScope;
  editingPost?: ForumPost; // Post being edited
}

export function CreatePostDialog({
  open,
  onOpenChange,
  onSubmit,
  scope,
  editingPost,
}: CreatePostDialogProps) {
  const { userData } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    is_pinned: false,
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");

  // Initialize form data when editing
  React.useEffect(() => {
    if (editingPost) {
      setFormData({
        title: editingPost.title || "",
        content: editingPost.content || "",
        category: editingPost.category || "",
        is_pinned: editingPost.is_pinned || false,
        start_date: editingPost.start_date
          ? new Date(editingPost.start_date)
          : undefined,
        end_date: editingPost.end_date
          ? new Date(editingPost.end_date)
          : undefined,
        tags: editingPost.tags || [],
      });
    } else {
      // Reset form when creating new post
      setFormData({
        title: "",
        content: "",
        category: "",
        is_pinned: false,
        start_date: undefined,
        end_date: undefined,
        tags: [],
      });
    }
  }, [editingPost]);

  const isTimedDiscussion = scope.type === "timed_discussion";
  const requiresDates = isTimedDiscussion;

  const categories = {
    institution: [
      { value: "announcements", label: "Announcements" },
      { value: "general", label: "General Discussion" },
      { value: "academic", label: "Academic" },
      { value: "events", label: "Events" },
      { value: "help", label: "Help & Support" },
    ],
    course: [
      { value: "assignments", label: "Assignments" },
      { value: "resources", label: "Resources" },
      { value: "questions", label: "Questions" },
      { value: "announcements", label: "Course Announcements" },
    ],
    timed_discussion: [
      { value: "assignment", label: "Assignment Discussion" },
      { value: "debate", label: "Debate Topic" },
      { value: "project", label: "Project Collaboration" },
      { value: "review", label: "Review Session" },
    ],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit({
        ...formData,
        start_date: formData.start_date?.toISOString(),
        end_date: formData.end_date?.toISOString(),
      });

      // Reset form
      setFormData({
        title: "",
        content: "",
        category: "",
        is_pinned: false,
        start_date: undefined,
        end_date: undefined,
        tags: [],
      });
      setNewTag("");
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Check if user can create timed discussions (only non-students)
  const canCreateTimedDiscussion = userData?.role !== "STUDENT";

  // If this is a timed discussion and user is a student, don't render the dialog
  if (isTimedDiscussion && !canCreateTimedDiscussion) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {editingPost
              ? `Edit ${isTimedDiscussion ? "Discussion" : "Post"}`
              : `Create New ${isTimedDiscussion ? "Discussion" : "Post"}`}
          </DialogTitle>
          <DialogDescription>
            {editingPost
              ? "Update your post content and settings."
              : scope.type === "institution" &&
                "Share something with the entire university community"}
            {!editingPost &&
              scope.type === "course" &&
              `Start a discussion in ${scope.course_name}`}
            {!editingPost &&
              scope.type === "timed_discussion" &&
              `Create a time-bounded discussion for ${scope.course_name}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder={
                isTimedDiscussion
                  ? "Discussion topic..."
                  : "What's on your mind?"
              }
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
              className="bg-white/70 border-2 border-gray-200 focus:border-blue-500 focus:bg-white/90 transition-colors duration-200"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder={
                isTimedDiscussion
                  ? "Describe the discussion topic and any instructions..."
                  : "Share your thoughts, ask a question, or start a discussion..."
              }
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              required
              className="min-h-[120px] bg-white/70 border-2 border-gray-200 focus:border-blue-500 focus:bg-white/90 transition-colors duration-200"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, category: value }))
              }
              required
            >
              <SelectTrigger className="bg-white/70 border-2 border-gray-200 focus:border-blue-500 transition-colors duration-200">
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                {categories[scope.type].map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range for Timed Discussions */}
          {isTimedDiscussion && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date & Time *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/70 border-white/20",
                        !formData.start_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.start_date
                        ? format(formData.start_date, "PPP p")
                        : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.start_date}
                      onSelect={(date) =>
                        setFormData((prev) => ({ ...prev, start_date: date }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date & Time *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white/70 border-white/20",
                        !formData.end_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.end_date
                        ? format(formData.end_date, "PPP p")
                        : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.end_date}
                      onSelect={(date) =>
                        setFormData((prev) => ({ ...prev, end_date: date }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (optional)</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                  className="flex-1 bg-white/70 border-white/20"
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Hash className="w-4 h-4" />
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pin Post (for admins/staff only) */}
          {(userData?.role === "SUPERADMIN" ||
            userData?.role === "ADMIN" ||
            userData?.role === "STAFF" ||
            userData?.role === "FACULTY") && (
            <div className="flex items-center space-x-2">
              <Switch
                id="pin-post"
                checked={formData.is_pinned}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_pinned: checked }))
                }
              />
              <Label htmlFor="pin-post" className="flex items-center gap-2">
                <Pin className="w-4 h-4" />
                Pin this post
              </Label>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/30">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white/70 border-white/30"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !formData.title.trim() ||
                !formData.content.trim() ||
                !formData.category ||
                (requiresDates && (!formData.start_date || !formData.end_date))
              }
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {loading
                ? editingPost
                  ? "Updating..."
                  : "Creating..."
                : editingPost
                ? `Update ${isTimedDiscussion ? "Discussion" : "Post"}`
                : `Create ${isTimedDiscussion ? "Discussion" : "Post"}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
