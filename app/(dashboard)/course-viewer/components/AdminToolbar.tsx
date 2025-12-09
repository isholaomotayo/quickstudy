"use client";

import { useState } from "react";
import {
    Settings,
    Plus,
    Edit,
    Trash,
    Eye,
    EyeOff, FileText,
    HelpCircle,
    CheckSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LessonCreator } from "@/app/(simple)/course/components/LessonCreator";
import { QuizCreator } from "@/app/(simple)/course/components/QuizCreator";
import { AssignmentCreatorModal } from "./AssignmentCreatorModal";
import { ConfirmDialog } from "./ConfirmDialog";
import { toast } from "sonner";
import { api } from "@/lib/api-wrapper";

interface CourseModule {
  id: number;
  course_id: number;
  name: string;
  order: number;
  description?: string;
  created_at: string;
  updated_at: string;
  published?: boolean;
  course_lesson?: CourseLesson[]; // Changed from course_lessons to match API response
}

interface CourseLesson {
  id: number;
  course_module_id: number;
  name: string;
  order: number;
  description?: string;
  created_at: string;
  updated_at: string;
  content: string;
  course_tests?: any[];
}

interface AdminToolbarProps {
  courseModule: CourseModule;
  courseLessons: CourseLesson[];
  currentLesson?: CourseLesson;
  onRefresh: () => void;
  onLessonsUpdate: (updatedLessons: CourseLesson[]) => void;
  isAdmin?: boolean;
}

