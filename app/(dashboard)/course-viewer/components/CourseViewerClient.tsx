"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    useModuleProgress,
    useUpdateModuleProgress,
} from "@/lib/hooks/useCourseData";
import { useUserData } from "@/hooks/useUserData";
import { usePreloadChatHistory } from "@/hooks/use-preload-chat-history";
import { useGuardrailsPreload } from "@/hooks/use-guardrails-preload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ChevronLeft,
    ChevronRight, CheckCircle,
    Circle,
    BookOpen,
    MessageCircle,
    Users,
    Sparkles, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import CourseSidebar from "./CourseSidebar";
import LessonContent from "./LessonContent";
import AIAssistantV2 from "./AIAssistantV2";
import TestSection from "./TestSection";
import PracticeTestSection from "./PracticeTestSection";
import { AskTutorisSelectableText } from "./AskTutorisSelectableText";
import { AdminToolbar } from "./AdminToolbar";

// Import Test type from TestSection
interface Test {
  id: number;
  course_id: number;
  course_module_id: number;
  course_lesson_id: number;
  name: string;
  instructions: string;
  duration_mins: number;
  deadline: string;
  max_attempts: number;
  max_score: number;
  created_at: string;
  updated_at: string;
  format: string;
  published: boolean;
}

interface CourseModule {
  id: number;
  name: string;
  description?: string;
  course_id: number;
  order: number;
  created_at: string;
  updated_at: string;
  course_tests?: Test[];
}

interface CourseLesson {
  id: number;
  name: string;
  description?: string;
  content: string;
  order: number;
  course_module_id: number;
  created_at: string;
  updated_at: string;
  course_tests?: Test[];
}

interface CourseViewerClientProps {
  courseModuleData: CourseModule;
  courseLessons: CourseLesson[];
  courseData: any; // Course data containing name and other properties
  onRefreshData?: () => void;
}

interface ProgressData {
  completed: Set<number>;
  lastLessonId: number | null;
}

