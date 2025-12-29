"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronDown,
  ChevronRight,
  Eye,
  Trash2,
  RefreshCw,
  CheckSquare,
  Circle,
  MessageSquare,
  Calendar,
  User,
  BarChart3,
  Play,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useUserData } from "@/hooks/useUserData";
import { useRouter } from "next/navigation";

interface PracticeQuestion {
  id: number;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  options?: Record<string, { text: string; is_correct: boolean }>;
  correct_answer: string;
  explanation: string;
  difficulty_level: "easy" | "medium" | "hard";
  created_at: string;
  generated_by: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface QuestionsSummary {
  total: number;
  byType: {
    multiple_choice: number;
    true_false: number;
    short_answer: number;
  };
  byDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}

interface ExistingPracticeQuestionsProps {
  lessonId: number;
  lessonName: string;
}

export default function ExistingPracticeQuestions({
  lessonId,
  lessonName,
}: ExistingPracticeQuestionsProps) {
  const { userData } = useUserData();
  const router = useRouter();
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [summary, setSummary] = useState<QuestionsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/practice-questions/list?lessonId=${lessonId}&limit=50`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch practice questions");
      }

      const data = await response.json();
      setQuestions(data.questions || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error("Error fetching practice questions:", error);
      toast.error("Failed to load existing practice questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lessonId) {
      fetchQuestions();
    }
  }, [lessonId]);

  const handleDeleteQuestion = async (questionId: number) => {
    if (!userData?.id) return;

    try {
      setDeleting(questionId);
      const response = await fetch(
        `/api/practice-questions/list?questionId=${questionId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      toast.success("Question deleted successfully");
      await fetchQuestions(); // Refresh the list
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    } finally {
      setDeleting(null);
    }
  };

