"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Download,
  Search,
  Loader2,
  FileDown,
} from "lucide-react";
import { useCoursesData } from "@/hooks/useDashboardData";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function CourseExport() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [includeUnpublished, setIncludeUnpublished] = useState(false);
  const [includePracticeQuestions, setIncludePracticeQuestions] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const {
    data: courses,
    isLoading: coursesLoading,
    error: coursesError,
  } = useCoursesData();

  const filteredCourses = courses?.filter(
    (course: any) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleExport = async () => {
    if (!selectedCourseId) {
      toast.error("Please select a course to export");
      return;
    }

    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        course_id: selectedCourseId,
        include_unpublished: includeUnpublished.toString(),
        include_practice_questions: includePracticeQuestions.toString(),
      });

      const response = await fetch(`/api/course/export?${params}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Export failed");
      }

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `course-export-${Date.now()}.md`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Course exported successfully!");
      setSelectedCourseId("");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to export course"
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickExport = async (courseId: number) => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        course_id: courseId.toString(),
        include_unpublished: "false",
        include_practice_questions: "true",
      });

      const response = await fetch(`/api/course/export?${params}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `course-${courseId}-${Date.now()}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Course exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to export course"
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Export Course to Markdown</CardTitle>
          <CardDescription>
            Export courses to markdown format for backup or editing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Search Courses</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Course Selection */}
          <div className="space-y-2">
            <Label>Select Course *</Label>
            <Select
              value={selectedCourseId}
              onValueChange={setSelectedCourseId}
              disabled={coursesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a course to export" />
              </SelectTrigger>
              <SelectContent>
                {filteredCourses.map((course: any) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.code} - {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export Options */}
          <div className="space-y-3 border rounded-lg p-4">
            <Label className="text-base font-semibold">Export Options</Label>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="unpublished" className="text-sm">
                  Include Unpublished Content
                </Label>
                <p className="text-xs text-gray-500">
                  Export modules, lessons, and tests that are not published
                </p>
              </div>
              <Switch
                id="unpublished"
                checked={includeUnpublished}
                onCheckedChange={setIncludeUnpublished}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="practice" className="text-sm">
                  Include Practice Questions
                </Label>
                <p className="text-xs text-gray-500">
                  Export practice questions from lessons
                </p>
              </div>
              <Switch
                id="practice"
                checked={includePracticeQuestions}
                onCheckedChange={setIncludePracticeQuestions}
              />
            </div>
          </div>

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={!selectedCourseId || isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export Course
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Course List */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>
            Quick export from the list below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {coursesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : coursesError ? (
            <div className="text-center py-8 text-red-600">
              Error loading courses
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No courses found matching your search" : "No courses available"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course: any) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.units}</TableCell>
                    <TableCell>
                      {course.published ? (
                        <span className="text-green-600">Published</span>
                      ) : (
                        <span className="text-gray-500">Draft</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleQuickExport(course.id)}
                        disabled={isExporting}
                      >
                        <FileDown className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