export default function CourseViewerClient({
  courseModuleData,
  courseLessons: initialCourseLessons,
  courseData,
  onRefreshData,
}: CourseViewerClientProps) {
  const router = useRouter();
  const { userData } = useUserData();
  const { preloadHistory, preloadMultipleHistories } = usePreloadChatHistory();
  const { preloadGuardrails, preloadMultipleGuardrails } =
    useGuardrailsPreload();
  const [courseLessons, setCourseLessons] = useState(initialCourseLessons);
  const [activeLesson, setActiveLesson] = useState<CourseLesson | null>(
    initialCourseLessons[0] || null
  );
  const [refreshKey, setRefreshKey] = useState(0);

  // Update courseLessons and activeLesson when props change (after refetch)
  useEffect(() => {
    setCourseLessons(initialCourseLessons);
    
    // Update active lesson if it exists in the new data
    if (activeLesson) {
      const updatedActiveLesson = initialCourseLessons.find(
        (l) => l.id === activeLesson.id
      );
      if (updatedActiveLesson) {
        setActiveLesson(updatedActiveLesson);
      }
    }
  }, [initialCourseLessons]);

  // Check if user is admin (you may need to adjust this based on your auth system)
  const isAdmin =
    userData?.role === "ADMIN" ||
    userData?.role === "SUPERADMIN" ||
    userData?.role === "HOD" ||
    userData?.role === "STAFF";

  // Function to refresh data
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
    if (onRefreshData) {
      onRefreshData();
    }
  }, [onRefreshData]);

  const handleLessonsUpdate = useCallback(
    (updatedLessons: CourseLesson[]) => {
      console.log(
        "handleLessonsUpdate called with:",
        updatedLessons.length,
        "lessons"
      );
      console.log("Current activeLesson:", activeLesson?.id);

      setCourseLessons(updatedLessons);

      // Update active lesson if it exists in the updated lessons
      if (activeLesson) {
        const updatedActiveLesson = updatedLessons.find(
          (l) => l.id === activeLesson.id
        );
        if (updatedActiveLesson) {
          console.log("Active lesson found, updating:", updatedActiveLesson.id);
          setActiveLesson(updatedActiveLesson);
        } else {
          // If the active lesson was deleted, set to the first available lesson
          console.log(
            "Active lesson not found, setting to first available lesson"
          );
          if (updatedLessons.length > 0) {
            setActiveLesson(updatedLessons[0]);
          } else {
            setActiveLesson(null);
          }
        }
      }
    },
    [activeLesson]
  );
  const [showAssistant, setShowAssistant] = useState(false);

  // Preload chat history and guardrails when component mounts and when lessons change
  useEffect(() => {
    if (userData?.id && courseLessons.length > 0) {
      // Preload history for the first few lessons to improve performance
      const contextsToPreload = courseLessons.slice(0, 3).map((lesson) => ({
        lessonId: lesson.id,
        moduleId: courseModuleData.id,
      }));

      preloadMultipleHistories(userData.id, contextsToPreload);

      // Preload guardrails for the first few lessons
      const lessonsToPreload = courseLessons.slice(0, 3);
      preloadMultipleGuardrails(courseData, lessonsToPreload);
    }
  }, [
    userData?.id,
    courseLessons,
    courseModuleData.id,
    courseData,
    preloadMultipleHistories,
    preloadMultipleGuardrails,
  ]);

  // Preload history and guardrails when active lesson changes
  useEffect(() => {
    if (userData?.id && activeLesson) {
      preloadHistory(userData.id, activeLesson.id, courseModuleData.id);
      preloadGuardrails(courseData, activeLesson);
    }
  }, [
    userData?.id,
    activeLesson,
    courseModuleData.id,
    courseData,
    preloadHistory,
    preloadGuardrails,
  ]);
  const [selectedText, setSelectedText] = useState<string>("");
  const [initialPrompt, setInitialPrompt] = useState<string>("");
  const [preloadedConversations, setPreloadedConversations] = useState<
    Map<number, any[]>
  >(new Map());
  const contentRef = useRef<HTMLDivElement>(null);

  // Preload conversation history for the current lesson
  const preloadConversationHistory = useCallback(
    async (lessonId: number) => {
      if (!userData?.id || preloadedConversations.has(lessonId)) {
        return; // Already preloaded or no user data
      }

      try {
        const response = await fetch(
          `/api/ai-chat?userId=${userData.id.toString()}&lessonId=${lessonId}`,
          { method: "GET" }
        );

        if (response.ok) {
          const data = await response.json();
          setPreloadedConversations((prev) => {
            const newMap = new Map(prev);
            newMap.set(lessonId, data.conversations || []);
            return newMap;
          });
        }
      } catch (err) {
        console.error("Failed to preload conversation history:", err);
      }
    },
    [userData?.id, preloadedConversations]
  );

  // Preload conversation history when lesson changes
  useEffect(() => {
    if (activeLesson?.id && userData?.id) {
      preloadConversationHistory(activeLesson.id);
    }
  }, [activeLesson?.id, userData?.id, preloadConversationHistory]);

  // Use SWR for progress management
  const {
    progressData,
    isLoading: progressLoading,
    mutate: mutateProgress,
  } = useModuleProgress(courseModuleData.id.toString());
  const { updateProgress } = useUpdateModuleProgress();

  // Local progress state for immediate UI updates
  const [localProgress, setLocalProgress] = useState<ProgressData>({
    completed: new Set(),
    lastLessonId: null,
  });

  // Sync local progress with SWR data
  useEffect(() => {
    if (progressData) {
      setLocalProgress({
        // Backend GET returns { completed: number[], lastLessonId: number|null }
        completed: new Set(progressData.completed || []),
        lastLessonId: progressData.lastLessonId || null,
      });
    }
  }, [progressData]);

  // Use local progress for UI, fallback to SWR data
  const progress = localProgress;

  // Initialize with first lesson or last viewed lesson
  useEffect(() => {
    if (courseLessons.length > 0) {
      const lastViewed = courseLessons.find(
        (lesson) => lesson.id === progress.lastLessonId
      );
      setActiveLesson(lastViewed || courseLessons[0]);
    }
  }, [courseLessons, progress.lastLessonId]);

  // Debug: Monitor courseLessons state changes
  useEffect(() => {
    console.log(
      "courseLessons state updated:",
      courseLessons.length,
      "lessons"
    );
  }, [courseLessons]);

  // Handle AI assistant text selection
  const handleAskTutoris = useCallback(
    (selectedText: string, context: string) => {
      setSelectedText(selectedText);
      setInitialPrompt(
        `Can you provide more information about: "${selectedText}"`
      );
      setShowAssistant(true);
    },
    []
  );

  const saveProgress = useCallback(
    async (newProgress: ProgressData) => {
      try {
        // Update local state immediately for responsive UI
        setLocalProgress(newProgress);

        // Update backend
        await updateProgress(courseModuleData.id.toString(), {
          completed_lessons: Array.from(newProgress.completed),
          last_lesson_id: newProgress.lastLessonId,
          current_lesson_id: newProgress.lastLessonId,
        });

        // Update the SWR cache
        mutateProgress();

        // Refresh course data to update overall progress in sidebar
        window.dispatchEvent(
          new CustomEvent("courseProgressUpdated", {
            detail: { courseId: courseModuleData.course_id },
          })
        );
      } catch (error) {
        console.error("Error saving progress:", error);
        toast.error("Failed to save progress");

        // Revert local state on error
        setLocalProgress({
          completed: new Set(progressData?.completed_lessons || []),
          lastLessonId: progressData?.last_lesson_id || null,
        });
      }
    },
    [
      courseModuleData.id,
      courseModuleData.course_id,
      updateProgress,
      mutateProgress,
      progressData,
    ]
  );

  const selectLesson = useCallback(
    (lesson: CourseLesson) => {
      setActiveLesson(lesson);
      const newProgress = {
        completed: progress.completed,
        lastLessonId: lesson.id,
      };
      saveProgress(newProgress);

      // Preload chat history and guardrails for the selected lesson
      if (userData?.id) {
        preloadHistory(userData.id, lesson.id, courseModuleData.id);
        preloadGuardrails(courseData, lesson);
      }
    },
    [
      saveProgress,
      progress.completed,
      userData?.id,
      preloadHistory,
      preloadGuardrails,
      courseData,
      courseModuleData.id,
    ]
  );

  const toggleLessonComplete = useCallback(() => {
    if (!activeLesson) return;

    const newCompleted = new Set(progress.completed);
    if (newCompleted.has(activeLesson.id)) {
      newCompleted.delete(activeLesson.id);
    } else {
      newCompleted.add(activeLesson.id);
    }

    const newProgress = {
      completed: newCompleted,
      lastLessonId: activeLesson.id,
    };
    saveProgress(newProgress);

    toast.success(
      progress.completed.has(activeLesson.id)
        ? "Lesson marked as incomplete"
        : "Lesson completed!"
    );
  }, [activeLesson, progress.completed, saveProgress]);

  const navigateLesson = useCallback(
    (direction: "prev" | "next") => {
      if (!activeLesson) return;

      const currentIndex = courseLessons.findIndex(
        (lesson) => lesson.id === activeLesson.id
      );
      const newIndex =
        direction === "next" ? currentIndex + 1 : currentIndex - 1;

      if (newIndex >= 0 && newIndex < courseLessons.length) {
        const newLesson = courseLessons[newIndex];
        // Compute new progress in one go to avoid duplicate saves
        const newCompleted = new Set(progress.completed);
        if (direction === "next" && !newCompleted.has(activeLesson.id)) {
          newCompleted.add(activeLesson.id);
        }

        const newProgress = {
          completed: newCompleted,
          lastLessonId: newLesson.id,
        };

        // Update local active lesson immediately for fluid UX
        setActiveLesson(newLesson);
        // Persist progress (optimistic local already updated by setActiveLesson + local state handling)
        saveProgress(newProgress);
      }
    },
    [activeLesson, courseLessons, progress.completed, saveProgress]
  );

  // Calculate module progress
  const progressPercentage =
    courseLessons.length > 0
      ? Math.round((progress.completed.size / courseLessons.length) * 100)
      : 0;

  // Module completion status
  const isModuleCompleted = progressPercentage === 100;
  const completedLessonsCount = progress.completed.size;
  const totalLessonsCount = courseLessons.length;

  const isCurrentLessonCompleted = activeLesson
    ? progress.completed.has(activeLesson.id)
    : false;
  const currentLessonIndex = activeLesson
    ? courseLessons.findIndex((l) => l.id === activeLesson.id)
    : -1;
  const canGoPrev = currentLessonIndex > 0;
  const canGoNext = currentLessonIndex < courseLessons.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <Link
                  href={`/course?course_id=${courseModuleData.course_id}`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Course
                </Link>
                <h1 className="text-xl font-semibold text-gray-900 mt-1">
                  {courseModuleData.name}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/connect?course=${
                    courseModuleData.course_id
                  }&tab=discussions&courseName=${encodeURIComponent(
                    courseData?.name || "Course"
                  )}`}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Discussions
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/connect?course=${
                    courseModuleData.course_id
                  }&tab=forum&courseName=${encodeURIComponent(
                    courseData?.name || "Course"
                  )}`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Forum
                </Link>
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowAssistant(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <CourseSidebar
          courseLessons={courseLessons}
          activeLesson={activeLesson}
          progress={progress}
          onLessonSelect={selectLesson}
          progressPercentage={progressPercentage}
          courseProgress={{
            completion_percentage: courseData?.completion_percentage || 0,
            total_lessons: courseData?.total_lessons || 0,
            completed_lessons: courseData?.completed_lessons || 0,
          }}
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Admin Toolbar */}
          <AdminToolbar
            courseModule={courseModuleData}
            courseLessons={courseLessons}
            currentLesson={activeLesson || undefined}
            onRefresh={handleRefresh}
            onLessonsUpdate={handleLessonsUpdate}
            isAdmin={isAdmin}
          />

          {activeLesson ? (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Lesson {currentLessonIndex + 1} of{" "}
                        {courseLessons.length}
                      </Badge>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {activeLesson.name}
                      </CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          isCurrentLessonCompleted ? "default" : "secondary"
                        }
                      >
                        {isCurrentLessonCompleted ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </>
                        ) : (
                          <>
                            <Circle className="h-3 w-3 mr-1" />
                            In Progress
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="w-full max-w-3xl mx-auto relative">
                    <AskTutorisSelectableText
                      onAskTutoris={handleAskTutoris}
                      highlightColor="#9810fa" // Light purple/indigo color
                    >
                      <LessonContent
                        content={activeLesson.content}
                        ref={contentRef}
                      />
                    </AskTutorisSelectableText>
                  </div>

                  {activeLesson.description && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">
                        Lesson Summary
                      </h4>
                      <p className="text-blue-800">
                        {activeLesson.description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Tests Section - Show tests for active lesson */}
              {activeLesson && (activeLesson.course_tests || []).length > 0 && (
                <TestSection
                  tests={activeLesson.course_tests || []}
                  courseId={courseModuleData.course_id}
                  courseModuleId={courseModuleData.id}
                  courseLessonId={activeLesson.id}
                  userRole={userData?.role}
                  lessonName={activeLesson.name}
                  onRefresh={handleRefresh}
                />
              )}

              {/* Practice Test Section - Show AI practice questions for active lesson */}
              {activeLesson && (
                <PracticeTestSection
                  courseLessonId={activeLesson.id}
                  lessonName={activeLesson.name}
                  showSection={true} // Always show practice questions as they're AI-generated
                />
              )}
              {/* Navigation Footer */}
              <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4">
                <Button
                  variant="outline"
                  onClick={toggleLessonComplete}
                  disabled={!activeLesson}
                  className={
                    isCurrentLessonCompleted
                      ? "bg-green-50 border-green-200 text-green-700"
                      : ""
                  }
                >
                  {isCurrentLessonCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </>
                  )}
                </Button>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => navigateLesson("prev")}
                    disabled={!canGoPrev}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => navigateLesson("next")}
                    disabled={!canGoNext}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Lesson
                </h3>
                <p className="text-gray-600">
                  Choose a lesson from the sidebar to begin learning.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* AI Assistant Modal */}
      {showAssistant && (
        <AIAssistantV2
          courseData={courseModuleData}
          currentLesson={activeLesson}
          selectedText={selectedText}
          initialPrompt={initialPrompt}
          student={
            userData
              ? {
                  id: userData.id,
                  name: `${userData.first_name} ${userData.last_name}`.trim(),
                  role: userData.role,
                }
              : undefined
          }
          currentModuleId={courseModuleData.id}
          currentLessonId={activeLesson?.id}
          preloadedConversations={
            activeLesson?.id
              ? preloadedConversations.get(activeLesson.id)
              : undefined
          }
          onClose={() => {
            setShowAssistant(false);
            setSelectedText(""); // Clear the selected text when closing
            setInitialPrompt(""); // Clear the initial prompt when closing
          }}
        />
      )}
    </div>
  );
}
