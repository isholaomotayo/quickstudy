"use client";

import React, { useState, useRef } from "react";
import { Paperclip, Upload, X, FileText, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { translateCode } from "@/helpers/language/translate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  url: string;
  cloudinaryId: string;
}

interface AssignmentSubmissionProps {
  courseTestId: number;
  questionId: number;
  question: string;
  details?: string;
  marks: number;
  onAnswerChange: (answer: {
    text: string;
    files: (File | UploadedFile)[];
  }) => void;
  initialAnswer?: { text: string; files: (File | UploadedFile)[] };
  disabled?: boolean;
}

export function AssignmentSubmission({
  courseTestId,
  questionId,
  question,
  details,
  marks,
  onAnswerChange,
  initialAnswer = { text: "", files: [] },
  disabled = false,
}: AssignmentSubmissionProps) {
  const [text, setText] = useState(initialAnswer.text);
  const [files, setFiles] = useState<(File | UploadedFile)[]>(
    initialAnswer.files || []
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onAnswerChange({ text: newText, files });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    // Validate file types and sizes
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles = selectedFiles.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`);
        return false;
      }

      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setUploading(true);
      try {
        // Upload files to Cloudinary
        const uploadedFiles = await Promise.all(
          validFiles.map(async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "ilearn");
            formData.append("tags", "assignment");

            const response = await fetch(
              "https://api.cloudinary.com/v1_1/emergingplatforms/upload",
              {
                method: "POST",
                body: formData,
              }
            );

            if (!response.ok) {
              throw new Error(`Failed to upload ${file.name}`);
            }

            const result = await response.json();
            return {
              name: file.name,
              type: file.type,
              size: file.size,
              url: result.secure_url,
              cloudinaryId: result.public_id,
            };
          })
        );

        const newFiles = [...files, ...uploadedFiles];
        setFiles(newFiles);
        onAnswerChange({ text, files: newFiles });
        toast.success(`${validFiles.length} file(s) uploaded successfully`);
      } catch (error) {
        console.error("Upload error:", error);
        // Check if it's an API error with pageNotif
        if (error.pageNotif) {
          const errorMessage = translateCode(error.pageNotif);
          toast.error(errorMessage);
        } else {
          toast.error("Failed to upload files. Please try again.");
        }
      } finally {
        setUploading(false);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onAnswerChange({ text, files: newFiles });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileType: string | undefined) => {
    if (!fileType) return "📎";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("text")) return "📄";
    if (fileType.includes("image")) return "🖼️";
    return "📎";
  };

  const downloadFile = (file: File | UploadedFile) => {
    if ("url" in file && file.url) {
      const link = document.createElement("a");
      link.href = file.url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Question {questionId}</span>
          <Badge variant="secondary">{marks} marks</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question */}
        <div className="space-y-2">
          <Label className="text-base font-medium">Question:</Label>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div
              className="text-gray-900"
              dangerouslySetInnerHTML={{ __html: question }}
            />
            {details && (
              <div
                className="text-sm text-gray-600 mt-2"
                dangerouslySetInnerHTML={{ __html: details }}
              />
            )}
          </div>
        </div>

        {/* Text Answer */}
        <div className="space-y-2">
          <Label
            htmlFor={`answer-${questionId}`}
            className="text-base font-medium"
          >
            Your Answer
          </Label>
          <Textarea
            id={`answer-${questionId}`}
            value={text}
            onChange={handleTextChange}
            disabled={disabled}
            placeholder="Type your detailed answer here..."
            className="min-h-32 resize-vertical"
            rows={6}
          />
        </div>

        {/* File Upload */}
        <div className="space-y-4">
          <Label className="text-base font-medium">
            Attach Files (Optional)
          </Label>

          {/* File Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              disabled={disabled || uploading}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              variant="outline"
              className="gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Choose Files
                </>
              )}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Supported formats: PDF, Word, Text, Images (max 10MB each)
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Attached Files:</Label>
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getFileIcon(file.type)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {file.name || "Unknown file"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {file.size ? formatFileSize(file.size) : "Size unknown"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {"url" in file && file.url && (
                      <Button
                        type="button"
                        onClick={() => downloadFile(file)}
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto"
                      >
                        <Download size={16} />
                      </Button>
                    )}
                    {!disabled && (
                      <Button
                        type="button"
                        onClick={() => removeFile(index)}
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submission Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800 mb-2">
            <FileText size={16} />
            <span className="font-medium">Submission Summary</span>
          </div>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Text length: {text.length} characters</p>
            <p>Files attached: {files.length}</p>
            {files.length > 0 && (
              <p>
                Total file size:{" "}
                {formatFileSize(
                  files.reduce((acc, file) => acc + (file.size || 0), 0)
                )}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
