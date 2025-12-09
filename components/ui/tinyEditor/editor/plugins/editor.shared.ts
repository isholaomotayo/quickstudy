/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */
// @ts-nocheck

import { createEditor } from 'prism-code-editor';
import { indentGuides } from 'prism-code-editor/guides';
import { highlightBracketPairs } from 'prism-code-editor/highlight-brackets';
import { matchBrackets } from 'prism-code-editor/match-brackets';
import { insertText } from 'prism-code-editor/utils';

import 'prism-code-editor/prism/languages/markup';
import 'prism-code-editor/prism/languages/markdown';

import 'prism-code-editor/layout.css';
import 'prism-code-editor/scrollbar.css';

import { getEditorModalStyles, getStyles } from '../dark-mode-styles';

interface FormatCodeOptions {
  parser?: string;
}

/**
 * Formats HTML/XML-like code with proper indentation.
 */
function formatIndentation(code: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  '; // 2 spaces for indentation

  // Define inline elements that should not be formatted with newlines
  const inlineElements = new Set([
    'code',
    'span',
    'em',
    'strong',
    'b',
    'i',
    'u',
    'a',
    'small',
    'sub',
    'sup',
    'mark',
    'del',
    'ins',
    'q',
    'cite',
    'abbr',
    'time',
    'kbd',
    'samp',
    'var',
  ]);

  const tokens = code.split('<');

  tokens.forEach((token, index) => {
    if (!token) return;

    const line = `<${token}`;
    const trimmedLine = line.trim();

    if (!trimmedLine) return;

    const isClosingTag = trimmedLine.match(/^<\//);

    // Extract tag name to check if it's an inline element
    const tagNameMatch = trimmedLine.match(/^<\/?([^\s/>]+)/);
    const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
    const isInlineElement = inlineElements.has(tagName);
    let currentIndent = indent;
    if (isClosingTag && !isInlineElement) {
      currentIndent = Math.max(0, indent - 1);
      indent = currentIndent;
    }

    // Check if the line starts with a closing tag and potentially has text after it
    const closingTagWithTextMatch = trimmedLine.match(/^(<\/.*?>)(.*)/s);

    if (isClosingTag && closingTagWithTextMatch) {
      const closingTagPart = closingTagWithTextMatch[1];
      const textPart = closingTagWithTextMatch[2].trim();

      // For inline elements, don't add newlines or indentation
      if (isInlineElement) {
        formatted += closingTagPart;
        if (textPart) {
          formatted += textPart;
        }
      } else {
        formatted += `${tab.repeat(Math.max(0, currentIndent))}${closingTagPart}`;
        if (textPart) {
          formatted += `\n${tab.repeat(Math.max(0, currentIndent))}${textPart}\n`;
        } else {
          formatted += '\n';
        }
      }
    } else {
      // For inline elements, don't add newlines or indentation
      if (isInlineElement) {
        formatted += trimmedLine;
      } else {
        formatted += `${tab.repeat(Math.max(0, currentIndent))}${trimmedLine}\n`;
      }
    }

    // Increase indent for opening tags, but not for self-closing, void elements, or inline elements
    if (
      !isClosingTag &&
      !isInlineElement &&
      !trimmedLine.match(/\/>$/) &&
      !trimmedLine.match(
        /^<(area|base|br|col|command|embed|hr|img|input|keygen|link|meta|param|source|track|wbr)([\s/>][^>]*)?>/i,
      ) &&
      trimmedLine.match(/^<\w/)
    ) {
      indent++;
    }
  });

  return formatted.trim();
}

export const formatCode = async (code: string, parser = 'html'): Promise<string> => {
  try {
    if (parser === 'html') {
      return formatIndentation(code);
    }

    // For markdown or any other parser, keep original formatting
    return code;
  } catch (error) {
    console.error('Error formatting code:', error);
    return code;
  }
};

export class BaseEditor {
  editor = null;
  containerId = '';
  initialContent = '';
  language = 'html';
  isDark = false;

  constructor(containerId: string, initialContent: string, language = 'html', isDark = false) {
    this.containerId = containerId;
    this.initialContent = initialContent;
    this.language = language;
    this.isDark = isDark;
  }

  async initialize() {
    const formattedContent = this.initialContent;

    const container = document.getElementById(this.containerId);
    if (!container) {
      throw new Error(`Container with id ${this.containerId} not found`);
    }

    this.editor = createEditor(
      `#${this.containerId}`,
      {
        language: this.language,
        value: formattedContent,
        lineNumbers: true,
        readOnly: false,
      },
      indentGuides(),
      matchBrackets(),
      highlightBracketPairs(),
    );

    return this;
  }

  async formatCurrentCode() {
    if (!this.editor) return;

    const currentCode = this.editor.value;
    const formattedCode = await formatCode(currentCode, this.language);
    const [start, end] = this.editor.getSelection();
    insertText(this.editor, formattedCode, 0, currentCode.length, start, end);
  }

  getValue() {
    return this.editor ? this.editor.value : '';
  }

  destroy() {
    if (this.editor) {
      const editorElement = document.querySelector(`#${this.containerId}`);
      if (editorElement) {
        editorElement.innerHTML = '';
        const newElement = editorElement.cloneNode(true);
        editorElement.parentNode.replaceChild(newElement, editorElement);
      }
      this.editor = null;
    }
  }
}

export class EditorModal {
  modal: HTMLDivElement;
  constructor(title = '', isDarkMode = false) {
    this.styles = getStyles(isDarkMode); // Ensure styles are initialized with the correct mode
    this.modal = document.createElement('div');
    this.modal.className = 'editor-modal';
    this.modal.style.cssText = this.styles.modal;
    // Create and add scoped styles
    this.styleElement = document.createElement('style');
    this.styleElement.textContent = getEditorModalStyles(isDarkMode);

    this.modal.appendChild(this.styleElement);
    if (title) {
      const header = document.createElement('div');
      header.style.cssText = this.styles.header;
      const titleEl = document.createElement('div');
      titleEl.textContent = title;
      titleEl.style.cssText = 'font-weight: bold; font-size: 16px;';
      header.appendChild(titleEl);
      this.modal.appendChild(header);
    }
  }

  createContainer(id) {
    const container = document.createElement('div');
    container.id = id;
    container.style.cssText = this.styles.editorContainer;
    return container;
  }

  createButton(text, variant, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.onclick = onClick;
    button.style.cssText = `${this.styles.button.base} ${this.styles.button[variant]}`;
    return button;
  }

  addEscapeHandler() {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        this.destroy();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  }

  mount() {
    document.body.appendChild(this.modal);
  }

  destroy() {
    if (this.modal?.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
  }
}
