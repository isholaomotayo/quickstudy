"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Search,
  Filter,
  Calendar,
  TrendingUp,
  MessageCircle,
  Pin,
  Tag,
} from "lucide-react";
import { ForumScope } from "@/lib/hooks/useForumData";

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  scope: ForumScope;
  courseStats?: {
    forumPosts: number;
    discussions: number;
    activeDiscussions: number;
    totalParticipants: number;
  };
  forumStats?: {
    today: number;
    thisWeek: number;
    totalMembers: number;
    totalPosts: number;
  };
}

const INSTITUTION_CATEGORIES = [
  { value: "all", label: "All Posts", icon: MessageCircle },
  { value: "announcements", label: "Announcements", icon: Pin },
  { value: "general", label: "General", icon: MessageCircle },
  { value: "academic", label: "Academic", icon: TrendingUp },
  { value: "events", label: "Events", icon: Calendar },
  { value: "help", label: "Help & Support", icon: MessageCircle },
];

const COURSE_CATEGORIES = [
  { value: "all", label: "All Posts", icon: MessageCircle },
  { value: "assignments", label: "Assignments", icon: TrendingUp },
  { value: "resources", label: "Resources", icon: Tag },
  { value: "questions", label: "Questions", icon: MessageCircle },
  { value: "announcements", label: "Announcements", icon: Pin },
];

const DISCUSSION_FILTERS = [
  { value: "all", label: "All Discussions", icon: MessageCircle },
  { value: "active", label: "Active", icon: Calendar },
  { value: "upcoming", label: "Upcoming", icon: Calendar },
  { value: "completed", label: "Completed", icon: Calendar },
];

export function SearchFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  scope,
  courseStats,
  forumStats,
}: SearchFiltersProps) {
  const getCategories = () => {
    switch (scope.type) {
      case "institution":
        return INSTITUTION_CATEGORIES;
      case "course":
        return COURSE_CATEGORIES;
      case "timed_discussion":
        return DISCUSSION_FILTERS;
      default:
        return INSTITUTION_CATEGORIES;
    }
  };

  const categories = getCategories();

  return (
    <GlassCard className="p-4">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={`Search ${
              scope.type === "timed_discussion" ? "discussions" : "posts"
            }...`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-white/70 border-white/20 focus:bg-white/90"
          />
        </div>

        {/* Category Filters */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">
              {scope.type === "timed_discussion"
                ? "Filter by Status:"
                : "Filter by Category:"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              const isSelected = selectedCategory === category.value;

              return (
                <Button
                  key={category.value}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onCategoryChange(category.value)}
                  className={`flex items-center gap-2 ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none"
                      : "bg-white/70 hover:bg-white/90 border-white/30"
                  }`}
                >
                  <IconComponent className="w-3 h-3" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-white/30">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {scope.type === "institution" && forumStats
                ? forumStats.today
                : courseStats
                ? scope.type === "course"
                  ? courseStats.forumPosts
                  : courseStats.activeDiscussions
                : 0}
            </div>
            <div className="text-xs text-gray-600">
              {scope.type === "timed_discussion"
                ? "Active"
                : scope.type === "course"
                ? "Forum Posts"
                : "Today"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">
              {scope.type === "institution" && forumStats
                ? forumStats.thisWeek
                : courseStats
                ? scope.type === "course"
                  ? courseStats.discussions
                  : courseStats.discussions
                : 0}
            </div>
            <div className="text-xs text-gray-600">
              {scope.type === "timed_discussion"
                ? "Total Discussions"
                : scope.type === "course"
                ? "Discussions"
                : "This Week"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {scope.type === "institution" && forumStats
                ? forumStats.totalMembers
                : courseStats
                ? courseStats.totalParticipants
                : 0}
            </div>
            <div className="text-xs text-gray-600">
              {scope.type === "timed_discussion"
                ? "Participants"
                : scope.type === "course"
                ? "Course Members"
                : "Course Members"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600">
              {scope.type === "institution" && forumStats
                ? forumStats.totalPosts
                : courseStats
                ? courseStats.forumPosts + courseStats.discussions
                : 0}
            </div>
            <div className="text-xs text-gray-600">
              {scope.type === "timed_discussion" ? "Upcoming" : "Total Posts"}
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
