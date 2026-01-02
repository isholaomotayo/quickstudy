"use client";

import { useRef, useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface TinyMCEEditorProps {
  value: string;
  onChange: (content: string) => void;
  height?: number;
  placeholder?: string;
  className?: string;
  minimal?: boolean;
  readonly?: boolean;
  onImageUpload?: (
    files: File[],
    insertImage: (
      base64: string,
      callback: (images: HTMLImageElement[]) => void
    ) => void
  ) => void;
}

export default function TinyMCEEditor({
  value,
  onChange,
  height = 500,
  placeholder,
  className = "",
  minimal = false,
  readonly = false,
  onImageUpload,
}: TinyMCEEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const editorInstanceRef = useRef<any>(null);
  const editorId = useRef(`tinymce-editor-${Math.random().toString(36).substr(2, 9)}`);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const [isClient, setIsClient] = useState(false);
  const [isTinyMCELoaded, setIsTinyMCELoaded] = useState(false);

  // Check for TinyMCE loaded via next/script
  useEffect(() => {
    setIsClient(true);
    
    // Check if TinyMCE is already loaded
    if ((window as any).tinymce) {
      setIsTinyMCELoaded(true);
      return;
    }

    // Poll for TinyMCE loaded via next/script
    const checkInterval = setInterval(() => {
      if ((window as any).tinymce || (window as any).__TINYMCE_LOADED__) {
        setIsTinyMCELoaded(true);
        clearInterval(checkInterval);
      }
    }, 100);

    // Cleanup interval on unmount
    return () => clearInterval(checkInterval);
  }, []);

  // Cloudinary upload handler
  const handleImageUpload = async (blobInfo: {
    blob: () => Blob;
    filename: () => string;
  }) => {
    const blob = blobInfo.blob();
    const file = new File([blob], blobInfo.filename() || "image.png", {
      type: blob.type,
    });

    return new Promise<string>((resolve, reject) => {
      if (onImageUpload) {
        onImageUpload([file], (base64: string) => {
          resolve(base64);
        });
      } else {
        // Default Cloudinary upload
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = false;
        xhr.open(
          "POST",
          "https://api.cloudinary.com/v1_1/emergingplatforms/upload"
        );

        xhr.onload = function () {
          if (xhr.status !== 200) {
            reject("HTTP Error: " + xhr.status);
            return;
          }

          const json = JSON.parse(xhr.responseText);
          if (!json || typeof json.secure_url !== "string") {
            reject("Invalid JSON: " + xhr.responseText);
            return;
          }

          resolve(json.secure_url);
        };

        xhr.onerror = () => reject("Upload failed");

        const formData = new FormData();
        formData.append("upload_preset", "ilearn");
        formData.append("tags", "CourseMaterials");
        formData.append("file", blobInfo.blob(), blobInfo.filename());
        xhr.send(formData);
      }
    });
  };

  // File picker callback for Cloudinary
  const handleFilePicker = (callback: any, value: string, meta: any) => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*,application/pdf,video/*");

    input.onchange = function () {
      const file = (this as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function () {
          const id = "blobid" + new Date().getTime();
          const editor = (window as any).tinymce.get(
            editorRef.current?.id || ""
          );
          const blobCache = editor?.editorUpload?.blobCache;
          if (blobCache) {
            const base64 = (reader.result as string).split(",")[1];
            const blobInfo = blobCache.create(id, file, base64);
            blobCache.add(blobInfo);

            const fname = blobInfo.name() + file.name;

            if (
              meta.filetype === "file" ||
              meta.filetype === "image" ||
              meta.filetype === "media"
            ) {
              const xhr = new XMLHttpRequest();
              xhr.withCredentials = false;
              xhr.open(
                "POST",
                "https://api.cloudinary.com/v1_1/emergingplatforms/upload"
              );

              xhr.onload = function () {
                if (xhr.status !== 200) {
                  console.error("Upload failed");
                  return;
                }

                const json = JSON.parse(xhr.responseText);
                if (!json || typeof json.secure_url !== "string") {
                  console.error("Invalid response");
                  return;
                }

                callback(json.secure_url, { text: file.name });
              };

              const formData = new FormData();
              formData.append("upload_preset", "ilearn");
              formData.append("file", blobInfo.blob(), fname);
              xhr.send(formData);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  };

  useEffect(() => {
    if (!isClient || !isTinyMCELoaded || !editorRef.current) return;

    const initEditor = async () => {
      const tinymce = (window as any).tinymce;
      if (!tinymce) {
        console.error("TinyMCE not loaded");
        return;
      }

      // Remove any existing editor on this element
      const existingEditor = tinymce.get(editorId.current);
      if (existingEditor) {
        existingEditor.remove();
      }

      const baseConfig = {
        selector: `#${editorId.current}`,
        height: height,
        readonly: readonly,
        placeholder: placeholder,
        license_key: "gpl",
        base_url: "/tinymce",
        suffix: ".min",
        plugins: minimal
          ? "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount"
          : "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table visualchars help wordcount",
        toolbar: minimal
          ? "undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | code fullscreen"
          : "undo redo | formatselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | code fullscreen | help",
        menubar: minimal
          ? false
          : "file edit view insert format tools table help",
        content_style: `
          body { 
            font-family: -apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif; 
            font-size: 14px; 
            line-height: 1.6; 
            color: ${isDarkMode ? "#e5e7eb" : "#333"};
            padding: 8px;
          }
          ${readonly ? "body { color: #aaa; }" : ""}
        `,
        skin: isDarkMode ? "oxide-dark" : "oxide",
        content_css: isDarkMode ? "dark" : "default",
        images_upload_handler: handleImageUpload,
        file_picker_callback: handleFilePicker,
        automatic_uploads: true,
        file_picker_types: "file image media",
        paste_data_images: true,
        relative_urls: false,
        remove_script_host: false,
        convert_urls: false,
        promotion: false,
        branding: false,
        setup: (editor: any) => {
          editorInstanceRef.current = editor;

          editor.on("init", () => {
            console.log("TinyMCE editor initialized");
            if (value) {
              editor.setContent(value);
            }
          });

          editor.on("change keyup", () => {
            const content = editor.getContent();
            onChange(content);
          });
        },
      };

      try {
        await tinymce.init(baseConfig);
      } catch (error) {
        console.error("Failed to initialize TinyMCE:", error);
      }
    };

    initEditor();

    return () => {
      if (editorInstanceRef.current) {
        try {
          editorInstanceRef.current.remove();
        } catch (e) {
          console.error("Error removing editor:", e);
        }
        editorInstanceRef.current = null;
      }
    };
  }, [
    isClient,
    isTinyMCELoaded,
    isDarkMode,
    minimal,
    height,
    readonly,
    placeholder,
  ]);

  // Update content when value prop changes
  useEffect(() => {
    if (
      editorInstanceRef.current &&
      value !== editorInstanceRef.current.getContent()
    ) {
      editorInstanceRef.current.setContent(value);
    }
  }, [value]);

  if (!isClient || !isTinyMCELoaded) {
    return (
      <div
        className={`h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded border ${className}`}
      />
    );
  }

  return (
    <div className={className}>
      <textarea
        ref={editorRef}
        id={editorId.current}
        data-testid="tinymce-editor"
        aria-label="rich text editor"
        defaultValue={value}
      />
    </div>
  );
}
