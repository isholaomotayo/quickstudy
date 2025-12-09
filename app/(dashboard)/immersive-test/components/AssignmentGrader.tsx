"use client";

import React, { useState, useEffect } from "react";
import { Download, Eye, Save, CheckCircle, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import { translateCode } from "@/helpers/language/translate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AssignmentSubmission {
  id: number;
  user_id: number;
  course_test_id: number;
  test_name: string;
  questions_answers: Array<{
    questionId: number;
    questionOrder: number;
    questionMarks: number;
    questionText: string;
    selection?: {
      text_answer: string;
      file_answer: string; // JSON string containing files array
    };
    // Fallback for old structure
    question_id?: number;
    text?: string;
    file_answer?: string;
    files?: Array<{
      name: string;
      url: string;
      size: number;
    }>;
  }>;
  score: number | null;
  max_score: number;
  submitted_at: string;
  marked_by?: number | null;
  marked_at?: string | null;
  feedback?:
    | Array<{
        questionId: number;
        feedback: string;
      }>
    | string; // Structured array or fallback string
  user: {
    first_name: string;
    last_name: string;
    username: string;
  };
}

interface AssignmentQuestion {
  id: number;
  question: string;
  details?: string;
  marks: number;
  order: number;
}

interface AssignmentGraderProps {
  submission: AssignmentSubmission;
  questions: AssignmentQuestion[];
  onGrade: (submissionId: number, scores: number[], feedback: string[]) => void;
  onClose: () => void;
  open: boolean;
}