export function AdminToolbar({
  courseModule,
  courseLessons,
  currentLesson,
  onRefresh,
  onLessonsUpdate,
  isAdmin = false,
}: AdminToolbarProps) {
  const [showLessonCreator, setShowLessonCreator] = useState(false);
  const [showQuizCreator, setShowQuizCreator] = useState(false);
  const [showAssignmentCreator, setShowAssignmentCreator] = useState(false);
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [adminMode, setAdminMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<number | null>(null);

  if (!isAdmin) {
    return null;
  }

  const handleCreateLesson = async (lessonData: any) => {
    // Create a temporary lesson with a temporary ID
    const tempLesson: CourseLesson = {
      id: Date.now(), // Temporary ID
      course_module_id: lessonData.course_module_id,
      name: lessonData.name,
      description: lessonData.description,
      content: lessonData.content,
      order: lessonData.order,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      course_tests: [],
    };

    // Optimistically update the UI
    const updatedLessons = [...courseLessons, tempLesson].sort(
      (a, b) => a.order - b.order
    );
    onLessonsUpdate(updatedLessons);

    try {
      const response = await api.post("/api/courselesson", lessonData);
      const createdLesson = response.data.data;

      // Update with the real lesson data from the server
      const finalLessons = updatedLessons.map((lesson) =>
        lesson.id === tempLesson.id ? createdLesson : lesson
      );
      onLessonsUpdate(finalLessons);

      setShowLessonCreator(false);
      setEditingLesson(null);
    } catch (error) {
      console.error("Error creating lesson:", error);
      // Revert the optimistic update
      onLessonsUpdate(courseLessons);
      throw error;
    }
  };

  const handleUpdateLesson = async (lessonData: any) => {
    // Store the original lessons for potential rollback
    const originalLessons = [...courseLessons];

    // Optimistically update the UI
    const updatedLessons = courseLessons.map((lesson) =>
      lesson.id === lessonData.id ? { ...lesson, ...lessonData } : lesson
    );
    onLessonsUpdate(updatedLessons);

    try {
      const response = await api.put(
        `/api/courselesson/${lessonData.id}`,
        lessonData
      );
      const updatedLesson = response.data.data;

      // Update with the real lesson data from the server
      const finalLessons = updatedLessons.map((lesson) =>
        lesson.id === lessonData.id ? updatedLesson : lesson
      );
      onLessonsUpdate(finalLessons);

      setShowLessonCreator(false);
      setEditingLesson(null);
    } catch (error) {
      console.error("Error updating lesson:", error);
      // Revert the optimistic update
      onLessonsUpdate(originalLessons);
      throw error;
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    // Store the original lessons for potential rollback
    const originalLessons = [...courseLessons];

    // Optimistically update the UI
    const updatedLessons = courseLessons.filter(
      (lesson) => lesson.id !== lessonId
    );

    // Call onLessonsUpdate to update the parent component's state
    onLessonsUpdate(updatedLessons);

    try {
      await api.delete(`/api/courselesson/${lessonId}`);
      // Deletion successful - the optimistic update remains
    } catch (error) {
      console.error("Error deleting lesson:", error);
      // Revert the optimistic update on error
      onLessonsUpdate(originalLessons);
      throw error; // Re-throw to show error to user
    }
  };

  const confirmDeleteLesson = (lessonId: number) => {
    setLessonToDelete(lessonId);
    setShowDeleteConfirm(true);
  };

  const executeDeleteLesson = async () => {
    if (lessonToDelete) {
      try {
        await handleDeleteLesson(lessonToDelete);
        // Close dialog and reset state on success
        setShowDeleteConfirm(false);
        setLessonToDelete(null);
      } catch (error) {
        // Keep dialog open on error so user can see the error
        console.error("Failed to delete lesson:", error);
        // You might want to show a toast error here
      }
    }
  };

  const handleCreateQuiz = async (quizData: any) => {
    try {
      // Extract questions from quizData
      const { questions, ...testData } = quizData;

      // Create the quiz/test (without questions field)
      const test = await api.post("/api/coursetest", {
        ...testData,
        course_id: courseModule.course_id,
        course_module_id: courseModule.id,
        course_lesson_id: currentLesson?.id,
      });

      // Create questions for the quiz
      if (questions && questions.length > 0) {
        for (const question of questions) {
          // Transform options array to object format
          let optionsObject: any = null;
          if (question.options && Array.isArray(question.options)) {
            const tempOptions: any = {};
            const letters = ['A', 'B', 'C', 'D', 'E'];
            question.options.forEach((optionText: string, index: number) => {
              if (optionText && optionText.trim()) {
                const letter = letters[index];
                tempOptions[letter] = {
                  text: optionText,
                  is_answer: question.correct_answer === letter
                };
              }
            });
            // Only set to object if we have options
            if (Object.keys(tempOptions).length > 0) {
              optionsObject = tempOptions;
            }
          }

          await api.post("/api/coursequestion", {
            course_test_id: test.id,
            question: question.question,
            details: question.details || "",
            marks: question.marks,
            order: question.order,
            options: optionsObject,
          });
        }
      }

      onRefresh();
      setShowQuizCreator(false);
    } catch (error) {
      console.error("Error creating quiz:", error);
      throw error;
    }
  };

  const handleEditLesson = (lesson: CourseLesson) => {
    setEditingLesson(lesson);
    setShowLessonCreator(true);
  };

  return (
    <>
      {/* Admin Toolbar */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Admin Mode
            </span>
            <Badge
              variant="outline"
              className="text-xs text-yellow-700 border-yellow-300"
            >
              {courseModule.published ? "Published" : "Draft"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setAdminMode(!adminMode)}
              className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            >
              {adminMode ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Hide Tools
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Show Tools
                </>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Content
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setEditingLesson(null);
                    setShowLessonCreator(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  New Lesson
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowQuizCreator(true)}
                  className="flex items-center gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  New Quiz/Test
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowAssignmentCreator(true)}
                  className="flex items-center gap-2"
                >
                  <CheckSquare className="h-4 w-4" />
                  New Assignment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Extended Admin Tools */}
        {adminMode && (
          <div className="mt-3 pt-3 border-t border-yellow-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="text-xs">
                <span className="font-medium text-yellow-800">Module:</span>
                <div className="text-yellow-700">{courseModule.name}</div>
              </div>
              <div className="text-xs">
                <span className="font-medium text-yellow-800">Lessons:</span>
                <div className="text-yellow-700">{courseLessons.length}</div>
              </div>
              <div className="text-xs">
                <span className="font-medium text-yellow-800">Tests:</span>
                <div className="text-yellow-700">
                  {courseLessons.reduce(
                    (total, lesson) =>
                      total + (lesson.course_tests?.length || 0),
                    0
                  )}
                </div>
              </div>
              <div className="text-xs">
                <span className="font-medium text-yellow-800">Status:</span>
                <div className="text-yellow-700">
                  {courseModule.published ? "Live" : "Draft"}
                </div>
              </div>
            </div>

            {/* Current Lesson Actions */}
            {currentLesson && (
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-yellow-800">
                    Current Lesson: {currentLesson.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditLesson(currentLesson)}
                      className="h-6 text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => confirmDeleteLesson(currentLesson.id)}
                      className="h-6 text-xs border-red-300 text-red-700 hover:bg-red-100"
                    >
                      <Trash className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lesson Creator Modal */}
      {showLessonCreator && (
        <LessonCreator
          moduleId={courseModule.id}
          existingLessons={courseLessons}
          initialData={editingLesson || undefined}
          open={showLessonCreator}
          onClose={() => {
            setShowLessonCreator(false);
            setEditingLesson(null);
          }}
          onSave={editingLesson ? handleUpdateLesson : handleCreateLesson}
          isEditing={!!editingLesson}
        />
      )}

      {/* Quiz Creator Modal */}
      {showQuizCreator && (
        <QuizCreator
          courseId={courseModule.course_id}
          courseModuleId={courseModule.id}
          courseLessonId={currentLesson?.id}
          open={showQuizCreator}
          onClose={() => setShowQuizCreator(false)}
          onSave={handleCreateQuiz}
        />
      )}

      {/* Assignment Creator Modal */}
      {showAssignmentCreator && currentLesson && (
        <AssignmentCreatorModal
          open={showAssignmentCreator}
          onOpenChange={setShowAssignmentCreator}
          courseId={courseModule.course_id}
          courseModuleId={courseModule.id}
          courseLessonId={currentLesson.id}
          onAssignmentCreated={() => {
            toast.success("Assignment created successfully!");
            setShowAssignmentCreator(false);
            onRefresh();
          }}
        />
      )}

      {/* Delete Lesson Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Lesson"
        message="Are you sure you want to delete this lesson? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={executeDeleteLesson}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setLessonToDelete(null);
        }}
      />
    </>
  );
}
