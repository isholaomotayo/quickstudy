"use client";

import React, { useState } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";
import { toast } from "react-hot-toast";

interface AssignmentQuestion {
  id?: number;
  question: string;
  details?: string;
  marks: number;
  order: number;
  question_type: "assignment";
}

interface AssignmentCreatorProps {
  courseId?: number;
  courseModuleId?: number;
  courseLessonId?: number;
  onSave: (assignment: AssignmentData) => void;
  onCancel: () => void;
  initialData?: Partial<AssignmentData>;
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

export function AssignmentCreator({
  courseId,
  courseModuleId,
  courseLessonId,
  onSave,
  onCancel,
  initialData,
}: AssignmentCreatorProps) {
  const [assignment, setAssignment] = useState<AssignmentData>({
    name: initialData?.name || "",
    instructions: initialData?.instructions || "",
    duration_mins: initialData?.duration_mins || undefined,
    deadline: initialData?.deadline || "",
    max_attempts: initialData?.max_attempts || 1,
    max_score: initialData?.max_score || 0,
    format: "assignment",
    published: initialData?.published || false,
    questions: initialData?.questions || [],
  });

  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    const newQuestion: AssignmentQuestion = {
      question: "",
      details: "",
      marks: 1,
      order: assignment.questions.length + 1,
      question_type: "assignment",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!assignment.name.trim()) {
      toast.error("Please enter an assignment name");
      return;
    }

    if (assignment.questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    if (assignment.questions.some((q) => !q.question.trim())) {
      toast.error("Please fill in all question texts");
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
      await onSave(finalAssignment);
      toast.success("Assignment saved successfully!");
    } catch (error) {
      toast.error("Failed to save assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {initialData ? "Edit Assignment" : "Create New Assignment"}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Assignment Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Name *
            </label>
            <input
              type="text"
              value={assignment.name}
              onChange={(e) =>
                setAssignment({ ...assignment, name: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter assignment name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes)
            </label>
            <input
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deadline
            </label>
            <input
              type="datetime-local"
              value={assignment.deadline}
              onChange={(e) =>
                setAssignment({ ...assignment, deadline: e.target.value })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Attempts
            </label>
            <input
              type="number"
              value={assignment.max_attempts}
              onChange={(e) =>
                setAssignment({
                  ...assignment,
                  max_attempts: parseInt(e.target.value) || 1,
                })
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="1"
              required
            />
          </div>
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instructions
          </label>
          <textarea
            value={assignment.instructions}
            onChange={(e) =>
              setAssignment({ ...assignment, instructions: e.target.value })
            }
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Provide instructions for students..."
          />
        </div>

        {/* Questions Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add Question
            </button>
          </div>

          {assignment.questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>
                No questions added yet. Click "Add Question" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignment.questions.map((question, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Question {index + 1}
                    </h4>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Question Text *
                      </label>
                      <textarea
                        value={question.question}
                        onChange={(e) =>
                          updateQuestion(index, "question", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Enter the question..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Details (Optional)
                      </label>
                      <textarea
                        value={question.details || ""}
                        onChange={(e) =>
                          updateQuestion(index, "details", e.target.value)
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={2}
                        placeholder="Additional context or requirements..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Marks
                        </label>
                        <input
                          type="number"
                          value={question.marks}
                          onChange={(e) =>
                            updateQuestion(
                              index,
                              "marks",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {assignment.questions.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Total Marks:{" "}
                <span className="font-semibold">{calculateTotalMarks()}</span>
              </p>
            </div>
          )}
        </div>

        {/* Publish Option */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="published"
            checked={assignment.published}
            onChange={(e) =>
              setAssignment({ ...assignment, published: e.target.checked })
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="published"
            className="text-sm font-medium text-gray-700"
          >
            Publish assignment immediately
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Save size={16} />
            {loading ? "Saving..." : "Save Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}
