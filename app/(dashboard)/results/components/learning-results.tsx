"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Clock,
  Calendar,
  ExternalLink,
  Eye,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { TestDetailModal } from "./test-detail-modal";

interface LearningResult {
  id: number;
  course_test_id: number;
  name: string;
  test_name: string;
}

interface LearningResultsProps {
  results: LearningResult[];
  onRefresh: () => void;
}

export function LearningResults({ results, onRefresh }: LearningResultsProps) {
  const [selectedTest, setSelectedTest] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewTest = (courseTestId: number) => {
    setSelectedTest(courseTestId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTest(null);
  };

  if (results.length === 0) {
    return (
      <Card className="border border-border bg-card">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium text-foreground">
              No Learning Results Available
            </h3>
            <p className="text-sm text-muted-foreground">
              Your quiz and test results will appear here once you complete
              assessments.
            </p>
            <Button onClick={onRefresh} variant="outline">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-muted/30 border border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <TrendingUp className="h-5 w-5" />
            <span>Learning Assessment Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {results.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {new Set(results.map((r) => r.name)).size}
              </div>
              <div className="text-sm text-muted-foreground">Courses with Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {new Set(results.map((r) => r.test_name)).size}
              </div>
              <div className="text-sm text-muted-foreground">Unique Test Types</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <Card
            key={`${result.id}-${index}`}
            className="hover:shadow-md transition-shadow border border-border bg-card"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-primary/15 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-foreground truncate">
                        {result.test_name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Course: {result.name}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Test ID: {result.course_test_id}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleViewTest(result.id)}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Information Card */}
      <Card className="bg-muted/30 border border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-foreground">
            <GraduationCap className="h-5 w-5" />
            <span>About Learning Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              Learning results show your performance in quizzes, tests, and
              other assessments taken through the Learning Management System
              (LMS).
            </p>
            <p>
              Click "View Details" on any test to see your detailed performance,
              including individual question responses and time taken.
            </p>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                Results are updated in real-time as you complete assessments
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Detail Modal */}
      <TestDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        courseTestId={selectedTest}
      />
    </div>
  );
}
