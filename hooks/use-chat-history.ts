import useSWR, { mutate } from "swr";
import { useState, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: number;
}

interface Conversation {
  id: string;
  userPrompt: string;
  aiResponse: string;
  timestamp: number;
  lessonId?: number;
  moduleId?: number;
}

interface ChatHistoryData {
  conversations: Conversation[];
  totalCount: number;
}

// SWR fetcher function
const chatHistoryFetcher = async (url: string): Promise<ChatHistoryData> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch chat history: ${response.status}`);
  }
  return response.json();
};

// Convert conversations to messages format
const conversationsToMessages = (conversations: Conversation[]): Message[] => {
  const messages: Message[] = [];
  conversations.forEach((conv) => {
    // Only add user message if it has content
    if (conv.userPrompt && conv.userPrompt.trim().length > 0) {
      messages.push({
        id: `user-${conv.timestamp}`,
        role: "user",
        content: conv.userPrompt,
        timestamp: conv.timestamp,
      });
    }

    // Only add assistant message if it has content
    if (conv.aiResponse && conv.aiResponse.trim().length > 0) {
      messages.push({
        id: `assistant-${conv.timestamp}`,
        role: "assistant",
        content: conv.aiResponse,
        timestamp: conv.timestamp + 1, // Assistant message slightly after user
      });
    }
  });
  return messages;
};

export function useChatHistory(
  userId: string | number | null,
  lessonId: number | null,
  moduleId: number | null,
  options: {
    enabled?: boolean;
    refreshInterval?: number;
    revalidateOnFocus?: boolean;
  } = {}
) {
  const {
    enabled = true,
    refreshInterval = 0, // No auto-refresh by default
    revalidateOnFocus = false,
  } = options;

  // Build cache key
  const cacheKey =
    userId && (lessonId || moduleId)
      ? `/api/ai-chat?userId=${userId}&lessonId=${lessonId || ""}&moduleId=${
          moduleId || ""
        }`
      : null;

  // SWR hook for data fetching
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR<ChatHistoryData>(
    enabled && cacheKey ? cacheKey : null,
    chatHistoryFetcher,
    {
      refreshInterval,
      revalidateOnFocus,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // 10 seconds deduplication
      errorRetryCount: 2,
      errorRetryInterval: 1000,
    }
  );

  // Convert to messages format
  const messages: Message[] = data
    ? conversationsToMessages(data.conversations)
    : [];
  const isHistoryLoading = isLoading;
  const historyError = error;

  // Optimistic update for new messages
  const addOptimisticMessage = useCallback(
    (message: Message) => {
      if (
        !cacheKey ||
        !message.content ||
        message.content.trim().length === 0
      ) {
        console.log("Skipping empty message:", message);
        return;
      }

      // Optimistically update the cache
      mutate(
        cacheKey,
        (currentData: ChatHistoryData | undefined) => {
          if (!currentData) return currentData;

          // Convert the new message to conversation format
          const newConversation: Conversation = {
            id: message.id,
            userPrompt: message.role === "user" ? message.content : "",
            aiResponse: message.role === "assistant" ? message.content : "",
            timestamp: message.timestamp || Date.now(),
            lessonId: lessonId || undefined,
            moduleId: moduleId || undefined,
          };

          return {
            ...currentData,
            conversations: [...currentData.conversations, newConversation],
            totalCount: currentData.totalCount + 1,
          };
        },
        false
      ); // Don't revalidate immediately
    },
    [cacheKey, lessonId, moduleId]
  );

  // Update the latest AI response (for streaming)
  const updateLatestAiResponse = useCallback(
    (content: string) => {
      if (!cacheKey || !content || content.trim().length === 0) {
        console.log("Skipping empty content update:", content);
        return;
      }

      mutate(
        cacheKey,
        (currentData: ChatHistoryData | undefined) => {
          if (!currentData || currentData.conversations.length === 0)
            return currentData;

          const updatedConversations = [...currentData.conversations];
          const lastConversation =
            updatedConversations[updatedConversations.length - 1];

          if (lastConversation) {
            updatedConversations[updatedConversations.length - 1] = {
              ...lastConversation,
              aiResponse: content,
            };
          }

          return {
            ...currentData,
            conversations: updatedConversations,
          };
        },
        false
      );
    },
    [cacheKey]
  );

  // Clear history
  const clearCachedHistory = useCallback(async () => {
    if (!userId || !cacheKey) return;

    try {
      const response = await fetch("/api/ai-chat", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId.toString(),
          lessonId: lessonId || null,
          moduleId: moduleId || null,
        }),
      });

      if (response.ok) {
        // Clear the cache
        mutate(cacheKey, undefined);
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  }, [userId, lessonId, moduleId, cacheKey]);

  // Preload history for a specific context
  const preloadHistory = useCallback(
    (
      targetUserId: string | number,
      targetLessonId?: number,
      targetModuleId?: number
    ) => {
      const preloadKey = `/api/ai-chat?userId=${targetUserId}&lessonId=${
        targetLessonId || ""
      }&moduleId=${targetModuleId || ""}`;

      // Prefetch the data
      mutate(preloadKey, chatHistoryFetcher(preloadKey));
    },
    []
  );

  return {
    messages,
    isHistoryLoading,
    historyError,
    addOptimisticMessage,
    updateLatestAiResponse,
    clearCachedHistory,
    preloadHistory,
    revalidate,
    // Raw data access
    conversations: data?.conversations || [],
    totalCount: data?.totalCount || 0,
  };
}
