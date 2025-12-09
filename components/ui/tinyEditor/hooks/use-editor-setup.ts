import { type MutableRefObject, useCallback, useEffect, useRef } from "react";
import type {
  EditorEvent,
  RawEditorOptions,
  Editor as TinyMCEEditor,
} from "tinymce";
import tinymce from "tinymce";

export const useEditorSetup = (
  content: string,
  onChange: (content: string) => void,
  onMediaDelete?: (images: HTMLImageElement[]) => void
) => {
  const editorInstanceRef = useRef<TinyMCEEditor | null>(null);
  const isInitializedRef = useRef(false);
  const prevContentRef = useRef(content);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const onMediaDeleteRef = useRef(onMediaDelete);
  onMediaDeleteRef.current = onMediaDelete;

  const handleImageDelete = useCallback(
    (element: HTMLElement) => {
      if (!onMediaDeleteRef.current || element.tagName !== "IMG") return;
      onMediaDeleteRef.current([element as HTMLImageElement]);
    },
    [] // Empty dependency array makes this stable
  );

  const handleEditorInit = useCallback(
    (editor: TinyMCEEditor) => {
      editorInstanceRef.current = editor;
      editor.on("init", () => {
        if (!isInitializedRef.current) {
          editor.setContent(prevContentRef.current || "");
          isInitializedRef.current = true;
        }
      });

      editor.on("change input", () => {
        const newContent = editor.getContent();
        if (newContent !== prevContentRef.current) {
          prevContentRef.current = newContent;
          onChangeRef.current(newContent);
        }
      });

      // Handle image deletion
      editor.on("NodeRemove", (e: EditorEvent<HTMLElement>) => {
        if (e.target instanceof HTMLElement) {
          handleImageDelete(e.target);
        }
      });
    },
    [handleImageDelete]
  );

  return {
    editorInstanceRef,
    isInitializedRef,
    handleEditorInit,
  };
};

/**
 * Consolidated editor lifecycle hook for both RichTextEditor and InlineRichTextEditor.
 * Handles initialization, destruction, delay, and DOM checks.
 */
export const useEditorLifecycle = <T extends HTMLElement>(
  configBuilder: () => Promise<RawEditorOptions>,
  editorRef: React.RefObject<T>,
  editorInstanceRef: MutableRefObject<TinyMCEEditor | null>,
  isInitializedRef: MutableRefObject<boolean>,
  delayMs = 150
) => {
  const initTimeoutRef = useRef<NodeJS.Timeout>();
  const isDestroyingRef = useRef(false);

  const destroyEditor = useCallback(() => {
    if (!editorInstanceRef.current || isDestroyingRef.current) return;
    isDestroyingRef.current = true;
    try {
      editorInstanceRef.current.destroy();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error destroying editor:", error);
    } finally {
      editorInstanceRef.current = null;
      isInitializedRef.current = false;
      isDestroyingRef.current = false;
    }
  }, [editorInstanceRef, isInitializedRef]);

  const initializeEditor = useCallback(async () => {
    if (isDestroyingRef.current) return;
    await destroyEditor();
    if (!editorRef.current) {
      // eslint-disable-next-line no-console
      console.warn("Editor DOM element not found");
      return;
    }
    try {
      const config = await configBuilder();
      await tinymce.init(config);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error initializing editor:", error);
    }
  }, [destroyEditor, configBuilder, editorRef]);

  useEffect(() => {
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }
    initTimeoutRef.current = setTimeout(() => {
      initializeEditor();
    }, delayMs);
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
      destroyEditor();
    };
  }, [initializeEditor, destroyEditor, delayMs]);

  return {
    destroyEditor,
    initializeEditor,
    initTimeoutRef,
    isDestroyingRef,
  };
};

export type UseEditorSetupReturnType = {
  editorInstanceRef: React.RefObject<TinyMCEEditor | null>;
  isInitializedRef: React.RefObject<boolean>;
  handleEditorInit: (editor: TinyMCEEditor) => void;
};
