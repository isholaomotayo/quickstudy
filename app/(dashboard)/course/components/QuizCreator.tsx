"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Save, X, HelpCircle, Clock, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuizQuestion {
  id?: number;
  question: string;
  details?: string;
  marks: number;
  order: number;
  question_type: "quiz" | "test";
  options?: string[];
  correct_answer?: string;
}

interface QuizData {
  id?: number;
  course_id?: number;
  course_module_id?: number;
  course_lesson_id?: number;
  name: string;
  instructions: string;
  duration_mins?: number;
  deadline?: string | null;
  max_attempts: number;
  max_score: number;
  format: "quiz" | "test";
  published: boolean;
  questions: QuizQuestion[];
}

interface QuizCreatorProps {
  courseId?: number;
  courseModuleId?: number;
  courseLessonId?: number;
  initialData?: Partial<QuizData>;
  open: boolean;
  onClose: () => void;
  onSave: (quizData: QuizData) => Promise<void>;
  isEditing?: boolean;
}

export function QuizCreator({
  courseId,
  courseModuleId,
  courseLessonId,
  initialData,
  open,
  onClose,
  onSave,
  isEditing = false,
}: QuizCreatorProps) {
  const [quizData, setQuizData] = useState<QuizData>({
    course_id: courseId,
    course_module_id: courseModuleId,
    course_lesson_id: courseLessonId,
    name: initialData?.name || "",
    instructions: initialData?.instructions || "",
    duration_mins: initialData?.duration_mins || 30,
    deadline: initialData?.deadline || "",
    max_attempts: initialData?.max_attempts || 3,
    max_score: initialData?.max_score || 0,
    format: initialData?.format || "quiz",
    published: initialData?.published || false,
    questions: initialData?.questions || [],
    ...initialData,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("details");

  // Update quiz data when initialData changes (for editing)
  useEffect(() => {
    if (open && initialData) {
      setQuizData({
        course_id: courseId || initialData.course_id,
        course_module_id: courseModuleId || initialData.course_module_id,
        course_lesson_id: courseLessonId || initialData.course_lesson_id,
        name: initialData.name || "",
        instructions: initialData.instructions || "",
        duration_mins: initialData.duration_mins || 30,
        deadline: initialData.deadline || "",
        max_attempts: initialData.max_attempts || 3,
        max_score: initialData.max_score || 0,
        format: initialData.format || "quiz",
        published: initialData.published || false,
        questions: initialData.questions || [],
        ...initialData,
      });
      setErrors({});
      setActiveTab("details");
    } else if (open && !initialData) {
      // Reset to default values when creating new quiz
      setQuizData({
        course_id: courseId,
        course_module_id: courseModuleId,
        course_lesson_id: courseLessonId,
        name: "",
        instructions: "",
        duration_mins: 30,
        deadline: "",
        max_attempts: 3,
        max_score: 0,
        format: "quiz",
        published: false,
        questions: [],
      });
      setErrors({});
      setActiveTab("details");
    }
  }, [open, initialData, courseId, courseModuleId, courseLessonId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!quizData.name.trim()) {
      newErrors.name = "Quiz name is required";
    } else if (quizData.name.length < 3) {
      newErrors.name = "Quiz name must be at least 3 characters";
    }

    if (!quizData.instructions.trim()) {
      newErrors.instructions = "Instructions are required";
    } else if (quizData.instructions.length < 10) {
      newErrors.instructions = "Instructions must be at least 10 characters";
    }

    if (quizData.duration_mins && quizData.duration_mins < 1) {
      newErrors.duration_mins = "Duration must be at least 1 minute";
    }

    if (quizData.max_attempts < 1) {
      newErrors.max_attempts = "Max attempts must be at least 1";
    }

    if (quizData.questions.length === 0) {
      newErrors.questions = "At least one question is required";
    }

    // Validate questions
    quizData.questions.forEach((question, index) => {
      if (!question.question.trim()) {
        newErrors[`question_${index}_text`] = "Question text is required";
      }
      if (question.marks <= 0) {
        newErrors[`question_${index}_marks`] =
          "Question marks must be positive";
      }
    });

    setErrors(newErrors);
    
    // Switch to appropriate tab if there are errors
    if (Object.keys(newErrors).length > 0) {
      // Check if errors are in details tab
      const detailsErrors = ['name', 'instructions', 'duration_mins', 'max_attempts'];
      const hasDetailsErrors = detailsErrors.some(field => newErrors[field]);
      
      if (hasDetailsErrors) {
        setActiveTab('details');
      } else if (newErrors.questions || Object.keys(newErrors).some(key => key.startsWith('question_'))) {
        setActiveTab('questions');
      }
    }
    
    return Object.keys(newErrors).length === 0;
  }

  const handleSave = async () => {
    console.log("handleSave called"); // Debug log
    console.log("Quiz data:", quizData); // Debug log
    
    // Calculate total score
    const totalScore = quizData.questions.reduce(
      (sum, question) => sum + question.marks,
      0
    );
    
    // Prepare quiz data with proper null handling for deadline
    const updatedQuizData = { 
      ...quizData, 
      max_score: totalScore,
      deadline: quizData.deadline && quizData.deadline.trim() !== "" ? quizData.deadline : null
    };

    console.log("Validating form..."); // Debug log
    
    // Validate returns false if there are errors
    const isValid = validateForm();
    
    if (!isValid) {
      console.log("Validation failed"); // Debug log
      toast.error("Please fix the validation errors before saving");
      return;
    }

    console.log("Form validated, saving..."); // Debug log
    setLoading(true);
    try {
      await onSave(updatedQuizData);
      toast.success(`Quiz ${isEditing ? "updated" : "created"} successfully!`);
      onClose();
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error(`Failed to ${isEditing ? "update" : "create"} quiz`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setQuizData({
        course_id: courseId,
        course_module_id: courseModuleId,
        course_lesson_id: courseLessonId,
        name: "",
        instructions: "",
        duration_mins: 30,
        deadline: "",
        max_attempts: 3,
        max_score: 0,
        format: "quiz",
        published: false,
        questions: [],
      });
      setErrors({});
      setActiveTab("details");
      onClose();
    }
  };

  const updateField = (field: keyof QuizData, value: any) => {
    setQuizData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      question: "",
      details: "",
      marks: 1,
      order: quizData.questions.length + 1,
      question_type: quizData.format,
      options: ["", "", "", ""],
      correct_answer: "",
    };

    setQuizData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setActiveTab("questions");
  };

  const removeQuestion = (index: number) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const updateQuestion = (
    index: number,
    field: keyof QuizQuestion,
    value: any
  ) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((question, i) =>
        i === index ? { ...question, [field]: value } : question
      ),
    }));

    // Clear related errors
    if (errors[`question_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`question_${index}_${field}`]: "" }));
    }
  };

  const updateQuestionOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.map((question, i) => {
        if (i === questionIndex && question.options) {
          const newOptions = [...question.options];
          newOptions[optionIndex] = value;
          return { ...question, options: newOptions };
        }
        return question;
      }),
    }));
  };

  const totalScore = quizData.questions.reduce(
    (sum, question) => sum + (question.marks || 0),
    0
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        size="xl"
        className="max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            {isEditing ? "Edit Quiz" : "Create New Quiz"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Quiz Details</TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              Questions
              {quizData.questions.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {quizData.questions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="details" className="space-y-4">
              {/* Quiz Name */}
              <div className="space-y-2">
                <Label htmlFor="quiz-name">
                  Quiz Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quiz-name"
                  value={quizData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Enter quiz name..."
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <Label htmlFor="quiz-instructions">
                  Instructions <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="quiz-instructions"
                  value={quizData.instructions}
                  onChange={(e) => updateField("instructions", e.target.value)}
                  placeholder="Enter quiz instructions..."
                  rows={3}
                  className={errors.instructions ? "border-red-500" : ""}
                />
                {errors.instructions && (
                  <p className="text-sm text-red-500">{errors.instructions}</p>
                )}
              </div>

              {/* Duration and Attempts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiz-duration">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Duration (minutes)
                  </Label>
                  <Input
                    id="quiz-duration"
                    type="number"
                    min="1"
                    value={quizData.duration_mins || ""}
                    onChange={(e) =>
                      updateField(
                        "duration_mins",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    placeholder="30"
                    className={errors.duration_mins ? "border-red-500" : ""}
                  />
                  {errors.duration_mins && (
                    <p className="text-sm text-red-500">
                      {errors.duration_mins}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quiz-attempts">
                    <Users className="h-4 w-4 inline mr-1" />
                    Max Attempts
                  </Label>
                  <Input
                    id="quiz-attempts"
                    type="number"
                    min="1"
                    value={quizData.max_attempts}
                    onChange={(e) =>
                      updateField("max_attempts", parseInt(e.target.value))
                    }
                    className={errors.max_attempts ? "border-red-500" : ""}
                  />
                  {errors.max_attempts && (
                    <p className="text-sm text-red-500">
                      {errors.max_attempts}
                    </p>
                  )}
                </div>
              </div>

              {/* Deadline */}
              <div className="space-y-2">
                <Label htmlFor="quiz-deadline">Deadline (optional)</Label>
                <Input
                  id="quiz-deadline"
                  type="datetime-local"
                  value={quizData.deadline || ""}
                  onChange={(e) => updateField("deadline", e.target.value)}
                />
              </div>

              {/* Format */}
              <div className="space-y-2">
                <Label htmlFor="quiz-format">Quiz Type</Label>
                <Select
                  value={quizData.format}
                  onValueChange={(value: "quiz" | "assignment" | "offline" | "") =>
                    updateField("format", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="offline">Offline Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Published Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="quiz-published">Publish Quiz</Label>
                  <p className="text-sm text-gray-500">
                    Make this quiz visible to students
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="quiz-published"
                    checked={quizData.published}
                    onCheckedChange={(checked) =>
                      updateField("published", checked)
                    }
                  />
                  <Badge
                    variant={quizData.published ? "default" : "secondary"}
                    className={
                      quizData.published
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }
                  >
                    {quizData.published ? "Published" : "Draft"}
                  </Badge>
                </div>
              </div>

              {/* Total Score Display */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">
                  Total Score: {totalScore} points
                </div>
                <div className="text-xs text-blue-500">
                  Based on {quizData.questions.length} question(s)
                </div>
              </div>
            </TabsContent>

            <TabsContent value="questions" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Quiz Questions</h3>
                <Button
                  type="button"
                  onClick={addQuestion}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {errors.questions && (
                <p className="text-sm text-red-500">{errors.questions}</p>
              )}

              {quizData.questions.map((question, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        Question {index + 1}
                      </CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Question Text */}
                    <div className="space-y-2">
                      <Label>
                        Question Text <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) =>
                          updateQuestion(index, "question", e.target.value)
                        }
                        placeholder="Enter question text..."
                        rows={2}
                        className={
                          errors[`question_${index}_text`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors[`question_${index}_text`] && (
                        <p className="text-sm text-red-500">
                          {errors[`question_${index}_text`]}
                        </p>
                      )}
                    </div>

                    {/* Question Details */}
                    <div className="space-y-2">
                      <Label>Additional Details (optional)</Label>
                      <Input
                        value={question.details || ""}
                        onChange={(e) =>
                          updateQuestion(index, "details", e.target.value)
                        }
                        placeholder="Additional context or explanation..."
                      />
                    </div>

                    {/* Options for multiple choice */}
                    {question.options && (
                      <div className="space-y-2">
                        <Label>Answer Options</Label>
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center gap-2"
                          >
                            <span className="text-sm font-medium">
                              {String.fromCharCode(65 + optionIndex)}.
                            </span>
                            <Input
                              value={option}
                              onChange={(e) =>
                                updateQuestionOption(
                                  index,
                                  optionIndex,
                                  e.target.value
                                )
                              }
                              placeholder={`Option ${String.fromCharCode(
                                65 + optionIndex
                              )}`}
                            />
                          </div>
                        ))}

                        {/* Correct Answer */}
                        <div className="space-y-2">
                          <Label>Correct Answer</Label>
                          <Select
                            value={question.correct_answer || ""}
                            onValueChange={(value) =>
                              updateQuestion(index, "correct_answer", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select correct answer" />
                            </SelectTrigger>
                            <SelectContent>
                              {question.options.map((option, optionIndex) => (
                                <SelectItem
                                  key={optionIndex}
                                  value={String.fromCharCode(65 + optionIndex)}
                                  disabled={!option.trim()}
                                >
                                  {String.fromCharCode(65 + optionIndex)}.{" "}
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Points */}
                    <div className="space-y-2">
                      <Label>
                        Points <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        min="1"
                        value={question.marks}
                        onChange={(e) =>
                          updateQuestion(
                            index,
                            "marks",
                            parseInt(e.target.value)
                          )
                        }
                        className={
                          errors[`question_${index}_marks`]
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {errors[`question_${index}_marks`] && (
                        <p className="text-sm text-red-500">
                          {errors[`question_${index}_marks`]}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {quizData.questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No questions added yet.</p>
                  <p className="text-sm">
                    Click "Add Question" to get started.
                  </p>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              console.log("Create Quiz button clicked!", e);
              handleSave();
            }}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading
              ? `${isEditing ? "Updating" : "Creating"}...`
              : `${isEditing ? "Update" : "Create"} Quiz`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
