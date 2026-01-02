"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { sanitizeQuestionContent } from "@/lib/sanitize-html";
import {
  Clock,
  CheckSquare,
  Circle,
  Check,
  ArrowLeft,
  ArrowRight,
  Flag,
  Eye,
  RotateCcw, AlertTriangle,
  CheckCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  useCourseTest,
  useCourseQuestions,
  usePastAttempts,
  useStartTest,
  useFinishTest,
} from "@/lib/hooks/useImmersiveTest";
import { useUserData } from "@/hooks/useUserData";
import { AssignmentSubmission } from "@/app/(dashboard)/immersive-test/components/AssignmentSubmission";

interface CourseTest {
  id: number;
  course_id: number;
  course_module_id: number;
  name: string;
  format: string;
  duration_mins: number;
  max_score: number;
  max_attempts: number;
  deadline: string;
  instructions: string;
  created_at: string;
  updated_at: string;
}

interface CourseQuestion {
  id: number;
  course_test_id: number;
  question: string;
  details?: string;
  question_type?: string;
  options?: Record<string, { text: string; is_correct?: boolean }>;
  created_at: string;
  updated_at: string;
}

interface PastAttempt {
  id: number;
  course_test_id: number;
  user_id: number;
  score: number;
  submitted_at?: string;
  endtime: string;
  created_at: string;
  updated_at: string;
  secsLeft?: number;
}

interface ImmersiveTestClientProps {
  courseTestId: string;
}

