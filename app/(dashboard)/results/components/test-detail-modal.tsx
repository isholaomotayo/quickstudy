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
  AlertCircle, CheckCircle,
  XCircle
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
    questionDetails?: string;
    selection: Record<
      string,
      {
        text: string;
        is_answer: boolean;
        is_correct?: boolean;
      }
    > | {
      text_answer?: string;
      file_answer?: string;
    };
  }>;
  user?: {
    first_name: string;
    last_name: string;
    username: string;
  };
  created_at: string;
  updated_at: string;
  feedback?: Array<{
    questionId: number;
    feedback: string;
  }>;
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
    if (percentage >= 80)
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-400/50";
    if (percentage >= 70)
      return "bg-primary/10 text-primary border border-primary/40";
    if (percentage >= 60)
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/50";
    if (percentage >= 50)
      return "bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-400/50";
    return "bg-destructive/10 text-destructive border border-destructive/40";
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
      <DialogContent size="lg" className="max-w-4xl max-h-[80vh] overflow-y-auto bg-card text-foreground">
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
              <Card className="bg-muted/30 border border-border/60">
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
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
          <Card className="bg-muted/30 border border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-foreground">
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
                  <div className="text-sm text-muted-foreground">Total Score</div>
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
                  <div className="text-3xl font-bold text-foreground">
                    {correctAnswers}/{totalQuestions}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct Answers</div>
                  <Progress
                    value={(correctAnswers / totalQuestions) * 100}
                    className="mt-2"
                  />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {testDetail.duration_mins} min
                  </div>
                  <div className="text-sm text-muted-foreground">Time Taken</div>
                  <div className="flex items-center justify-center mt-2 text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="text-xs">Duration</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {testDetail.attempt_number}/{testDetail.max_attempts}
                  </div>
                  <div className="text-sm text-muted-foreground">Attempt</div>
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
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Test Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Submitted:</span>
                  <span className="ml-2">
                    {formatDate(testDetail.created_at)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Deadline:</span>
                  <span className="ml-2">
                    {formatDate(testDetail.deadline)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Format:</span>
                  <span className="ml-2">
                    {testDetail.format}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Duration:</span>
                  <span className="ml-2">
                    {testDetail.duration_mins} minutes
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question Review */}
          {testDetail.questions_answers &&
          testDetail.questions_answers.length > 0 ? (
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Question Review</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {testDetail.questions_answers.map((question, index) => {
                    const selection = question.selection;
                    const isObjectiveQuestion = selection && typeof selection === 'object' && !('text_answer' in selection);
                    const isSubjectiveQuestion = selection && typeof selection === 'object' && ('text_answer' in selection || 'file_answer' in selection);
                    
                    // Find feedback for this question
                    const questionFeedback = testDetail.feedback?.find(f => f.questionId === question.questionId);
                    
                    // Check if question was answered correctly (for objective questions)
                    let isQuestionCorrect = false;
                    if (isObjectiveQuestion) {
                      isQuestionCorrect = Object.values(selection as Record<string, any>).every(
                        (option) => (option.is_answer === true && option.is_correct === true) || 
                                   (option.is_answer === false && option.is_correct === false)
                      );
                    }
                    
                    return (
                      <div key={index} className="border border-border/60 rounded-lg p-4 bg-card">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground mb-1">
                              Question {question.questionOrder}:{" "}
                              {question.questionText}
                            </h4>
                            {question.questionDetails && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {question.questionDetails}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {isObjectiveQuestion && (
                              <Badge
                                className={isQuestionCorrect ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-400/50" : "bg-destructive/10 text-destructive border border-destructive/40"}
                              >
                                {isQuestionCorrect ? (
                                  <><CheckCircle className="h-3 w-3 mr-1 inline" />Correct</>
                                ) : (
                                  <><XCircle className="h-3 w-3 mr-1 inline" />Incorrect</>
                                )}
                              </Badge>
                            )}
                            <span className="text-sm text-muted-foreground">
                              {question.questionMarks || 1} mark{question.questionMarks !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        {/* Objective Question - Show options with user's selections */}
                        {isObjectiveQuestion && (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-foreground mb-2">
                              Your Answer{Object.values(selection as Record<string, any>).filter((o: any) => o.is_answer).length > 1 ? 's' : ''}:
                            </div>
                            {Object.entries(selection as Record<string, any>).map(
                              ([key, option]) => {
                                const isSelected = option.is_answer === true;
                                const isCorrect = option.is_correct === true;
                                
                                return (
                                  <div
                                    key={key}
                                    className={`flex items-start space-x-3 p-3 rounded-lg border-2 transition-colors ${
                                      isSelected
                                        ? isCorrect
                                          ? "bg-emerald-500/10 border-emerald-400/50"
                                          : "bg-destructive/10 border-destructive/40"
                                        : "bg-muted/30 border-border/60"
                                    }`}
                                  >
                                    <div className="flex-shrink-0 mt-0.5">
                                      {isSelected ? (
                                        isCorrect ? (
                                          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                                        ) : (
                                          <XCircle className="h-5 w-5 text-destructive" />
                                        )
                                      ) : (
                                        <div className="h-5 w-5 rounded-full border-2 border-border" />
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <span className="font-medium text-foreground mr-2">
                                            {key}.
                                          </span>
                                          <span className={isSelected ? "font-medium" : "text-muted-foreground"}>
                                            {option.text || `Option ${key}`}
                                          </span>
                                        </div>
                                        {isSelected && (
                                          <Badge variant="outline" className="ml-2">
                                            Your Selection
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}

                        {/* Subjective Question - Show text/file answer */}
                        {isSubjectiveQuestion && (
                          <div className="space-y-3">
                            <div className="text-sm font-medium text-foreground">
                              Your Answer:
                            </div>
                            {(selection as any).text_answer && (
                              <div className="p-3 bg-muted/30 border border-border/60 rounded-lg">
                                <p className="text-foreground whitespace-pre-wrap">
                                  {(selection as any).text_answer}
                                </p>
                              </div>
                            )}
                            {(selection as any).file_answer && (
                              <div className="p-3 bg-muted/30 border border-border/60 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <Download className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-medium text-foreground">
                                    Submitted Files:
                                  </span>
                                </div>
                                <div className="mt-2 text-sm text-muted-foreground">
                                  {typeof (selection as any).file_answer === 'string' 
                                    ? (selection as any).file_answer
                                    : JSON.stringify((selection as any).file_answer, null, 2)
                                  }
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Feedback Section */}
                        {questionFeedback && (
                          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-400/50 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium text-foreground mb-1">
                                  Instructor Feedback:
                                </div>
                                <p className="text-sm text-amber-700 dark:text-amber-300">
                                  {questionFeedback.feedback}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Question Review</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 bg-muted/40 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No Questions Available
                  </h3>
                  <p className="text-sm text-muted-foreground">
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
