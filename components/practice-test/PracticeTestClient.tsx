"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Clock,
  CheckSquare,
  Circle,
  Check,
  ArrowLeft,
  ArrowRight,
  Flag,
  Eye,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  X,
  Brain,
  Lightbulb,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useUserData } from "@/hooks/useUserData";

interface PracticeConfig {
  lessonId: number;
  difficulty: "easy" | "medium" | "hard";
  questionCount: number;
  questionTypes: ("multiple_choice" | "true_false")[];
  retake?: boolean;
}

interface PracticeQuestion {
  id: number;
  question_text: string;
  question_type: "multiple_choice" | "true_false";
  options?: Record<string, { text: string; is_correct: boolean }>;
  correct_answer: string;
  explanation: string;
  difficulty_level: "easy" | "medium" | "hard";
}

interface PracticeTestClientProps {
  config: PracticeConfig;
}

interface SessionResults {
  score: number;
  totalQuestions: number;
  percentage: number;
  correctAnswers: number;
  incorrectAnswers: number;
  detailedResults: Array<{
    questionId: number;
    questionText: string;
    userAnswer: any;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
    questionType: string;
  }>;
}

export default function PracticeTestClient({
  config,
}: PracticeTestClientProps) {
  const router = useRouter();
  const { userData, isLoading: userLoading } = useUserData();

  // State management
  const [currentScreen, setCurrentScreen] = useState<
    "loading" | "instructions" | "practice" | "results"
  >("loading");
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set<number>());
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(
    null
  );
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [lessonInfo, setLessonInfo] = useState<{
    name: string;
    module: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const [existingQuestions, setExistingQuestions] = useState<
    PracticeQuestion[]
  >([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [hasAttemptedGeneration, setHasAttemptedGeneration] = useState(false);

  // Memoize config to prevent unnecessary re-renders
  const memoizedConfig = useMemo(
    () => config,
    [
      config.lessonId,
      config.difficulty,
      config.questionCount,
      config.questionTypes.join(","),
    ]
  );

  const retakeTest = useCallback(() => {
    // Reset state for retaking the same questions
    setCurrentScreen("instructions");
    setAnswers({});
    setCurrentQuestion(0);
    setSessionResults(null);
    setFlaggedQuestions(new Set());
    setSessionId(null);
    setStartTime(null);
    setHasAttemptedGeneration(false);
    toast.success("Ready to retake the same questions!");
  }, []);

  const fetchExistingQuestions = useCallback(async () => {
    if (!userData?.id) return;

    setLoadingExisting(true);
    try {
      const response = await fetch(
        `/api/practice-questions/list?lessonId=${memoizedConfig.lessonId}&limit=50`
      );

      if (response.ok) {
        const data = await response.json();
        setExistingQuestions(data.questions || []);
      }
    } catch (error) {
      console.error("Error fetching existing questions:", error);
    } finally {
      setLoadingExisting(false);
    }
  }, [userData?.id, memoizedConfig.lessonId]);

  const retakeExistingQuestions = useCallback(
    (questionsToRetake: PracticeQuestion[]) => {
      setQuestions(questionsToRetake);
      setCurrentScreen("instructions");
      setAnswers({});
      setCurrentQuestion(0);
      setSessionResults(null);
      setFlaggedQuestions(new Set());
      setSessionId(null);
      setStartTime(null);
      setHasAttemptedGeneration(false);
      toast.success(
        `Ready to retake ${questionsToRetake.length} existing questions!`
      );
    },
    []
  );

  const generateQuestions = useCallback(async () => {
    if (!userData?.id) return;

    console.log(
      "PracticeTestClient: generateQuestions called for config:",
      memoizedConfig
    );

    // Rate limiting: prevent requests more frequent than every 2 seconds
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const minInterval = 2000; // 2 seconds

    if (timeSinceLastRequest < minInterval) {
      const remainingTime = Math.ceil(
        (minInterval - timeSinceLastRequest) / 1000
      );
      toast.error(
        `Please wait ${remainingTime} more second(s) before generating new questions`
      );
      return;
    }

    setIsGenerating(true);
    setCurrentScreen("loading");
    setLastRequestTime(now);

    try {
      const response = await fetch("/api/practice-questions/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lessonId: memoizedConfig.lessonId,
          questionCount: memoizedConfig.questionCount,
          difficultyLevel: memoizedConfig.difficulty,
          questionTypes: memoizedConfig.questionTypes,
          userId: userData.id.toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate questions");
      }

      const data = await response.json();
      setQuestions(data.questions);

      // Get lesson information for display
      if (data.questions.length > 0) {
        // You might want to fetch this separately if not included in the questions response
        setLessonInfo({ name: "Current Lesson", module: "Current Module" });
      }

      setCurrentScreen("instructions");

      if (data.cached) {
        toast.success("Using previously generated questions");
      } else {
        toast.success(
          `Generated ${data.questions.length} new practice questions`
        );
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate questions"
      );
      router.back();
    } finally {
      setIsGenerating(false);
    }
  }, [userData?.id, memoizedConfig, lastRequestTime]);

  // Fetch existing questions when component mounts and check if auto-generation is needed
  useEffect(() => {
    if (!userData?.id) return;

    const initializeQuestions = async () => {
      await fetchExistingQuestions();
    };

    initializeQuestions();
  }, [userData?.id, fetchExistingQuestions]);

  // Auto-generate questions if no existing questions are available
  useEffect(() => {
    if (
      !userData?.id ||
      loadingExisting ||
      isGenerating ||
      hasAttemptedGeneration
    )
      return;

    // If retake mode, don't auto-set questions - let user choose
    if (memoizedConfig.retake && existingQuestions.length > 0) {
      console.log("Retake mode: waiting for user to select questions");
      setCurrentScreen("instructions");
      setHasAttemptedGeneration(true);
      return;
    }

    // Only auto-generate if we have no existing questions and no current questions
    if (
      existingQuestions.length === 0 &&
      questions.length === 0 &&
      currentScreen === "loading"
    ) {
      console.log("No existing questions found, auto-generating new questions");
      setHasAttemptedGeneration(true);
      generateQuestions();
    }
  }, [
    userData?.id,
    existingQuestions.length,
    questions.length,
    loadingExisting,
    isGenerating,
    hasAttemptedGeneration,
    currentScreen,
    generateQuestions,
    memoizedConfig.retake,
  ]);

  const startPracticeTest = async () => {
    if (!userData?.id || questions.length === 0) return;

    try {
      // Create practice session
      const response = await fetch("/api/practice-questions/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userData.id.toString(),
          lessonId: memoizedConfig.lessonId,
          questionsData: questions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create practice session");
      }

      const data = await response.json();
      setSessionId(data.session.id);
      setStartTime(new Date());
      setCurrentScreen("practice");
      toast.success("Practice test started!");
    } catch (error) {
      console.error("Error starting practice test:", error);
      toast.error("Failed to start practice test");
    }
  };

  const submitPracticeTest = async () => {
    if (!sessionId || !startTime) return;

    setIsSubmitting(true);

    try {
      const endTime = new Date();
      const durationMins = Math.round(
        (endTime.getTime() - startTime.getTime()) / 60000
      );

      const response = await fetch("/api/practice-questions/session", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          userAnswers: answers,
          sessionDurationMins: durationMins,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit practice test");
      }

      const data = await response.json();
      setSessionResults(data.results);
      setCurrentScreen("results");
      toast.success("Practice test completed!");
    } catch (error) {
      console.error("Error submitting practice test:", error);
      toast.error("Failed to submit practice test");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSelect = (answerValue: any) => {
    const currentQ = questions[currentQuestion];
    if (!currentQ) return;

    setAnswers((prev) => ({ ...prev, [currentQ.id]: answerValue }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
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

  const goToQuestion = (questionIndex: number) => {
    setCurrentQuestion(questionIndex);
  };

  const getQuestionIcon = (questionType: string) => {
    switch (questionType) {
      case "multiple_choice":
        return <CheckSquare className="h-4 w-4" />;
      case "true_false":
        return <Circle className="h-4 w-4" />;
      default:
        return <CheckSquare className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Computed values
  const answeredCount = Object.keys(answers).length;
  const progressPercentage = questions.length
    ? (answeredCount / questions.length) * 100
    : 0;
  const currentQuestionAnswer = questions[currentQuestion]?.id
    ? answers[questions[currentQuestion].id]
    : null;

  // Loading screen
  if (currentScreen === "loading" || isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">
              Generating Practice Questions
            </h2>
            <p className="text-gray-600">
              AI is creating {memoizedConfig.questionCount} personalized
              questions for you...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Instructions screen
  if (currentScreen === "instructions") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Brain className="h-12 w-12 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">
                    AI Practice Test
                  </h1>
                  <p className="text-xl text-gray-600 mt-2">
                    {lessonInfo?.name || "Lesson Practice"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  Test Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-medium">{questions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <Badge
                      className={getDifficultyColor(memoizedConfig.difficulty)}
                    >
                      {memoizedConfig.difficulty.charAt(0).toUpperCase() +
                        memoizedConfig.difficulty.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Question Types:</span>
                    <div className="flex gap-1">
                      {memoizedConfig.questionTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Limit:</span>
                    <span className="font-medium">No limit</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-amber-600" />
                  How It Works
                </h3>
                <div className="text-gray-700 space-y-2 text-sm">
                  <p>• AI-generated questions based on your lesson content</p>
                  <p>• Get detailed explanations for each answer</p>
                  <p>• No grades recorded - pure practice!</p>
                  <p>• Flag questions for review</p>
                  <p>• See your results with improvement suggestions</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    Practice Benefits
                  </h4>
                  <p className="text-sm text-blue-700 mt-1">
                    These AI-generated questions help reinforce your learning
                    and identify areas that need more attention. Take your time
                    and focus on understanding the concepts.
                  </p>
                </div>
              </div>
            </div>

            {/* Question Source Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Brain className="h-5 w-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-green-900 text-sm">
                    {memoizedConfig.retake
                      ? "Retaking Previous Questions"
                      : "Questions Ready"}
                  </h4>
                  <p className="text-sm text-green-800 mt-1">
                    {memoizedConfig.retake
                      ? `You are retaking ${questions.length} previously generated questions. Practice these questions again to reinforce your learning.`
                      : `You have ${questions.length} ${memoizedConfig.difficulty} questions ready to practice. These questions are based on your lesson content and will help you master the material.`}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-green-700">
                      Question types:
                    </span>
                    {memoizedConfig.questionTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Existing Questions Section - Show selection options even in retake mode */}
            {existingQuestions.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <RotateCcw className="h-5 w-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {memoizedConfig.retake
                        ? "Select Questions to Practice"
                        : "Retake Previous Questions"}
                    </h4>
                    <p className="text-sm text-gray-700 mt-1">
                      {memoizedConfig.retake
                        ? `Choose how many of the ${existingQuestions.length} available questions you want to practice.`
                        : `You have ${existingQuestions.length} previously generated questions available for this lesson.`}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {/* Generate buttons for different question counts */}
                      {(() => {
                        const buttons: JSX.Element[] = [];
                        const maxQuestions = Math.min(
                          existingQuestions.length,
                          20
                        );

                        // Add buttons for increments of 3 and 5
                        const increments = [3];
                        const usedCounts = new Set<number>();

                        // Add increment-based buttons
                        increments.forEach((increment) => {
                          for (
                            let count = increment;
                            count <= maxQuestions;
                            count += increment
                          ) {
                            if (!usedCounts.has(count)) {
                              usedCounts.add(count);
                              buttons.push(
                                <Button
                                  key={count}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const shuffled = [
                                      ...existingQuestions,
                                    ].sort(() => 0.5 - Math.random());
                                    retakeExistingQuestions(
                                      shuffled.slice(0, count)
                                    );
                                  }}
                                  className="text-xs"
                                >
                                  {count} Questions
                                </Button>
                              );
                            }
                          }
                        });

                        // Add "All Questions" button
                        buttons.push(
                          <Button
                            key="all"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              retakeExistingQuestions(existingQuestions)
                            }
                            className="text-xs bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
                          >
                            All {existingQuestions.length} Questions
                          </Button>
                        );

                        return buttons;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Show message when no questions selected in retake mode */}
            {memoizedConfig.retake && questions.length === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
                  <p className="text-sm text-amber-800">
                    Please select how many questions you want to practice from
                    the options above.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Lesson
              </Button>

              <Button
                onClick={startPracticeTest}
                disabled={questions.length === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start Practice Test
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results screen
  if (currentScreen === "results" && sessionResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-4">
        <div className="max-w-6xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                  Practice Test Completed!
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Score Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600">
                    {sessionResults.score}/{sessionResults.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">
                    {sessionResults.percentage}%
                  </div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="text-3xl font-bold text-emerald-600">
                    {sessionResults.correctAnswers}
                  </div>
                  <div className="text-sm text-gray-600">Correct</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="text-3xl font-bold text-red-600">
                    {sessionResults.incorrectAnswers}
                  </div>
                  <div className="text-sm text-gray-600">Incorrect</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    Overall Performance
                  </span>
                  <span className="text-sm text-gray-600">
                    {sessionResults.percentage}%
                  </span>
                </div>
                <Progress value={sessionResults.percentage} className="h-3" />
              </div>

              {/* Question Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Brain className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-900 text-sm">
                      Current Questions
                    </h4>
                    <p className="text-sm text-blue-800 mt-1">
                      You just completed {questions.length}{" "}
                      {memoizedConfig.difficulty} questions. You can retake
                      these same questions or generate new ones.
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-blue-700">Types:</span>
                      {memoizedConfig.questionTypes.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-center gap-4 mb-8">
                <Button
                  onClick={retakeTest}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Test
                </Button>
                <Button
                  onClick={() => {
                    setCurrentScreen("loading");
                    setAnswers({});
                    setCurrentQuestion(0);
                    setSessionResults(null);
                    setHasAttemptedGeneration(false);
                    generateQuestions();
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Generate New Questions
                </Button>
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Lesson
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Detailed Results & Explanations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {sessionResults.detailedResults.map((result, index) => (
                  <div
                    key={result.questionId}
                    className="border rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                            result.isCorrect
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <Badge
                          className={getDifficultyColor(
                            questions[index]?.difficulty_level || "medium"
                          )}
                        >
                          {questions[index]?.difficulty_level || "medium"}
                        </Badge>
                      </div>
                      <div className="flex items-center">
                        {getQuestionIcon(result.questionType)}
                        <span className="ml-2 text-sm text-gray-600 capitalize">
                          {result.questionType.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-medium mb-3">{result.questionText}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Your Answer:
                        </p>
                        <p
                          className={`font-medium ${
                            result.isCorrect ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {result.userAnswer || "No answer"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Correct Answer:
                        </p>
                        <p className="font-medium text-green-700">
                          {result.correctAnswer}
                        </p>
                      </div>
                    </div>

                    {result.explanation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <Lightbulb className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-blue-900 text-sm">
                              Explanation
                            </h4>
                            <p className="text-sm text-blue-800 mt-1">
                              {result.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Practice test screen
  if (currentScreen === "practice" && questions.length > 0) {
    const currentQ = questions[currentQuestion];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Brain className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-lg font-semibold">Practice Test</h2>
                  <p className="text-sm text-gray-600">
                    {lessonInfo?.name || "Current Lesson"}
                  </p>
                </div>
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
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">
                  {answeredCount}/{questions.length} answered (
                  {Math.round(progressPercentage)}%)
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Question Navigator */}
            <div className="flex justify-center gap-1 mb-6 flex-wrap">
              {questions.map((_, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => goToQuestion(index)}
                  className={`w-8 h-8 p-0 relative ${
                    index === currentQuestion
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : answers[questions[index].id] !== undefined
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {currentQ?.question_text}
                </h2>
                <Badge
                  className={getDifficultyColor(
                    currentQ?.difficulty_level || "medium"
                  )}
                >
                  {currentQ?.difficulty_level || "medium"}
                </Badge>
              </div>

              {/* Question Type Indicator & Answer Options */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  {getQuestionIcon(
                    currentQ?.question_type || "multiple_choice"
                  )}
                  <span className="font-medium capitalize">
                    {currentQ?.question_type?.replace("_", " ") ||
                      "Multiple Choice"}
                  </span>
                </div>

                {/* Answer Input Based on Type */}
                {currentQ?.question_type === "multiple_choice" &&
                  currentQ.options && (
                    <div className="space-y-3">
                      {Object.entries(currentQ.options).map(([key, option]) => (
                        <div
                          key={key}
                          onClick={() => handleAnswerSelect(key)}
                          className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                            currentQuestionAnswer === key
                              ? "bg-blue-50 border-blue-300"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              currentQuestionAnswer === key
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {currentQuestionAnswer === key && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <span className="text-lg flex-1">
                            <strong>{key}.</strong> {option.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                {currentQ?.question_type === "true_false" &&
                  currentQ.options && (
                    <div className="space-y-3">
                      {Object.entries(currentQ.options).map(([key, option]) => (
                        <div
                          key={key}
                          onClick={() => handleAnswerSelect(key)}
                          className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                            currentQuestionAnswer === key
                              ? "bg-blue-50 border-blue-300"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              currentQuestionAnswer === key
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {currentQuestionAnswer === key && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                          <span className="text-lg flex-1">
                            <strong>{key}.</strong> {option.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
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
              </div>

              <div className="flex gap-2">
                {currentQuestion === questions.length - 1 ? (
                  <Button
                    onClick={submitPracticeTest}
                    disabled={isSubmitting || answeredCount === 0}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Test"}
                    <CheckCircle className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback loading
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </CardContent>
      </Card>
    </div>
  );
}
