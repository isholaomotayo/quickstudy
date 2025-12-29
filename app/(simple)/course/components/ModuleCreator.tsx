"use client";

import React, { useState, useEffect } from "react";
import { Plus, Save, X, BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";

// Dynamically import the MinimalEditor for a cleaner module description editor
const MinimalEditor = dynamic(
  () =>
    import("../../../../components/ui/tinyEditor/editor").then((mod) => ({
      default: mod.MinimalEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 bg-muted/40 animate-pulse rounded-lg flex items-center justify-center">
        Loading editor...
      </div>
    ),
  }
);

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ModuleData {
  id?: number;
  course_id: number;
  name: string;
  description?: string;
  order: number;
  published: boolean;
}

interface ModuleCreatorProps {
  courseId: number;
  existingModules?: ModuleData[];
  initialData?: Partial<ModuleData>;
  open: boolean;
  onClose: () => void;
  onSave: (moduleData: ModuleData) => Promise<void>;
  isEditing?: boolean;
}

export function ModuleCreator({
  courseId,
  existingModules = [],
  initialData,
  open,
  onClose,
  onSave,
  isEditing = false,
}: ModuleCreatorProps) {
  const [moduleData, setModuleData] = useState<ModuleData>({
    course_id: courseId,
    name: initialData?.name || "",
    description: initialData?.description || "",
    order: initialData?.order || existingModules.length + 1,
    published: initialData?.published || false,
    ...initialData,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editorContent, setEditorContent] = useState(
    initialData?.description || ""
  );

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      const newModuleData = {
        course_id: courseId,
        name: initialData?.name || "",
        description: initialData?.description || "",
        order: initialData?.order || existingModules.length + 1,
        published: initialData?.published || false,
        ...initialData,
      };
      setModuleData(newModuleData);
      setEditorContent(newModuleData.description || "");
      setErrors({});
    }
  }, [open, courseId, existingModules.length, initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!moduleData.name.trim()) {
      newErrors.name = "Module name is required";
    } else if (moduleData.name.length < 3) {
      newErrors.name = "Module name must be at least 3 characters";
    }

    if (!editorContent?.trim()) {
      newErrors.description = "Module description is required";
    } else if (editorContent.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (moduleData.order < 1) {
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
      // Include the editor content in the module data
      const moduleDataWithContent = {
        ...moduleData,
        description: editorContent,
      };
      await onSave(moduleDataWithContent);
      toast.success(
        `Module ${isEditing ? "updated" : "created"} successfully!`
      );
      onClose();
    } catch (error) {
      console.error("Error saving module:", error);
      toast.error(`Failed to ${isEditing ? "update" : "create"} module`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setModuleData({
        course_id: courseId,
        name: "",
        description: "",
        order: existingModules.length + 1,
        published: false,
      });
      setEditorContent("");
      setErrors({});
      onClose();
    }
  };

  const updateField = (field: keyof ModuleData, value: any) => {
    setModuleData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose} modal={false}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-hidden"
        preventOutsideClick={true}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {isEditing ? "Edit Module" : "Create New Module"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Module Name */}
          <div className="space-y-2">
            <Label htmlFor="module-name">
              Module Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="module-name"
              value={moduleData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Enter module name..."
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Module Description */}
          <div className="space-y-2">
            <Label>
              Description <span className="text-destructive">*</span>
            </Label>
            <div
              className={`border rounded-lg ${
                errors.description ? "border-destructive" : "border-border"
              }`}
            >
              <MinimalEditor
                height={200}
                content={editorContent}
                onChange={(content) => {
                  setEditorContent(content);
                  if (errors.description) {
                    setErrors((prev) => ({ ...prev, description: "" }));
                  }
                }}
              />
            </div>
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Order */}
          <div className="space-y-2">
            <Label htmlFor="module-order">Module Order</Label>
            <Input
              id="module-order"
              type="number"
              min="1"
              value={moduleData.order}
              onChange={(e) => updateField("order", parseInt(e.target.value))}
              className={errors.order ? "border-destructive" : ""}
            />
            {errors.order && (
              <p className="text-sm text-destructive">{errors.order}</p>
            )}
          </div>

          {/* Published Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="module-published">Publish Module</Label>
              <p className="text-sm text-muted-foreground">
                Make this module visible to students
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="module-published"
                checked={moduleData.published}
                onCheckedChange={(checked) => updateField("published", checked)}
              />
              <Badge
                variant={moduleData.published ? "default" : "secondary"}
                className={
                  moduleData.published
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-muted/40 text-muted-foreground border border-border"
                }
              >
                {moduleData.published ? "Published" : "Draft"}
              </Badge>
            </div>
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
            disabled={loading}
            className="bg-primary hover:brightness-110 text-primary-foreground"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading
              ? `${isEditing ? "Updating" : "Creating"}...`
              : `${isEditing ? "Update" : "Create"} Module`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
