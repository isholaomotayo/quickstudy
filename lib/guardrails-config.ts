// Shared guardrails configuration for both frontend and backend
// This ensures consistent validation across all entry points

// Helper function to log configured origins (for debugging)
export function logConfiguredOrigins(): void {
  if (process.env.NODE_ENV === "development") {
    const origins = DEFAULT_GUARDRAILS_CONFIG.security.allowedOrigins;
    console.log("🔒 Configured allowed origins:", origins);
  }
}

export interface GuardRailsConfig {
  // Validation thresholds
  thresholds: {
    keywordSimilarity: number;
    conceptSimilarity: number;
    topicSimilarity: number;
    minimumRelevanceScore: number;
  };

  // Response templates
  responseTemplates: {
    offTopic: string;
    notAQuestion: string;
    lowRelevance: string;
    needsSpecificity: string;
    unauthorized: string;
    rateLimited: string;
  };

  // Security settings
  security: {
    maxRequestsPerMinute: number;
    maxRequestsPerHour: number;
    allowedOrigins: string[];
    requireValidOrigin: boolean;
  };
}

// Default configuration
export const DEFAULT_GUARDRAILS_CONFIG: GuardRailsConfig = {
  thresholds: {
    keywordSimilarity: 0.05, // At least 5% keyword overlap (permissive)
    conceptSimilarity: 0.05, // Some concept overlap
    topicSimilarity: 0.1, // Topic match preferred (permissive)
    minimumRelevanceScore: 0.1, // Overall relevance threshold (permissive)
  },

  responseTemplates: {
    offTopic:
      "I'm here to help with course-related questions. Your question seems to be about a different topic. Could you ask something related to the course content, lessons, or learning materials?",
    notAQuestion:
      "I'd be happy to help! Could you please rephrase that as a question about the course content?",
    lowRelevance:
      "I can see you're asking a question, but it doesn't seem directly related to our course content. Try asking about topics covered in the lessons, assignments, or course materials.",
    needsSpecificity:
      "Your question is on the right track! Could you be more specific about which aspect of the course content you'd like to explore?",
    unauthorized:
      "You need to be logged in to use the AI chat feature. Please sign in and try again.",
    rateLimited:
      "You're making requests too quickly. Please wait a moment before asking another question.",
  },

  security: {
    maxRequestsPerMinute: 10, // Max 10 requests per minute per user
    maxRequestsPerHour: 100, // Max 100 requests per hour per user
    allowedOrigins: (() => {
      const frontendUrl = process.env.FRONTEND_URL;
      const allowedOrigins = process.env.ALLOWED_ORIGINS;

      const origins: string[] = [];

      // Add FRONTEND_URL if provided
      if (frontendUrl) {
        origins.push(frontendUrl);
      }

      // Add ALLOWED_ORIGINS if provided (comma-separated)
      if (allowedOrigins) {
        const additionalOrigins = allowedOrigins
          .split(",")
          .map((origin) => origin.trim())
          .filter((origin) => origin.length > 0);
        origins.push(...additionalOrigins);
      }

      // Add default development origins if in development mode
      if (process.env.NODE_ENV === "development") {
        const defaultDevOrigins = [
          "https://applications.unn.edu.ng",
          "http://localhost:8080", // Next.js dev server port
        ];

        // Only add if not already present
        defaultDevOrigins.forEach((origin) => {
          if (!origins.includes(origin)) {
            origins.push(origin);
          }
        });
      }

      // Add default production origins if none specified
      if (origins.length === 0) {
        origins.push("http://localhost:8080", "https://localhost:3000");
      }

      return origins;
    })(),
    requireValidOrigin: process.env.NODE_ENV === "production",
  },
};