export function AssignmentGrader({
  submission,
  questions,
  onGrade,
  onClose,
  open,
}: AssignmentGraderProps) {
  const [scores, setScores] = useState<number[]>(questions.map(() => 0));
  const [feedback, setFeedback] = useState<string[]>(questions.map(() => ""));
  const [loading, setLoading] = useState(false);

  // Initialize scores and feedback with existing data if submission is already graded
  useEffect(() => {
    if (submission.score !== null && submission.score !== undefined) {
      // If there's a total score, distribute it evenly across questions for now
      // In a more sophisticated system, you'd store individual question scores
      const scorePerQuestion = Math.round(submission.score / questions.length);
      setScores(questions.map(() => scorePerQuestion));
    }

    // Load existing feedback if available
    if (submission.feedback) {
      const existingFeedback = Array(questions.length).fill("");

      if (Array.isArray(submission.feedback)) {
        // Handle structured feedback format: [{"questionId": 12426, "feedback": "text"}]
        submission.feedback.forEach((feedbackItem) => {
          if (
            feedbackItem &&
            feedbackItem.questionId &&
            feedbackItem.feedback
          ) {
            // Find the question index by matching questionId
            const questionIndex = questions.findIndex(
              (q) => q.id === feedbackItem.questionId
            );
            if (questionIndex >= 0 && questionIndex < questions.length) {
              existingFeedback[questionIndex] = feedbackItem.feedback;
            }
          }
        });
      } else if (typeof submission.feedback === "string") {
        // Fallback for old string format
        try {
          const parsedFeedback = JSON.parse(submission.feedback);
          if (Array.isArray(parsedFeedback)) {
            parsedFeedback.forEach((feedbackItem) => {
              if (
                feedbackItem &&
                feedbackItem.questionId &&
                feedbackItem.feedback
              ) {
                const questionIndex = questions.findIndex(
                  (q) => q.id === feedbackItem.questionId
                );
                if (questionIndex >= 0 && questionIndex < questions.length) {
                  existingFeedback[questionIndex] = feedbackItem.feedback;
                }
              }
            });
          }
        } catch (e) {
          // If parsing fails, treat as simple string
          console.warn("Failed to parse feedback:", e);
        }
      }

      setFeedback(existingFeedback);
    }
  }, [submission.score, submission.feedback, questions.length]);

  const handleScoreChange = (questionIndex: number, score: number) => {
    const newScores = [...scores];
    newScores[questionIndex] = Math.min(score, questions[questionIndex].marks);
    setScores(newScores);
  };

  const handleFeedbackChange = (
    questionIndex: number,
    feedbackText: string
  ) => {
    const newFeedback = [...feedback];
    newFeedback[questionIndex] = feedbackText;
    setFeedback(newFeedback);
  };

  const calculateTotalScore = () => {
    return scores.reduce((total, score) => total + score, 0);
  };

  const getGradeFromScore = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 70) return { grade: "A", color: "text-green-600" };
    if (percentage >= 60) return { grade: "B", color: "text-blue-600" };
    if (percentage >= 50) return { grade: "C", color: "text-yellow-600" };
    if (percentage >= 45) return { grade: "D", color: "text-orange-600" };
    if (percentage >= 40) return { grade: "E", color: "text-red-500" };
    return { grade: "F", color: "text-red-600" };
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onGrade(submission.id, scores, feedback);
      // Success message is handled by the parent component
      onClose();
    } catch (error) {
      // Check if it's an API error with pageNotif
      if (error.pageNotif) {
        const errorMessage = translateCode(error.pageNotif);
        toast.error(errorMessage);
      } else {
        toast.error("Failed to grade assignment");
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadFile = (file: { name: string; url: string }) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "txt":
        return "📄";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "🖼️";
      default:
        return "📎";
    }
  };

  // Helper function to parse file_answer JSON string and get files array
  const getFilesFromAnswer = (submissionAnswer: any) => {
    if (!submissionAnswer) {
      return [];
    }

    console.log("submissionAnswer:", submissionAnswer); // Debug log

    // Handle the actual backend structure where files are in selection.file_answer
    if (submissionAnswer.selection && submissionAnswer.selection.file_answer) {
      try {
        const parsedFiles = JSON.parse(submissionAnswer.selection.file_answer);
        console.log("Parsed files from selection.file_answer:", parsedFiles);
        return Array.isArray(parsedFiles) ? parsedFiles : [];
      } catch (error) {
        console.error("Error parsing selection.file_answer:", error);
        return [];
      }
    }

    // Fallback for old structure
    if (submissionAnswer.files && Array.isArray(submissionAnswer.files)) {
      console.log("Using files array:", submissionAnswer.files);
      return submissionAnswer.files;
    }

    if (submissionAnswer.file_answer) {
      try {
        const parsedFiles = JSON.parse(submissionAnswer.file_answer);

        return Array.isArray(parsedFiles) ? parsedFiles : [];
      } catch (error) {
        console.error("Error parsing file_answer:", error);
        return [];
      }
    }

    console.log("No files found");
    return [];
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Grade Assignment Submission
              </h2>
              <p className="text-gray-600">
                {submission.user.first_name} {submission.user.last_name} (
                {submission.user.username})
              </p>
              <p className="text-sm text-gray-500">
                Submitted: {new Date(submission.submitted_at).toLocaleString()}
              </p>
              {submission.score !== null && submission.score !== undefined && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                  >
                    Current Grade: {submission.score}/
                    {submission.max_score ||
                      questions.reduce((sum, q) => sum + q.marks, 0)}
                  </Badge>
                  {submission.marked_at && (
                    <span className="text-xs text-gray-500">
                      Graded: {new Date(submission.marked_at).toLocaleString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Questions and Answers */}
          {questions.map((question, questionIndex) => {
            const submissionAnswer = submission.questions_answers.find(
              (answer) => answer.questionId === question.id
            );

            return (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">
                      Question {questionIndex + 1}
                    </span>
                    <Badge variant="secondary">
                      Max Marks: {question.marks}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Question */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div
                      className="font-medium text-gray-900"
                      dangerouslySetInnerHTML={{ __html: question.question }}
                    />
                    {question.details && (
                      <div
                        className="text-sm text-gray-600 mt-1"
                        dangerouslySetInnerHTML={{ __html: question.details }}
                      />
                    )}
                  </div>

                  {/* Student's Answer */}
                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      Student's Answer:
                    </Label>

                    {/* Text Answer */}
                    {(submissionAnswer?.text ||
                      submissionAnswer?.selection?.text_answer) && (
                      <div className="p-3 bg-blue-50 rounded-lg max-h-40 overflow-y-auto">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {submissionAnswer?.selection?.text_answer ||
                            submissionAnswer?.text}
                        </p>
                      </div>
                    )}

                    {/* File Attachments */}
                    {(() => {
                      const files = getFilesFromAnswer(submissionAnswer);
                      if (files.length > 0) {
                        return (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Attached Files:
                            </Label>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                              {files.map((file, fileIndex) => (
                                <div
                                  key={fileIndex}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">
                                      {getFileIcon(file.name)}
                                    </span>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {file.name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {formatFileSize(file.size)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      onClick={() =>
                                        window.open(file.url, "_blank")
                                      }
                                      variant="ghost"
                                      size="sm"
                                      className="p-1 h-auto"
                                      title="View file"
                                    >
                                      <Eye size={16} />
                                    </Button>
                                    <Button
                                      onClick={() => downloadFile(file)}
                                      variant="ghost"
                                      size="sm"
                                      className="p-1 h-auto"
                                      title="Download file"
                                    >
                                      <Download size={16} />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {!submissionAnswer?.text &&
                      getFilesFromAnswer(submissionAnswer).length === 0 && (
                        <div className="p-3 bg-red-50 rounded-lg">
                          <p className="text-sm text-red-600">
                            No answer submitted
                          </p>
                        </div>
                      )}
                  </div>

                  {/* Grading Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`score-${questionIndex}`}>
                        Score (0 - {question.marks})
                      </Label>
                      <Input
                        id={`score-${questionIndex}`}
                        type="number"
                        value={scores[questionIndex] || ""}
                        onChange={(e) =>
                          handleScoreChange(
                            questionIndex,
                            parseInt(e.target.value) || 0
                          )
                        }
                        min="0"
                        max={question.marks}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`feedback-${questionIndex}`}>
                        Feedback (Optional)
                      </Label>
                      <Textarea
                        id={`feedback-${questionIndex}`}
                        value={feedback[questionIndex] || ""}
                        onChange={(e) =>
                          handleFeedbackChange(questionIndex, e.target.value)
                        }
                        rows={3}
                        placeholder="Provide feedback for this question..."
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-800">
                    Total Score: {calculateTotalScore()} /{" "}
                    {submission.max_score}
                  </p>
                  <p className="text-sm text-blue-600">
                    Percentage:{" "}
                    {(
                      (calculateTotalScore() / submission.max_score) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <div className="text-right">
                  {(() => {
                    const gradeInfo = getGradeFromScore(
                      calculateTotalScore(),
                      submission.max_score
                    );
                    return (
                      <p className={`text-lg font-bold ${gradeInfo.color}`}>
                        Grade: {gradeInfo.grade}
                      </p>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="gap-2">
              <Save size={16} />
              {loading
                ? "Saving..."
                : submission.score !== null && submission.score !== undefined
                ? "Update Grade"
                : "Save Grade"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
