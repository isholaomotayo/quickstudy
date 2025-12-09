// Browser-compatible text processing without natural.js
// import natural from "natural";
import compromise from "compromise";
import {
  DEFAULT_GUARDRAILS_CONFIG,
  ACADEMIC_TERMS,
  QUESTION_PATTERNS,
  QUESTION_WORDS,
  OFF_TOPIC_PATTERNS,
  EDUCATIONAL_PATTERNS,
  STOP_WORDS,
  type GuardRailsConfig as SharedGuardRailsConfig,
} from "./guardrails-config";

// ====================
// 1. COURSE CONTENT EXTRACTOR
// ====================

export interface CourseContent {
  courseKeywords: string[];
  courseConcepts: string[];
  courseTopics: string[];
  courseEntities: {
    people: string[];
    places: string[];
    organizations: string[];
    concepts: string[];
  };
}

export const extractCourseContent = (courseDocument: string): CourseContent => {
  return {
    courseKeywords: extractKeywords(courseDocument),
    courseConcepts: extractConcepts(courseDocument),
    courseTopics: extractTopics(courseDocument),
    courseEntities: extractEntities(courseDocument),
  };
};

// Use shared stop words from config
const stopWords = STOP_WORDS;

// Simple tokenizer for browser
const tokenize = (text: string): string[] => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0);
};

// Simple stemmer for browser
const stem = (word: string): string => {
  // Basic stemming - remove common suffixes
  if (word.endsWith("ing")) return word.slice(0, -3);
  if (word.endsWith("ed")) return word.slice(0, -2);
  if (word.endsWith("er")) return word.slice(0, -2);
  if (word.endsWith("est")) return word.slice(0, -3);
  if (word.endsWith("ly")) return word.slice(0, -2);
  if (word.endsWith("s") && word.length > 3) return word.slice(0, -1);
  return word;
};

const extractKeywords = (document: string): string[] => {
  const text = document.toLowerCase();

  // Use shared academic terms from config
  const academicTerms = ACADEMIC_TERMS;

  // Extract domain-specific terms from the document
  const words = tokenize(text);

  const documentTerms = words
    .filter((word) => word.length > 3)
    .filter((word) => !stopWords.has(word))
    .reduce((freq, word) => {
      freq[word] = (freq[word] || 0) + 1;
      return freq;
    }, {} as Record<string, number>);

  // Get most frequent domain terms
  const frequentTerms = Object.entries(documentTerms)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 50)
    .map(([word]) => word);

  return [...new Set([...academicTerms, ...frequentTerms])];
};

const extractConcepts = (document: string): string[] => {
  const doc = compromise(document);

  // Extract noun phrases that likely represent concepts
  const concepts = [
    ...doc.match("#Noun+ #Noun").out("array"),
    ...doc.match("#Adjective #Noun").out("array"),
    ...doc.topics().out("array"),
  ];

  return [...new Set(concepts.map((c) => c.toLowerCase()))];
};

const extractTopics = (document: string): string[] => {
  // Predefined research methodology topics
  const researchTopics = [
    "research design",
    "data collection",
    "ethical considerations",
    "literature review",
    "hypothesis testing",
    "sampling methods",
    "statistical analysis",
    "research proposal",
    "research report",
    "validity and reliability",
    "research problems",
    "research questions",
  ];

  // Extract chapter/section titles from document
  const sectionPattern =
    /(?:chapter|section|unit|lesson)\s*\d*:?\s*(.+?)(?:\n|$)/gi;
  const matches = document.match(sectionPattern) || [];
  const extractedTopics = matches.map((match) =>
    match
      .replace(/(?:chapter|section|unit|lesson)\s*\d*:?\s*/i, "")
      .trim()
      .toLowerCase()
  );

  return [...new Set([...researchTopics, ...extractedTopics])];
};

const extractEntities = (document: string) => {
  const doc = compromise(document);

  return {
    people: doc.people().out("array"),
    places: doc.places().out("array"),
    organizations: doc.organizations().out("array"),
    concepts: doc.topics().out("array"),
  };
};

// ====================
// 2. QUESTION CLASSIFIER
// ====================

export interface QuestionClassification {
  isQuestion: boolean;
  categories: string[];
  isOffTopic: boolean;
}

// Use shared patterns from config
const questionPatterns = QUESTION_PATTERNS;
const questionWords = QUESTION_WORDS;
const offTopicPatterns = OFF_TOPIC_PATTERNS;