// Academic and educational terms for validation
export const ACADEMIC_TERMS = [
  // Core research terms
  "research",
  "methodology",
  "hypothesis",
  "data",
  "analysis",
  "ethics",
  "validity",
  "reliability",
  "sample",
  "population",
  "variables",
  "correlation",
  "regression",
  "statistics",
  "findings",
  "conclusions",
  "literature review",
  "primary data",
  "secondary data",
  "questionnaire",
  "interview",
  "observation",
  "experimental design",
  "survey",
  "case study",
  "ethnographic",
  "quantitative",
  "qualitative",

  // Educational terms students commonly use
  "explain",
  "example",
  "examples",
  "summary",
  "summarize",
  "key",
  "takeaway",
  "takeaways",
  "concept",
  "concepts",
  "definition",
  "define",
  "meaning",
  "understand",
  "understanding",
  "learn",
  "learning",
  "study",
  "studying",
  "practice",
  "help",
  "assistance",
  "clarify",
  "clarification",
  "detail",
  "details",
  "information",
  "content",
  "topic",
  "topics",
  "subject",
  "material",
  "lesson",
  "course",
  "module",
  "important",
  "significance",
  "relevance",
  "application",
  "apply",
  "use",
  "difference",
  "compare",
  "contrast",
  "similar",
  "similarity",
  "relationship",
  "process",
  "procedure",
  "method",
  "approach",
  "technique",
  "strategy",
  "benefit",
  "advantages",
  "disadvantages",
  "pros",
  "cons",
  "limitations",
  "challenge",
  "difficult",
  "problem",
  "issue",
  "solution",
  "solve",
  "step",
  "steps",
  "stage",
  "stages",
  "phase",
  "phases",
  "part",
  "parts",
  "section",
  "sections",
  "chapter",
  "chapters",
  "unit",
  "units",
  "overview",
  "introduction",
  "conclusion",
  "summary",
  "review",
  "recap",
];

// Question patterns for classification
export const QUESTION_PATTERNS = {
  research: /\b(research|study|investigation|analysis|methodology)\b/i,
  ethics: /\b(ethical?|moral|consent|privacy|confidential|harm)\b/i,
  data: /\b(data|information|collect|gather|sample|population)\b/i,
  hypothesis: /\b(hypothesis|theory|test|prove|predict)\b/i,
  design: /\b(design|method|approach|strategy|procedure)\b/i,
  analysis: /\b(analyz|statistic|result|finding|conclusion)\b/i,
  reporting: /\b(report|write|document|present|communicate)\b/i,
  general:
    /\b(explain|describe|define|compare|contrast|analyze|evaluate|discuss|examine)\b/i,
};

// Question words that indicate a question
export const QUESTION_WORDS = [
  "what",
  "how",
  "why",
  "when",
  "where",
  "which",
  "who",
  "explain",
  "describe",
  "define",
  "compare",
  "contrast",
  "analyze",
  "evaluate",
  "discuss",
  "examine",
  "can you",
  "could you",
  "would you",
  "do you",
  "does",
  "is",
  "are",
  "was",
  "were",
  "will",
  "should",
  "could",
  "would",
  "might",
  "may",
];

// Off-topic patterns that should be rejected
export const OFF_TOPIC_PATTERNS = [
  /\b(weather|sports|entertainment|politics|personal|relationship)\b/i,
  /\b(cook|recipe|food|travel|vacation|movie|music|game|gaming)\b/i,
  /\b(homework|assignment|quiz|test|exam)\b/i, // Unless specifically about course content
  /\b(help.*with.*code|programming|software|app|website)\b/i,
  /\b(medical|health|doctor|symptom|disease|medicine)\b/i,
  /\b(legal|law|court|lawyer|attorney)\b/i,
  /\b(financial.*advice|investment|trading|stock|crypto)\b/i,
  /\b(relationship.*advice|dating|marriage|counseling)\b/i,
];

