"use client";

import { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Loader2,
  FileCheck,
} from "lucide-react";
import { parseCourseMarkdown, validateParsedCourse } from "@/lib/course-markdown-parser";
import { ParsedCourse, ValidationError } from "@/lib/types/course-markdown";
import { useDepartmentsData } from "@/hooks/useDashboardData";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface CourseImportProps {
  onImportSuccess?: () => void;
}

export default function CourseImport({ onImportSuccess }: CourseImportProps) {
  const [markdown, setMarkdown] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [parsedCourse, setParsedCourse] = useState<ParsedCourse | null>(null);
  const [validation, setValidation] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [departmentId, setDepartmentId] = useState<string>("");
  const [importMode, setImportMode] = useState<"file" | "text">("file");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: departments,
    isLoading: departmentsLoading,
  } = useDepartmentsData();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".md")) {
      toast.error("Please select a markdown (.md) file");
      return;
    }

    setFile(selectedFile);
    const text = await selectedFile.text();
    setMarkdown(text);
    parseAndPreview(text);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMarkdown(text);
    if (text.trim()) {
      parseAndPreview(text);
    } else {
      setParsedCourse(null);
      setValidation(null);
    }
  };

  const parseAndPreview = (text: string) => {
    try {
      const parsed = parseCourseMarkdown(text);
      const validationResult = validateParsedCourse(parsed);
      setParsedCourse(parsed);
      setValidation(validationResult);
    } catch (error) {
      console.error("Parse error:", error);
      toast.error("Failed to parse markdown. Please check the format.");
      setParsedCourse(null);
      setValidation({
        valid: false,
        errors: [
          {
            field: "parse",
            message: error instanceof Error ? error.message : "Parse error",
          },
        ],
        warnings: [],
      });
    }
  };

  const handleImport = async () => {
    if (!parsedCourse || !validation?.valid) {
      toast.error("Please fix validation errors before importing");
      return;
    }

    if (!departmentId) {
      toast.error("Please select a department");
      return;
    }

    setIsImporting(true);
    try {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      } else {
        formData.append("markdown", markdown);
      }
      formData.append("department_id", departmentId);

      const response = await fetch("/api/course/import", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Import failed");
      }

      const importData = result.data;
      if (importData.success) {
        toast.success(
          `Course imported successfully! Created ${importData.created.modules} modules, ${importData.created.lessons} lessons, ${importData.created.tests} tests, and ${importData.created.questions} questions.`
        );
        // Reset form
        setMarkdown("");
        setFile(null);
        setParsedCourse(null);
        setValidation(null);
        setDepartmentId("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onImportSuccess?.();
      } else {
        throw new Error("Import was not successful");
      }
    } catch (error) {
      console.error("Import error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to import course"
      );
    } finally {
      setIsImporting(false);
    }
  };

  const renderPreview = () => {
    if (!parsedCourse) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Course Preview</h3>
          <Badge variant={validation?.valid ? "default" : "destructive"}>
            {validation?.valid ? "Valid" : "Invalid"}
          </Badge>
        </div>

        {/* Course Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {parsedCourse.metadata.name}
            </CardTitle>
            <CardDescription>
              Code: {parsedCourse.metadata.code} | Units:{" "}
              {parsedCourse.metadata.units}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {parsedCourse.metadata.description}
            </p>
          </CardContent>
        </Card>

        {/* Validation Errors */}
        {validation && !validation.valid && validation.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Errors</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {validation.errors.map((error: ValidationError, idx: number) => (
                  <li key={idx} className="text-sm">
                    <strong>{error.field}:</strong> {error.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Validation Warnings */}
        {validation && validation.warnings.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warnings</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside space-y-1 mt-2">
                {validation.warnings.map((warning: ValidationError, idx: number) => (
                  <li key={idx} className="text-sm">
                    <strong>{warning.field}:</strong> {warning.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Course Structure */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="structure">
            <AccordionTrigger>Course Structure</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {/* Course-level tests */}
                {parsedCourse.tests.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Course Tests</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {parsedCourse.tests.map((test, idx) => (
                        <li key={idx}>
                          {test.metadata.name} ({test.questions.length} questions)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Modules */}
                {parsedCourse.modules.map((module, moduleIdx) => (
                  <div key={moduleIdx} className="border-l-2 border-blue-200 pl-4">
                    <h4 className="font-semibold">
                      Module {module.metadata.order}: {module.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {module.metadata.description}
                    </p>

                    {/* Module-level tests */}
                    {module.tests.length > 0 && (
                      <div className="ml-4 mb-2">
                        <h5 className="text-sm font-medium">Module Tests:</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {module.tests.map((test, idx) => (
                            <li key={idx}>
                              {test.metadata.name} ({test.questions.length}{" "}
                              questions)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Lessons */}
                    {module.lessons.map((lesson, lessonIdx) => (
                      <div
                        key={lessonIdx}
                        className="ml-4 mt-2 border-l-2 border-green-200 pl-4"
                      >
                        <h5 className="font-medium">
                          Lesson {lesson.metadata.order}: {lesson.name}
                        </h5>
                        <p className="text-xs text-gray-500 mb-1">
                          {lesson.metadata.description}
                        </p>

                        {/* Practice Questions */}
                        {lesson.practiceQuestions.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {lesson.practiceQuestions.length} Practice Questions
                          </Badge>
                        )}

                        {/* Lesson-level tests */}
                        {lesson.tests.length > 0 && (
                          <div className="mt-1">
                            <h6 className="text-xs font-medium">Tests:</h6>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              {lesson.tests.map((test, idx) => (
                                <li key={idx}>
                                  {test.metadata.name} ({test.questions.length}{" "}
                                  questions)
                                  {test.metadata.format === "assignment" && (
                                    <Badge variant="secondary" className="ml-1 text-xs">
                                      Assignment
                                    </Badge>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Import Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Modules:</span>{" "}
                {parsedCourse.modules.length}
              </div>
              <div>
                <span className="font-medium">Lessons:</span>{" "}
                {parsedCourse.modules.reduce(
                  (sum, m) => sum + m.lessons.length,
                  0
                )}
              </div>
              <div>
                <span className="font-medium">Tests:</span>{" "}
                {parsedCourse.tests.length +
                  parsedCourse.modules.reduce(
                    (sum, m) =>
                      sum + m.tests.length + m.lessons.reduce((s, l) => s + l.tests.length, 0),
                    0
                  )}
              </div>
              <div>
                <span className="font-medium">Practice Questions:</span>{" "}
                {parsedCourse.modules.reduce(
                  (sum, m) =>
                    sum + m.lessons.reduce((s, l) => s + l.practiceQuestions.length, 0),
                  0
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Course from Markdown</CardTitle>
          <CardDescription>
            Upload a markdown file or paste markdown content to import a course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Import Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={importMode === "file" ? "default" : "outline"}
              onClick={() => setImportMode("file")}
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <Button
              variant={importMode === "text" ? "default" : "outline"}
              onClick={() => setImportMode("text")}
              size="sm"
            >
              <FileText className="h-4 w-4 mr-2" />
              Paste Text
            </Button>
          </div>

          {/* File Upload */}
          {importMode === "file" && (
            <div className="space-y-2">
              <Label>Markdown File</Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".md"
                  onChange={handleFileSelect}
                  className="flex-1"
                />
                {file && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <FileCheck className="h-3 w-3" />
                    {file.name}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Text Input */}
          {importMode === "text" && (
            <div className="space-y-2">
              <Label>Markdown Content</Label>
              <Textarea
                value={markdown}
                onChange={handleTextChange}
                placeholder="Paste your course markdown here..."
                rows={15}
                className="font-mono text-sm"
              />
            </div>
          )}

          {/* Department Selection */}
          <div className="space-y-2">
            <Label>Department *</Label>
            <Select
              value={departmentId}
              onValueChange={setDepartmentId}
              disabled={departmentsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments?.map((dept: any) => (
                  <SelectItem key={dept.id} value={dept.id.toString()}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Button */}
          {parsedCourse && (
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Full Preview
            </Button>
          )}

          {/* Import Button */}
          <Button
            onClick={handleImport}
            disabled={
              !parsedCourse ||
              !validation?.valid ||
              !departmentId ||
              isImporting
            }
            className="w-full"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import Course
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Inline Preview */}
      {parsedCourse && !showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Preview</CardTitle>
          </CardHeader>
          <CardContent>{renderPreview()}</CardContent>
        </Card>
      )}

      {/* Full Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Import Preview</DialogTitle>
            <DialogDescription>
              Review the course structure before importing
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">{renderPreview()}</div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