export const classifyQuestion = (text: string): QuestionClassification => {
  const doc = compromise(text);
  const hasQuestionWord = questionWords.some((word) =>
    text.toLowerCase().includes(word)
  );
  const hasQuestionMark = text.includes("?");
  const isImperative = doc.sentences().first().has("#Imperative");

  const isQuestion = hasQuestionWord || hasQuestionMark || isImperative;

  const categories: string[] = [];
  for (const [category, pattern] of Object.entries(questionPatterns)) {
    if (pattern.test(text)) {
      categories.push(category);
    }
  }

  const isOffTopic = offTopicPatterns.some((pattern) => pattern.test(text));

  return {
    isQuestion,
    categories,
    isOffTopic,
  };
};

// ====================
// 3. SEMANTIC SIMILARITY CHECKER
// ====================

export interface SimilarityResult {
  score: number;
  matches: string[];
  totalWords?: number;
}

export const calculateKeywordSimilarity = (
  questionText: string,
  courseKeywords: string[]
): SimilarityResult => {
  const questionWords = tokenize(questionText.toLowerCase()).map((word) =>
    stem(word)
  );

  const courseWordsSet = new Set(courseKeywords.map((word) => stem(word)));

  const matches = questionWords.filter((word) => courseWordsSet.has(word));

  // More lenient scoring: if we have any matches, give a decent score
  // Also boost score for educational terms even if not in course keywords
  const educationalTerms = [
    "explain",
    "example",
    "summary",
    "key",
    "takeaway",
    "concept",
    "help",
    "understand",
  ];
  const hasEducationalTerms = questionWords.some((word) =>
    educationalTerms.includes(word)
  );

  let score = matches.length / Math.max(questionWords.length, 1);

  // Boost score if question contains educational terms
  if (hasEducationalTerms) {
    score = Math.max(score, 0.3); // Minimum 30% score for educational questions
  }

  // If we have any course-related matches, ensure minimum score
  if (matches.length > 0) {
    score = Math.max(score, 0.2); // Minimum 20% score for any course matches
  }

  return {
    score: Math.min(score, 1.0), // Cap at 100%
    matches: matches,
    totalWords: questionWords.length,
  };
};

export const calculateConceptSimilarity = (
  questionText: string,
  courseConcepts: string[]
): SimilarityResult => {
  const text = questionText.toLowerCase();
  const matchedConcepts = courseConcepts.filter(
    (concept) => text.includes(concept) || fuzzyMatch(text, concept)
  );

  // More lenient scoring for concepts
  // If we have any concept matches, give a decent score
  let score = matchedConcepts.length / Math.max(courseConcepts.length * 0.1, 1);

  // If we have any matches, ensure minimum score
  if (matchedConcepts.length > 0) {
    score = Math.max(score, 0.2); // Minimum 20% score for any concept matches
  }

  return {
    score: Math.min(score, 1.0), // Cap at 100%
    matches: matchedConcepts,
  };
};

export const calculateTopicSimilarity = (
  questionText: string,
  courseTopics: string[]
): SimilarityResult => {
  const text = questionText.toLowerCase();
  const matchedTopics = courseTopics.filter(
    (topic) => text.includes(topic) || fuzzyMatch(text, topic)
  );

  // More lenient scoring: give partial credit for partial matches
  let score = 0;
  if (matchedTopics.length > 0) {
    score = 1.0; // Full score for any topic match
  } else {
    // Check for partial topic matches (individual words from topics)
    const topicWords = courseTopics.flatMap((topic) => topic.split(" "));
    const matchedTopicWords = topicWords.filter(
      (word) => word.length > 3 && text.includes(word.toLowerCase())
    );

    if (matchedTopicWords.length > 0) {
      score = 0.5; // Partial score for topic word matches
    }
  }

  return {
    score: score,
    matches: matchedTopics,
  };
};

// Simple string similarity function for browser
const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

// Levenshtein distance implementation
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
};

const fuzzyMatch = (
  text: string,
  pattern: string,
  threshold = 0.5 // Lowered from 0.7 to 0.5 for more lenient matching
): boolean => {
  const similarity = calculateSimilarity(text, pattern);
  return similarity >= threshold;
};

// ====================
// 4. CONTEXT VALIDATOR
// ====================

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  reasons: string[];
  suggestions: string[];
  analysis: {
    keywordSimilarity: SimilarityResult;
    conceptSimilarity: SimilarityResult;
    topicSimilarity: SimilarityResult;
    questionCategories: string[];
  };
}

export interface ValidationThresholds {
  keywordSimilarity: number;
  conceptSimilarity: number;
  topicSimilarity: number;
  minimumRelevanceScore: number;
}

