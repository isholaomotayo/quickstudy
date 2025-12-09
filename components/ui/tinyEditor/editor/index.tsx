import type React from "react";
import { useCallback, useRef } from "react";

// import { ThemeColorMode } from "src/common/enums";

import { useEditorLifecycle, useEditorSetup } from "../hooks/use-editor-setup";

import {
  getEditorConfig,
  getMinimalEditorConfig,
  loadEditorTheme,
} from "./tinymce-config";
import "./plugins/thm-markdown.plugin";
import "./plugins/enhanced-code-editor.plugin";

export interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload?: (
    files: File[],
    insertImage: (
      base64: string,
      callback: (images: HTMLImageElement[]) => void
    ) => void
  ) => void;
  onMediaDelete?: (images: HTMLImageElement[]) => void;
}

export interface MinimalEditorProps {
  content: string;
  height: number;
  onChange: (content: string) => void;
}

declare global {
  interface Window {
    tinymce: typeof import("tinymce");
  }
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  onImageUpload,
  onMediaDelete,
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const isDarkMode = false;

  const { editorInstanceRef, isInitializedRef, handleEditorInit } =
    useEditorSetup(content, onChange, onMediaDelete);

  const handleImageUpload = useCallback(
    async (blobInfo: { blob: () => Blob; filename: () => string }) => {
      const blob = blobInfo.blob();
      const file = new File([blob], blobInfo.filename() || "image.png", {
        type: blob.type,
      });

      return new Promise<string>((resolve) => {
        onImageUpload?.(
          [file],
          (base64: string, callback: (images: HTMLImageElement[]) => void) => {
            resolve(base64);
            requestAnimationFrame(() => {
              const images = editorInstanceRef.current?.dom.select(
                `img[src="${base64}"]`
              );
              if (images?.length) callback(images as HTMLImageElement[]);
            });
          }
        );
      });
    },
    [editorInstanceRef, onImageUpload]
  );

  const configBuilder = useCallback(async () => {
    await loadEditorTheme();
    return {
      ...getEditorConfig(),
      target: editorRef.current || undefined,
      images_upload_handler: handleImageUpload,
      automatic_uploads: true,
      file_picker_types: "file image media",
      setup: handleEditorInit,
    };
  }, [isDarkMode, handleImageUpload, handleEditorInit]);

  useEditorLifecycle(
    configBuilder,
    editorRef,
    editorInstanceRef,
    isInitializedRef
  );

  return (
    <textarea
      ref={editorRef}
      data-testid="tinymce-editor"
      aria-label="task editor "
    />
  );
};

export const MinimalEditor: React.FC<MinimalEditorProps> = ({
  content,
  onChange,
  height = 200,
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const { editorInstanceRef, isInitializedRef, handleEditorInit } =
    useEditorSetup(content, onChange);

  const configBuilder = useCallback(async () => {
    await loadEditorTheme();
    return {
      ...getMinimalEditorConfig(),
      height: height,
      target: editorRef.current || undefined,
      setup: handleEditorInit,
    };
  }, [handleEditorInit]);

  useEditorLifecycle(
    configBuilder,
    editorRef,
    editorInstanceRef,
    isInitializedRef
  );

  return (
    <textarea
      ref={editorRef}
      data-testid="tinymce-editor-minimal"
      aria-label="minimal editor"
    />
  );
};

export default {
  RichTextEditor,
  MinimalEditor,
};