// Educational question patterns that should always be allowed
export const EDUCATIONAL_PATTERNS = [
  /can you explain/i,
  /can you provide examples/i,
  /what are the key takeaways/i,
  /can you summarize/i,
  /what is the summary/i,
  /can you help me understand/i,
  /what does this mean/i,
  /how does this work/i,
  /what is the difference/i,
  /can you clarify/i,
  /what are the main points/i,
  /can you give me an overview/i,
  /what should i know/i,
  /what is important/i,
  /can you break this down/i,
  /how do i/i,
  /what do i need to know/i,
  /can you help me with/i,
  /i don't understand/i,
  /i'm confused about/i,
  /can you elaborate/i,
  /what does this concept mean/i,
];

// Stop words for text processing
export const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "that",
  "the",
  "to",
  "was",
  "will",
  "with",
  "this",
  "these",
  "they",
  "them",
  "their",
  "there",
  "then",
  "than",
  "but",
  "or",
  "so",
  "if",
  "when",
  "where",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "can",
  "could",
  "should",
  "would",
  "may",
  "might",
  "must",
  "shall",
  "will",
  "do",
  "does",
  "did",
  "have",
  "has",
  "had",
  "been",
  "being",
  "am",
  "is",
  "are",
  "was",
  "were",
]);

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message: string;
}

export const RATE_LIMIT_CONFIGS = {
  perMinute: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: DEFAULT_GUARDRAILS_CONFIG.security.maxRequestsPerMinute,
    message: DEFAULT_GUARDRAILS_CONFIG.responseTemplates.rateLimited,
  },
  perHour: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: DEFAULT_GUARDRAILS_CONFIG.security.maxRequestsPerHour,
    message:
      "You've exceeded the hourly limit for AI chat requests. Please try again later.",
  },
};

// Security validation functions
export function validateOrigin(
  origin: string | null,
  config: GuardRailsConfig
): boolean {
  if (!config.security.requireValidOrigin) {
    return true; // Skip origin validation in development
  }

  if (!origin) {
    return false; // No origin header
  }

  return config.security.allowedOrigins.some(
    (allowedOrigin) =>
      origin === allowedOrigin || origin.endsWith(allowedOrigin)
  );
}

export function validateUserAgent(userAgent: string | null): boolean {
  if (!userAgent) {
    return false; // No user agent
  }

  // Basic bot detection - reject common bot user agents
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /postman/i,
    /insomnia/i,
    /httpie/i,
    /axios/i,
    /fetch/i,
  ];

  return !botPatterns.some((pattern) => pattern.test(userAgent));
}

// Request validation interface
export interface RequestValidation {
  isValid: boolean;
  error?: string;
  statusCode?: number;
}

// Validate incoming request
export function validateRequest(
  request: Request,
  config: GuardRailsConfig = DEFAULT_GUARDRAILS_CONFIG
): RequestValidation {
  const origin = request.headers.get("origin");
  const userAgent = request.headers.get("user-agent");
  const referer = request.headers.get("referer");

  // Check origin
  if (!validateOrigin(origin, config)) {
    return {
      isValid: false,
      error: "Invalid request origin",
      statusCode: 403,
    };
  }

  // Check user agent
  if (!validateUserAgent(userAgent)) {
    return {
      isValid: false,
      error: "Invalid user agent",
      statusCode: 403,
    };
  }

  // Check referer (additional security layer)
  if (config.security.requireValidOrigin && referer) {
    const refererUrl = new URL(referer);
    const isValidReferer = config.security.allowedOrigins.some(
      (allowedOrigin) => {
        try {
          const allowedUrl = new URL(allowedOrigin);
          return refererUrl.origin === allowedUrl.origin;
        } catch {
          return refererUrl.origin === allowedOrigin;
        }
      }
    );

    if (!isValidReferer) {
      return {
        isValid: false,
        error: "Invalid referer",
        statusCode: 403,
      };
    }
  }

  return { isValid: true };
}

// Export all validation constants and functions
export { DEFAULT_GUARDRAILS_CONFIG as defaultConfig };