// Use shared thresholds from config
const defaultThresholds: ValidationThresholds =
  DEFAULT_GUARDRAILS_CONFIG.thresholds;

export const validateQuestion = (
  questionText: string,
  courseContent: CourseContent,
  thresholds: ValidationThresholds = defaultThresholds
): ValidationResult => {
  const validation: ValidationResult = {
    isValid: false,
    confidence: 0,
    reasons: [],
    suggestions: [],
    analysis: {
      keywordSimilarity: { score: 0, matches: [] },
      conceptSimilarity: { score: 0, matches: [] },
      topicSimilarity: { score: 0, matches: [] },
      questionCategories: [],
    },
  };

  // Step 1: Check if it's actually a question
  const classification = classifyQuestion(questionText);
  if (!classification.isQuestion) {
    validation.reasons.push("Input does not appear to be a question");
    validation.suggestions.push(
      "Please phrase your input as a question about research methodology"
    );
    return validation;
  }

  // Step 1.5: Check for common educational question patterns that should always be allowed
  const educationalPatterns = EDUCATIONAL_PATTERNS;

  const isEducationalQuestion = educationalPatterns.some((pattern) =>
    pattern.test(questionText)
  );
  if (isEducationalQuestion) {
    validation.isValid = true;
    validation.confidence = 0.8; // High confidence for educational questions
    validation.reasons.push("Question appears to be educational and relevant");
    return validation;
  }

  // Step 2: Check for off-topic content
  if (classification.isOffTopic) {
    validation.reasons.push("Question appears to be off-topic");
    validation.suggestions.push(
      "Please ask questions related to research methodology, ethics, or data collection"
    );
    return validation;
  }

  // Step 3: Calculate semantic similarities
  const keywordSim = calculateKeywordSimilarity(
    questionText,
    courseContent.courseKeywords
  );
  const conceptSim = calculateConceptSimilarity(
    questionText,
    courseContent.courseConcepts
  );
  const topicSim = calculateTopicSimilarity(
    questionText,
    courseContent.courseTopics
  );

  validation.analysis = {
    keywordSimilarity: keywordSim,
    conceptSimilarity: conceptSim,
    topicSimilarity: topicSim,
    questionCategories: classification.categories,
  };

  // Step 4: Calculate overall relevance score
  const relevanceScore =
    keywordSim.score * 0.4 + conceptSim.score * 0.3 + topicSim.score * 0.3;

  validation.confidence = relevanceScore;

  // Step 5: Make validation decision
  if (relevanceScore >= thresholds.minimumRelevanceScore) {
    validation.isValid = true;
    validation.reasons.push("Question is relevant to the course content");
  } else {
    validation.isValid = false;
    validation.reasons.push(
      `Question relevance score (${relevanceScore.toFixed(2)}) below threshold`
    );

    // Provide helpful suggestions
    if (keywordSim.score < thresholds.keywordSimilarity) {
      validation.suggestions.push(
        `Try using course-related terms like: ${courseContent.courseKeywords
          .slice(0, 5)
          .join(", ")}`
      );
    }

    if (topicSim.score === 0) {
      validation.suggestions.push(
        `Consider asking about topics like: ${courseContent.courseTopics
          .slice(0, 3)
          .join(", ")}`
      );
    }
  }

  return validation;
};

// Method to check if question is within specific lesson scope
export const validateForLesson = (
  questionText: string,
  lessonContent: string
): {
  isLessonSpecific: boolean;
  lessonRelevance: number;
  matchedContent: {
    keywords: string[];
    topics: string[];
  };
} => {
  const lessonContentExtracted = extractCourseContent(lessonContent);

  const lessonKeywordSim = calculateKeywordSimilarity(
    questionText,
    lessonContentExtracted.courseKeywords
  );
  const lessonTopicSim = calculateTopicSimilarity(
    questionText,
    lessonContentExtracted.courseTopics
  );

  const lessonRelevance =
    lessonKeywordSim.score * 0.6 + lessonTopicSim.score * 0.4;

  return {
    isLessonSpecific: lessonRelevance > 0.3,
    lessonRelevance: lessonRelevance,
    matchedContent: {
      keywords: lessonKeywordSim.matches,
      topics: lessonTopicSim.matches,
    },
  };
};

// ====================
// 5. GUARD RAILS SYSTEM
// ====================

export interface GuardRailsOptions {
  strictMode?: boolean;
  debugMode?: boolean;
  thresholds?: ValidationThresholds;
}

export interface GuardRailsResult {
  allowed: boolean;
  response: string | null;
  confidence: number;
  debugInfo?: ValidationResult;
}

