import type React from "react";
import { useCallback, useContext, useRef } from "react";

import { useEditorLifecycle, useEditorSetup } from "../hooks/use-editor-setup";

import { getInlineEditorConfig, loadEditorTheme } from "./tinymce-config";
import "./plugins/thm-markdown.plugin";
import "./plugins/enhanced-code-editor.plugin";

import type { RichTextEditorProps } from ".";

export const InlineRichTextEditor: React.FC<
  Pick<RichTextEditorProps, "content" | "onChange">
> = ({ content, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const { editorInstanceRef, isInitializedRef, handleEditorInit } =
    useEditorSetup(content, onChange);

  const configBuilder = useCallback(async () => {
    await loadEditorTheme();
    const inlineEditorConfig = getInlineEditorConfig();
    return {
      target: editorRef.current || undefined,
      ...inlineEditorConfig,
      setup: handleEditorInit,
    };
  }, [handleEditorInit]);

  useEditorLifecycle(
    configBuilder,
    editorRef,
    editorInstanceRef,
    isInitializedRef,
    100
  );

  return <div contentEditable ref={editorRef} data-testid="inline-editor" />;
};
