"use client";

import React, {
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { cn } from "@/lib/utils";
import {
  Upload,
  X,
  File,
  ImageIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { GlassButton } from "./glass-button";
import { AnimatedProgress } from "./animated-progress";

interface FileData {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: "uploading" | "success" | "error" | "idle";
  error?: string;
}

interface GlassFileUploadProps {
  onFilesChange?: (files: FileData[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
  multiple?: boolean;
  showPreview?: boolean;
  autoUpload?: boolean; // New prop to control automatic upload simulation
  onUploadStart?: (files: FileData[]) => void; // Callback when upload should start
}

export interface GlassFileUploadRef {
  startUpload: (fileIds?: string[]) => void;
  files: FileData[];
}

export const GlassFileUpload = forwardRef<
  GlassFileUploadRef,
  GlassFileUploadProps
>(
  (
    {
      onFilesChange,
      maxFiles = 5,
      maxSize = 5 * 1024 * 1024, // 5MB
      acceptedTypes = ["image/*"],
      className,
      multiple = true,
      showPreview = true,
      autoUpload = false, // Default to false
      onUploadStart,
    },
    ref
  ) => {
    const [files, setFiles] = useState<FileData[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const validateFile = (file: File): string | undefined => {
      if (file.size > maxSize) {
        return `File size must be less than ${Math.round(
          maxSize / 1024 / 1024
        )}MB`;
      }

      if (acceptedTypes.length > 0) {
        const isValidType = acceptedTypes.some((type) => {
          if (type.endsWith("/*")) {
            return file.type?.startsWith(type.slice(0, -1));
          }
          return file.type === type;
        });
        if (!isValidType) {
          return `File type not supported. Accepted types: ${acceptedTypes.join(
            ", "
          )}`;
        }
      }

      return undefined;
    };

    const processFiles = useCallback(
      (fileList: FileList) => {
        const newFiles: FileData[] = [];

        Array.from(fileList).forEach((file) => {
          if (files.length + newFiles.length >= maxFiles) return;

          const error = validateFile(file);

          const fileData: FileData = {
            id: generateId(),
            file: file, // Keep the original file object intact
            status: error ? "error" : "idle",
            error,
            progress: 0,
          };

          // Create preview for images
          if (file.type?.startsWith("image/") && showPreview) {
            fileData.preview = URL.createObjectURL(file);
          }

          newFiles.push(fileData);
        });

        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        onFilesChange?.(updatedFiles);

        // Only simulate upload if autoUpload is enabled
        if (autoUpload) {
          newFiles.forEach((fileData) => {
            if (fileData.status !== "error") {
              simulateUpload(fileData.id);
            }
          });
        }
      },
      [files, maxFiles, onFilesChange, showPreview, autoUpload]
    );

    const simulateUpload = (fileId: string) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    progress: 100,
                    status: "success" as const,
                  }
                : f
            )
          );
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileId
                ? {
                    ...f,
                    progress,
                    status: "uploading" as const,
                  }
                : f
            )
          );
        }
      }, 200);
    };

    // Public method to start upload simulation for specific files
    const startUpload = (fileIds?: string[]) => {
      const filesToUpload = fileIds
        ? files.filter((f) => fileIds.includes(f.id) && f.status === "idle")
        : files.filter((f) => f.status === "idle");

      filesToUpload.forEach((fileData) => {
        if (fileData.status !== "error") {
          simulateUpload(fileData.id);
        }
      });
    };

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      startUpload,
      files,
    }));

    const removeFile = (fileId: string) => {
      const updatedFiles = files.filter((f) => {
        if (f.id === fileId && f.preview) {
          URL.revokeObjectURL(f.preview);
        }
        return f.id !== fileId;
      });
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
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

      if (e.dataTransfer.files) {
        processFiles(e.dataTransfer.files);
      }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
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

    const formatFileSize = (bytes: number): string => {
      if (bytes >= 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      }
      return `${(bytes / 1024).toFixed(1)} KB`;
    };

    return (
      <div className={cn("space-y-4", className)}>
        {/* Upload Area */}
        <div
          className={cn(
            "relative rounded-lg border-2 border-dashed transition-all duration-300 cursor-pointer",
            "bg-white/70 backdrop-blur-sm hover:bg-white/80",
            isDragOver
              ? "border-blue-400 bg-blue-50/70 scale-[1.02]"
              : "border-gray-300 hover:border-blue-300",
            files.length >= maxFiles && "opacity-50 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={files.length < maxFiles ? openFileDialog : undefined}
        >
          <div className="p-8 text-center">
            <div
              className={cn(
                "mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300",
                isDragOver
                  ? "bg-blue-100 text-blue-600 scale-110"
                  : "bg-gray-100 text-gray-400"
              )}
            >
              <Upload className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                {isDragOver ? "Drop files here" : "Drag & drop files here"}
              </p>
              <p className="text-sm text-gray-500">
                or click to browse ({files.length}/{maxFiles} files)
              </p>
              <p className="text-xs text-gray-400">
                Max {Math.round(maxSize / 1024 / 1024)}MB per file •{" "}
                {acceptedTypes.join(", ")}
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={acceptedTypes.join(",")}
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">
              Uploaded Files ({files.length})
            </h4>

            <div className="space-y-2">
              {files.map((fileData) => (
                <div
                  key={fileData.id}
                  className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-white/20 transition-all duration-300 hover:bg-white/80 group"
                >
                  {/* File Preview/Icon */}
                  <div className="flex-shrink-0">
                    {fileData.preview ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={fileData.preview}
                          alt={fileData.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        {fileData.file.type?.startsWith("image/") ? (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        ) : (
                          <File className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {fileData.file.name}
                      </p>
                      {getStatusIcon(fileData.status)}
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                      {formatFileSize(fileData.file.size)}
                    </p>

                    {fileData.status === "error" && fileData.error && (
                      <p className="text-xs text-red-500">{fileData.error}</p>
                    )}

                    {fileData.status === "uploading" && (
                      <AnimatedProgress
                        value={fileData.progress}
                        color="blue"
                        className="h-1"
                      />
                    )}

                    {fileData.status === "success" && (
                      <AnimatedProgress
                        value={100}
                        color="emerald"
                        className="h-1"
                      />
                    )}
                  </div>

                  {/* Remove Button */}
                  <GlassButton
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(fileData.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </GlassButton>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);
