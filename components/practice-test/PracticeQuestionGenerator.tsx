"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Brain,
  Play,
  Settings,
  CheckSquare,
  Circle,
  MessageSquare,
  Target,
  Lightbulb,
  TrendingUp,
  Timer,
  Pause,
  X,
} from "lucide-react";

interface PracticeQuestionGeneratorProps {
  lessonId: number;
  lessonName: string;
  trigger?: React.ReactNode;
}

export default function PracticeQuestionGenerator({
  lessonId,
  lessonName,
  trigger,
}: PracticeQuestionGeneratorProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [autoStart, setAutoStart] = useState(false);
  const countdownValueRef = useRef(5);
  const [config, setConfig] = useState({
    difficulty: "medium" as "easy" | "medium" | "hard",
    questionCount: 5,
    questionTypes: ["multiple_choice"] as ("multiple_choice" | "true_false")[],
  });

  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartPractice = () => {
    const queryParams = new URLSearchParams({
      lesson_id: lessonId.toString(),
      difficulty: config.difficulty,
      question_count: config.questionCount.toString(),
      question_types: config.questionTypes.join(","),
    });

    setShowCountdown(false);
    setShowDialog(false);
    router.push(`/practice-test?${queryParams}`);
  };

  const handleQuickStart = (quickConfig: typeof config) => {
    setConfig(quickConfig);

    if (autoStart) {
      // Start countdown for auto-start
      setShowCountdown(true);
      setCountdown(5);
      countdownValueRef.current = 5;

      countdownRef.current = setInterval(() => {
        countdownValueRef.current -= 1;
        setCountdown(countdownValueRef.current);

        if (countdownValueRef.current <= 0) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
          }
          handleStartPractice();
        }
      }, 1000);
    } else {
      // Show confirmation dialog
      setShowCountdown(true);
    }
  };

  const handleCancelCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setShowCountdown(false);
    setCountdown(5);
    countdownValueRef.current = 5;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      countdownValueRef.current = 5;
    };
  }, []);

  const handleQuestionTypeChange = (
    type: "multiple_choice" | "true_false",
    checked: boolean
  ) => {
    if (checked) {
      setConfig((prev) => ({
        ...prev,
        questionTypes: [...prev.questionTypes, type],
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        questionTypes: prev.questionTypes.filter((t) => t !== type),
      }));
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "multiple_choice":
        return <CheckSquare className="h-4 w-4" />;
      case "true_false":
        return <Circle className="h-4 w-4" />;
      default:
        return <CheckSquare className="h-4 w-4" />;
    }
  };

  const defaultTrigger = (
    <Button
      onClick={() => setShowDialog(true)}
      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
      size="sm"
    >
      <Brain className="h-4 w-4 mr-2" />
      AI Practice Questions
    </Button>
  );

  return (
    <>
      {trigger ? (
        <div onClick={() => setShowDialog(true)}>{trigger}</div>
      ) : (
        defaultTrigger
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl" size="xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              AI Practice Question Generator
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Generate personalized practice questions for:{" "}
              <strong>{lessonName}</strong>
            </p>
          </DialogHeader>

          <div className="space-y-6">
            {/* Quick Start Options */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Play className="h-4 w-4 text-green-600" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Auto-start toggle */}
                <div className="flex items-center space-x-2 mb-4 p-3 bg-gray-50 rounded-lg border">
                  <Switch
                    id="auto-start"
                    checked={autoStart}
                    onCheckedChange={setAutoStart}
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="auto-start"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Auto-start after selection
                    </Label>
                    <p className="text-xs text-gray-600">
                      {autoStart
                        ? "Quick start will begin practice immediately with 5s countdown"
                        : "Quick start will show confirmation before beginning practice"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleQuickStart({
                        difficulty: "easy",
                        questionCount: 3,
                        questionTypes: ["multiple_choice"],
                      })
                    }
                    className="h-auto p-4 text-left flex-col items-start"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Quick Review</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      3 easy questions • Multiple choice
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      handleQuickStart({
                        difficulty: "medium",
                        questionCount: 5,
                        questionTypes: ["multiple_choice", "true_false"],
                      })
                    }
                    className="h-auto p-4 text-left flex-col items-start"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Standard Practice</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      5 medium questions • Mixed types
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      handleQuickStart({
                        difficulty: "hard",
                        questionCount: 8,
                        questionTypes: ["multiple_choice", "true_false"],
                      })
                    }
                    className="h-auto p-4 text-left flex-col items-start"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="h-4 w-4 text-red-600" />
                      <span className="font-medium">Challenge Mode</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      8 hard questions • All types
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Custom Configuration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="h-4 w-4 text-gray-600" />
                  Custom Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Difficulty Level */}
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={config.difficulty}
                    onValueChange={(value: "easy" | "medium" | "hard") =>
                      setConfig((prev) => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor("easy")}>
                            Easy
                          </Badge>
                          <span>Basic concepts and definitions</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor("medium")}>
                            Medium
                          </Badge>
                          <span>Application and analysis</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="hard">
                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor("hard")}>
                            Hard
                          </Badge>
                          <span>Critical thinking and synthesis</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question Count */}
                <div className="space-y-2">
                  <Label htmlFor="questionCount">Number of Questions</Label>
                  <Select
                    value={config.questionCount.toString()}
                    onValueChange={(value) =>
                      setConfig((prev) => ({
                        ...prev,
                        questionCount: parseInt(value),
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 questions</SelectItem>
                      <SelectItem value="5">5 questions</SelectItem>
                      <SelectItem value="8">8 questions</SelectItem>
                      <SelectItem value="10">10 questions</SelectItem>
                      <SelectItem value="15">15 questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Question Types */}
                <div className="space-y-3">
                  <Label>Question Types</Label>
                  <div className="space-y-2">
                    {[
                      {
                        id: "multiple_choice",
                        label: "Multiple Choice",
                        description: "Choose the best answer from 4 options",
                      },
                      {
                        id: "true_false",
                        label: "True/False",
                        description: "Choose between True or False options",
                      },
                    ].map((type) => (
                      <div
                        key={type.id}
                        className="flex items-center space-x-3 p-2 rounded-lg border"
                      >
                        <Checkbox
                          id={type.id}
                          checked={config.questionTypes.includes(
                            type.id as any
                          )}
                          onCheckedChange={(checked) =>
                            handleQuestionTypeChange(
                              type.id as any,
                              checked as boolean
                            )
                          }
                        />
                        <div className="flex items-center gap-2 flex-1">
                          {getQuestionTypeIcon(type.id)}
                          <div>
                            <label
                              htmlFor={type.id}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {type.label}
                            </label>
                            <p className="text-xs text-gray-600">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {config.questionTypes.length === 0 && (
                    <p className="text-sm text-red-600">
                      Please select at least one question type.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">
                    Practice Preview
                  </h4>
                  <p className="text-sm text-blue-800 mt-1">
                    You'll get <strong>{config.questionCount}</strong>{" "}
                    <Badge className={getDifficultyColor(config.difficulty)}>
                      {config.difficulty}
                    </Badge>{" "}
                    questions with detailed explanations. No grades are recorded
                    - it's pure practice!
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-blue-700">Types:</span>
                    {config.questionTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStartPractice}
              disabled={config.questionTypes.length === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              Generate & Start Practice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Countdown Dialog */}
      <Dialog open={showCountdown} onOpenChange={handleCancelCountdown}>
        <DialogContent className="max-w-md" size="sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-center">
              {autoStart ? (
                <>
                  <Timer className="h-5 w-5 text-blue-600" />
                  Starting in {countdown}...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 text-green-600" />
                  Ready to start practice?
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="text-center py-6">
            {autoStart ? (
              <div className="space-y-4">
                <div className="text-6xl font-bold text-blue-600 animate-pulse">
                  {countdown}
                </div>
                <div className="space-y-2">
                  <p className="font-medium">
                    {config.questionCount} {config.difficulty} questions
                  </p>
                  <div className="flex justify-center gap-1">
                    {config.questionTypes.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type.replace("_", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-4xl">🧠</div>
                <div className="space-y-2">
                  <p className="font-medium text-lg">
                    Starting {config.difficulty} practice
                  </p>
                  <p className="text-gray-600">
                    {config.questionCount} questions •{" "}
                    {config.questionTypes
                      .map((t) => t.replace("_", " "))
                      .join(", ")}
                  </p>
                  <p className="text-sm text-gray-500">
                    Ready to test your knowledge?
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {autoStart ? (
              <div className="flex justify-between w-full">
                <Button variant="outline" onClick={handleCancelCountdown}>
                  <Pause className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleStartPractice}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Now
                </Button>
              </div>
            ) : (
              <div className="flex justify-between w-full">
                <Button variant="outline" onClick={handleCancelCountdown}>
                  <X className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleStartPractice}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Practice
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