  const handleClearAllQuestions = async () => {
    if (!userData?.id) return;

    try {
      const response = await fetch(
        `/api/practice-questions/list?lessonId=${lessonId}&userId=${userData.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to clear questions");
      }

      toast.success("All your practice questions cleared");
      await fetchQuestions(); // Refresh the list
    } catch (error) {
      console.error("Error clearing questions:", error);
      toast.error("Failed to clear questions");
    }
  };

  const handleRetakeTest = () => {
    // Navigate to practice test with existing questions
    router.push(`/practice-test?lessonId=${lessonId}&retake=true`);
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return <CheckSquare className="h-4 w-4" />;
      case "true_false":
        return <Circle className="h-4 w-4" />;
      case "short_answer":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <CheckSquare className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-400/40";
      case "medium":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-400/40";
      case "hard":
        return "bg-destructive/10 text-destructive border border-destructive/30";
      default:
        return "bg-muted/30 text-foreground border border-border/60";
    }
  };

  if (loading) {
    return (
    <Card className="mb-6 bg-card border border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-5 w-5 animate-spin mr-2 text-primary" />
          <span className="text-muted-foreground">
            Loading existing practice questions...
          </span>
        </div>
      </CardContent>
    </Card>
    );
  }

  if (!questions.length) {
    return null; // Don't show if no questions exist
  }

  return (
    <Card className="mb-6 bg-card border border-border">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Existing Practice Questions</span>
                <Badge variant="outline">{questions.length} questions</Badge>
              </div>
              <div className="flex items-center gap-2">
                {summary && (
                  <div className="flex gap-1">
                    {summary.byDifficulty.easy > 0 && (
                      <Badge className={getDifficultyColor("easy")}>
                        {summary.byDifficulty.easy} Easy
                      </Badge>
                    )}
                    {summary.byDifficulty.medium > 0 && (
                      <Badge className={getDifficultyColor("medium")}>
                        {summary.byDifficulty.medium} Medium
                      </Badge>
                    )}
                    {summary.byDifficulty.hard > 0 && (
                      <Badge className={getDifficultyColor("hard")}>
                        {summary.byDifficulty.hard} Hard
                      </Badge>
                    )}
                  </div>
                )}
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent>
            {/* Summary Statistics */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-muted/30 border border-border/60 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">By Type</h4>
                  <div className="space-y-1 text-sm">
                    {summary.byType.multiple_choice > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <CheckSquare className="h-3 w-3" />
                          Multiple Choice
                        </span>
                        <span className="font-medium">
                          {summary.byType.multiple_choice}
                        </span>
                      </div>
                    )}
                    {summary.byType.true_false > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <Circle className="h-3 w-3" />
                          True/False
                        </span>
                        <span className="font-medium">
                          {summary.byType.true_false}
                        </span>
                      </div>
                    )}
                    {summary.byType.short_answer > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Short Answer
                        </span>
                        <span className="font-medium">
                          {summary.byType.short_answer}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-muted/30 border border-border/60 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">
                    By Difficulty
                  </h4>
                  <div className="space-y-1 text-sm">
                    {summary.byDifficulty.easy > 0 && (
                      <div className="flex justify-between">
                        <span>Easy</span>
                        <span className="font-medium">
                          {summary.byDifficulty.easy}
                        </span>
                      </div>
                    )}
                    {summary.byDifficulty.medium > 0 && (
                      <div className="flex justify-between">
                        <span>Medium</span>
                        <span className="font-medium">
                          {summary.byDifficulty.medium}
                        </span>
                      </div>
                    )}
                    {summary.byDifficulty.hard > 0 && (
                      <div className="flex justify-between">
                        <span>Hard</span>
                        <span className="font-medium">
                          {summary.byDifficulty.hard}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchQuestions}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>

                <Button
                  onClick={handleRetakeTest}
                  className="gap-2 bg-gradient-to-r from-primary to-emerald-500 hover:brightness-110 text-primary-foreground"
                >
                  <Play className="h-4 w-4" />
                  Retake Test
                </Button>
              </div>

              {userData &&
                questions.some(
                  (q) => q.generated_by.id === userData.id.toString()
                ) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear My Questions
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Clear All Your Practice Questions?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all practice questions
                          you've generated for this lesson. This action cannot
                          be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearAllQuestions}>
                          Clear All Questions
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <Badge
                        className={getDifficultyColor(
                          question.difficulty_level
                        )}
                      >
                        {question.difficulty_level}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        {getQuestionTypeIcon(question.question_type)}
                        <span className="capitalize">
                          {question.question_type.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {question.generated_by.first_name}{" "}
                        {question.generated_by.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(question.created_at).toLocaleDateString()}
                      </div>

                      {userData &&
                        question.generated_by.id === userData.id.toString() && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive/80"
                                disabled={deleting === question.id}
                              >
                                {deleting === question.id ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Practice Question?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this practice
                                  question. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteQuestion(question.id)
                                  }
                                >
                                  Delete Question
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                    </div>
                  </div>

                  <h3 className="font-medium mb-3">{question.question_text}</h3>

                  {/* Show question details */}
                  <div className="text-sm text-muted-foreground space-y-2">
                    {question.question_type === "multiple_choice" &&
                      question.options && (
                        <div className="ml-4">
                          <p className="font-medium mb-1">Options:</p>
                          {Object.entries(question.options).map(
                            ([key, option]) => (
                              <div
                                key={key}
                                className={`flex items-center gap-2 ${
                                  option.is_correct
                                    ? "text-emerald-600 dark:text-emerald-300 font-medium"
                                    : ""
                                }`}
                              >
                                <span className="font-medium">{key}.</span>
                                <span>{option.text}</span>
                                {option.is_correct && (
                                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-400/40 text-xs">
                                    Correct
                                  </Badge>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      )}

                    {question.question_type !== "multiple_choice" && (
                      <div className="ml-4">
                        <span className="font-medium">Answer: </span>
                        <span className="text-emerald-600 dark:text-emerald-300 font-medium">
                          {question.correct_answer}
                        </span>
                      </div>
                    )}

                    {question.explanation && (
                      <div className="ml-4 mt-3 p-2 bg-muted/30 border border-border/60 rounded">
                        <span className="font-medium text-foreground">
                          Explanation:{" "}
                        </span>
                        <span className="text-muted-foreground">
                          {question.explanation}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
