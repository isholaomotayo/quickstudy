"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    FileText,
    Clock,
    ExternalLink,
    Play,
    CheckCircle,
    AlertCircle,
    Plus,
    Edit,
    Trash2,
} from "lucide-react";
import { AssignmentCreatorModal } from "./AssignmentCreatorModal";
import { AssignmentEditorModal } from "./AssignmentEditorModal";
import { QuizCreator } from "@/app/(simple)/course/components/QuizCreator";
import { ConfirmDialog } from "./ConfirmDialog";
import { toast } from "sonner";
import { api } from "@/lib/api-wrapper";

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

interface TestSectionProps {
  tests: Test[];
  courseId?: number;
  courseModuleId?: number;
  courseLessonId?: number;
  userRole?: string;
  lessonName?: string;
  onRefresh?: () => void;
}

export default function TestSection({
  tests,
  courseId,
  courseModuleId,
  courseLessonId,
  userRole,
  lessonName,
  onRefresh,
}: TestSectionProps) {
  const [showAssignmentCreator, setShowAssignmentCreator] = useState(false);
  const [showAssignmentEditor, setShowAssignmentEditor] = useState(false);
  const [showQuizEditor, setShowQuizEditor] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(
    null
  );
  const [selectedQuiz, setSelectedQuiz] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Test | null>(
    null
  );
  const [quizToDelete, setQuizToDelete] = useState<Test | null>(null);

  // Check if user can create assignments (admin, superadmin, staff)
  const canCreateAssignments =
    userRole && ["SUPERADMIN", "ADMIN", "STAFF"].includes(userRole);

  const handleEditQuiz = async (quiz: Test) => {
    try {
      // Fetch quiz with questions
      const quizData = await api.get(
        `/api/coursetest/${quiz.id}?questions=true`
      );
      
      // Transform questions from API format to QuizCreator format
      // API returns 'course_questions' not 'questions'
      const transformedQuestions = quizData.course_questions?.map((q: any) => {
        // Convert options object to array format
        let optionsArray: string[] = ["", "", "", ""];
        let correctAnswer = q.answer || ""; // API returns answer directly
        
        if (q.options && typeof q.options === "object" && Object.keys(q.options).length > 0) {
          // Options exist as object with letter keys
          const letters = ["A", "B", "C", "D", "E"];
          letters.forEach((letter, index) => {
            if (q.options[letter] && q.options[letter].text) {
              optionsArray[index] = q.options[letter].text;
              if (q.options[letter].is_answer) {
                correctAnswer = letter;
              }
            }
          });
        }
        
        return {
          id: q.id,
          question: q.question || "",
          details: q.details || "",
          marks: q.marks || 1,
          order: q.order || 1,
          question_type: quizData.format || "quiz",
          options: optionsArray,
          correct_answer: correctAnswer,
        };
      }) || [];
      
      // Convert deadline from ISO format to datetime-local format (YYYY-MM-DDTHH:mm)
      let formattedDeadline = "";
      if (quizData.deadline) {
        try {
          const date = new Date(quizData.deadline);
          // Format as YYYY-MM-DDTHH:mm for datetime-local input
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          formattedDeadline = `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (e) {
          console.error('Error formatting deadline:', e);
          formattedDeadline = "";
        }
      }
      
      // Transform quiz data to match QuizCreator format
      const transformedQuizData = {
        id: quizData.id,
        course_id: quizData.course_id,
        course_module_id: quizData.course_module_id,
        course_lesson_id: quizData.course_lesson_id,
        name: quizData.name || "",
        instructions: quizData.instructions || "",
        duration_mins: quizData.duration_mins || 30,
        deadline: formattedDeadline,
        max_attempts: quizData.max_attempts || 3,
        max_score: quizData.max_score || 0,
        format: quizData.format || "quiz",
        published: quizData.published || false,
        questions: transformedQuestions,
      };
      
      setSelectedQuiz(transformedQuizData);
      setShowQuizEditor(true);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      toast.error("Failed to load quiz for editing");
    }
  };

  const handleDeleteQuiz = (quiz: Test) => {
    setQuizToDelete(quiz);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteQuiz = async () => {
    if (!quizToDelete) return;

    try {
      await api.delete(`/api/coursetest/${quizToDelete.id}`);

      toast.success("Quiz deleted successfully!");
      setShowDeleteConfirm(false);
      setQuizToDelete(null);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error("Error deleting quiz:", error);
      
      // Handle specific error cases from api-wrapper error
      if (error.message?.includes("student") && error.message?.includes("taken")) {
        toast.error(error.message);
      } else if (error.message?.includes("not found") || error.message?.includes("No Rows Deleted")) {
        toast.error("Quiz not found. It may have been already deleted.");
      } else {
        toast.error(error.message || "Failed to delete quiz. Please try again.");
      }
      
      setShowDeleteConfirm(false);
      setQuizToDelete(null);
    }
  };

  const handleUpdateQuiz = async (quizData: any) => {
    try {
      // Extract questions from quizData
      const { questions, ...testData } = quizData;

      // Update the quiz/test
      await api.put(`/api/coursetest/${quizData.id}`, testData);

      // Delete all existing questions and recreate them
      // First, fetch existing questions
      try {
        const existingData = await api.get(
          `/api/coursetest/${quizData.id}?questions=true`
        );
        
        // Delete existing questions
        if (existingData.course_questions && existingData.course_questions.length > 0) {
          for (const question of existingData.course_questions) {
            await api.delete(`/api/coursequestion/${question.id}`);
          }
        }
      } catch (error) {
        console.error("Error handling existing questions:", error);
      }

      // Create new questions
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
            course_test_id: quizData.id,
            question: question.question,
            details: question.details || "",
            marks: question.marks,
            order: question.order,
            options: optionsObject,
          });
        }
      }

      toast.success("Quiz updated successfully!");
      setShowQuizEditor(false);
      setSelectedQuiz(null);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating quiz:", error);
      throw error;
    }
  };
  const getTestIcon = (test: Test) => {
    switch (test.format?.toLowerCase()) {
      case "quiz":
        return <FileText className="h-4 w-4" />;
      case "exam":
        return <AlertCircle className="h-4 w-4" />;
      case "assignment":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTestColor = (test: Test) => {
    switch (test.format?.toLowerCase()) {
      case "quiz":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "exam":
        return "bg-red-50 border-red-200 text-red-800";
      case "assignment":
        return "bg-green-50 border-green-200 text-green-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getTestBadgeVariant = (test: Test) => {
    switch (test.format?.toLowerCase()) {
      case "quiz":
        return "secondary";
      case "exam":
        return "destructive";
      case "assignment":
        return "default";
      default:
        return "outline";
    }
  };

  const handleDeleteAssignment = async (test: Test) => {
    setAssignmentToDelete(test);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAssignment = async () => {
    if (!assignmentToDelete) return;

    try {
      await api.delete(`/api/coursetest/${assignmentToDelete.id}`);
      
      toast.success("Assignment deleted successfully!");
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error("Error deleting assignment:", error);
      toast.error(error.message || "Failed to delete assignment");
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-gray-600" />
              <span>Lesson Assessments</span>
              <Badge variant="outline" className="ml-2">
                {tests.length} test{tests.length > 1 ? "s" : ""}
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              {/* Add Assignment - Only for staff/admin */}
              {canCreateAssignments &&
                courseId &&
                courseModuleId &&
                courseLessonId && (
                  <Button
                    onClick={() => setShowAssignmentCreator(true)}
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Assignment
                  </Button>
                )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {tests.map((test, index) => (
              <div
                key={test.id || index}
                className={`p-4 rounded-lg border ${getTestColor(test)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getTestIcon(test)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-sm">
                          {test.name || `Test ${index + 1}`}
                        </h4>
                        <Badge
                          variant={getTestBadgeVariant(test)}
                          className="text-xs"
                        >
                          {test.format?.toUpperCase() || "TEST"}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {test.duration_mins} min
                        </span>
                        <span className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {test.max_score} points
                        </span>
                        <span className="flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {test.max_attempts} attempt
                          {test.max_attempts > 1 ? "s" : ""}
                        </span>
                      </div>

                      {test.instructions && (
                        <div className="mt-2 text-xs text-gray-500">
                          <strong>Instructions:</strong> {test.instructions}
                        </div>
                      )}

                      {test.deadline && (
                        <div className="mt-1 text-xs text-gray-500">
                          <strong>Deadline:</strong>{" "}
                          {new Date(test.deadline).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="flex-shrink-0"
                    >
                      <a
                        href={`/immersive-test?course_test_id=${test.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1"
                      >
                        <Play className="h-3 w-3" />
                        <span>Start</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>

                    {canCreateAssignments && (
                      <>
                        {test.format === "assignment" ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Transform Test to AssignmentData format
                                const assignmentData = {
                                  ...test,
                                  questions: [], // Will be fetched by AssignmentEditorModal
                                };
                                setSelectedAssignment(assignmentData as any);
                                setShowAssignmentEditor(true);
                              }}
                              className="flex-shrink-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAssignment(test)}
                              className="flex-shrink-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditQuiz(test)}
                              className="flex-shrink-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteQuiz(test)}
                              className="flex-shrink-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 mt-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Complete these assessments to reinforce
                your understanding of the lesson material and track your
                progress.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Creator Modal */}
      {canCreateAssignments && courseId && courseModuleId && courseLessonId && (
        <AssignmentCreatorModal
          open={showAssignmentCreator}
          onOpenChange={setShowAssignmentCreator}
          courseId={courseId}
          courseModuleId={courseModuleId}
          courseLessonId={courseLessonId}
          onAssignmentCreated={() => {
            toast.success("Assignment created successfully!");
            if (onRefresh) {
              onRefresh();
            }
          }}
        />
      )}

      {/* Assignment Editor Modal */}
      {canCreateAssignments && (
        <AssignmentEditorModal
          open={showAssignmentEditor}
          onOpenChange={setShowAssignmentEditor}
          assignment={selectedAssignment}
          onAssignmentUpdated={() => {
            toast.success("Assignment updated successfully!");
            if (onRefresh) {
              onRefresh();
            }
          }}
        />
      )}

      {/* Quiz Editor Modal */}
      {canCreateAssignments && (
        <QuizCreator
          courseId={courseId}
          courseModuleId={courseModuleId}
          courseLessonId={courseLessonId}
          initialData={selectedQuiz || undefined}
          open={showQuizEditor}
          onClose={() => {
            setShowQuizEditor(false);
            setSelectedQuiz(null);
          }}
          onSave={handleUpdateQuiz}
          isEditing={!!selectedQuiz}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={quizToDelete ? "Delete Quiz/Test" : "Delete Assignment"}
        message={
          quizToDelete
            ? `Are you sure you want to delete "${quizToDelete?.name}"? This action cannot be undone and will also delete all associated questions.`
            : `Are you sure you want to delete "${assignmentToDelete?.name}"? This action cannot be undone.`
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={quizToDelete ? confirmDeleteQuiz : confirmDeleteAssignment}
      />
    </>
  );
}
