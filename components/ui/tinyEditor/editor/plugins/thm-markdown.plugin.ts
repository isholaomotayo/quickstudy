/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */
// @ts-nocheck

import tinymce from "tinymce";
import { getStyles } from "../dark-mode-styles";
import { BaseEditor, EditorModal } from "./editor.shared";

(() => {
  interface ThMarkdownConfig {
    fontSize: number;
    wrap: boolean;
    language: string;
    shortcut: boolean;
    debug: boolean;
    parser?: (content: string) => string;
    renderer?: (markdown: string) => string;
  }

  interface Editor {
    getContent: (options: { format: string }) => string;
    getParam: (param: string) => Partial<ThMarkdownConfig>;
    setContent: (content: string) => void;
    undoManager: { add: () => void };
    nodeChanged: () => void;
    ui: {
      registry: {
        addButton: (
          name: string,
          settings: { icon: string; tooltip: string; onAction: () => void }
        ) => void;
        addIcon: (name: string, svg: string) => void;
      };
    };
    addShortcut: (
      shortcut: string,
      description: string,
      callback: () => void
    ) => void;
    on: (event: string, callback: () => void) => void;
  }

  tinymce.PluginManager.add("thmarkdown", (editor) => {
    const config: ThMarkdownConfig = {
      fontSize: 14,
      wrap: true,
      language: "markdown",
      shortcut: true,
      debug: true,
      isDark: editor.getParam("isDark") ?? false,
      ...editor.getParam("thmarkdown"),
    };

    function initializeMarkdownEditor(
      markdownEditor: any,
      modal: any
    ): Promise<void> {
      return markdownEditor
        .initialize()
        .then(() => {
          modal.addEscapeHandler();
          editor.on("remove", () => {
            markdownEditor.destroy();
            modal.destroy();
          });
        })
        .catch((error: Error) => {
          console.error("Error initializing markdown editor:", error);
          throw error;
        });
    }

    function handleSaveChanges(markdownEditor: any, modal: any) {
      return () => {
        const markdown = markdownEditor.getValue();

        if (config.renderer) {
          try {
            const html = config.renderer(markdown);
            editor.setContent(html);
            editor.undoManager.add();
            editor.nodeChanged();
          } catch (error) {
            console.error("Error rendering Markdown to HTML:", error);
          }
        } else {
          editor.setContent(markdown);
        }

        markdownEditor.destroy();
        modal.destroy();
      };
    }

    function createModalContent(content: string) {
      const styles = getStyles(config.isDark); // Initialize styles with the correct theme mode
      const modal = new EditorModal("Markdown Editor", config.isDark); // Pass isDarkMode to EditorModal
      const editorContainer = modal.createContainer("prism-markdown-editor");

      const notice = document.createElement("div");
      notice.style.cssText = `
        padding: 12px;
        background-color: #fff3cd;
        border: 1px solid #ffeeba;
        border-radius: 4px;
        color: #151C2B;
        margin: 10px 0;
        font-size: 0.8rem;
      `;
      notice.textContent =
        "Converting HTML to Markdown can result in information loss due to format incompatibilities. Whenever possible, avoid repeated conversions between HTML <> Markdown.";

      modal.modal.appendChild(notice);
      modal.modal.appendChild(editorContainer);

      const markdownEditor = new BaseEditor(
        "prism-markdown-editor",
        content,
        "markdown",
        config.isDark
      );

      const buttonContainer = document.createElement("div");
      buttonContainer.style.cssText = styles.buttonContainer;

      const saveButton = modal.createButton(
        "Save changes",
        "primary",
        handleSaveChanges(markdownEditor, modal)
      );

      const cancelButton = modal.createButton(
        "Discard changes",
        "secondary",
        () => {
          markdownEditor.destroy();
          modal.destroy();
        }
      );

      buttonContainer.appendChild(cancelButton);
      buttonContainer.appendChild(saveButton);
      modal.modal.appendChild(buttonContainer);

      return { modal, markdownEditor };
    }

    const openMarkdownEditor = () => {
      try {
        let content = editor.getContent({ format: "raw" });

        if (config.parser) {
          try {
            content = config.parser(content);
          } catch (error) {
            console.error("Error parsing HTML to Markdown:", error);
          }
        }

        const { modal, markdownEditor } = createModalContent(content);
        modal.mount();

        // Initialize editor without returning the promise
        initializeMarkdownEditor(markdownEditor, modal).catch((error) => {
          console.error("Failed to initialize markdown editor:", error);
          modal.destroy();
        });
      } catch (error) {
        console.error("Error opening markdown editor:", error);
      }
    };

    editor.ui.registry.addIcon(
      "custom-markdown-icon",
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 24 24" height="24" width="24"><path d="m15.333333333333334 14.375 2.875 -2.875 -1.00625 -1.0302083333333334 -1.15 1.15V8.625h-1.4375v2.994791666666667l-1.15 -1.15L12.458333333333334 11.5l2.875 2.875ZM1.9166666666666667 19.166666666666668V3.8333333333333335h19.166666666666668v15.333333333333334H1.9166666666666667Zm1.4375 -1.4375h16.291666666666668V5.270833333333334H3.354166666666667v12.458333333333334Zm1.8927083333333334 -3.354166666666667h1.1979166666666667v-4.552083333333334h1.2697916666666667v3.042708333333333h1.1979166666666667V9.822916666666668h1.4375V14.375h1.1979166666666667V8.625H5.246875v5.75Z"></path></svg>'
    );

    editor.ui.registry.addButton("thmarkdown", {
      icon: "custom-markdown-icon",
      tooltip: "Markdown Editor",
      onAction: openMarkdownEditor,
    });

    if (config.shortcut) {
      editor.addShortcut("Meta+E", "Open markdown editor", openMarkdownEditor);
    }

    return {
      getMetadata: () => ({
        name: "Markdown editor TinyMCE plugin",
        description: "A custom plugin to edit Markdown with Prism.js",
      }),
    };
  });
})();
