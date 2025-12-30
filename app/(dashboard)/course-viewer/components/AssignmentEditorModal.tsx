"use client";

import React, { useState, useEffect } from "react";
import { Edit, Trash2, Save, X, Plus } from "lucide-react";
import { toast } from "sonner";
import {
    handleApiError
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
import { ConfirmDialog } from "./ConfirmDialog";
import { api } from "@/lib/api-wrapper";

interface AssignmentQuestion {
  id?: number;
  question: string;
  details?: string;
  marks: number;
  order: number;
}

interface AssignmentData {
  id: number;
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

interface AssignmentEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: AssignmentData | null;
  onAssignmentUpdated: () => void;
}

export function AssignmentEditorModal({
  open,
  onOpenChange,
  assignment,
  onAssignmentUpdated,
}: AssignmentEditorModalProps) {
  const [formData, setFormData] = useState<AssignmentData>({
    id: 0,
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update form data when assignment prop changes
  useEffect(() => {
    if (assignment) {
      // Fetch assignment details with questions
      const fetchAssignmentDetails = async () => {
        try {
          const assignmentData = await api.get(
            `/api/coursetest/${assignment.id}`
          );

          console.log("Fetched assignment data:", assignmentData);
          console.log("Questions found:", assignmentData.course_questions);

          setFormData({
            ...assignmentData,
            questions: assignmentData.course_questions || [],
            deadline: assignmentData.deadline
              ? new Date(assignmentData.deadline).toISOString().slice(0, 16)
              : "",
          });
        } catch (error) {
          console.error("Error fetching assignment details:", error);
          // Fallback to the passed assignment data
          setFormData({
            ...assignment,
            questions: [],
            deadline: assignment.deadline
              ? new Date(assignment.deadline).toISOString().slice(0, 16)
              : "",
          });
        }
      };

      fetchAssignmentDetails();
    }
  }, [assignment]);

  const addQuestion = () => {
    const newQuestion: AssignmentQuestion = {
      question: "",
      details: "",
      marks: 1,
      order: formData.questions.length + 1,
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion],
    });
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    // Reorder questions
    const reorderedQuestions = newQuestions.map((q, i) => ({
      ...q,
      order: i + 1,
    }));
    setFormData({
      ...formData,
      questions: reorderedQuestions,
    });
  };

  const updateQuestion = (
    index: number,
    field: keyof AssignmentQuestion,
    value: any
  ) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData({
      ...formData,
      questions: newQuestions,
    });
  };

  const calculateTotalMarks = () => {
    return formData.questions.reduce((total, q) => total + q.marks, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Please enter an assignment name");
      return;
    }

    if (formData.questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    if (formData.questions.some((q) => !q.question.trim())) {
      toast.error("Please fill in all question texts");
      return;
    }

    // Update max score based on total marks
    const totalMarks = calculateTotalMarks();
    const finalAssignment = {
      ...formData,
      max_score: totalMarks,
    };

    setLoading(true);
    try {
      // Convert deadline to proper ISO format if it exists
      const requestData = {
        ...finalAssignment,
      };

      // Convert deadline to ISO format if it exists
      if (requestData.deadline) {
        requestData.deadline = new Date(requestData.deadline).toISOString();
      }

      // Update the assignment
      await api.put(`/api/coursetest/${formData.id}`, requestData);
      toast.success("Assignment updated successfully!");

      // Update questions
      for (const question of finalAssignment.questions) {
        if (question.id) {
          // Update existing question
          await api.put(`/api/coursequestion/${question.id}`, {
            ...question,
            course_test_id: formData.id,
          });
        } else {
          // Create new question
          await api.post("/api/coursequestion", {
            ...question,
            course_test_id: formData.id,
          });
        }
      }

      onAssignmentUpdated();
      onOpenChange(false);
    } catch (error) {
      handleApiError(error, "Error updating assignment");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!formData.id) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!formData.id) return;

    setLoading(true);
    try {
      await api.delete(`/api/coursetest/${formData.id}`);
      
      toast.success("Assignment deleted successfully!");
      onAssignmentUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error deleting assignment:", error);
      toast.error(error.message || "Failed to delete assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Assignment
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
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter assignment name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_mins || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_mins: e.target.value
                          ? parseInt(e.target.value)
                          : undefined,
                      })
                    }
                    placeholder="Optional"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_attempts">Max Attempts</Label>
                  <Input
                    id="max_attempts"
                    type="number"
                    value={formData.max_attempts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        max_attempts: parseInt(e.target.value) || 1,
                      })
                    }
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      instructions: e.target.value,
                    })
                  }
                  placeholder="Provide instructions for students..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      published: e.target.checked,
                    })
                  }
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <Label htmlFor="published">Published</Label>
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
              {formData.questions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>
                    No questions added yet. Click "Add Question" to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.questions.map((question, index) => (
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
                            className="text-destructive hover:text-destructive/80"
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
                              rows={2}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`details-${index}`}>
                              Question Details
                            </Label>
                            <Textarea
                              id={`details-${index}`}
                              value={question.details || ""}
                              onChange={(e) =>
                                updateQuestion(index, "details", e.target.value)
                              }
                              placeholder="Additional details or context..."
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

                            <div className="space-y-2">
                              <Label htmlFor={`order-${index}`}>Order</Label>
                              <Input
                                id={`order-${index}`}
                                type="number"
                                value={question.order}
                                onChange={(e) =>
                                  updateQuestion(
                                    index,
                                    "order",
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

              {formData.questions.length > 0 && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/60">
                  <p className="text-sm text-foreground">
                    <strong>Total Marks:</strong> {calculateTotalMarks()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              onClick={handleDelete}
              variant="destructive"
              disabled={loading}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Assignment
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                type="button"
                onClick={() => onOpenChange(false)}
                variant="outline"
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="gap-2">
                <Save className="h-4 w-4" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Assignment"
        message={`Are you sure you want to delete "${formData.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </Dialog>
  );
}
