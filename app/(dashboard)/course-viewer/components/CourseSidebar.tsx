"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Circle,
  Play,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Clock,
  FileText,
  Video,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Test interface
interface Test {
  id: number;
  course_id: number;
  course_module_id: number;
  course_lesson_id: number;
  name: string;
  instructions: string;
  duration_mins: number;
  deadline: string;
  max_attempts: number;
  max_score: number;
  created_at: string;
  updated_at: string;
  format: string;
  published: boolean;
}

interface CourseLesson {
  id: number;
  name: string;
  description?: string;
  content: string;
  order: number;
  course_module_id: number;
  created_at: string;
  updated_at: string;
  course_tests?: Test[];
}

interface ProgressData {
  completed: Set<number>;
  lastLessonId: number | null;
}

interface CourseSidebarProps {
  courseLessons: CourseLesson[];
  activeLesson: CourseLesson | null;
  progress: ProgressData;
  onLessonSelect: (lesson: CourseLesson) => void;
  progressPercentage: number;
  courseProgress: {
    completion_percentage: number;
    total_lessons: number;
    completed_lessons: number;
  };
}

export default function CourseSidebar({
  courseLessons,
  activeLesson,
  progress,
  onLessonSelect,
  progressPercentage,
  courseProgress,
}: CourseSidebarProps) {
  const [expandedLessons, setExpandedLessons] = useState<Set<number>>(
    new Set()
  );

  const toggleLessonExpansion = (lessonId: number) => {
    setExpandedLessons((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(lessonId)) {
        newSet.delete(lessonId);
      } else {
        newSet.add(lessonId);
      }
      return newSet;
    });
  };

  const getLessonIcon = (lesson: CourseLesson) => {
    const content = lesson.content.toLowerCase();
    if (
      content.includes("video") ||
      content.includes("youtube") ||
      content.includes("vimeo")
    ) {
      return <Video className="h-4 w-4" />;
    }
    if (lesson.course_tests && lesson.course_tests.length > 0) {
      return <FileText className="h-4 w-4" />;
    }
    return <BookOpen className="h-4 w-4" />;
  };

  const getLessonDuration = () => {
    // Estimate duration based on content length
    const avgWordsPerMinute = 200;
    const totalWords = courseLessons.reduce((acc, lesson) => {
      const textContent = lesson.content.replace(/<[^>]*>/g, "");
      return acc + textContent.split(" ").length;
    }, 0);
    return Math.ceil(totalWords / avgWordsPerMinute);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
      {/* Progress Section */}
      <Card className="mb-3">
        <CardContent className="space-y-2">
          {/* Overall Course Progress */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-semibold text-gray-900">
                {courseProgress.completion_percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  courseProgress.completion_percentage === 100
                    ? "bg-green-500"
                    : courseProgress.completion_percentage >= 50
                    ? "bg-yellow-500"
                    : "bg-blue-500"
                }`}
                style={{ width: `${courseProgress.completion_percentage}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              {courseProgress.completed_lessons} of{" "}
              {courseProgress.total_lessons} lessons completed
            </div>
          </div>

          {/* Module Progress Section */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Module Progress</span>
              <span className="font-semibold text-gray-900">
                {progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  progressPercentage === 100
                    ? "bg-green-500"
                    : progressPercentage >= 50
                    ? "bg-yellow-500"
                    : "bg-blue-500"
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {progress.completed.size} of {courseLessons.length} module
                lessons completed
              </span>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />~{getLessonDuration()} min
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="mb-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            const firstIncomplete = courseLessons.find(
              (lesson) => !progress.completed.has(lesson.id)
            );
            if (firstIncomplete) {
              onLessonSelect(firstIncomplete);
            }
          }}
        >
          <Play className="h-4 w-4 mr-2" />
          Continue Learning
        </Button>
      </div>

      {/* Lessons List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">
            Lessons
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {courseLessons.map((lesson, index) => {
              const isActive = activeLesson?.id === lesson.id;
              const isCompleted = progress.completed.has(lesson.id);
              const hasTests =
                lesson.course_tests && lesson.course_tests.length > 0;
              const isExpanded = expandedLessons.has(lesson.id);

              return (
                <div key={lesson.id} className="space-y-1">
                  {/* Lesson Item */}
                  <div
                    className={cn(
                      "group flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-all duration-200",
                      isActive
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50 border border-transparent",
                      isCompleted && !isActive && "bg-green-50"
                    )}
                    onClick={() => onLessonSelect(lesson)}
                  >
                    {/* Status Icon */}
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : isActive ? (
                        <Play className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {getLessonIcon(lesson)}
                        <span
                          className={cn(
                            "text-sm font-medium truncate",
                            isActive ? "text-blue-900" : "text-gray-900",
                            isCompleted && !isActive && "text-green-800"
                          )}
                        >
                          {lesson.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          Lesson {index + 1}
                        </span>
                        {hasTests && (
                          <Badge variant="outline" className="text-xs">
                            {lesson?.course_tests?.length || 0} test
                            {lesson?.course_tests?.length &&
                            lesson?.course_tests?.length > 1
                              ? "s"
                              : ""}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Expand Button for Tests */}
                    {hasTests && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLessonExpansion(lesson.id);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Tests Section */}
                  {hasTests && isExpanded && (
                    <div className="ml-6 space-y-1">
                      {lesson?.course_tests?.map((test, testIndex) => (
                        <div
                          key={test.id || testIndex}
                          className="flex items-center space-x-2 p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <FileText className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-700 truncate">
                            {test.name || `Test ${testIndex + 1}`}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 ml-auto"
                            asChild
                          >
                            <a
                              href={`/lms/immersive-test?course_test_id=${test.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
