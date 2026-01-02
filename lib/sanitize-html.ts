import DOMPurify from "isomorphic-dompurify";

// Common allowed tags - extracted to avoid duplication
const COMMON_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "b",
  "i",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "code",
  "pre",
  "span",
  "div",
  "table",
  "thead",
  "tbody",
  "tr",
  "td",
  "th",
] as const;

// Memoized default config to avoid recreation on every call
const DEFAULT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    ...COMMON_TAGS,
    "img",
    "video",
    "audio",
    "source",
    "iframe",
  ],
  ALLOWED_ATTR: [
    "href",
    "target",
    "rel",
    "src",
    "alt",
    "title",
    "width",
    "height",
    "class",
    "id",
    "style",
    "controls",
    "autoplay",
    "loop",
    "muted",
    "poster",
    "allowfullscreen",
    "frameborder",
    "allow",
    "sandbox",
  ],
  ALLOW_DATA_ATTR: false,
};

/**
 * Sanitize HTML content to prevent XSS attacks
 * 
 * @param html - The HTML string to sanitize
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export function sanitizeHTML(
  html: string,
  options?: {
    allowedTags?: string[];
    allowedAttributes?: Record<string, string[]>;
  }
): string {
  // Build config with proper attribute handling
  const config: DOMPurify.Config = {
    ...DEFAULT_CONFIG,
  };

  // Override tags if provided
  if (options?.allowedTags) {
    config.ALLOWED_TAGS = options.allowedTags;
  }

  // Handle per-tag attributes properly using DOMPurify's ADD_ATTR
  if (options?.allowedAttributes) {
    // Start with default attributes
    config.ALLOWED_ATTR = [...(DEFAULT_CONFIG.ALLOWED_ATTR || [])];
    
    // Add tag-specific attributes using DOMPurify's ADD_ATTR
    const addAttr: string[] = [];
    Object.entries(options.allowedAttributes).forEach(([tag, attrs]) => {
      attrs.forEach((attr) => {
        // Format: "tag:attr" for tag-specific, or just "attr" for global
        if (tag === "*") {
          if (config.ALLOWED_ATTR && !config.ALLOWED_ATTR.includes(attr)) {
            config.ALLOWED_ATTR.push(attr);
          }
        } else {
          addAttr.push(`${tag}:${attr}`);
        }
      });
    });
    
    if (addAttr.length > 0) {
      config.ADD_ATTR = addAttr;
    }
  }

  return DOMPurify.sanitize(html, config);
}

/**
 * Sanitize HTML for lesson content (allows more formatting)
 */
export function sanitizeLessonContent(html: string): string {
  return sanitizeHTML(html, {
    allowedTags: [
      ...COMMON_TAGS,
      "img",
      "video",
      "audio",
      "iframe",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "class"],
      video: ["src", "controls", "autoplay", "loop", "muted", "poster", "width", "height"],
      audio: ["src", "controls", "autoplay", "loop"],
      iframe: ["src", "width", "height", "allowfullscreen", "frameborder", "allow", "sandbox"],
      "*": ["class", "id", "style"],
    },
  });
}

/**
 * Sanitize HTML for quiz/question content (more restrictive)
 */
export function sanitizeQuestionContent(html: string): string {
  return sanitizeHTML(html, {
    allowedTags: ["p", "br", "strong", "em", "u", "b", "i", "ul", "ol", "li", "span", "div"],
    allowedAttributes: {
      "*": ["class", "id"],
    },
  });
}

