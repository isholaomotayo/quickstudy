"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/AppContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Globe, BookOpen, Clock, Users, MessageSquare } from "lucide-react";
import { ForumScope, ForumPost } from "@/lib/hooks/useForumData";

interface Course {
  id: number;
  name: string;
  code: string;
  has_forum_posts?: boolean;
  has_discussions?: boolean;
  forum_count?: number;
  discussion_count?: number;
}

interface ForumNavigationProps {
  currentScope: ForumScope;
  onScopeChange: (scope: ForumScope) => void;
  courseOnly?: boolean; // Hide university tab when true
  courseId?: number; // Pre-select specific course
  courseName?: string; // Course name from URL parameter
  posts?: ForumPost[]; // Forum posts to extract course data from
}

export function ForumNavigation({
  currentScope,
  onScopeChange,
  courseOnly = false,
  courseId,
  courseName,
  posts = [],
}: ForumNavigationProps) {
  const { userData } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Initialize selected course immediately if courseId is provided
  useEffect(() => {
    if (courseId && !selectedCourse) {
      const displayName = courseName || `Course ${courseId}`;
      const placeholderCourse = {
        id: courseId,
        name: displayName,
        code: `Course ${courseId}`,
        has_forum_posts: true,
        has_discussions: true,
        forum_count: 0,
        discussion_count: 0,
      };
      setSelectedCourse(placeholderCourse);
      setCourses([placeholderCourse]);
    }
  }, [courseId, courseName, selectedCourse]);

  useEffect(() => {
    // Extract course data from posts
    const courseData = extractCourseDataFromPosts(posts);
    setCourses(courseData);

    // Auto-select course if courseId is provided
    if (courseId) {
      const targetCourse = courseData.find((course) => course.id === courseId);
      if (targetCourse) {
        setSelectedCourse(targetCourse);
      } else if (courseData.length === 0) {
        // If no posts loaded yet but we have a courseId, create a placeholder course
        const displayName = courseName || `Course ${courseId}`;
        const placeholderCourse = {
          id: courseId,
          name: displayName,
          code: `Course ${courseId}`,
          has_forum_posts: true,
          has_discussions: true,
          forum_count: 0,
          discussion_count: 0,
        };
        setSelectedCourse(placeholderCourse);
        setCourses([placeholderCourse]);
      }
    }
  }, [posts, courseId, courseName]);

  const extractCourseDataFromPosts = (posts: ForumPost[]): Course[] => {
    const courseMap = new Map<number, Course>();

    if (!Array.isArray(posts)) {
      return [];
    }

    posts.forEach((post) => {
      if (post.course) {
        const courseId = post.course.id;
        if (!courseMap.has(courseId)) {
          courseMap.set(courseId, {
            id: courseId,
            name: post.course.name,
            code: `Course ${courseId}`,
            has_forum_posts: true,
            has_discussions: currentScope.type === "timed_discussion",
            forum_count: 1, // Will be updated with actual count
            discussion_count: currentScope.type === "timed_discussion" ? 1 : 0,
          });
        } else {
          // Update counts
          const existingCourse = courseMap.get(courseId)!;
          if (currentScope.type === "course") {
            existingCourse.forum_count = (existingCourse.forum_count || 0) + 1;
          } else if (currentScope.type === "timed_discussion") {
            existingCourse.discussion_count =
              (existingCourse.discussion_count || 0) + 1;
          }
        }
      }
    });

    return Array.from(courseMap.values());
  };

  const handleScopeChange = (type: ForumScope["type"]) => {
    if (type === "institution") {
      onScopeChange({ type: "institution" });
    } else {
      // If no course is selected but user clicks course/discussion tab,
      // attempt to select a course, otherwise still switch the tab type
      if (!selectedCourse) {
        // Try courseId from props
        let targetCourse = null as Course | null;
        if (courseId) {
          targetCourse =
            courses.find((course) => course.id === courseId) || null;
        }

        // Fall back to first available course
        if (!targetCourse && courses.length > 0) {
          targetCourse = courses[0];
        }

        if (targetCourse) {
          setSelectedCourse(targetCourse);
          onScopeChange({
            type,
            course_id: targetCourse.id,
            course_name: targetCourse.name,
          });
        } else {
          // No course available yet; still update type so tabs switch immediately
          onScopeChange({ type });
        }
      } else {
        // Course is already selected, just switch the type
        onScopeChange({
          type,
          course_id: selectedCourse.id,
          course_name: selectedCourse.name,
        });
      }
    }
  };

  return (
    <GlassCard className="p-6 bg-card border border-border">
      <div className="space-y-4">
        {/* Main Navigation Tabs */}
        <Tabs
          value={currentScope.type}
          onValueChange={(value) =>
            handleScopeChange(value as ForumScope["type"])
          }
          className="w-full"
        >
          <TabsList
            className={`grid w-full ${
              courseOnly ? "grid-cols-2" : "grid-cols-3"
            } bg-muted/30 border border-border/60`}
          >
            {/* Always show University tab unless explicitly in course-only mode */}
            {!courseOnly && (
              <TabsTrigger
                value="institution"
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Globe className="w-4 h-4" />
                University Forum
              </TabsTrigger>
            )}
            <TabsTrigger
              value="course"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BookOpen className="w-4 h-4" />
              Course Forum
            </TabsTrigger>
            <TabsTrigger
              value="timed_discussion"
              className="flex items-center gap-2 data-[state=active]:bg-emerald-500 data-[state=active]:text-primary-foreground"
            >
              <Clock className="w-4 h-4" />
              Timed Discussions
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Course Selection */}
        {(currentScope.type === "course" ||
          currentScope.type === "timed_discussion") && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  {selectedCourse ? "Selected Course:" : "Select Course:"}
                </span>
              </div>
              {selectedCourse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCourse(null);
                    onScopeChange({ type: currentScope.type });
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Change Course
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {courses.map((course) => {
                const hasForumPosts = course.has_forum_posts;
                const hasDiscussions = course.has_discussions;
                const forumCount = course.forum_count || 0;
                const discussionCount = course.discussion_count || 0;

                // Show count based on current tab
                const currentCount =
                  currentScope.type === "course" ? forumCount : discussionCount;
                const hasCurrentContent =
                  currentScope.type === "course"
                    ? hasForumPosts
                    : hasDiscussions;

                return (
                  <button
                    key={course.id}
                    onClick={() => {
                      setSelectedCourse(course);
                      onScopeChange({
                        type: currentScope.type,
                        course_id: course.id,
                        course_name: course.name,
                      });
                    }}
                    className={`p-2 rounded-md border transition-all duration-200 text-left ${
                      selectedCourse?.id === course.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-xs text-foreground truncate">
                        {course.name}
                      </div>
                      {hasCurrentContent && currentCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-1 py-0"
                        >
                          {currentCount}
                        </Badge>
                      )}
                    </div>
                    {!hasCurrentContent && (
                      <div className="text-xs text-muted-foreground mt-1">
                        No{" "}
                        {currentScope.type === "course"
                          ? "posts"
                          : "discussions"}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Scope Description */}
        <div className="bg-muted/30 border border-border/60 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
            <div>
              {currentScope.type === "institution" && (
                <div>
                  <h3 className="font-medium text-foreground">
                    University-wide Forum
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Discuss topics that affect the entire university community.
                    Share announcements, general questions, and engage with
                    students from all departments.
                  </p>
                </div>
              )}

              {currentScope.type === "course" && (
                <div>
                  <h3 className="font-medium text-foreground">
                    Course Discussion Forum
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedCourse ? (
                      <>
                        Open-ended discussions for {selectedCourse.name}. Ask
                        questions, share resources, and collaborate on
                        course-related topics.
                      </>
                    ) : (
                      <>
                        Select a course to view its discussion forum. Browse all
                        your enrolled courses and their forum activities.
                      </>
                    )}
                  </p>
                </div>
              )}

              {currentScope.type === "timed_discussion" && (
                <div>
                  <h3 className="font-medium text-foreground">
                    Timed Course Discussions
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedCourse ? (
                      <>
                        Time-limited discussions for {selectedCourse.name}
                        with specific start and end dates. Perfect for
                        assignments and structured debates.
                      </>
                    ) : (
                      <>
                        Select a course to view its timed discussions. Browse
                        all your enrolled courses and their timed discussion
                        activities.
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
