"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2, Edit3 } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  action: "delete" | "edit" | "custom";
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  icon?: React.ReactNode;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  action,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  icon,
}: ConfirmationDialogProps) {
  const getDefaultIcon = () => {
    switch (action) {
      case "delete":
        return <Trash2 className="w-5 h-5 text-red-500" />;
      case "edit":
        return <Edit3 className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    }
  };

  const getDefaultConfirmText = () => {
    switch (action) {
      case "delete":
        return "Delete";
      case "edit":
        return "Save Changes";
      default:
        return "Confirm";
    }
  };

  const getDefaultCancelText = () => {
    return "Cancel";
  };

  const getConfirmButtonVariant = () => {
    switch (action) {
      case "delete":
        return "destructive";
      case "edit":
        return "default";
      default:
        return "default";
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon || getDefaultIcon()}
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="bg-white/70 border-white/20 hover:bg-white/90"
          >
            {cancelText || getDefaultCancelText()}
          </Button>
          <Button
            variant={getConfirmButtonVariant()}
            onClick={handleConfirm}
            className={
              action === "delete"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            }
          >
            {confirmText || getDefaultConfirmText()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
