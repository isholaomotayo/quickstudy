import { useState, useEffect } from "react";

const AIAssistant = ({
  courseData,
  currentModuleId,
  currentLessonId,
  student,
  selectedText,
  onClose,
}) => {
  const [message, setMessage] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectionPopover, setSelectionPopover] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
  });

  // Extract current module and lesson from course data
  const getCurrentModule = () => {
    if (!courseData?.course_modules || !currentModuleId) return null;
    return courseData.course_modules.find((m) => m.id === currentModuleId);
  };

  const getCurrentLesson = () => {
    const module = getCurrentModule();
    if (!module?.course_lessons || !currentLessonId) return null;
    return module.course_lessons.find((l) => l.id === currentLessonId);
  };

  // Get related lessons in the same module (for context)
  const getRelatedLessons = () => {
    const module = getCurrentModule();
    if (!module?.course_lessons) return [];
    return module.course_lessons
      .filter((l) => l.id !== currentLessonId)
      .map((l) => ({ id: l.id, name: l.name, order: l.order }));
  };

  // Construct the lesson data object for the API
  const constructLessonData = () => {
    // courseData is actually a single module (courseModuleData)
    const moduleData = courseData;
    const allLessonsInModule = moduleData?.course_lessons || [];
    const currentLesson = getCurrentLesson();

    return {
      course: {
        id: moduleData?.course_id,
        name: "Course", // We don't have full course info, just the module
      },
      currentModule: {
        id: moduleData?.id,
        name: moduleData?.name,
        order: moduleData?.order,
        description: moduleData?.description,
        totalLessons: allLessonsInModule.length,
        published: moduleData?.published,
      },
      currentLesson: currentLesson
        ? {
            id: currentLesson.id,
            name: currentLesson.name,
            order: currentLesson.order,
            description: currentLesson.description,
            content: currentLesson.content,
            moduleName: moduleData?.name,
            moduleOrder: moduleData?.order,
          }
        : null,
      allLessonsInModule: allLessonsInModule.map((lesson) => ({
        id: lesson.id,
        name: lesson.name,
        order: lesson.order,
        description: lesson.description,
        // Only include content for current lesson to avoid sending too much data
        content: lesson.id === currentLessonId ? lesson.content : undefined,
      })),
      current_activity: {
        type: "lesson_study",
        progress: calculateProgress(),
        totalLessonsInModule: allLessonsInModule.length,
        currentLessonPosition: currentLesson
          ? allLessonsInModule.findIndex((l) => l.id === currentLesson.id) + 1
          : 0,
      },
    };
  };

  // Calculate progress based on lessons completed in module
  const calculateProgress = () => {
    const module = getCurrentModule();
    if (!module?.course_lessons) return 0;
    const currentLesson = getCurrentLesson();
    if (!currentLesson) return 0;
    const lessonIndex = module.course_lessons.findIndex(
      (l) => l.id === currentLessonId
    );
    const progress = ((lessonIndex + 1) / module.course_lessons.length) * 100;
    return Math.round(progress);
  };

  // Load conversation history on mount or when lesson changes
  useEffect(() => {
    if (currentLessonId && student?.id) {
      loadConversationHistory();
    }
  }, [currentLessonId, student?.id]);

  // Prefill input when there's selected text
  useEffect(() => {
    if (selectedText && !message) {
      setMessage(`Can you explain this part: "${selectedText}"`);
    }
  }, [selectedText]);

  const loadConversationHistory = async () => {
    if (!student?.id || !currentLessonId) return;
    try {
      const response = await fetch(
        `/api/ai-assistant?userId=${student.id}&lessonId=${currentLessonId}`,
        { method: "GET" }
      );
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error("Failed to load conversation history:", err);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !student?.id) return;
    setLoading(true);
    setError(null);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000); // 30 second timeout

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonData: constructLessonData(),
          userPrompt: message,
          userId: student.id,
          lessonId: currentLessonId || null,
          moduleId: currentModuleId || null,
          includeHistory: true,
          contextId: currentLessonId,
          contextType: "lesson",
        }),
        signal: controller.signal,
      });

      // Clear timeout if request completes
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }
      const data = await response.json();
      const newConversation = {
        userPrompt: message,
        aiResponse: data.aiResponse,
        timestamp: Date.now(),
      };
      setConversations([newConversation, ...conversations]);
      setMessage("");
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        setError(
          "The request timed out. Please try again with a shorter question or check your connection."
        );
      } else {
        setError("Sorry, I couldn't process your question. Please try again.");
      }
      console.error("AI Assistant error:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!student?.id) return;
    try {
      const response = await fetch("/api/ai-assistant", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: student.id,
          lessonId: currentLessonId || null,
        }),
      });
      if (response.ok) {
        setConversations([]);
      }
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const getSuggestedPrompts = () => {
    const lesson = getCurrentLesson();
    const module = getCurrentModule();
    if (!lesson) return [];
    const prompts = [
      `Can you explain the main concept in ${lesson.name}?`,
      `What are the key takeaways from this lesson?`,
      `Can you give me a real-world example of this concept?`,
      `I'm having trouble understanding this part...`,
    ];
    if (module?.name.toLowerCase().includes("finance")) {
      prompts.push("How does this relate to financial management?");
      prompts.push("Can you explain this with a practical business example?");
    }
    if (module?.name.toLowerCase().includes("banking")) {
      prompts.push("How is this concept applied in banking?");
      prompts.push("What are the regulatory considerations here?");
    }
    return prompts;
  };

  const renderAIResponse = (response) => {
    const lines = response.split("\n");
    const elements = [];
    let currentList = [];
    let listType = null; // 'ul' or 'ol'

    const processInlineMarkdown = (text) => {
      // Process **bold** text
      text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      // Process *italic* text
      text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
      // Process `code` text
      text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
      return text;
    };

    const flushList = () => {
      if (currentList.length > 0) {
        const ListComponent = listType === "ol" ? "ol" : "ul";
        elements.push(
          <ListComponent
            key={`list-${elements.length}`}
            style={{ margin: "12px 0", paddingLeft: "24px" }}
          >
            {currentList.map((item, idx) => (
              <li
                key={idx}
                dangerouslySetInnerHTML={{
                  __html: processInlineMarkdown(item),
                }}
              />
            ))}
          </ListComponent>
        );
        currentList = [];
        listType = null;
      }
    };

    lines.forEach((line, i) => {
      const trimmedLine = line.trim();

      // Handle horizontal rules
      if (trimmedLine === "---" || trimmedLine === "***") {
        flushList();
        elements.push(
          <hr
            key={i}
            style={{
              margin: "20px 0",
              border: "none",
              borderTop: "2px solid #e2e8f0",
            }}
          />
        );
        return;
      }

      // Handle headings
      if (trimmedLine.startsWith("### ")) {
        flushList();
        elements.push(
          <h4
            key={i}
            style={{
              margin: "20px 0 12px 0",
              fontSize: "16px",
              fontWeight: "600",
              color: "#1e293b",
            }}
            dangerouslySetInnerHTML={{
              __html: processInlineMarkdown(trimmedLine.slice(4)),
            }}
          />
        );
        return;
      }
      if (trimmedLine.startsWith("## ")) {
        flushList();
        elements.push(
          <h3
            key={i}
            style={{
              margin: "24px 0 16px 0",
              fontSize: "18px",
              fontWeight: "600",
              color: "#1e293b",
            }}
            dangerouslySetInnerHTML={{
              __html: processInlineMarkdown(trimmedLine.slice(3)),
            }}
          />
        );
        return;
      }
      if (trimmedLine.startsWith("# ")) {
        flushList();
        elements.push(
          <h2
            key={i}
            style={{
              margin: "28px 0 20px 0",
              fontSize: "20px",
              fontWeight: "700",
              color: "#1e293b",
            }}
            dangerouslySetInnerHTML={{
              __html: processInlineMarkdown(trimmedLine.slice(2)),
            }}
          />
        );
        return;
      }

      // Handle numbered list items
      if (/^\d+\.\s/.test(trimmedLine)) {
        if (listType !== "ol") {
          flushList();
          listType = "ol";
        }
        currentList.push(trimmedLine.replace(/^\d+\.\s/, ""));
        return;
      }

      // Handle bullet list items
      if (
        trimmedLine.startsWith("- ") ||
        trimmedLine.startsWith("• ") ||
        trimmedLine.startsWith("* ")
      ) {
        if (listType !== "ul") {
          flushList();
          listType = "ul";
        }
        currentList.push(trimmedLine.slice(2));
        return;
      }

      // Handle special bullet points
      if (trimmedLine.startsWith("➢ ")) {
        if (listType !== "ul") {
          flushList();
          listType = "ul";
        }
        currentList.push(trimmedLine.slice(2));
        return;
      }

      // Handle empty lines
      if (trimmedLine === "") {
        flushList();
        elements.push(<div key={i} style={{ height: "8px" }} />);
        return;
      }

      // Handle regular paragraphs
      flushList();
      if (trimmedLine.length > 0) {
        elements.push(
          <p
            key={i}
            style={{ margin: "8px 0", lineHeight: "1.6" }}
            dangerouslySetInnerHTML={{
              __html: processInlineMarkdown(trimmedLine),
            }}
          />
        );
      }
    });

    // Flush any remaining list
    flushList();

    return elements;
  };

  const currentLesson = getCurrentLesson();
  const currentModule = getCurrentModule();

  return (
    <div className="assistant-overlay" role="dialog" aria-modal="true">
      <div className="assistant-panel">
        <div className="assistant-header">
          <h5 className="m-0">
            <i className="fa fa-magic" /> AI Learning Assistant
          </h5>
          <button
            className="btn"
            onClick={onClose}
            aria-label="Close assistant"
          >
            <i className="fa fa-times" />
          </button>
        </div>
        <div className="assistant-body">
          {selectedText && (
            <div className="selected-snippet">
              <div className="label">Selected Text</div>
              <blockquote>"{selectedText}"</blockquote>
            </div>
          )}

          {!selectedText && currentModule && currentLesson && (
            <div className="selected-snippet">
              <div className="label">Currently Learning</div>
              <blockquote>
                {currentModule.name} → {currentLesson.name}
              </blockquote>
            </div>
          )}

          {conversations.length > 0 && (
            <div
              className="messages"
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                marginBottom: "12px",
              }}
            >
              {conversations.map((conv, index) => (
                <div
                  key={index}
                  className="message-pair"
                  style={{
                    background: "#f8fafc",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    className="user-message"
                    style={{
                      color: "#0ea5e9",
                      fontWeight: "500",
                      marginBottom: "4px",
                    }}
                  >
                    <strong>You:</strong> {conv.userPrompt}
                  </div>
                  <div className="ai-message" style={{ color: "#334155" }}>
                    <strong>Assistant:</strong>
                    <div
                      className="ai-response-content"
                      style={{ marginTop: "4px" }}
                    >
                      {renderAIResponse(conv.aiResponse)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="assistant-input"
            rows={4}
            placeholder="Ask a question about any lesson or topic in this course..."
            disabled={loading}
          />

          <div className="assistant-buttons">
            <button
              className="btn btn-primary"
              onClick={sendMessage}
              disabled={loading || !message.trim()}
            >
              <i className="fa fa-paper-plane" />{" "}
              {loading ? "Thinking..." : "Ask"}
            </button>
            <button className="btn" onClick={clearHistory}>
              Clear History
            </button>
            <button className="btn" onClick={onClose}>
              Close
            </button>
          </div>

          {error && (
            <div
              style={{
                color: "#dc2626",
                background: "#fee2e2",
                borderRadius: "8px",
                padding: "8px 16px",
                margin: "12px 0",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <p className="hint text-muted">
            AI can make mistakes, ensure you crosscheck the information provided
            with external sources
          </p>
        </div>
      </div>

      <style jsx>{`
        .learning-container {
          max-width: 1200px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
        }

        .course-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }

        .course-info .course-label {
          font-size: 14px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }

        .course-label-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #64748b;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 6px;
          transition: all 0.2s ease;
          margin-bottom: 4px;
        }

        .course-label-link:hover {
          background: #f1f5f9;
          color: #3b82f6;
          text-decoration: none;
        }

        .course-label-link .fa-arrow-left {
          font-size: 12px;
        }

        .course-title {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin: 4px 0 0 0;
        }

        .course-actions {
          display: flex;
          gap: 12px;
        }

        .btn-icon {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #475569;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .btn-icon:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #475569;
          text-decoration: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .btn-icon:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .discussions-btn:hover {
          background: #eff6ff !important;
          border-color: #93c5fd !important;
          color: #2563eb !important;
        }

        .forum-btn:hover {
          background: #f0fdf4 !important;
          border-color: #86efac !important;
          color: #16a34a !important;
        }

        .ai-assistant-btn:hover {
          background: #fdf4ff !important;
          border-color: #e879f9 !important;
          color: #a21caf !important;
        }

        .learning-layout {
          display: flex;
          min-height: calc(100vh - 100px);
        }

        .sidebar {
          width: 300px;
          background: white;
          border-right: 1px solid #e2e8f0;
          padding: 24px;
          overflow-y: auto;
        }

        .progress-section {
          margin-bottom: 32px;
        }

        .progress-header {
          margin-bottom: 8px;
        }

        .progress-text {
          font-size: 14px;
          color: #475569;
          font-weight: 500;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }

        .course-structure {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
        }

        .structure-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .structure-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .lesson-count {
          font-size: 12px;
          color: #64748b;
          background: #e2e8f0;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .expand-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
        }

        .lessons-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .lesson-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
          border: 1px solid transparent;
        }

        .lesson-item:hover {
          background: #f1f5f9;
          border-color: #e2e8f0;
        }

        .lesson-item.active {
          background: #eff6ff;
          border-color: #3b82f6;
        }

        .lesson-item.completed {
          background: #f0fdf4;
        }

        .lesson-status {
          flex-shrink: 0;
        }

        .completed-icon {
          color: #16a34a;
          font-size: 16px;
        }

        .active-icon {
          color: #3b82f6;
          font-size: 16px;
        }

        .pending-icon {
          color: #cbd5e1;
          font-size: 16px;
        }

        .lesson-details {
          flex: 1;
          min-width: 0;
        }

        .lesson-name {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lesson-duration {
          font-size: 12px;
          color: #64748b;
        }

        .edit-lesson-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          color: #64748b;
          padding: 4px 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 12px;
          margin-left: auto;
        }

        .edit-lesson-btn:hover {
          background: #e2e8f0;
          color: #3b82f6;
        }

        .main-content {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          overflow-x: hidden;
          height: calc(100vh - 100px);
          max-height: calc(100vh - 100px);
        }

        .lesson-header {
          margin-bottom: 24px;
        }

        .lesson-type {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
          margin-bottom: 8px;
          display: block;
        }

        .lesson-title {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          line-height: 1.2;
        }

        .lesson-content-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: visible;
          margin-bottom: 24px;
        }

        .lesson-content {
          padding: 32px;
          font-size: 16px;
          line-height: 1.7;
          color: #374151;
          min-height: 400px;
          overflow-y: visible;
          word-wrap: break-word;
        }

        .lesson-content iframe {
          max-width: 100%;
          border: none;
        }

        .lesson-content .video-wrapper {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          height: 0;
          margin-bottom: 20px;
          overflow: hidden;
        }

        .lesson-content .video-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .lesson-content h1,
        .lesson-content h2,
        .lesson-content h3,
        .lesson-content h4,
        .lesson-content h5,
        .lesson-content h6 {
          color: #1e293b;
          margin-top: 32px;
          margin-bottom: 16px;
        }

        .lesson-content h1 {
          font-size: 24px;
        }
        .lesson-content h2 {
          font-size: 20px;
        }
        .lesson-content h3 {
          font-size: 18px;
        }

        .lesson-content p {
          margin-bottom: 16px;
        }

        .lesson-content ul,
        .lesson-content ol {
          margin-bottom: 16px;
          padding-left: 24px;
        }

        .lesson-content li {
          margin-bottom: 8px;
        }

        .lesson-description {
          padding: 24px 32px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .lesson-description h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .lesson-description p {
          color: #64748b;
          margin: 0;
          line-height: 1.6;
        }

        .lesson-footer {
          padding: 24px 32px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          position: relative;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .completion-section {
          flex: 1;
        }

        .completion-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .completion-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .completion-btn.completed {
          background: #dcfce7;
          border-color: #16a34a;
          color: #16a34a;
        }

        .completion-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .navigation-section {
          display: flex;
          gap: 12px;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .nav-btn.primary {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .nav-btn.primary:hover {
          background: #2563eb;
          border-color: #2563eb;
        }

        .nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .delete-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #dc2626;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .delete-btn:hover {
          background: #fecaca;
          border-color: #f87171;
        }

        .selection-popover {
          position: absolute;
          transform: translate(-50%, -100%);
          background: #111827;
          color: #fff;
          padding: 6px 8px;
          border-radius: 8px;
          display: flex;
          gap: 6px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
          z-index: 5;
        }

        .selection-popover .btn {
          color: #fff;
          background: transparent;
          border: none;
          font-size: 12px;
          padding: 2px 6px;
        }

        .selection-popover .btn:hover {
          text-decoration: underline;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .learning-layout {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
            padding: 16px;
          }

          .main-content {
            padding: 16px;
          }

          .lesson-content {
            padding: 24px;
          }

          .lesson-footer {
            padding: 16px 24px;
          }

          .footer-content {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .navigation-section {
            justify-content: space-between;
          }
        }

        @media (max-width: 640px) {
          .course-header {
            padding: 16px;
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .course-title {
            font-size: 24px;
          }

          .lesson-title {
            font-size: 24px;
          }

          .lesson-content {
            padding: 16px;
          }

          .lesson-footer {
            padding: 16px;
          }

          .nav-btn {
            padding: 10px 16px;
            font-size: 13px;
          }
        }

        /* AI Assistant Styles */
        .assistant-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }

        .assistant-panel {
          width: min(960px, 92vw);
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .assistant-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          border-bottom: 1px solid #e5e7eb;
        }

        .assistant-header h5 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
        }

        .assistant-header .btn {
          background: none;
          border: none;
          color: #64748b;
          padding: 4px;
          cursor: pointer;
        }

        .assistant-body {
          padding: 14px;
        }

        .selected-snippet {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 10px;
          border-radius: 10px;
          margin-bottom: 12px;
        }

        .selected-snippet .label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 4px;
        }

        .assistant-input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px;
          outline: none;
          font-family: inherit;
          resize: vertical;
        }

        .assistant-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .assistant-buttons {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          justify-content: flex-end;
        }

        .assistant-buttons .btn {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .assistant-buttons .btn-primary {
          background: #3b82f6;
          border: 1px solid #3b82f6;
          color: white;
        }

        .assistant-buttons .btn-primary:hover {
          background: #2563eb;
          border-color: #2563eb;
        }

        .hint {
          font-size: 12px;
          color: #64748b;
          margin-top: 12px;
          margin-bottom: 0;
        }

        .ai-response-content strong {
          font-weight: 600;
          color: #2563eb;
        }

        .ai-response-content em {
          font-style: italic;
          color: #4f46e5;
        }

        .ai-response-content code {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          padding: 2px 6px;
          font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
          font-size: 13px;
          color: #1e293b;
        }
      `}</style>
    </div>
  );
};

export default AIAssistant;
