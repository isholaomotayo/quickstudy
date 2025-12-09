"use client";

import type React from "react";
import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Camera, X, User, CheckCircle, AlertCircle } from "lucide-react";
import { GlassButton } from "./glass-button";
import { AnimatedProgress } from "./animated-progress";

interface AvatarFile extends File {
  preview?: string;
  id: string;
  progress?: number;
  status?: "uploading" | "success" | "error" | "idle";
  error?: string;
}

interface GlassAvatarUploadProps {
  onAvatarChange?: (file: AvatarFile | null) => void;
  maxSize?: number; // in bytes
  currentAvatar?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-40 h-40",
};

export function GlassAvatarUpload({
  onAvatarChange,
  maxSize = 5 * 1024 * 1024, // 5MB
  currentAvatar,
  className,
  size = "lg",
}: GlassAvatarUploadProps) {
  const [avatar, setAvatar] = useState<AvatarFile | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const validateFile = (file: File): string | undefined => {
    if (!file.type.startsWith("image/")) {
      return "Please select an image file";
    }

    if (file.size > maxSize) {
      return `Image size must be less than ${Math.round(
        maxSize / 1024 / 1024
      )}MB`;
    }

    return undefined;
  };

  const processFile = useCallback(
    (file: File) => {
      const error = validateFile(file);
      const avatarFile: AvatarFile = {
        ...file,
        id: generateId(),
        status: error ? "error" : "idle",
        error,
        progress: 0,
        preview: URL.createObjectURL(file),
      };

      setAvatar(avatarFile);
      onAvatarChange?.(avatarFile);

      // Simulate upload progress for demo
      if (!error) {
        simulateUpload(avatarFile.id);
      }
    },
    [onAvatarChange]
  );

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setAvatar((prev) =>
          prev?.id === fileId
            ? { ...prev, progress: 100, status: "success" as const }
            : prev
        );
      } else {
        setAvatar((prev) =>
          prev?.id === fileId
            ? { ...prev, progress, status: "uploading" as const }
            : prev
        );
      }
    }, 200);
  };

  const removeAvatar = () => {
    if (avatar?.preview) {
      URL.revokeObjectURL(avatar.preview);
    }
    setAvatar(null);
    onAvatarChange?.(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "uploading":
        return (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
      default:
        return null;
    }
  };

  const displayImage = avatar?.preview || currentAvatar;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Avatar Upload Area */}
      <div className="flex flex-col items-center space-y-4">
        <div
          className={cn(
            "relative rounded-full border-4 border-dashed transition-all duration-300 cursor-pointer group",
            "bg-white/70 backdrop-blur-sm hover:bg-white/80",
            sizeClasses[size],
            isDragOver
              ? "border-blue-400 bg-blue-50/70 scale-105"
              : "border-gray-300 hover:border-blue-300",
            avatar?.status === "error" && "border-red-300"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          {/* Avatar Image or Placeholder */}
          {displayImage ? (
            <div className="w-full h-full rounded-full overflow-hidden">
              <img
                src={displayImage || "/placeholder.svg"}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <User
                className={cn(
                  "text-gray-400 transition-all duration-300",
                  size === "sm" && "w-6 h-6",
                  size === "md" && "w-8 h-8",
                  size === "lg" && "w-12 h-12",
                  size === "xl" && "w-16 h-16",
                  isDragOver && "text-blue-500 scale-110"
                )}
              />
            </div>
          )}

          {/* Upload Overlay */}
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300",
              isDragOver && "opacity-100"
            )}
          >
            <Camera className="w-6 h-6 text-white" />
          </div>

          {/* Status Icon */}
          {avatar?.status && (
            <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg">
              {getStatusIcon(avatar.status)}
            </div>
          )}

          {/* Remove Button */}
          {(avatar || currentAvatar) && (
            <GlassButton
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                removeAvatar();
              }}
              className="absolute -top-2 -left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 h-8 w-8 bg-red-500/80 hover:bg-red-600/80 text-white border-red-400"
            >
              <X className="w-4 h-4" />
            </GlassButton>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Upload Instructions */}
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-gray-700">
            {isDragOver ? "Drop image here" : "Click or drag to upload avatar"}
          </p>
          <p className="text-xs text-gray-500">
            Max {Math.round(maxSize / 1024 / 1024)}MB • JPG, PNG, GIF
          </p>
        </div>

        {/* Upload Progress */}
        {avatar?.status === "uploading" &&
          typeof avatar.progress === "number" && (
            <div className="w-full max-w-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Uploading...</span>
                <span className="text-xs text-gray-600">
                  {Math.round(avatar.progress)}%
                </span>
              </div>
              <AnimatedProgress
                value={avatar.progress}
                color="blue"
                className="h-2"
              />
            </div>
          )}

        {/* Success Message */}
        {avatar?.status === "success" && (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle className="w-4 h-4" />
            Avatar uploaded successfully
          </div>
        )}

        {/* Error Message */}
        {avatar?.status === "error" && avatar.error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {avatar.error}
          </div>
        )}
      </div>
    </div>
  );
}
