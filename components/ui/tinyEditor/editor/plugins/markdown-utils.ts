/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable unicorn/no-abusive-eslint-disable */
/* eslint-disable */
// @ts-nocheck

import { marked } from 'marked';
import Turndown from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

// Utility functions for autolink handling
const autolinkRegex = new RegExp(
  /\b(?:(?:https?|ftp):\/\/|www\.)/.source +
    /(?![-_])(?:[-_a-z0-9\u00a1-\uffff]{1,63}\.)+(?:[a-z\u00a1-\uffff]{2,63})/.source +
    /(?:[^\s<>]*)/.source,
  'gi',
);

function findAutolinkEnd(string: string): number {
  let length = string.length;
  while (length > 0) {
    const char = string[length - 1];
    if ('?!.,:*_~\'"'.includes(char)) {
      length--;
    } else if (char === ')') {
      let openBrackets = 0;
      for (let i = 0; i < length; i++) {
        if (string[i] === '(') {
          openBrackets++;
        } else if (string[i] === ')') {
          openBrackets--;
        }
      }
      if (openBrackets < 0) {
        length--;
      } else {
        break;
      }
    } else {
      break;
    }
  }
  return length;
}

function* matchAutolink(string: string) {
  for (const match of string.matchAll(autolinkRegex)) {
    const matched = match[0];
    const length = findAutolinkEnd(matched);
    yield Object.assign([matched.substring(0, length)], { index: match.index });
  }
}

function escapeString(string: string, originalEscape: (s: string) => string): string {
  let escaped = '';
  let lastLinkEnd = 0;

  for (const match of matchAutolink(string)) {
    const index = match.index!;
    if (index > lastLinkEnd) {
      const substring = string.substring(lastLinkEnd, index);
      escaped += originalEscape(substring).replace(/</g, '\\<');
    }
    const matchedURL = match[0];
    escaped += matchedURL;
    lastLinkEnd = index + matchedURL.length;
  }

  if (lastLinkEnd < string.length) {
    const substring = string.substring(lastLinkEnd, string.length);
    escaped += originalEscape(substring).replace(/</g, '\\<');
  }

  return escaped;
}

// Configure marked options
const markedOptions = {
  gfm: true,
  breaks: true,
  tables: true,
  xhtml: true,
  headerIds: false,
  tokenizer: {
    autolink: () => null as any,
    url: () => null as any,
  },
  renderer: {
    checkbox(...args: Array<any>) {
      return Object.getPrototypeOf(this)
        .checkbox.call(this, ...args)
        .trimRight();
    },
    code(...args: Array<any>) {
      return Object.getPrototypeOf(this)
        .code.call(this, ...args)
        .replace('\n</code>', '</code>');
    },
  },
};

// Configure turndown options
const turndownOptions = {
  codeBlockStyle: 'fenced',
  hr: '---',
  headingStyle: 'atx',
  // Keep elements that match our preservation rules
  keepReplacement: (content, node) => {
    if (node instanceof HTMLElement && node.classList.length > 0) {
      // Create an HTML string with the original element and its content
      const container = document.createElement('div');
      container.appendChild(node.cloneNode(true));
      return container.innerHTML;
    }
    return content;
  },
};

// Custom rule for task list items
const taskListRule = {
  filter(node: any) {
    return (
      node.type === 'checkbox' && (node.parentNode.nodeName === 'LI' || node.parentNode.parentNode.nodeName === 'LI')
    );
  },
  replacement(content: any, node: any) {
    return (node.checked ? '[x]' : '[ ]') + ' ';
  },
};

// Convert Markdown to HTML
export function renderMarkdownToHtml(markdown: string): string {
  try {
    marked.use(markedOptions);
    return marked.parse(markdown.trim());
  } catch (error) {
    console.error('Error converting Markdown to HTML:', error);
    return markdown;
  }
}

// Convert HTML to Markdown
export function parseHtmlToMarkdown(html: string): string {
  try {
    const turndownService = new Turndown(turndownOptions);

    // Override escape method to handle autolinks
    const originalEscape = turndownService.escape.bind(turndownService);
    turndownService.escape = (string: string) => escapeString(string, originalEscape);

    // Add GFM plugin
    turndownService.use(gfm);

    // Add task list rule
    turndownService.addRule('taskListItems', taskListRule);

    // Add rule to ignore elements with style, id, or detail tags
    turndownService.addRule('ignoreElementsWithStyleOrIdOrDetail', {
      filter: (node) => {
        // Add your conditions here
        const hasStyle = node.getAttribute && node.getAttribute('style');
        const hasId = node.getAttribute && node.getAttribute('id');
        const isDetail = node.nodeName.toLowerCase() === 'details';
        return hasStyle || hasId || isDetail;
      },
      replacement: (content, node) => {
        return node.outerHTML; // Return the HTML as is
      },
    });

    // Add rule to preserve elements with classes
    turndownService.addRule('preserveClassElements', {
      filter: (node: HTMLElement) => {
        // Check if the node has any classes
        return node.classList && node.classList.length > 0;
      },
      replacement: (content, node) => {
        return node.outerHTML; // Return the HTML as is
      },
    });

    return turndownService.turndown(html);
  } catch (error) {
    console.error('Error converting HTML to Markdown:', error);
    return html;
  }
}
