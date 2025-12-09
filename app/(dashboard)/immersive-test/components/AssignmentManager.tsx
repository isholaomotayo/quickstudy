"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Eye,
  Download,
  CheckCircle,
  Clock,
  Users,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { translateCode } from "@/helpers/language/translate";
import {
  handleApiResponse,
  handleApiError,
} from "@/helpers/apiResponseHandler";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssignmentGrader } from "./AssignmentGrader";
import { AssignmentCreator } from "./AssignmentCreator";
import { api } from "@/lib/api-wrapper";

interface Assignment {
  id: number;
  name: string;
  instructions: string;
  duration_mins?: number;
  deadline?: string;
  max_attempts: number;
  max_score: number;
  format: "assignment";
  published: boolean;
  created_at: string;
  course_id?: number;
  course_module_id?: number;
  course_lesson_id?: number;
  submissions_count?: number;
  graded_count?: number;
}

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
  feedback?: any; // JSON object or string
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

interface AssignmentManagerProps {
  courseId?: number;
  courseModuleId?: number;
  courseLessonId?: number;
}

export function AssignmentManager({
  courseId,
  courseModuleId,
  courseLessonId,
}: AssignmentManagerProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [questions, setQuestions] = useState<AssignmentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] =
    useState<AssignmentSubmission | null>(null);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [showGrader, setShowGrader] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [activeTab, setActiveTab] = useState("assignments");

  // Helper function to parse file_answer JSON string and get files array
  const getFilesFromAnswer = (submissionAnswer: any) => {
    if (!submissionAnswer) {
      return [];
    }

    // Handle the actual backend structure where files are in selection.file_answer
    if (submissionAnswer.selection && submissionAnswer.selection.file_answer) {
      try {
        const parsedFiles = JSON.parse(submissionAnswer.selection.file_answer);
        return Array.isArray(parsedFiles) ? parsedFiles : [];
      } catch (error) {
        console.error("Error parsing selection.file_answer:", error);
        return [];
      }
    }

    // Fallback for old structure
    if (submissionAnswer.files && Array.isArray(submissionAnswer.files)) {
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

    return [];
  };

  useEffect(() => {
    loadAssignments();
  }, [courseId, courseModuleId, courseLessonId]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (courseId) params.append("course_id", courseId.toString());
      if (courseModuleId)
        params.append("course_module_id", courseModuleId.toString());
      if (courseLessonId)
        params.append("course_lesson_id", courseLessonId.toString());
      params.append("format", "assignment");

      const data = await api.get(`/api/coursetest?${params}`);
      setAssignments(data);
    } catch (error) {
      handleApiError(error, "Error loading assignments");
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async (assignmentId: number) => {
    try {
      // Use the correct filter format that checkAccess expects
      const data = await api.get(
        `/api/studenttest?filter=course_test_id:${assignmentId}`
      );
      setSubmissions(data);
    } catch (error) {
      handleApiError(error, "Error loading submissions");
    }
  };

  const loadSubmission = async (submissionId: number) => {
    try {
      const updatedSubmission = await api.get(
        `/api/studenttest/${submissionId}`
      );

      // Update the submission in the current list
      setSubmissions((prevSubmissions) =>
        prevSubmissions.map((sub) =>
          sub.id === submissionId ? updatedSubmission : sub
        )
      );

      // Update selectedSubmission if it's the one being graded
      if (selectedSubmission && selectedSubmission.id === submissionId) {
        setSelectedSubmission(updatedSubmission);
      }
    } catch (error) {
      handleApiError(error, "Error loading submission");
    }
  };

  const loadQuestions = async (assignmentId: number) => {
    try {
      // Use the correct filter format that checkAccess expects
      const data = await api.get(
        `/api/coursequestion?filter=course_test_id:${assignmentId}`
      );
      setQuestions(data);
    } catch (error) {
      handleApiError(error, "Error loading questions");
    }
  };

  const handleGradeSubmission = async (
    submissionId: number,
    scores: number[],
    feedback: string[]
  ) => {
    try {
      const totalScore = scores.reduce((sum, score) => sum + score, 0);

      // Create structured feedback with questionId
      const structuredFeedback = feedback
        .map((feedbackText, index) => ({
          questionId: questions[index]?.id,
          feedback: feedbackText,
        }))
        .filter((item) => item.questionId && item.feedback);

      // Use the existing mark endpoint from studentTestController
      await api.post("/api/studenttest/mark", {
        student_test_id: submissionId,
        score: totalScore,
        feedback: structuredFeedback, // Send as structured array
      });

      toast.success("Assignment graded successfully!");

      // Reload the specific submission to get updated grade
      await loadSubmission(submissionId);

      // Also reload all submissions to update the list
      if (selectedAssignment) {
        loadSubmissions(selectedAssignment.id);
      }
    } catch (error) {
      handleApiError(error, "Error grading submission");
      throw error;
    }
  };

  const handleViewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    await loadSubmissions(assignment.id);
    await loadQuestions(assignment.id);
    setActiveTab("submissions");
  };

  const handleGradeSubmissionClick = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    setShowGrader(true);
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (!assignment.published) {
      return <Badge variant="secondary">Draft</Badge>;
    }

    const now = new Date();
    const deadline = assignment.deadline ? new Date(assignment.deadline) : null;

    if (deadline && now > deadline) {
      return <Badge variant="destructive">Closed</Badge>;
    }

    return <Badge variant="default">Active</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleCreateAssignment = async (assignmentData: any) => {
    try {
      // Create the assignment
      const assignment = await api.post("/api/coursetest", {
        ...assignmentData,
        course_id: courseId,
        course_module_id: courseModuleId,
        course_lesson_id: courseLessonId,
      });

      toast.success("Assignment created successfully!");

      // Create questions for the assignment
      for (const question of assignmentData.questions) {
        await api.post("/api/coursequestion", {
          ...question,
          course_test_id: assignment.id,
          course_id: courseId,
        });
      }

      setShowCreator(false);
      await loadAssignments();
    } catch (error) {
      handleApiError(error, "Error creating assignment");
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Assignment Management
          </h1>
          <p className="text-gray-600">
            Manage assignments and grade submissions
          </p>
        </div>
        <button
          onClick={() => setShowCreator(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Create Assignment
        </button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="assignments">
            Assignments ({assignments.length})
          </TabsTrigger>
          {selectedAssignment && (
            <TabsTrigger value="submissions">
              Submissions ({submissions.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No assignments
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new assignment.
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => setShowCreator(true)}
                  className="inline-flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create Assignment
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">
                            {assignment.name}
                          </CardTitle>
                          {getStatusBadge(assignment)}
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {assignment.instructions}
                        </p>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>Max Score: {assignment.max_score}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>Max Attempts: {assignment.max_attempts}</span>
                          </div>
                          {assignment.deadline && (
                            <div className="flex items-center gap-1">
                              <span>
                                Deadline: {formatDate(assignment.deadline)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={() => handleViewSubmissions(assignment)}
                        variant="outline"
                        size="sm"
                        className="gap-1"
                      >
                        <Eye size={14} />
                        View Submissions
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          {selectedAssignment && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Submissions for "{selectedAssignment.name}"
                  </h2>
                  <p className="text-gray-600">
                    {submissions.length} submission
                    {submissions.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button
                  onClick={() => setActiveTab("assignments")}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  <ArrowLeft size={14} />
                  Back to Assignments
                </Button>
              </div>

              {submissions.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No submissions yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Students haven't submitted any assignments yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <Card
                      key={submission.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {submission?.user?.first_name}{" "}
                                {submission?.user?.last_name}
                              </h4>
                              <span className="text-sm text-gray-500">
                                ({submission?.user?.username})
                              </span>
                              {submission.marked_by ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <Clock className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>
                                Submitted: {formatDate(submission.submitted_at)}
                              </span>
                              <span>
                                Score: {submission.score}/{submission.max_score}
                              </span>
                              <span>
                                Files:{" "}
                                {submission.questions_answers.reduce(
                                  (total, answer) => {
                                    const files = getFilesFromAnswer(answer);
                                    return total + files.length;
                                  },
                                  0
                                )}
                              </span>
                            </div>
                          </div>

                          <Button
                            onClick={() =>
                              handleGradeSubmissionClick(submission)
                            }
                            variant={
                              submission.marked_by ? "outline" : "default"
                            }
                            size="sm"
                            className="gap-1"
                          >
                            {submission.marked_by ? "View Grade" : "Grade"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Grading Modal */}
      {showGrader && selectedSubmission && (
        <AssignmentGrader
          submission={selectedSubmission}
          questions={questions}
          onGrade={handleGradeSubmission}
          onClose={() => {
            setShowGrader(false);
            setSelectedSubmission(null);
          }}
          open={showGrader}
        />
      )}

      {/* Assignment Creator Modal */}
      {showCreator && (
        <AssignmentCreator
          courseId={courseId}
          courseModuleId={courseModuleId}
          courseLessonId={courseLessonId}
          onSave={handleCreateAssignment}
          onCancel={() => setShowCreator(false)}
        />
      )}
    </div>
  );
}
