"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Send,
  Sparkles,
  MessageSquare,
  Lightbulb,
  BookOpen,
  Trash2,
  StopCircle,
  RefreshCw,
} from "lucide-react";
import { useAIChat } from "./hooks/use-ai-chat";
import { useGuardrailsPreload } from "@/hooks/use-guardrails-preload";
import {
  createGuardRails,
  createCourseDocument,
  type GuardRailsConfig,
} from "@/lib/guardrails";

// Utility function to format timestamps
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) {
    return "Just now";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) {
    // 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else {
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }
};

interface CourseModule {
  id: number;
  name: string;
  description?: string;
  course_id: number;
  course_lessons?: CourseLesson[];
  order?: number;
  published?: boolean;
}

interface CourseLesson {
  id: number;
  name: string;
  description?: string;
  content: string;
  order?: number;
}

interface AIAssistantV2Props {
  courseData: CourseModule;
  currentLesson: CourseLesson | null;
  selectedText: string;
  initialPrompt?: string;
  onClose: () => void;
  student?: {
    id: number | string;
    name?: string;
    role?: string;
  };
  currentModuleId?: number;
  currentLessonId?: number;
  preloadedConversations?: any[];
  enableGuardrails?: boolean;
}

export default function AIAssistantV2({
  courseData,
  currentLesson,
  selectedText,
  initialPrompt,
  onClose,
  student,
  currentModuleId,
  currentLessonId,
  preloadedConversations,
  enableGuardrails = true,
}: AIAssistantV2Props) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Explain this concept in simple terms",
    "What are the key takeaways?",
    "Can you provide examples?",
  ];

  // Auto-scroll function to keep the latest message in view
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  // Get preloaded guardrails configuration
  const { getCachedGuardrails, preloadGuardrails } = useGuardrailsPreload();
  const guardrailsConfig = React.useMemo(() => {
    if (!enableGuardrails) return undefined;
    return getCachedGuardrails(courseData, currentLesson);
  }, [enableGuardrails, courseData, currentLesson, getCachedGuardrails]);

  // Preload guardrails when component mounts or lesson changes
  useEffect(() => {
    if (enableGuardrails && courseData && currentLesson) {
      const cached = getCachedGuardrails(courseData, currentLesson);
      if (!cached) {
        console.log("Preloading guardrails for lesson:", currentLesson.id);
        preloadGuardrails(courseData, currentLesson).catch((error) => {
          console.warn("Failed to preload guardrails:", error);
        });
      }
    }
  }, [
    enableGuardrails,
    courseData,
    currentLesson,
    getCachedGuardrails,
    preloadGuardrails,
  ]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    isStreaming,
    error: chatError,
    sendMessage,
    clearHistory,
    loadConversationHistory,
    stop,
    reload,
  } = useAIChat({
    courseData,
    currentLesson,
    student,
    currentModuleId,
    currentLessonId,
    preloadedConversations,
    enableGuardrails,
    guardrailsConfig,
    onError: (error) => {
      setError(error.message);
    },
  });

  // Auto-scroll when messages change or when streaming
  useEffect(() => {
    if (isStreaming || messages.length > 0) {
      // Small delay to ensure DOM is updated
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [messages, isStreaming]);

  // Load conversation history on mount or when lesson changes
  useEffect(() => {
    if (student?.id && currentLessonId) {
      loadConversationHistory();
    }
  }, [currentLessonId, student?.id, loadConversationHistory]);

  // Prefill input when there's selected text or initial prompt (only once)
  useEffect(() => {
    if (initialPrompt) {
      setInputValue(initialPrompt);
    } else if (selectedText) {
      setInputValue(`Can you explain this part: "${selectedText}"`);
    }
  }, [selectedText, initialPrompt]);

  // Clear error when chat error changes
  useEffect(() => {
    if (chatError) {
      // Check if it's a guardrails error with specific message
      if ((chatError as any).type === "guardrails") {
        setError(chatError.message);
      } else {
        setError(chatError.message);
      }
    } else {
      setError(null);
    }
  }, [chatError]);

  const handleQuickPrompt = (prompt: string) => {
    let finalPrompt = prompt;

    if (selectedText) {
      finalPrompt = `${prompt} regarding: "${selectedText}"`;
    }

    sendMessage(finalPrompt);
    setInputValue("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  const renderMarkdown = (content: string): string => {
    const lines = content.split("\n");
    let html = "";
    let inList = false;
    let listType = "";

    const processInlineMarkdown = (text: string): string => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        .replace(
          /`([^`]+)`/g,
          '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>'
        );
    };

    lines.forEach((line, i) => {
      const trimmedLine = line.trim();

      // Handle horizontal rules
      if (trimmedLine === "---" || trimmedLine === "***") {
        if (inList) {
          html += listType === "ol" ? "</ol>" : "</ul>";
          inList = false;
        }
        html += '<hr class="my-4 border-t border-gray-200">';
        return;
      }

      // Handle headings
      if (trimmedLine.startsWith("### ")) {
        if (inList) {
          html += listType === "ol" ? "</ol>" : "</ul>";
          inList = false;
        }
        html += `<h3 class="text-lg font-semibold mb-2 mt-4">${processInlineMarkdown(
          trimmedLine.slice(4)
        )}</h3>`;
        return;
      }
      if (trimmedLine.startsWith("## ")) {
        if (inList) {
          html += listType === "ol" ? "</ol>" : "</ul>";
          inList = false;
        }
        html += `<h2 class="text-xl font-bold mb-3 mt-4">${processInlineMarkdown(
          trimmedLine.slice(3)
        )}</h2>`;
        return;
      }
      if (trimmedLine.startsWith("# ")) {
        if (inList) {
          html += listType === "ol" ? "</ol>" : "</ul>";
          inList = false;
        }
        html += `<h1 class="text-2xl font-bold mb-4 mt-4">${processInlineMarkdown(
          trimmedLine.slice(2)
        )}</h1>`;
        return;
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(trimmedLine)) {
        if (!inList || listType !== "ol") {
          if (inList) {
            html += listType === "ol" ? "</ol>" : "</ul>";
          }
          html += '<ol class="list-decimal ml-6 mb-2">';
          inList = true;
          listType = "ol";
        }
        html += `<li class="mb-1">${processInlineMarkdown(
          trimmedLine.replace(/^\d+\.\s/, "")
        )}</li>`;
        return;
      }

      // Handle bullet lists
      if (
        trimmedLine.startsWith("- ") ||
        trimmedLine.startsWith("* ") ||
        trimmedLine.startsWith("• ")
      ) {
        if (!inList || listType !== "ul") {
          if (inList) {
            html += listType === "ol" ? "</ol>" : "</ul>";
          }
          html += '<ul class="list-disc ml-6 mb-2">';
          inList = true;
          listType = "ul";
        }
        html += `<li class="mb-1">${processInlineMarkdown(
          trimmedLine.slice(2)
        )}</li>`;
        return;
      }

      // Handle empty lines
      if (trimmedLine === "") {
        if (inList) {
          html += listType === "ol" ? "</ol>" : "</ul>";
          inList = false;
        }
        html += '<div class="h-2"></div>';
        return;
      }

      // Handle regular paragraphs
      if (inList) {
        html += listType === "ol" ? "</ol>" : "</ul>";
        inList = false;
      }
      html += `<p class="mb-2">${processInlineMarkdown(trimmedLine)}</p>`;
    });

    // Close any open list
    if (inList) {
      html += listType === "ol" ? "</ol>" : "</ul>";
    }

    return html;
  };

  const clearConversationHistory = async () => {
    await clearHistory();
    setError(null);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent size="lg" className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  Tutoris Learning Assistant
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  Ask questions, get explanations, and receive personalized help
                  with <strong> {courseData.name} </strong> using the best AI
                  technology
                </DialogDescription>
              </div>
            </div>
          </div>{" "}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearConversationHistory}
              disabled={
                messages.filter((m) => m.content && m.content.trim().length > 0)
                  .length === 0
              }
              className="text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear History
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Context Information */}
          <div className="flex-shrink-0 p-3 bg-gray-50 rounded-lg mb-3">
            <div className="flex items-start space-x-3">
              <BookOpen className="h-4 w-4 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-900">
                  Learning Context
                </p>
                <p className="text-xs text-gray-600">
                  I can help you with: <strong>{courseData.name}</strong>
                  {currentLesson && ` • Current lesson: ${currentLesson.name}`}
                </p>
                {selectedText && (
                  <div className="mt-1 p-1.5 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs font-medium text-blue-900 mb-0.5">
                      Selected Text:
                    </p>
                    <p className="text-xs text-blue-800 line-clamp-1">
                      {selectedText}
                    </p>
                  </div>
                )}
                {/* Debug info for guardrails */}
                {process.env.NODE_ENV === "development" && (
                  <div className="mt-1 p-1.5 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-xs font-medium text-yellow-900 mb-0.5">
                      Debug: Guardrails Status
                    </p>
                    <p className="text-xs text-yellow-800">
                      Enabled: {enableGuardrails ? "Yes" : "No"} • Config:{" "}
                      {guardrailsConfig ? "Loaded" : "Missing"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="flex-shrink-0 mb-3">
            <p className="text-xs font-medium text-gray-600 mb-1">
              Quick Questions:
            </p>
            <div className="flex flex-wrap gap-1">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPrompt(prompt)}
                  disabled={isLoading}
                  className="text-xs h-7 px-2"
                >
                  <Lightbulb className="h-2.5 w-2.5 mr-1" />
                  {prompt}
                </Button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto space-y-4 mb-4"
          >
            {(() => {
              // Filter out empty messages to prevent "Just now" timestamps from empty content
              const filteredMessages = messages.filter(
                (message) =>
                  message.content && message.content.trim().length > 0
              );

              return filteredMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    I'm here to help! Ask me questions about the lesson content,
                    request explanations, or get help with difficult concepts.
                  </p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <Card
                      className={`max-w-[80%] ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white"
                      }`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start space-x-2">
                          {message.role === "assistant" && (
                            <Sparkles className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div
                              className={`text-sm ${
                                message.role === "user"
                                  ? "text-white"
                                  : "text-gray-900"
                              } ${
                                message.role === "assistant"
                                  ? "prose prose-sm max-w-none"
                                  : ""
                              }`}
                              dangerouslySetInnerHTML={{
                                __html:
                                  message.role === "assistant"
                                    ? renderMarkdown(message.content)
                                    : message.content,
                              }}
                            />

                            {/* Timestamp */}
                            {message.timestamp && (
                              <div
                                className={`text-xs mt-2 ${
                                  message.role === "user"
                                    ? "text-blue-100"
                                    : "text-gray-500"
                                }`}
                              >
                                {formatTimestamp(message.timestamp)}
                              </div>
                            )}

                            {/* Show typing indicator for streaming messages */}
                            {message.role === "assistant" &&
                              isStreaming &&
                              filteredMessages.indexOf(message) ===
                                filteredMessages.length - 1 &&
                              message.content && (
                                <div className="flex items-center space-x-1 mt-2">
                                  <div className="w-1 h-1 bg-purple-600 rounded-full animate-pulse"></div>
                                  <div
                                    className="w-1 h-1 bg-purple-600 rounded-full animate-pulse"
                                    style={{ animationDelay: "0.2s" }}
                                  ></div>
                                  <div
                                    className="w-1 h-1 bg-purple-600 rounded-full animate-pulse"
                                    style={{ animationDelay: "0.4s" }}
                                  ></div>
                                  <span className="text-xs text-purple-600 ml-2">
                                    typing...
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))
              );
            })()}

            {isLoading && (
              <div className="flex justify-start">
                <Card className="bg-white border-purple-200 border-2">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-purple-600 animate-spin" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
                        <div
                          className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                      <p className="text-sm text-purple-600 font-medium">
                        AI is responding...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Scroll anchor - invisible element to scroll to */}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex-shrink-0 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0">
                  <svg
                    className="h-4 w-4 text-red-500 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-red-700 font-medium mb-1">
                    {chatError && (chatError as any).type === "guardrails"
                      ? "Question Guidelines"
                      : "Error"}
                  </p>
                  <p className="text-sm text-red-600">{error}</p>
                  {chatError &&
                    (chatError as any).suggestions &&
                    (chatError as any).suggestions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-red-600 font-medium mb-1">
                          Suggestions:
                        </p>
                        <ul className="text-xs text-red-600 list-disc list-inside space-y-0.5">
                          {(chatError as any).suggestions.map(
                            (suggestion: string, index: number) => (
                              <li key={index}>{suggestion}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleFormSubmit} className="flex-shrink-0">
            <div className="flex space-x-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about this lesson..."
                className="flex-1 resize-none"
                rows={2}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleFormSubmit(e);
                  }
                }}
              />
              <div className="flex flex-col space-y-1">
                {/* Main action button - switches between Send and Stop */}
                {isLoading ? (
                  <Button
                    type="button"
                    onClick={stop}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <StopCircle className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}

                {/* Retry button - only show when not loading and has messages */}
                {!isLoading &&
                  messages.filter(
                    (m) => m.content && m.content.trim().length > 0
                  ).length > 0 && (
                    <Button
                      type="button"
                      onClick={reload}
                      variant="outline"
                      size="sm"
                      className="text-xs px-2"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  )}
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
