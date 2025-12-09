"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
    Clock,
    Calendar, Award,
    TrendingUp,
    BookOpen,
    Download,
    AlertCircle
} from "lucide-react";

interface TestDetail {
  id: number;
  test_name: string;
  course_test_id: number;
  score: number;
  max_score: number;
  duration_mins: number;
  deadline: string;
  format: string;
  attempt_number: number;
  max_attempts: number;
  questions_answers?: Array<{
    questionId: number;
    questionOrder: number;
    questionMarks?: number;
    questionText: string;
    selection: Record<
      string,
      {
        text: string;
        is_answer: boolean;
      }
    >;
  }>;
  user?: {
    first_name: string;
    last_name: string;
    username: string;
  };
  created_at: string;
  updated_at: string;
}

interface TestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTestId: number | null;
}

export function TestDetailModal({
  isOpen,
  onClose,
  courseTestId,
}: TestDetailModalProps) {
  const [testDetail, setTestDetail] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && courseTestId) {
      fetchTestDetail();
    }
  }, [isOpen, courseTestId]);

  const fetchTestDetail = async () => {
    if (!courseTestId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch real test details from the API
      const response = await fetch(`/api/studenttest/${courseTestId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // API wraps response in { success, data, user } structure
      const testDetail = result.data || result;
      setTestDetail(testDetail);
    } catch (err) {
      setError("Failed to load test details");
      console.error("Error fetching test detail:", err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 70) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    if (percentage >= 50) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return "bg-green-100 text-green-800";
    if (percentage >= 70) return "bg-blue-100 text-blue-800";
    if (percentage >= 60) return "bg-yellow-100 text-yellow-800";
    if (percentage >= 50) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading test details...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>{error}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <Button onClick={fetchTestDetail} variant="outline">
              Try Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!testDetail) {
    return null;
  }

  const percentage = (testDetail.score / testDetail.max_score) * 100;
  const totalQuestions = testDetail.questions_answers?.length || 0;
  const correctAnswers =
    testDetail.questions_answers?.filter((question) => {
      if (!question.selection || typeof question.selection !== "object")
        return false;
      const selectedOption = Object.entries(question.selection).find(
        ([key, option]) => option.text && option.text.trim() !== ""
      );
      return selectedOption && selectedOption[1].is_answer;
    }).length || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>{testDetail.test_name}</span>
          </DialogTitle>
          <DialogDescription>
            {testDetail.test_name} • {testDetail.format}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Information Note */}
          {testDetail.questions_answers &&
            testDetail.questions_answers.length > 0 && (
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">
                        Test Review Information:
                      </p>
                      <p>
                        This view shows your test performance and questions.
                        Correct answers are hidden to maintain academic
                        integrity.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Score Summary */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-900">
                <Award className="h-5 w-5" />
                <span>Test Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${getScoreColor(
                      testDetail.score,
                      testDetail.max_score
                    )}`}
                  >
                    {testDetail.score}/{testDetail.max_score}
                  </div>
                  <div className="text-sm text-gray-600">Total Score</div>
                  <Badge
                    className={`mt-2 ${getScoreBadge(
                      testDetail.score,
                      testDetail.max_score
                    )}`}
                  >
                    {percentage.toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {correctAnswers}/{totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">Correct Answers</div>
                  <Progress
                    value={(correctAnswers / totalQuestions) * 100}
                    className="mt-2"
                  />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {testDetail.duration_mins} min
                  </div>
                  <div className="text-sm text-gray-600">Time Taken</div>
                  <div className="flex items-center justify-center mt-2">
                    <Clock className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-500">Duration</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {testDetail.attempt_number}/{testDetail.max_attempts}
                  </div>
                  <div className="text-sm text-gray-600">Attempt</div>
                  <Progress
                    value={
                      (testDetail.attempt_number / testDetail.max_attempts) *
                      100
                    }
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Test Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Submitted:</span>
                  <span className="ml-2 text-gray-600">
                    {formatDate(testDetail.created_at)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Deadline:</span>
                  <span className="ml-2 text-gray-600">
                    {formatDate(testDetail.deadline)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Format:</span>
                  <span className="ml-2 text-gray-600">
                    {testDetail.format}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <span className="ml-2 text-gray-600">
                    {testDetail.duration_mins} minutes
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Review */}
          {testDetail.questions_answers &&
          testDetail.questions_answers.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Question Review</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {testDetail.questions_answers.map((question, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-gray-900">
                          Question {question.questionOrder}:{" "}
                          {question.questionText}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {question.questionMarks || 1} mark
                            {question.questionMarks !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Student's Answer Summary */}
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-700">
                            Question Status:
                          </span>
                          <span className="text-gray-600">
                            Question completed
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {Object.entries(question.selection).map(
                          ([key, option]) => (
                            <div
                              key={key}
                              className="flex items-center space-x-2 p-2 rounded bg-gray-50"
                            >
                              <span className="font-medium text-gray-700">
                                {key}:
                              </span>
                              <span className="text-gray-900">
                                {option.text || `Option ${key}`}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Question Review</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Questions Available
                  </h3>
                  <p className="text-sm text-gray-500">
                    This test doesn't have any questions or answers recorded.
                    This might be because the test was not completed or the
                    answers were not saved.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button className="flex items-center space-x-1">
              <Download className="h-4 w-4" />
              <span>Download Report</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
