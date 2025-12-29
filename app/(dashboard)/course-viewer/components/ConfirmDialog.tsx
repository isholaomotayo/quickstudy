"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        <div className="flex items-center justify-end space-x-2">
          <Button variant="outline" onClick={handleCancel} className="gap-2">
            <X className="h-4 w-4" />
            {cancelText}
          </Button>
          <Button variant={variant} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
