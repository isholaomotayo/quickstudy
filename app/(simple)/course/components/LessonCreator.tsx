"use client";

import React, { useState } from "react";
import { Save, X, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useCallback } from "react";

// Dynamically import the RichTextEditor to prevent SSR issues
const RichTextEditor = dynamic(
  () =>
    import("@/components/ui/tinyEditor/editor").then((mod) => ({
      default: mod.RichTextEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        Loading editor...
      </div>
    ),
  }
);

interface LessonData {
  id?: number;
  course_module_id: number;
  name: string;
  description?: string;
  content: string;
  order: number;
}

interface LessonCreatorProps {
  moduleId: number;
  existingLessons?: LessonData[];
  initialData?: Partial<LessonData>;
  open: boolean;
  onClose: () => void;
  onSave: (lessonData: LessonData) => Promise<void>;
  onRefetch?: () => void;
  isEditing?: boolean;
}

export function LessonCreator({
  moduleId,
  existingLessons = [],
  initialData,
  open,
  onClose,
  onSave,
  onRefetch,
  isEditing = false,
}: LessonCreatorProps) {
  const [lessonData, setLessonData] = useState<LessonData>({
    course_module_id: moduleId,
    name: initialData?.name || "",
    description: initialData?.description || "",
    content: initialData?.content || "",
    order: initialData?.order || existingLessons.length + 1,
    ...initialData,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  // State for TinyMCE editor
  const [editorContent, setEditorContent] = useState(
    initialData?.content || ""
  );

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      const newLessonData = {
        course_module_id: moduleId,
        name: initialData?.name || "",
        description: initialData?.description || "",
        content: initialData?.content || "",
        order: initialData?.order || existingLessons.length + 1,
        ...initialData,
      };
      setLessonData(newLessonData);
      setEditorContent(newLessonData.content);
      setErrors({});
    }
  }, [open, moduleId, existingLessons.length, initialData]);

  // Stable callback handlers to prevent editor re-renders
  const handleContentChange = useCallback(
    (content: string) => {
      setEditorContent(content);
      if (errors.content) {
        setErrors((prev) => ({ ...prev, content: "" }));
      }
    },
    [errors.content]
  );

  const handleImageUpload = useCallback(
    async (
      files: File[],
      insertImage: (
        url: string,
        callback: (images: HTMLImageElement[]) => void
      ) => void
    ) => {
      setUploading(true);
      try {
        // Import the uploader dynamically to avoid SSR issues
        const { uploadToCloudinary } = await import("@/lib/cloudinary-upload");

        toast.success(`Uploading ${files.length} file(s)...`);

        for (const file of files) {
          try {
            const url = await uploadToCloudinary(file);
            // Insert the uploaded image
            insertImage(url, (images) => {
              console.log("Image inserted:", images);
            });
            toast.success(`Successfully uploaded ${file.name}`);
          } catch (error) {
            console.error("Upload failed for file:", file.name, error);
            toast.error(`Failed to upload ${file.name}`);
          }
        }
      } catch (error) {
        console.error("Upload system error:", error);
        toast.error("Upload system unavailable");
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!lessonData.name.trim()) {
      newErrors.name = "Lesson name is required";
    } else if (lessonData.name.length < 3) {
      newErrors.name = "Lesson name must be at least 3 characters";
    }

    if (!lessonData.description?.trim()) {
      newErrors.description = "Lesson description is required";
    } else if (lessonData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!editorContent.trim()) {
      newErrors.content = "Lesson content is required";
    } else if (editorContent.length < 20) {
      newErrors.content = "Content must be at least 20 characters";
    }

    if (lessonData.order < 1) {
      newErrors.order = "Order must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setLoading(true);
    try {
      // Include the editor content in the lesson data
      const lessonDataWithContent = {
        ...lessonData,
        content: editorContent,
      };
      await onSave(lessonDataWithContent);
      toast.success(
        `Lesson ${isEditing ? "updated" : "created"} successfully!`
      );
      onClose();
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast.error(`Failed to ${isEditing ? "update" : "create"} lesson`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setLessonData({
        course_module_id: moduleId,
        name: "",
        description: "",
        content: "",
        order: existingLessons.length + 1,
      });
      setEditorContent("");
      setErrors({});
      onClose();
    }
  };

  const updateField = (field: keyof LessonData, value: any) => {
    setLessonData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose} modal={false}>
      <DialogContent
        size="xl"
        className="max-w-6xl max-h-[95vh] overflow-hidden"
        preventOutsideClick={true}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            {isEditing ? "Edit Lesson" : "Create New Lesson"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Lesson Name */}
          <div className="space-y-2">
            <Label htmlFor="lesson-name">
              Lesson Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lesson-name"
              value={lessonData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Enter lesson name..."
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Lesson Description */}
          <div className="space-y-2">
            <Label htmlFor="lesson-description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="lesson-description"
              value={lessonData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Enter lesson description..."
              rows={3}
              className={errors.description ? "border-red-500" : ""}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Order */}
          <div className="space-y-2">
            <Label htmlFor="lesson-order">Lesson Order</Label>
            <Input
              id="lesson-order"
              type="number"
              min="1"
              value={lessonData.order}
              onChange={(e) => updateField("order", parseInt(e.target.value))}
              className={`w-32 ${errors.order ? "border-red-500" : ""}`}
            />
            {errors.order && (
              <p className="text-sm text-red-500">{errors.order}</p>
            )}
          </div>

          {/* Lesson Content */}
          <div className="space-y-2">
            <Label>
              Lesson Content <span className="text-red-500">*</span>
            </Label>
            <div
              className={`border rounded-lg ${
                errors.content ? "border-red-500" : "border-gray-300"
              }`}
            >
              <RichTextEditor
                key={`lesson-editor-${moduleId}-${
                  isEditing ? initialData?.id : "new"
                }`}
                content={editorContent}
                onChange={handleContentChange}
                onImageUpload={handleImageUpload}
              />
            </div>
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading || uploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading
              ? `${isEditing ? "Updating" : "Creating"}...`
              : uploading
              ? "Uploading files..."
              : `${isEditing ? "Update" : "Create"} Lesson`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