export interface GuardRailsConfig {
  courseContent: CourseContent;
  options: GuardRailsOptions;
  responseTemplates: {
    offTopic: string;
    notAQuestion: string;
    lowRelevance: string;
    needsSpecificity: string;
  };
}

// Use shared response templates from config
const createResponseTemplates = () =>
  DEFAULT_GUARDRAILS_CONFIG.responseTemplates;

export const createGuardRails = (
  courseDocument: string,
  options: GuardRailsOptions = {}
): GuardRailsConfig => {
  const courseContent = extractCourseContent(courseDocument);

  return {
    courseContent,
    options: {
      strictMode: false,
      debugMode: false,
      thresholds: options.thresholds || defaultThresholds,
      ...options,
    },
    responseTemplates: createResponseTemplates(),
  };
};

export const checkQuestion = (
  questionText: string,
  config: GuardRailsConfig,
  lessonContent: string | null = null
): GuardRailsResult => {
  const result: GuardRailsResult = {
    allowed: false,
    response: null,
    confidence: 0,
    debugInfo: undefined,
  };

  // Validate against course content
  const validation = validateQuestion(
    questionText,
    config.courseContent,
    config.options.thresholds
  );
  result.confidence = validation.confidence;

  if (config.options.debugMode) {
    result.debugInfo = validation;
  }

  // Check if question passes validation
  if (validation.isValid) {
    // If lesson content provided, do additional lesson-specific validation
    if (lessonContent) {
      const lessonValidation = validateForLesson(questionText, lessonContent);

      if (config.options.strictMode && !lessonValidation.isLessonSpecific) {
        result.allowed = false;
        result.response =
          config.responseTemplates.needsSpecificity +
          ` This lesson focuses on: ${
            lessonValidation.matchedContent.topics.join(", ") ||
            "research fundamentals"
          }.`;
      } else {
        result.allowed = true;
      }
    } else {
      result.allowed = true;
    }
  } else {
    result.allowed = false;

    // Generate appropriate response based on validation reasons
    if (validation.reasons.includes("Input does not appear to be a question")) {
      result.response = config.responseTemplates.notAQuestion;
    } else if (
      validation.reasons.includes("Question appears to be off-topic")
    ) {
      result.response = config.responseTemplates.offTopic;
    } else {
      result.response = config.responseTemplates.lowRelevance;

      if (validation.suggestions.length > 0) {
        result.response +=
          "\n\nSuggestions: " + validation.suggestions.join(" ");
      }
    }
  }

  return result;
};

// Batch validation for multiple questions
export const checkQuestions = (
  questions: string[],
  config: GuardRailsConfig,
  lessonContent: string | null = null
) => {
  return questions.map((q) => ({
    question: q,
    result: checkQuestion(q, config, lessonContent),
  }));
};

// Get statistics about validation patterns
export const getValidationStats = (
  questions: string[],
  config: GuardRailsConfig
) => {
  const results = checkQuestions(questions, config);

  return {
    totalQuestions: results.length,
    allowedQuestions: results.filter((r) => r.result.allowed).length,
    averageConfidence:
      results.reduce((sum, r) => sum + r.result.confidence, 0) / results.length,
    commonReasons: getCommonReasons(results.filter((r) => !r.result.allowed)),
  };
};

const getCommonReasons = (
  rejectedResults: Array<{ result: GuardRailsResult }>
) => {
  const reasons: Record<string, number> = {};
  rejectedResults.forEach((r) => {
    if (r.result.debugInfo) {
      r.result.debugInfo.reasons.forEach((reason) => {
        reasons[reason] = (reasons[reason] || 0) + 1;
      });
    }
  });
  return reasons;
};

// ====================
// 6. UTILITY FUNCTIONS
// ====================

export const createCourseDocument = (
  courseData: any,
  currentLesson: any
): string => {
  const lessonContent = currentLesson?.content || "";
  const moduleContent = courseData?.description || "";
  const courseName = courseData?.name || "Course";

  return `
    ${courseName}: ${currentLesson?.name || "Current Lesson"}
    
    ${moduleContent}
    
    ${lessonContent}
    
    Topics include: research design, data collection, hypothesis testing,
    ethical considerations, literature review, sampling methods, statistical analysis,
    research proposals, research reports, validity and reliability.
  `;
};

export const updateThresholds = (
  config: GuardRailsConfig,
  newThresholds: Partial<ValidationThresholds>
): GuardRailsConfig => {
  return {
    ...config,
    options: {
      ...config.options,
      thresholds: {
        ...config.options.thresholds!,
        ...newThresholds,
      },
    },
  };
};
