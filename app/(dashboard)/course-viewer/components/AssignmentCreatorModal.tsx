"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  handleApiResponse,
  handleApiError,
} from "@/helpers/apiResponseHandler";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AssignmentQuestion {
  id?: number;
  question: string;
  details?: string;
  marks: number;
  order: number;
}

interface AssignmentCreatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number;
  courseModuleId: number;
  courseLessonId: number;
  onAssignmentCreated: () => void;
}

interface AssignmentData {
  name: string;
  instructions: string;
  duration_mins?: number;
  deadline?: string;
  max_attempts: number;
  max_score: number;
  format: "assignment";
  published: boolean;
  questions: AssignmentQuestion[];
}

export function AssignmentCreatorModal({
  open,
  onOpenChange,
  courseId,
  courseModuleId,
  courseLessonId,
  onAssignmentCreated,
}: AssignmentCreatorModalProps) {
  // Generate a unique key for this assignment form
  const storageKey = `assignment_draft_${courseId}_${courseModuleId}_${courseLessonId}`;

  const [assignment, setAssignment] = useState<AssignmentData>({
    name: "",
    instructions: "",
    duration_mins: undefined,
    deadline: "",
    max_attempts: 1,
    max_score: 0,
    format: "assignment",
    published: false,
    questions: [],
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load saved data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setAssignment(parsedData);
          toast.success("Draft loaded from previous session");
        } catch (error) {
          console.error("Error loading saved data:", error);
        }
      }
    }
  }, [storageKey]);

  // Save data to localStorage whenever assignment changes
  useEffect(() => {
    if (typeof window !== "undefined" && assignment.name.trim()) {
      localStorage.setItem(storageKey, JSON.stringify(assignment));
    }
  }, [assignment, storageKey]);

  // Clear saved data when modal closes
  useEffect(() => {
    if (!open) {
      setErrors({});
    }
  }, [open]);

  const addQuestion = () => {
    const newQuestion: AssignmentQuestion = {
      question: "",
      details: "",
      marks: 1,
      order: assignment.questions.length + 1,
    };
    setAssignment({
      ...assignment,
      questions: [...assignment.questions, newQuestion],
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = assignment.questions.filter((_, i) => i !== index);
    // Reorder questions
    const reorderedQuestions = newQuestions.map((q, i) => ({
      ...q,
      order: i + 1,
    }));
    setAssignment({
      ...assignment,
      questions: reorderedQuestions,
    });
  };

  const updateQuestion = (
    index: number,
    field: keyof AssignmentQuestion,
    value: any
  ) => {
    const newQuestions = [...assignment.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setAssignment({
      ...assignment,
      questions: newQuestions,
    });
  };

  const calculateTotalMarks = () => {
    return assignment.questions.reduce((total, q) => total + q.marks, 0);
  };

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }
    setAssignment({
      name: "",
      instructions: "",
      duration_mins: undefined,
      deadline: "",
      max_attempts: 1,
      max_score: 0,
      format: "assignment",
      published: false,
      questions: [],
    });
    setErrors({});
    toast.success("Draft cleared");
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Assignment name validation
    if (!assignment.name.trim()) {
      newErrors.name = "Assignment name is required";
    } else if (assignment.name.trim().length < 3) {
      newErrors.name = "Assignment name must be at least 3 characters";
    } else if (assignment.name.trim().length > 255) {
      newErrors.name = "Assignment name must be less than 255 characters";
    }

    // Duration validation
    if (
      assignment.duration_mins !== undefined &&
      assignment.duration_mins <= 0
    ) {
      newErrors.duration_mins = "Duration must be greater than 0";
    }

    // Max attempts validation
    if (assignment.max_attempts <= 0) {
      newErrors.max_attempts = "Max attempts must be greater than 0";
    } else if (assignment.max_attempts > 10) {
      newErrors.max_attempts = "Max attempts cannot exceed 10";
    }

    // Deadline validation
    if (assignment.deadline) {
      const deadlineDate = new Date(assignment.deadline);
      const now = new Date();
      if (deadlineDate <= now) {
        newErrors.deadline = "Deadline must be in the future";
      }
    }

    // Questions validation
    if (assignment.questions.length === 0) {
      newErrors.questions = "At least one question is required";
    } else {
      assignment.questions.forEach((question, index) => {
        if (!question.question.trim()) {
          newErrors[`question_${index}`] = "Question text is required";
        } else if (question.question.trim().length < 5) {
          newErrors[`question_${index}`] =
            "Question must be at least 5 characters";
        }

        if (question.marks <= 0) {
          newErrors[`marks_${index}`] = "Marks must be greater than 0";
        } else if (question.marks > 100) {
          newErrors[`marks_${index}`] = "Marks cannot exceed 100";
        }

        if (question.order <= 0) {
          newErrors[`order_${index}`] = "Order must be greater than 0";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    // Update max score based on total marks
    const totalMarks = calculateTotalMarks();
    const finalAssignment = {
      ...assignment,
      max_score: totalMarks,
    };

    setLoading(true);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      // Convert deadline to proper ISO format if it exists
      const requestData = {
        ...finalAssignment,
        course_id: courseId,
        course_module_id: courseModuleId,
        course_lesson_id: courseLessonId,
      };

      // Convert deadline to ISO format if it exists
      if (requestData.deadline) {
        requestData.deadline = new Date(requestData.deadline).toISOString();
      }

      // Create assignment and questions in a single request using the bulk endpoint
      const response = await fetch(
        `${API_URL}/api/coursetest/bulk-assignment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestData),
        }
      );

      await handleApiResponse(
        response,
        "Assignment created successfully!",
        "Failed to create assignment"
      );

      // Clear localStorage on successful submission
      if (typeof window !== "undefined") {
        localStorage.removeItem(storageKey);
      }

      onAssignmentCreated();
      onOpenChange(false);

      // Reset form
      setAssignment({
        name: "",
        instructions: "",
        duration_mins: undefined,
        deadline: "",
        max_attempts: 1,
        max_score: 0,
        format: "assignment",
        published: false,
        questions: [],
      });
      setErrors({});
    } catch (error) {
      handleApiError(error, "Error creating assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Assignment
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Assignment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Assignment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Assignment Name *</Label>
                  <Input
                    id="name"
                    value={assignment.name}
                    onChange={(e) =>
                      setAssignment({ ...assignment, name: e.target.value })
                    }
                    placeholder="Enter assignment name"
                    required
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={assignment.duration_mins || ""}
                    onChange={(e) =>
                      setAssignment({
                        ...assignment,
                        duration_mins: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Optional"
                    min="1"
                    className={errors.duration_mins ? "border-red-500" : ""}
                  />
                  {errors.duration_mins && (
                    <p className="text-sm text-red-500">
                      {errors.duration_mins}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={assignment.deadline}
                    onChange={(e) =>
                      setAssignment({ ...assignment, deadline: e.target.value })
                    }
                    className={errors.deadline ? "border-red-500" : ""}
                  />
                  {errors.deadline && (
                    <p className="text-sm text-red-500">{errors.deadline}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_attempts">Max Attempts</Label>
                  <Input
                    id="max_attempts"
                    type="number"
                    value={assignment.max_attempts}
                    onChange={(e) =>
                      setAssignment({
                        ...assignment,
                        max_attempts: parseInt(e.target.value) || 1,
                      })
                    }
                    min="1"
                    required
                    className={errors.max_attempts ? "border-red-500" : ""}
                  />
                  {errors.max_attempts && (
                    <p className="text-sm text-red-500">
                      {errors.max_attempts}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={assignment.instructions}
                  onChange={(e) =>
                    setAssignment({
                      ...assignment,
                      instructions: e.target.value,
                    })
                  }
                  placeholder="Provide instructions for students..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Questions</CardTitle>
                <Button
                  type="button"
                  onClick={addQuestion}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {errors.questions && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.questions}</p>
                </div>
              )}
              {assignment.questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>
                    No questions added yet. Click "Add Question" to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignment.questions.map((question, index) => (
                    <Card key={index} className="border-dashed">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              Question {index + 1}
                            </Badge>
                            <Badge variant="secondary">
                              {question.marks} marks
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor={`question-${index}`}>
                              Question Text *
                            </Label>
                            <Textarea
                              id={`question-${index}`}
                              value={question.question}
                              onChange={(e) =>
                                updateQuestion(
                                  index,
                                  "question",
                                  e.target.value
                                )
                              }
                              placeholder="Enter the question..."
                              rows={3}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`details-${index}`}>
                              Additional Details (Optional)
                            </Label>
                            <Textarea
                              id={`details-${index}`}
                              value={question.details || ""}
                              onChange={(e) =>
                                updateQuestion(index, "details", e.target.value)
                              }
                              placeholder="Additional context or requirements..."
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`marks-${index}`}>Marks</Label>
                              <Input
                                id={`marks-${index}`}
                                type="number"
                                value={question.marks}
                                onChange={(e) =>
                                  updateQuestion(
                                    index,
                                    "marks",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                min="1"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {assignment.questions.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Total Marks:{" "}
                    <span className="font-semibold">
                      {calculateTotalMarks()}
                    </span>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Publish Option */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={assignment.published}
                  onChange={(e) =>
                    setAssignment({
                      ...assignment,
                      published: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Label htmlFor="published" className="text-sm font-medium">
                  Publish assignment immediately
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t">
            <div className="flex items-center gap-2">
              {assignment.name.trim() && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearDraft}
                  className="text-red-500 hover:text-red-700"
                >
                  Clear Draft
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="h-4 w-4" />
                {loading ? "Creating..." : "Create Assignment"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