export default function ImmersiveTestClient({
  courseTestId,
}: ImmersiveTestClientProps) {
  const router = useRouter();

  // Get user data
  const { userData, isLoading: userLoading } = useUserData();

  // Fetch data using SWR hooks
  const {
    courseTest,
    isLoading: testLoading,
    isError: testError,
  } = useCourseTest(courseTestId);
  const {
    courseQuestions,
    isLoading: questionsLoading,
    isError: questionsError,
  } = useCourseQuestions(courseTestId);
  const {
    pastAttempts,
    isLoading: attemptsLoading,
    isError: attemptsError,
  } = usePastAttempts(courseTestId, userData?.id || null);

  // API hooks
  const { startTest } = useStartTest();
  const { finishTest } = useFinishTest();

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [showAttemptHistory, setShowAttemptHistory] = useState(false);
  const [questions, setQuestions] = useState(courseQuestions || []);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set<number>());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [currentScreen, setCurrentScreen] = useState<
    "instructions" | "quiz" | "pre-review" | "final-results" | "completed"
  >("instructions");
  const [unfinishedTest, setUnfinishedTest] = useState<PastAttempt | null>(
    null
  );
  const [bestAttempt, setBestAttempt] = useState<any>(null);

  // LocalStorage key for quiz progress
  const localStorageKey = `immersiveQuizProgress_${courseTest?.id}`;

  // Restore progress from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.answers && parsed.currentQuestion !== undefined) {
          setAnswers(parsed.answers);
          setCurrentQuestion(parsed.currentQuestion);
          setFlaggedQuestions(new Set(parsed.flaggedQuestions || []));
          setTimeRemaining(parsed.timeRemaining || 0);
        }
      } catch (e) {
        console.error("Error parsing saved progress:", e);
      }
    }
  }, [courseTest?.id, localStorageKey]);

  // Save progress to localStorage on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentScreen === "quiz") {
      localStorage.setItem(
        localStorageKey,
        JSON.stringify({
          answers,
          currentQuestion,
          flaggedQuestions: Array.from(flaggedQuestions),
          timeRemaining,
        })
      );
    }
  }, [
    answers,
    currentQuestion,
    flaggedQuestions,
    timeRemaining,
    currentScreen,
    localStorageKey,
  ]);

  // Update questions when courseQuestions changes
  useEffect(() => {
    if (courseQuestions && courseQuestions.length > 0) {
      setQuestions(courseQuestions);
    }
  }, [JSON.stringify(courseQuestions)]);

  // Process past attempts
  useEffect(() => {
    if (pastAttempts && pastAttempts.length) {
      const currentDatetime = new Date();
      let bestScore: PastAttempt | null = null;
      let unfinished: PastAttempt | null = null;

      pastAttempts.forEach((pastAttempt) => {
        const pastAttemptEndtime = new Date(pastAttempt.endtime);

        if (!bestScore || pastAttempt.score > bestScore.score) {
          bestScore = pastAttempt;
        }

        if (!pastAttempt.submitted_at && currentDatetime < pastAttemptEndtime) {
          const secsLeft = Math.floor(
            (new Date(pastAttempt.endtime).getTime() -
              currentDatetime.getTime()) /
              1000
          );
          unfinished = { ...pastAttempt, secsLeft } as PastAttempt;
        }
      });

      setBestAttempt(bestScore);
      setUnfinishedTest(unfinished);

      if (unfinished) {
        setTimeRemaining((unfinished as any).secsLeft || 0);
        setCurrentScreen("quiz");
      } else if ((bestScore as any)?.submitted_at) {
        setCurrentScreen("completed");
      }
    }
  }, [pastAttempts]);

  // Timer logic
  useEffect(() => {
    if (timeRemaining > 0 && !isQuizComplete && currentScreen === "quiz") {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && currentScreen === "quiz") {
      handleAutoSubmit();
    }
  }, [timeRemaining, isQuizComplete, currentScreen]);

  // Update selected answer when question changes
  useEffect(() => {
    setSelectedAnswer(answers[currentQuestion] ?? null);
  }, [currentQuestion, answers]);

  // Computed values
  const deadlinePassed =
    courseTest?.deadline && new Date() > new Date(courseTest.deadline);

  // Loading and error states
  const isLoading =
    userLoading || testLoading || questionsLoading || attemptsLoading;
  const hasError = testError || questionsError || attemptsError;

  // Show loading if any data is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-border bg-card">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted/40 border-t-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading test data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error if data failed to load
  if (hasError || !courseTest) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border border-border bg-card">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Test Not Found
            </h2>
            <p className="text-muted-foreground mb-4">
              The requested test could not be loaded.
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Clear localStorage when test starts or finishes
  const clearLocalStorageProgress = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(localStorageKey);
    }
  };

  const handleAutoSubmit = () => {
    toast("Time's up! Auto-submitting test...", { icon: "⏰" });
    handleTestFinish();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper function to get question type from backend
  const getQuestionType = (question: CourseQuestion) => {
    if (!question?.options) return "assignment";
    return question.question_type || "multiple";
  };

  const handleAnswerSelect = (answerValue: any) => {
    const currentQ = questions[currentQuestion];

    if (courseTest.format === "quiz" && currentQ.options) {
      const questionType = getQuestionType(currentQ);

      if (questionType === "multiple") {
        // Multiple choice - allow multiple selections
        const currentAnswers = Array.isArray(selectedAnswer)
          ? selectedAnswer
          : [];
        let newAnswers = currentAnswers.includes(answerValue)
          ? currentAnswers.filter((a: any) => a !== answerValue)
          : [...currentAnswers, answerValue];

        setSelectedAnswer(newAnswers);
        setAnswers((prev) => ({ ...prev, [currentQuestion]: newAnswers }));
      } else {
        // Single choice - only one selection allowed
        setSelectedAnswer(answerValue);
        setAnswers((prev) => ({ ...prev, [currentQuestion]: answerValue }));
      }
    } else if (courseTest.format === "assignment") {
      setSelectedAnswer(answerValue);
      setAnswers((prev) => ({ ...prev, [currentQuestion]: answerValue }));
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentScreen("pre-review");
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };

  const handleTestStart = async () => {
    clearLocalStorageProgress();

    try {
      const result = await startTest(courseTest.id);
      if (result && result.id) {
        // Set the unfinished test with the newly created attempt
        const newUnfinishedTest = {
          id: result.id,
          course_test_id: courseTest.id,
          user_id: userData?.id || 0,
          score: 0,
          endtime: new Date(
            Date.now() + (courseTest?.duration_mins || 60) * 60 * 1000
          ).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          secsLeft: (courseTest?.duration_mins || 60) * 60,
        };
        setUnfinishedTest(newUnfinishedTest);
        setTimeRemaining((courseTest?.duration_mins || 60) * 60);
        setCurrentScreen("quiz");
        toast.success("Test started successfully!");
      } else if (result && result.pageNotif) {
        toast.error(result.pageNotif);
      }
    } catch (error) {
      console.error("Error starting test:", error);
      toast.error("Failed to start test. Please try again.");
    }
  };

  const handleTestFinish = async () => {
    // If no unfinished test is set, we need to create one first
    let testAttemptId = unfinishedTest?.id;

    if (!testAttemptId) {
      try {
        // Start a new test attempt if none exists
        const startResult = await startTest(courseTest.id);
        if (startResult && startResult.id) {
          testAttemptId = startResult.id;
          // Update the unfinished test state
          const newUnfinishedTest = {
            id: startResult.id,
            course_test_id: courseTest.id,
            user_id: userData?.id || 0,
            score: 0,
            endtime: new Date(
              Date.now() + (courseTest?.duration_mins || 60) * 60 * 1000
            ).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            secsLeft: (courseTest?.duration_mins || 60) * 60,
          };
          setUnfinishedTest(newUnfinishedTest);
        } else {
          toast.error("Failed to create test attempt. Please try again.");
          return;
        }
      } catch (error) {
        console.error("Error creating test attempt:", error);
        toast.error("Failed to create test attempt. Please try again.");
        return;
      }
    }

    clearLocalStorageProgress();
    const questionsAnswers: any[] = [];

    questions.forEach((questionRow, index) => {
      const userAnswer = answers[index];
      let selection: any = {};

      if (courseTest.format === "quiz" && questionRow.options) {
        Object.entries(questionRow.options).forEach(([optionKey, option]) => {
          if (!(option as any).text) return;

          if (Array.isArray(userAnswer)) {
            selection[optionKey] = {
              is_answer: userAnswer.includes(optionKey),
            };
          } else {
            selection[optionKey] = { is_answer: userAnswer === optionKey };
          }
        });

        questionsAnswers.push({
          questionId: questionRow.id,
          selection: selection,
        });
      } else if (courseTest.format === "assignment") {
        // Convert files array to JSON string for file_answer
        const fileAnswer =
          userAnswer?.files && userAnswer.files.length > 0
            ? JSON.stringify(
                userAnswer.files.map((file) => ({
                  name: file.name,
                  url: file.url,
                  size: file.size,
                  type: file.type,
                }))
              )
            : "";

        questionsAnswers.push({
          questionId: questionRow.id,
          text_answer: userAnswer?.text || userAnswer || "",
          file_answer: fileAnswer,
        });
      }
    });

    if (!testAttemptId) {
      toast.error("No valid test attempt found. Please restart the test.");
      return;
    }

    try {
      const result = await finishTest(testAttemptId, questionsAnswers);
      if (result && result.id) {
        setIsQuizComplete(true);
        setCurrentScreen("final-results");
        toast.success("Test submitted successfully!");
        // Refresh page to get updated results
        setTimeout(() => router.refresh(), 2000);
      } else if (result && result.pageNotif) {
        toast.error(result.pageNotif);
      }
    } catch (error) {
      console.error("Error finishing test:", error);
      toast.error("Failed to submit test. Please try again.");
    }
  };

  const goToQuestion = (questionIndex: number) => {
    setCurrentQuestion(questionIndex);
    setCurrentScreen("quiz");
  };

  const progressPercentage = questions.length
    ? ((currentQuestion + 1) / questions.length) * 100
    : 0;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flaggedQuestions.size;

  // Instructions Screen
  if (currentScreen === "instructions") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl border border-border bg-card">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 text-gray-900">
                {courseTest.name}
              </h1>
              <p className="text-xl text-gray-600">
                Read instructions carefully before starting
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Test Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium capitalize">
                      {courseTest.format}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {courseTest.duration_mins} minutes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-medium">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Score:</span>
                    <span className="font-medium">{courseTest.max_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attempts:</span>
                    <span className="font-medium">
                      {courseTest.max_attempts}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deadline:</span>
                    <span className="font-medium">
                      {new Date(courseTest.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Instructions</h3>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {courseTest.instructions ||
                    "Complete all questions within the time limit."}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              

              {!deadlinePassed && userData?.role === "STUDENT" && (
                <>
                  {courseTest.format === "assignment" &&
                  bestAttempt &&
                  !bestAttempt.marked_by ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm font-medium">
                      ⏳ You have a pending assignment submission waiting for
                      grading. Please wait for your instructor to grade it
                      before starting a new attempt.
                    </div>
                  ) : (
                    <Button
                      onClick={handleTestStart}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      Start Test →
                    </Button>
                  )}
                </>
              )}

              {deadlinePassed && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-center">
                  <AlertTriangle className="h-5 w-5 inline mr-2" />
                  The deadline for this test has passed. You can no longer start
                  the test.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Completed Screen
  if (currentScreen === "completed" && bestAttempt) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {/* Attempt History Modal */}
        {pastAttempts && pastAttempts.length > 0 && showAttemptHistory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border border-border bg-card shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Attempt History</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAttemptHistory(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pastAttempts.map((attempt, idx) => (
                    <div
                      key={attempt.id || idx}
                      className="flex justify-between items-center p-2 bg-muted/30 rounded border border-border/60"
                    >
                      <span className="text-foreground">Attempt {idx + 1}</span>
                      <span>
                        {courseTest.format === "assignment" &&
                        !attempt.marked_by ? (
                          <span className="text-amber-600 font-medium">
                            Pending Grading
                          </span>
                        ) : (
                          `${attempt.score}/${courseTest.max_score}`
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {attempt.submitted_at
                          ? new Date(attempt.submitted_at).toLocaleString()
                          : "Not submitted"}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="w-full max-w-2xl border border-border bg-card">
          <CardContent className="p-8 text-center">
            <h1 className="text-4xl font-bold mb-8 text-foreground">
              {courseTest.format === "assignment" && !bestAttempt.marked_by
                ? "Assignment Submitted"
                : "Test Completed"}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-muted/30 border border-border/60 rounded-lg p-6">
                <div className="text-3xl font-bold text-foreground">
                  {courseTest.format === "assignment" &&
                  !bestAttempt.marked_by ? (
                    <span className="text-amber-600 text-2xl">
                      Pending Grading
                    </span>
                  ) : (
                    `${bestAttempt.score}/${courseTest.max_score}`
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {courseTest.format === "assignment" && !bestAttempt.marked_by
                    ? "Status"
                    : "Your Score"}
                </div>
              </div>

              <div className="bg-muted/30 border border-border/60 rounded-lg p-6">
                <div className="text-3xl font-bold text-foreground">
                  {courseTest.format === "assignment" &&
                  !bestAttempt.marked_by ? (
                    <span className="text-amber-600">--</span>
                  ) : (
                    `${Math.round(
                      (bestAttempt.score / courseTest.max_score) * 100
                    )}%`
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {courseTest.format === "assignment" && !bestAttempt.marked_by
                    ? "Grade"
                    : "Percentage"}
                </div>
              </div>

              <div className="bg-muted/30 border border-border/60 rounded-lg p-6">
                <div className="text-3xl font-bold text-foreground">
                  {bestAttempt.submitted_at ? (
                    <CheckCircle className="h-8 w-8 mx-auto" />
                  ) : (
                    <X className="h-8 w-8 mx-auto" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {bestAttempt.submitted_at ? "Submitted" : "Not Submitted"}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-primary font-semibold">
                {courseTest.format === "assignment" && !bestAttempt.marked_by
                  ? "Assignment submitted successfully!"
                  : "You submitted this test!"}
              </p>
              <p className="text-muted-foreground">
                On:{" "}
                {bestAttempt.submitted_at
                  ? new Date(bestAttempt.submitted_at).toLocaleString()
                  : "-"}
              </p>
              <p className="text-muted-foreground">
                {courseTest.format === "assignment" &&
                !bestAttempt.marked_by ? (
                  <span className="text-amber-600 font-medium">
                    Status: Pending Grading
                  </span>
                ) : (
                  `Your best score: ${bestAttempt.score}/${courseTest.max_score}`
                )}
              </p>

              <div className="flex justify-center gap-4">
                {pastAttempts.length < courseTest.max_attempts && (
                  <>
                    {courseTest.format === "assignment" &&
                    !bestAttempt.marked_by ? (
                      <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm font-medium">
                        ⏳ Waiting for grading...
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAnswers({});
                          setCurrentQuestion(0);
                          setCurrentScreen("instructions");
                          setUnfinishedTest(null);
                          setIsQuizComplete(false);
                        }}
                      >
                        Try Again
                      </Button>
                    )}
                  </>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowAttemptHistory(true)}
                >
                  View Attempt History
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Pre-Review Screen
  if (currentScreen === "pre-review") {
    const unansweredQuestions = questions.filter(
      (_, index) => answers[index] === undefined
    );

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl border border-border bg-card">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-6 text-foreground">
                Review Your Answers
              </h1>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4">
                  <div className="text-2xl font-bold text-foreground">
                    {answeredCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Answered</div>
                </div>

                <div className="bg-muted/30 border border-border/60 rounded-lg p-4">
                  <div className="text-2xl font-bold text-foreground">
                    {questions.length - answeredCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Unanswered</div>
                </div>

                <div className="bg-muted/30 border border-border/60 rounded-lg p-4">
                  <div className="text-2xl font-bold text-foreground">
                    {flaggedCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Flagged</div>
                </div>

                <div className="bg-muted/30 border border-border/60 rounded-lg p-4">
                  <div className="text-2xl font-bold text-foreground">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm text-muted-foreground">Time Left</div>
                </div>
              </div>
            </div>

            {unansweredQuestions.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/40 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-destructive mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Unanswered Questions
                </h3>
                <p className="text-destructive">
                  You have {unansweredQuestions.length} unanswered question(s).
                </p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Quick Navigation</h3>
              <div className="grid grid-cols-6 md:grid-cols-10 gap-2">
                {questions.map((_, index) => {
                  const isAnswered = answers[index] !== undefined;
                  const isFlagged = flaggedQuestions.has(index);

                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => goToQuestion(index)}
                      className={`h-12 relative ${
                        isAnswered
                          ? "bg-emerald-500/10 border-emerald-400/40 text-emerald-600 dark:text-emerald-300"
                          : "bg-destructive/10 border-destructive/40 text-destructive"
                      }`}
                    >
                      Q{index + 1}
                      {isFlagged && (
                        <Flag className="h-3 w-3 absolute -top-1 -right-1 text-yellow-600" />
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentScreen("quiz")}
              >
                ← Back to Quiz
              </Button>

              <Button
                onClick={handleTestFinish}
                disabled={answeredCount === 0}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Submit Test →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Final Results Screen
  if (currentScreen === "final-results") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center">
            <h1 className="text-4xl font-bold mb-4 text-gray-900">
              Test Submitted Successfully!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {courseTest.format === "assignment"
                ? "Your assignment has been submitted for review."
                : "Your test has been graded automatically."}
            </p>

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => router.refresh()}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                View Results
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  router.push(
                    `/lms/course-module?course_module_id=${courseTest.course_module_id}`
                  )
                }
              >
                Back to Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Quiz Interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <Clock className="h-5 w-5" />
              {formatTime(timeRemaining)}
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFlag}
                className={
                  flaggedQuestions.has(currentQuestion)
                    ? "text-yellow-600"
                    : "text-gray-600"
                }
              >
                <Flag className="h-4 w-4 mr-1" />
                {flaggedQuestions.has(currentQuestion) ? "Flagged" : "Flag"}
              </Button>

              <Badge variant="outline">
                Question {currentQuestion + 1} of {questions.length}
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          {/* Question Navigator */}
          <div className="flex justify-center gap-1 mb-6 flex-wrap">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 p-0 relative ${
                  index === currentQuestion
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : answers[index] !== undefined
                    ? "bg-green-100 border-green-300 text-green-700"
                    : "bg-gray-100 border-gray-300 text-gray-700"
                }`}
              >
                {index + 1}
                {flaggedQuestions.has(index) && (
                  <Flag className="h-2 w-2 absolute -top-1 -right-1 text-yellow-600" />
                )}
              </Button>
            ))}
          </div>

          {/* Question Content */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {questions[currentQuestion]?.question}
            </h2>

            {questions[currentQuestion]?.details && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitizeQuestionContent(questions[currentQuestion].details),
                  }}
                />
              </div>
            )}

            {/* Question Type Indicator & Answer Options */}
            {courseTest.format === "quiz" &&
            questions[currentQuestion]?.options ? (
              <div>
                {/* Question Type Indicator */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getQuestionType(questions[currentQuestion]) ===
                    "multiple" ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                    <span className="font-medium">
                      {getQuestionType(questions[currentQuestion]) ===
                      "multiple"
                        ? "Multiple Choice: Select all that apply"
                        : "Single Choice: Select one option"}
                    </span>
                  </div>
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {Object.entries(questions[currentQuestion].options!)
                    .filter(
                      ([key, option]) =>
                        (option as any).text &&
                        (option as any).text.trim() !== ""
                    )
                    .map(([key, option]) => {
                      const questionType = getQuestionType(
                        questions[currentQuestion]
                      );
                      const isSelected = Array.isArray(selectedAnswer)
                        ? selectedAnswer.includes(key)
                        : selectedAnswer === key;

                      return (
                        <div
                          key={key}
                          onClick={() => handleAnswerSelect(key)}
                          className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-green-50 border-green-300"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              questionType === "multiple"
                                ? "rounded-sm"
                                : "rounded-full"
                            } ${
                              isSelected
                                ? "border-green-500 bg-green-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected &&
                              (questionType === "multiple" ? (
                                <Check className="h-3 w-3 text-white" />
                              ) : (
                                <div className="w-2 h-2 bg-white rounded-full" />
                              ))}
                          </div>
                          <span className="text-lg flex-1">
                            {(option as any).text}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : courseTest.format === "assignment" ? (
              <AssignmentSubmission
                courseTestId={courseTest.id}
                questionId={currentQuestion + 1}
                question={questions[currentQuestion]?.question || ""}
                details={questions[currentQuestion]?.details}
                marks={questions[currentQuestion]?.marks || 1}
                onAnswerChange={(answer) => {
                  handleAnswerSelect({
                    text: answer.text,
                    files: answer.files,
                  });
                }}
                initialAnswer={{
                  text: selectedAnswer?.text || "",
                  files: selectedAnswer?.files || [],
                }}
                disabled={false}
              />
            ) : null}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {answeredCount}/{questions.length} answered
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentScreen("pre-review")}
              >
                <Eye className="h-4 w-4 mr-2" />
                Review
              </Button>
            </div>

            <Button
              onClick={handleNext}
              disabled={answeredCount === 0}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {currentQuestion === questions.length - 1
                ? "Review Answers"
                : "Next"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
