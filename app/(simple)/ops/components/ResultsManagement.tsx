"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";
import AsyncSelect from "react-select/async";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Download,
  RefreshCw,
  FileText,
  CheckCircle,
  AlertCircle,
  Calculator,
  GraduationCap,
  BookOpen,
  Users,
  BarChart3,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";

interface Course {
  id: number;
  name: string;
  code: string;
  units: number;
  department?: {
    name: string;
    faculty?: {
      name: string;
    };
  };
}

interface CourseOption {
  value: number;
  label: string;
  course: Course;
}

interface Semester {
  id: number;
  name: string;
  session?: {
    name: string;
  };
}

interface StudentCourse {
  id: number;
  student: {
    id: number;
    reg_no: string;
    user?: {
      first_name: string;
      last_name: string;
      other_name?: string;
    };
  };
}

interface ParsedResult {
  "S/N": string;
  "Name of Student (Surname First)": string;
  "Reg. No": string;
  "CA Mark"?: string;
  "Exam Score"?: string;
  Total: string;
}

interface UploadResult {
  regNo: string;
  name: string;
  score: number;
  grade: string;
  status: string;
  error?: string;
  resultId?: number;
}

interface Grade {
  id: number;
  letter: string;
  min_score: number;
  max_score: number;
}

export default function ResultsManagement() {
  const { userData } = useApp();

  // Course and semester state
  const [selectedCourse, setSelectedCourse] = useState<CourseOption | null>(
    null
  );
  const [defaultOptions, setDefaultOptions] = useState<CourseOption[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [availableSemesters, setAvailableSemesters] = useState<Semester[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentCourse[]>([]);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResult[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    stage: "",
    current: 0,
    total: 0,
    message: "",
  });
  const [message, setMessage] = useState("");
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Results management state
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsPage, setResultsPage] = useState(1);
  const [resultsLimit] = useState(10);
  const [resultsTotal, setResultsTotal] = useState(0);
  const [resultsTotalPages, setResultsTotalPages] = useState(0);

  // Action modals state
  const [viewResultModal, setViewResultModal] = useState<any>(null);
  const [editResultModal, setEditResultModal] = useState<any>(null);
  const [deleteResultModal, setDeleteResultModal] = useState<any>(null);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    score: "",
    ca_mark: "",
    exam_score: "",
    publish: false,
  });

  // Grades configuration
  const [grades, setGrades] = useState<Grade[]>([]);

  // Batch info
  const [batchInfo, setBatchInfo] = useState({
    courseTitle: "",
    courseCode: "",
    courseUnit: "",
    department: "",
    faculty: "",
    selectedSemester: "",
    session: "N/A",
    totalStudents: 0,
  });

  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState({
    totalCourses: 0,
    resultsUploaded: 0,
    pendingResults: 0,
    averageGrade: "N/A",
    gradeDistribution: [] as Array<{
      grade: string;
      count: number;
      percentage: number;
    }>,
    performanceMetrics: {
      averageScore: 0,
      passRate: 0,
      highestScore: 0,
      lowestScore: 0,
      standardDeviation: 0,
    },
  });

  // Load grades configuration and default courses on mount
  useEffect(() => {
    loadGrades();
    loadDefaultCourses();
    loadAnalyticsData();
    loadResultsData();
  }, []);

  const loadResultsData = async (page = resultsPage) => {
    setResultsLoading(true);
    try {
      const response = await fetch(
        `/api/dashboard/student-results?page=${page}&limit=${resultsLimit}`
      );

      if (response.ok) {
        const result = await response.json();
        const data = result.success ? result.data : result;

        setResultsData(data.grades || []);
        setResultsTotal(data.pagination?.total || 0);
        setResultsTotalPages(data.pagination?.pages || 0);
        setResultsPage(page);
      } else {
        console.error("Failed to load results data:", response.status);
      }
    } catch (error) {
      console.error("Error loading results data:", error);
    } finally {
      setResultsLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      // Load total courses count
      const coursesResponse = await fetch("/api/dashboard/courses");
      if (coursesResponse.ok) {
        const coursesResult = await coursesResponse.json();
        const courses = coursesResult.success
          ? coursesResult.data
          : coursesResult;
        const totalCourses = Array.isArray(courses) ? courses.length : 0;

        // Load grades/results data for statistics
        const gradesResponse = await fetch("/api/dashboard/student-results");
        if (gradesResponse.ok) {
          const gradesResult = await gradesResponse.json();
          const gradesData = gradesResult.success
            ? gradesResult.data
            : gradesResult;

          const totalResultsUploaded = gradesData.statistics?.totalGrades || 0;
          const averageScore = gradesData.statistics?.averageScore || 0;
          const publishedCount = gradesData.statistics?.publishedCount || 0;
          const unpublishedCount = gradesData.statistics?.unpublishedCount || 0;

          // Calculate grade distribution
          const gradeDistribution =
            gradesData.statistics?.gradeDistribution || [];
          const totalGrades = gradeDistribution.reduce(
            (sum: number, g: any) => sum + g.count,
            0
          );
          const formattedDistribution = gradeDistribution.map((dist: any) => ({
            grade: dist.gradeLetter || "Unknown",
            count: dist.count,
            percentage:
              totalGrades > 0
                ? Math.round((dist.count / totalGrades) * 100)
                : 0,
          }));

          // Calculate performance metrics
          const grades = gradesData.grades || [];
          const scores = grades
            .map((g: any) => g.score)
            .filter((s: any) => !isNaN(s) && s > 0);
          const passRate =
            scores.length > 0
              ? Math.round(
                  (scores.filter((s: number) => s >= 50).length /
                    scores.length) *
                    100
                )
              : 0;
          const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
          const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

          // Calculate standard deviation
          const mean = averageScore;
          const variance =
            scores.length > 0
              ? scores.reduce(
                  (sum: number, score: number) =>
                    sum + Math.pow(score - mean, 2),
                  0
                ) / scores.length
              : 0;
          const standardDeviation = Math.sqrt(variance);

          // Determine average grade letter
          let averageGrade = "N/A";
          if (grades.length > 0 && averageScore > 0) {
            // Use the grades configuration to determine the average grade letter
            const gradeConfig = await fetch("/api/grades/config");
            if (gradeConfig.ok) {
              const gradeConfigs = await gradeConfig.json();
              const gradeObj = gradeConfigs.find(
                (g: any) =>
                  averageScore >= g.min_score && averageScore <= g.max_score
              );
              averageGrade = gradeObj?.letter || "N/A";
            }
          }

          setAnalyticsData({
            totalCourses,
            resultsUploaded: totalResultsUploaded,
            pendingResults: unpublishedCount,
            averageGrade,
            gradeDistribution: formattedDistribution,
            performanceMetrics: {
              averageScore: Math.round(averageScore * 10) / 10, // Round to 1 decimal
              passRate,
              highestScore,
              lowestScore,
              standardDeviation: Math.round(standardDeviation * 10) / 10, // Round to 1 decimal
            },
          });
        }
      }
    } catch (error) {
      console.error("Error loading analytics data:", error);
      // Keep default values on error
    }
  };

  const loadDefaultCourses = async () => {
    try {
      const searchParams = "limit=50"; // Load 50 courses as default
      const response = await fetch(`/api/dashboard/courses?${searchParams}`);

      if (!response.ok) {
        throw new Error(`Failed to load courses: ${response.status}`);
      }

      const coursesResult = await response.json();
      const courses = coursesResult.success
        ? coursesResult.data
        : coursesResult;

      // Transform courses into react-select format
      const options: CourseOption[] = courses.map((course: Course) => ({
        value: course.id,
        label: `${course.code} - ${course.name}`,
        course: course,
      }));

      setDefaultOptions(options);
    } catch (error) {
      console.error("Error loading default courses:", error);
      setDefaultOptions([]);
    }
  };

  const loadGrades = async () => {
    try {
      const response = await fetch("/api/grades/config");

      if (!response.ok) {
        throw new Error(
          `Failed to fetch grades: ${response.status} ${response.statusText}`
        );
      }

      const grades = await response.json();

      if (!grades || grades.length === 0) {
        throw new Error(
          "No grades found in database. Please ensure grades are properly configured."
        );
      }

      setGrades(grades);
    } catch (error) {
      console.error("Error loading grades:", error);
      setMessage(
        `Error loading grades: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please check that grades are properly configured in the database.`
      );
      // Set empty grades array so the component doesn't break
      setGrades([]);
    }
  };

  const calculateGrade = (score: number): string => {
    if (!grades.length) return "N/A";

    const grade = grades.find(
      (g) => score >= g.min_score && score <= g.max_score
    );
    return grade?.letter || "N/A";
  };

  const loadCourseOptions = async (inputValue: string) => {
    try {
      let searchParams = "limit=50"; // Load 50 courses at a time

      // Add search filter if user typed something
      if (inputValue && inputValue.trim()) {
        searchParams += `&search=${encodeURIComponent(inputValue.trim())}`;
      }

      const response = await fetch(`/api/dashboard/courses?${searchParams}`);

      if (!response.ok) {
        throw new Error(`Failed to search courses: ${response.status}`);
      }

      const coursesResult = await response.json();
      const courses = coursesResult.success
        ? coursesResult.data
        : coursesResult;

      // Transform courses into react-select format
      const options: CourseOption[] = courses.map((course: Course) => ({
        value: course.id,
        label: `${course.code} - ${course.name}`,
        course: course,
      }));

      return options;
    } catch (error) {
      console.error("Error loading courses:", error);
      return [];
    }
  };

  const handleCourseSelect = async (selectedOption: CourseOption | null) => {
    setSelectedCourse(selectedOption);
    setSelectedSemester("");
    setFilteredStudents([]);

    if (!selectedOption) {
      setAvailableSemesters([]);
      setBatchInfo({
        courseTitle: "",
        courseCode: "",
        courseUnit: "",
        department: "",
        faculty: "",
        selectedSemester: "",
        session: "N/A",
        totalStudents: 0,
      });
      return;
    }

    setLoading(true);
    const course = selectedOption.course;

    try {
      // Use the actual backend API endpoint for course semesters
      const response = await fetch(`/api/courses/${course.id}/semesters`);

      if (!response.ok) {
        throw new Error(`Failed to get semesters: ${response.status}`);
      }

      const availableSemesters = await response.json();

      // Transform the response to match our Semester interface
      const formattedSemesters: Semester[] = availableSemesters.map(
        (semester: any) => ({
          id: semester.id,
          name: semester.name,
          session: { name: "2024/2025" }, // Default session, could be extracted from semester name
        })
      );

      setAvailableSemesters(formattedSemesters);
      setBatchInfo({
        courseTitle: course.name,
        courseCode: course.code,
        courseUnit: course.units.toString(),
        department: course.department?.name || "",
        faculty: course.department?.faculty?.name || "",
        selectedSemester: "",
        session: "N/A",
        totalStudents: 0,
      });
    } catch (error) {
      console.error("Error loading semesters:", error);
      setMessage("Error loading semesters: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleSemesterSelect = async (semesterId: string) => {
    if (!semesterId) {
      setSelectedSemester("");
      setFilteredStudents([]);
      return;
    }

    setSelectedSemester(semesterId);
    setLoading(true);

    try {
      if (!selectedCourse) {
        throw new Error("No course selected");
      }

      const courseId = selectedCourse.course.id;

      // Load students for the selected course and filter by semester
      // Using the same pattern as bulk-upload-results.js
      const searchParams = `course_id=${courseId}&all=true`;
      const response = await fetch(`/api/studentcourses?${searchParams}`);

      if (!response.ok) {
        throw new Error(`Failed to get students: ${response.status}`);
      }

      const students = await response.json();

      // Use the same filtering logic as the backend (filterStudentsForSemester utility)
      // This ensures consistency between frontend and backend
      const filteredOut: {
        wrongSemester: any[];
        noRegNo: any[];
        duplicates: any[];
      } = {
        wrongSemester: [],
        noRegNo: [],
        duplicates: [],
      };

      // Step 1: Filter by semester
      const semesterFiltered = students.filter((sc: any) => {
        const studentSemesterId = sc.semester?.id; // Fixed: renamed from semesterId to avoid conflict
        const regNo = sc.student?.reg_no;
        const studentData = {
          id: sc.id,
          name: `${sc.student?.user?.last_name || "N/A"}, ${
            sc.student?.user?.first_name || "N/A"
          }`,
          reg_no: regNo || "MISSING",
          semester_id: studentSemesterId,
          debug_info: {
            studentCourseSemesterId: studentSemesterId,
            selectedSemester: semesterId, // Use the function parameter
            comparison: `${studentSemesterId} === ${semesterId}`,
          },
        };

        // Check semester match - convert both to strings for comparison
        const semesterMatch =
          studentSemesterId &&
          studentSemesterId.toString() === semesterId.toString();

        if (!semesterMatch) {
          filteredOut.wrongSemester.push(studentData);
          return false;
        }
        return true;
      });

      // Step 2: Filter out students without registration numbers
      const withRegNoFiltered = semesterFiltered.filter((sc: any) => {
        const regNo = sc.student?.reg_no;
        const studentData = {
          id: sc.id,
          name: `${sc.student?.user?.last_name || "N/A"}, ${
            sc.student?.user?.first_name || "N/A"
          }`,
          reg_no: regNo,
        };

        if (!regNo) {
          filteredOut.noRegNo.push(studentData);
          return false;
        }
        return true;
      });

      // Step 3: Remove duplicates based on registration number
      const uniqueStudents: any[] = [];
      const seenRegNos = new Set();

      withRegNoFiltered.forEach((sc: any) => {
        const regNo = sc.student?.reg_no;
        const studentData = {
          id: sc.id,
          name: `${sc.student?.user?.last_name || "N/A"}, ${
            sc.student?.user?.first_name || "N/A"
          }`,
          reg_no: regNo,
        };

        if (!seenRegNos.has(regNo)) {
          seenRegNos.add(regNo);
          uniqueStudents.push(sc);
        } else {
          filteredOut.duplicates.push(studentData);
        }
      });

      const summary = {
        original: students.length,
        semesterFiltered: semesterFiltered.length,
        withRegNo: withRegNoFiltered.length,
        final: uniqueStudents.length,
        filteredOut: {
          wrongSemester: filteredOut.wrongSemester.length,
          noRegNo: filteredOut.noRegNo.length,
          duplicates: filteredOut.duplicates.length,
          total: students.length - uniqueStudents.length,
        },
      };

      const selectedSemesterObj = availableSemesters.find(
        (s) => s.id.toString() === semesterId
      );

      setFilteredStudents(uniqueStudents);
      setBatchInfo((prev) => ({
        ...prev,
        selectedSemester: selectedSemesterObj?.name || "",
        session: selectedSemesterObj?.session?.name || "N/A",
        totalStudents: uniqueStudents.length,
      }));
    } catch (error) {
      console.error("Error loading students for semester:", error);
      setMessage("Error loading students for semester: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setSelectedFile(file);
      parseCSV(file);
    } else {
      setMessage("Please select a valid CSV file");
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split(/\r?\n/);

        // Find all lines that contain the separator (handle CSV formatting with commas)
        const separatorLines: number[] = [];
        lines.forEach((line, index) => {
          // Check if line starts with ---DATA--- (ignoring trailing commas from CSV)
          if (line.trim().startsWith("---DATA---")) {
            separatorLines.push(index);
          }
        });

        if (separatorLines.length < 2) {
          setMessage(
            `CSV format error: Expected 2 separators, found ${separatorLines.length}. Please ensure the CSV file has the correct format with ---DATA--- markers.`
          );
          return;
        }

        const startIdx = separatorLines[0];
        const endIdx = separatorLines[1];

        // Only parse lines between the two separators
        const dataLines = lines
          .slice(startIdx + 1, endIdx)
          .filter((line) => line.trim().length > 0); // remove blank lines

        if (dataLines.length === 0) {
          setMessage("CSV format error: No data found between separators.");
          return;
        }

        Papa.parse<ParsedResult>(dataLines.join("\n"), {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            setParsedData(results.data);
            validateData(results.data);
            setMessage("");
          },
          error: (error) => {
            setMessage("Error parsing CSV: " + error.message);
          },
        });
      } catch (error) {
        setMessage("Error parsing CSV: " + error);
      }
    };
    reader.readAsText(file);
  };

  const validateData = (data: ParsedResult[]) => {
    const errors: string[] = [];

    data.forEach((row, index) => {
      const rowNumber = index + 1;

      // Check required fields
      if (!row["Reg. No"]) {
        errors.push(`Row ${rowNumber}: Registration number is required`);
      }

      if (!row["Total"] || isNaN(parseFloat(row["Total"]))) {
        errors.push(`Row ${rowNumber}: Valid total score is required`);
      } else {
        const total = parseFloat(row["Total"]);
        if (total < 0 || total > 100) {
          errors.push(
            `Row ${rowNumber}: Total score must be between 0 and 100`
          );
        }
      }

      // Validate CA Mark if provided
      if (
        row["CA Mark"] &&
        (isNaN(parseFloat(row["CA Mark"])) ||
          parseFloat(row["CA Mark"]) < 0 ||
          parseFloat(row["CA Mark"]) > 30)
      ) {
        errors.push(`Row ${rowNumber}: CA Mark must be between 0 and 30`);
      }

      // Validate Exam Score if provided
      if (
        row["Exam Score"] &&
        (isNaN(parseFloat(row["Exam Score"])) ||
          parseFloat(row["Exam Score"]) < 0 ||
          parseFloat(row["Exam Score"]) > 70)
      ) {
        errors.push(`Row ${rowNumber}: Exam Score must be between 0 and 70`);
      }
    });

    setValidationErrors(errors);
  };

  const handleBulkUpload = async () => {
    if (validationErrors.length > 0) {
      setMessage("Please fix validation errors before uploading");
      return;
    }

    if (filteredStudents.length === 0) {
      setMessage("No students found for the selected semester");
      return;
    }

    if (grades.length === 0) {
      setMessage(
        "Grades are not loaded. Cannot proceed with upload. Please refresh the page and ensure grades are configured in the database."
      );
      return;
    }

    // Helper function to calculate grade from score using grades configuration
    const calculateGradeFromScore = (score: number, gradesConfig: Grade[]) => {
      const grade = gradesConfig.find(
        (g) => score >= g.min_score && score <= g.max_score
      );
      return grade
        ? { id: grade.id, letter: grade.letter }
        : { id: null, letter: "N/A" };
    };

    // Additional validation to ensure all scores can be graded
    const ungradableRows: Array<{ row: number; score: number; regNo: string }> =
      [];
    parsedData.forEach((row, index) => {
      const score = parseFloat(row["Total"]);
      if (!isNaN(score)) {
        const gradeResult = calculateGradeFromScore(score, grades);
        if (!gradeResult.id) {
          ungradableRows.push({
            row: index + 1,
            score: score,
            regNo: row["Reg. No"],
          });
        }
      }
    });

    if (ungradableRows.length > 0) {
      const errorMessage = ungradableRows
        .map(
          (item) =>
            `Row ${item.row} (${item.regNo}): Score ${item.score} cannot be graded`
        )
        .join("\n");

      setMessage(
        `Cannot proceed with upload. The following scores cannot be graded:\n\n${errorMessage}\n\nPlease check the grade configuration in the database.`
      );
      return;
    }

    setUploading(true);
    setUploadResults([]);
    setMessage("Preparing batch upload...");
    setUploadProgress({
      stage: "preparing",
      current: 0,
      total: parsedData.length,
      message: "Preparing data for upload...",
    });

    try {
      const batchResults: any[] = [];
      const validationErrors: any[] = [];

      // Create a map of registration numbers to student course IDs
      const regNoToStudentCourseMap = new Map();
      filteredStudents.forEach((studentCourse: StudentCourse) => {
        const regNo = studentCourse.student?.reg_no;
        if (regNo) {
          const studentData = {
            student_course_id: studentCourse.id,
            student_name: `${studentCourse.student.user?.last_name || ""}, ${
              studentCourse.student.user?.first_name || ""
            } ${studentCourse.student.user?.other_name || ""}`.trim(),
          };
          regNoToStudentCourseMap.set(regNo, studentData);
          regNoToStudentCourseMap.set(regNo.toLowerCase(), studentData);
          regNoToStudentCourseMap.set(regNo.toUpperCase(), studentData);
        }
      });

      // Process and prepare all results for batch upload
      parsedData.forEach((row, index) => {
        const regNo = row["Reg. No"];
        const totalScore = parseFloat(row["Total"]);
        const caScore = row["CA Mark"] ? parseFloat(row["CA Mark"]) : null;
        const examScore = row["Exam Score"]
          ? parseFloat(row["Exam Score"])
          : null;

        if (!regNo || isNaN(totalScore)) {
          validationErrors.push({
            row: index + 1,
            regNo: regNo || "N/A",
            name: row["Name of Student (Surname First)"] || "N/A",
            error: "Missing registration number or total score",
          });
          return;
        }

        // Try to find the student course mapping
        let studentCourseData =
          regNoToStudentCourseMap.get(regNo) ||
          regNoToStudentCourseMap.get(regNo.toLowerCase()) ||
          regNoToStudentCourseMap.get(regNo.toUpperCase());

        if (!studentCourseData) {
          validationErrors.push({
            row: index + 1,
            regNo,
            name: row["Name of Student (Surname First)"] || "N/A",
            error: `Student with registration number ${regNo} not found in selected semester`,
          });
          return;
        }

        // Calculate grade using backend grades configuration
        const gradeResult = calculateGradeFromScore(totalScore, grades);
        const gradeId = gradeResult.id;

        if (!gradeId) {
          validationErrors.push({
            row: index + 1,
            regNo,
            name: studentCourseData.student_name,
            error: `Grade ID not found for score ${totalScore}. Grade configuration error.`,
          });
          return;
        }

        // Add to batch results
        batchResults.push({
          student_course_id: studentCourseData.student_course_id,
          score: totalScore.toString(), // Convert to string as per DB schema
          grade_id: gradeId,
          ca_mark: caScore,
          exam_score: examScore,
          publish: false,
          // Add metadata for response tracking
          _metadata: {
            regNo,
            studentName: studentCourseData.student_name,
            gradeLetter: gradeResult.letter,
          },
        });
      });

      if (validationErrors.length > 0) {
        setUploading(false);
        setMessage(
          `Validation failed: ${validationErrors.length} errors found.`
        );
        setUploadResults(
          validationErrors.map((err) => ({
            regNo: err.regNo,
            name: err.name,
            score: 0,
            grade: "N/A",
            status: "Failed",
            error: err.error,
          }))
        );
        return;
      }

      setMessage(`Uploading batch of ${batchResults.length} results...`);
      setUploadProgress({
        stage: "uploading",
        current: 0,
        total: batchResults.length,
        message: `Uploading ${batchResults.length} results to server...`,
      });

      // Make API call to backend for batch upload
      const response = await fetch("/api/studentresult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ results: batchResults }),
      });

      if (response.ok) {
        const batchResult = await response.json();

        // Transform response to display format
        const displayResults = batchResult.results.map((result: any) => ({
          regNo:
            batchResults.find(
              (b) => b.student_course_id === result.student_course_id
            )?._metadata?.regNo || "N/A",
          name:
            batchResults.find(
              (b) => b.student_course_id === result.student_course_id
            )?._metadata?.studentName || "N/A",
          score: parseFloat(result.score),
          grade: result.grade,
          status: result.status,
          resultId: result.id,
        }));

        // Add any errors
        if (batchResult.errors && batchResult.errors.length > 0) {
          batchResult.errors.forEach((error: any) => {
            displayResults.push({
              regNo: error.regNo || "N/A",
              name: "N/A",
              score: 0,
              grade: "N/A",
              status: "Failed",
              error: error.error,
            });
          });
        }

        setUploadResults(displayResults);

        // After successful upload, trigger GPA recalculation for affected students
        if (batchResult.uploaded > 0) {
          setMessage(
            `Batch upload completed: ${batchResult.uploaded} successful, ${batchResult.errors} failed. Calculating GPAs...`
          );
          setUploadProgress({
            stage: "calculating_gpa",
            current: 0,
            total: 0,
            message: "Calculating GPAs for affected students...",
          });

          try {
            // Extract student IDs from successful uploads
            const successfulStudentCourseIds = batchResult.results
              .filter((result: any) => result.status === "Success" || result.id)
              .map((result: any) => result.student_course_id);

            // Get unique student IDs from the filtered students
            const affectedStudentIds = filteredStudents
              .filter((sc: StudentCourse) =>
                successfulStudentCourseIds.includes(sc.id)
              )
              .map((sc: StudentCourse) => sc.student?.id)
              .filter((id) => id); // Remove null/undefined

            if (affectedStudentIds.length > 0) {
              console.log(
                `Triggering GPA recalculation for ${affectedStudentIds.length} students`
              );

              // Call GPA recalculation API
              const gpaResponse = await fetch("/api/studentgpa/batch", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  student_ids: affectedStudentIds,
                  semester_id: selectedSemester,
                  level_id: null, // Level ID not available in current data structure
                }),
              });

              if (gpaResponse.ok) {
                setMessage(
                  `Upload completed: ${batchResult.uploaded} results uploaded successfully and GPAs updated.`
                );
              } else {
                setMessage(
                  `Upload completed: ${batchResult.uploaded} results uploaded successfully. GPA calculation failed but can be run manually.`
                );
              }
            } else {
              setMessage(
                `Batch upload completed: ${batchResult.uploaded} successful, ${batchResult.errors} failed.`
              );
            }
          } catch (gpaError) {
            console.error("GPA calculation error:", gpaError);
            setMessage(
              `Upload completed: ${batchResult.uploaded} results uploaded successfully. GPA calculation failed but can be run manually.`
            );
          }
        } else {
          setMessage(
            `Batch upload completed: ${batchResult.uploaded} successful, ${batchResult.errors} failed.`
          );
        }
      } else {
        const errorText = await response.text();
        console.error("Batch upload failed:", errorText);

        setMessage(`Batch upload failed: ${response.status} - ${errorText}`);
        setUploadResults(
          batchResults.map((result) => ({
            regNo: result._metadata.regNo,
            name: result._metadata.studentName,
            score: parseFloat(result.score),
            grade: result._metadata.gradeLetter,
            status: "Failed",
            error: "Batch upload failed on server",
          }))
        );
      }
    } catch (error) {
      console.error("Batch upload error:", error);
      setMessage(
        "Error during batch upload: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setUploading(false);
      setUploadProgress({
        stage: "",
        current: 0,
        total: 0,
        message: "",
      });
    }
  };

  const downloadTemplate = async () => {
    if (!selectedCourse || !selectedSemester) {
      setMessage("Please select course and semester first");
      return;
    }

    try {
      const courseId = selectedCourse.course.id;
      const semesterId = selectedSemester;

      // Use the backend template generation API with semester filter
      // Following the same pattern as bulk-upload-results.js
      const response = await fetch(
        `/api/courses/${courseId}/template?semester_id=${semesterId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to download template: ${response.status}`);
      }

      // Get the CSV content as blob (backend returns CSV string, converted to blob by our API route)
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Generate filename based on course and semester (same pattern as legacy)
      const selectedSemesterObj = availableSemesters.find(
        (semester) => semester.id.toString() === selectedSemester
      );

      link.download = `${selectedCourse.course.code}_${
        selectedSemesterObj?.name.replace(/[^a-zA-Z0-9]/g, "_") || "semester"
      }_result_template.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setMessage("Template downloaded successfully");
    } catch (error) {
      console.error("Template download error:", error);
      setMessage("Error downloading template: " + error);
    }
  };

  const handleGpaRecalculation = async () => {
    if (!filteredStudents.length || !selectedSemester) {
      setMessage("Please select course and semester with students first");
      return;
    }

    setUploading(true);
    setMessage("Recalculating GPA...");

    try {
      // collect student IDs from filtered list
      const student_ids = filteredStudents.map((sc) => sc.student?.id);

      // Get the level/semester ID (using semester ID from first student as level reference)
      const level_id = filteredStudents[0]?.student?.id; // This may need adjustment based on data structure

      console.log("Recalculating GPA for students:", {
        student_ids,
        semester_id: selectedSemester,
        level_id,
      });

      const response = await fetch("/api/studentgpa/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_ids,
          semester_id: selectedSemester,
          level_id,
        }),
      });

      if (response.ok) {
        const result = await response.json();

        setMessage("GPA recalculation completed successfully");
      } else {
        const errorText = await response.text();
        setMessage(
          `GPA recalculation failed: ${response.status} - ${errorText}`
        );
      }
    } catch (error) {
      console.error("GPA recalculation error:", error);
      setMessage(
        "Error during GPA recalculation: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setUploading(false);
    }
  };

  // Action handlers for manage results
  const handleViewResult = (result: any) => {
    setViewResultModal(result);
  };

  const handleEditResult = (result: any) => {
    setEditResultModal(result);
    setEditFormData({
      score: result.score?.toString() || "",
      ca_mark: result.camark?.toString() || "",
      exam_score: result.exam_score?.toString() || "",
      publish: result.publish || false,
    });
  };

  const handleDeleteResult = (result: any) => {
    setDeleteResultModal(result);
  };

  const confirmDeleteResult = async () => {
    if (!deleteResultModal) return;

    try {
      setResultsLoading(true);
      const response = await fetch(
        `/api/dashboard/student-results/${deleteResultModal.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setMessage("Result deleted successfully");
        loadResultsData(); // Reload the current page
        setDeleteResultModal(null);
      } else {
        setMessage("Failed to delete result");
      }
    } catch (error) {
      console.error("Error deleting result:", error);
      setMessage("Error deleting result");
    } finally {
      setResultsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editResultModal) return;

    try {
      setResultsLoading(true);
      const response = await fetch(
        `/api/dashboard/student-results/${editResultModal.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            score: parseFloat(editFormData.score),
            ca_mark: editFormData.ca_mark
              ? parseFloat(editFormData.ca_mark)
              : null,
            exam_score: editFormData.exam_score
              ? parseFloat(editFormData.exam_score)
              : null,
            publish: editFormData.publish,
          }),
        }
      );

      if (response.ok) {
        setMessage("Result updated successfully");
        loadResultsData(); // Reload the current page
        setEditResultModal(null);
        setEditFormData({
          score: "",
          ca_mark: "",
          exam_score: "",
          publish: false,
        });
      } else {
        const errorData = await response.json();
        setMessage(
          `Failed to update result: ${errorData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error updating result:", error);
      setMessage("Error updating result");
    } finally {
      setResultsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Results Management</h2>
          <p className="text-gray-600">
            Manage student results, bulk uploads, and grade calculations
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleGpaRecalculation}
            disabled={!filteredStudents.length || uploading}
          >
            <Calculator className="h-4 w-4 mr-2" />
            {uploading ? "Recalculating..." : "Recalculate GPA"}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-blue-900">
              Total Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-blue-900">
              {analyticsData.totalCourses.toLocaleString()}
            </div>
            <p className="text-xs text-blue-700">Active courses</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-green-900">
              Results Uploaded
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-green-900">
              {analyticsData.resultsUploaded.toLocaleString()}
            </div>
            <p className="text-xs text-green-700">This semester</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 border-amber-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-amber-900">
              Pending Results
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-amber-900">
              {analyticsData.pendingResults.toLocaleString()}
            </div>
            <p className="text-xs text-amber-700">Awaiting upload</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-purple-900">
              Average Grade
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-purple-900">
              {analyticsData.averageGrade}
            </div>
            <p className="text-xs text-purple-700">Overall performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="upload" className="space-y-4">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <TabsTrigger
            value="upload"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            Bulk Upload
          </TabsTrigger>
          <TabsTrigger
            value="manage"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
          >
            Manage Results
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Results Upload</CardTitle>
              <CardDescription>
                Upload student results in bulk using CSV files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Course Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course-select">Select Course</Label>
                  <AsyncSelect
                    id="course-select"
                    cacheOptions
                    loadOptions={loadCourseOptions}
                    defaultOptions={defaultOptions}
                    value={selectedCourse}
                    onChange={handleCourseSelect}
                    placeholder="Search for a course by name or code..."
                    isClearable={true}
                    noOptionsMessage={({ inputValue }) =>
                      inputValue
                        ? `No courses found for "${inputValue}"`
                        : "Start typing to search courses"
                    }
                    loadingMessage={() => "Loading courses..."}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: "42px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        "&:hover": {
                          borderColor: "#cbd5e1",
                        },
                        "&:focus-within": {
                          borderColor: "#3b82f6",
                          boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                        },
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "#9ca3af",
                      }),
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester-select">Select Semester</Label>
                  <Select
                    value={selectedSemester}
                    onValueChange={handleSemesterSelect}
                    disabled={!selectedCourse || loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSemesters.map((semester) => (
                        <SelectItem
                          key={semester.id}
                          value={semester.id.toString()}
                        >
                          {semester.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Batch Information */}
              {selectedCourse && selectedSemester && (
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Course
                        </p>
                        <p className="font-semibold">{batchInfo.courseTitle}</p>
                        <p className="text-sm text-gray-500">
                          {batchInfo.courseCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Semester
                        </p>
                        <p className="font-semibold">
                          {batchInfo.selectedSemester}
                        </p>
                        <p className="text-sm text-gray-500">
                          {batchInfo.session}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">
                          Students
                        </p>
                        <p className="font-semibold">
                          {batchInfo.totalStudents}
                        </p>
                        <p className="text-sm text-gray-500">Total enrolled</p>
                      </div>
                    </div>

                    {/* Download Template Button */}
                    <div className="flex justify-end mt-4 pt-4 border-t border-blue-200">
                      <Button
                        variant="outline"
                        onClick={downloadTemplate}
                        disabled={loading}
                        className="bg-white hover:bg-blue-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* File Upload */}
              {selectedCourse && selectedSemester && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">Upload Results CSV</p>
                      <p className="text-sm text-gray-500">
                        Select a CSV file with student results
                      </p>
                    </div>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="mt-4"
                    />
                  </div>

                  {/* CSV Requirements */}
                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="pt-6">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div className="space-y-2">
                          <p className="font-medium text-amber-900">
                            CSV Requirements
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-medium text-amber-800">
                                Required Fields:
                              </p>
                              <ul className="list-disc list-inside text-amber-700 space-y-1">
                                <li>Reg. No - Student registration number</li>
                                <li>Total - Total score (0-100)</li>
                              </ul>
                            </div>
                            <div>
                              <p className="font-medium text-amber-800">
                                Optional Fields:
                              </p>
                              <ul className="list-disc list-inside text-amber-700 space-y-1">
                                <li>CA Mark - Continuous Assessment (0-30)</li>
                                <li>Exam Score - Examination score (0-70)</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Upload Results Button - Show after CSV is parsed */}
                  {parsedData.length > 0 && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <p className="font-medium text-green-900">
                              CSV Parsed Successfully - {parsedData.length}{" "}
                              records found and ready for upload
                            </p>
                            <div className="mt-3">
                              <Button
                                onClick={() => setShowBulkUpload(true)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Results
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manage Results</CardTitle>
              <CardDescription>
                View and manage uploaded student results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search results..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Result
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex items-center justify-center space-x-2">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            <span>Loading results...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : resultsData.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-gray-500"
                        >
                          No results found
                        </TableCell>
                      </TableRow>
                    ) : (
                      resultsData
                        .filter((result) => {
                          if (!searchTerm) return true;
                          const searchLower = searchTerm.toLowerCase();
                          return (
                            result.studentName
                              ?.toLowerCase()
                              .includes(searchLower) ||
                            result.studentId
                              ?.toLowerCase()
                              .includes(searchLower) ||
                            result.course?.code
                              ?.toLowerCase()
                              .includes(searchLower) ||
                            result.course?.name
                              ?.toLowerCase()
                              .includes(searchLower)
                          );
                        })
                        .map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {result.studentName || "Unknown Student"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {result.studentId || "N/A"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {result.course?.code || "N/A"}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {result.course?.name || "Unknown Course"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">
                                {result.score || 0}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  result.grade?.letter === "F"
                                    ? "destructive"
                                    : "default"
                                }
                              >
                                {result.grade?.letter || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  result.publish ? "default" : "secondary"
                                }
                              >
                                {result.publish ? "Published" : "Unpublished"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  title="View Details"
                                  onClick={() => handleViewResult(result)}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  title="Edit Result"
                                  onClick={() => handleEditResult(result)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  title="Delete Result"
                                  onClick={() => handleDeleteResult(result)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {resultsTotal > 0 && (
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="text-sm text-gray-500">
                    Showing {(resultsPage - 1) * resultsLimit + 1} to{" "}
                    {Math.min(resultsPage * resultsLimit, resultsTotal)} of{" "}
                    {resultsTotal} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadResultsData(resultsPage - 1)}
                      disabled={resultsPage <= 1 || resultsLoading}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {resultsPage} of {resultsTotalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadResultsData(resultsPage + 1)}
                      disabled={
                        resultsPage >= resultsTotalPages || resultsLoading
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Grade Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.gradeDistribution.length > 0 ? (
                    analyticsData.gradeDistribution.map((item) => (
                      <div key={item.grade} className="flex items-center gap-4">
                        <div className="w-8 text-center">
                          <Badge
                            variant={
                              item.grade === "F" ? "destructive" : "default"
                            }
                          >
                            {item.grade}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {item.count} students
                            </span>
                            <span className="text-sm text-gray-500">
                              {item.percentage}%
                            </span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No grade data available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Average Score</span>
                    <span className="font-medium">
                      {analyticsData.performanceMetrics.averageScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pass Rate</span>
                    <span className="font-medium text-green-600">
                      {analyticsData.performanceMetrics.passRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Highest Score</span>
                    <span className="font-medium">
                      {analyticsData.performanceMetrics.highestScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Lowest Score</span>
                    <span className="font-medium">
                      {analyticsData.performanceMetrics.lowestScore}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Standard Deviation</span>
                    <span className="font-medium">
                      {analyticsData.performanceMetrics.standardDeviation}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bulk Upload Dialog */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl" size="xl">
          <DialogHeader>
            <DialogTitle>Bulk Upload Results</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900">
                        Validation Errors ({validationErrors.length})
                      </p>
                      <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
                        {validationErrors.slice(0, 10).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Parsed Data Preview */}
            {parsedData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview ({parsedData.length} records)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Reg. No</TableHead>
                          <TableHead>CA Mark</TableHead>
                          <TableHead>Exam Score</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedData.slice(0, 5).map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {row["Name of Student (Surname First)"]}
                            </TableCell>
                            <TableCell>{row["Reg. No"]}</TableCell>
                            <TableCell>{row["CA Mark"] || "-"}</TableCell>
                            <TableCell>{row["Exam Score"] || "-"}</TableCell>
                            <TableCell>{row["Total"]}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  calculateGrade(parseFloat(row["Total"])) ===
                                  "F"
                                    ? "destructive"
                                    : "default"
                                }
                              >
                                {calculateGrade(parseFloat(row["Total"]))}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {parsedData.length > 5 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Showing first 5 records of {parsedData.length} total
                      records
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Upload Results */}
            {uploadResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upload Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reg. No</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {uploadResults.map((result, index) => (
                          <TableRow
                            key={index}
                            className={
                              result.status === "Failed" ? "bg-red-50" : ""
                            }
                          >
                            <TableCell>{result.regNo}</TableCell>
                            <TableCell>{result.name}</TableCell>
                            <TableCell>{result.score}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  result.grade === "F"
                                    ? "destructive"
                                    : "default"
                                }
                              >
                                {result.grade}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  result.status === "Success"
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {result.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkUpload(false)}>
              Close
            </Button>
            <Button
              onClick={handleBulkUpload}
              disabled={
                validationErrors.length > 0 ||
                uploading ||
                parsedData.length === 0
              }
            >
              {uploading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Results
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Display */}
      {message && (
        <Card
          className={
            message.includes("Error")
              ? "border-red-200 bg-red-50"
              : "border-green-200 bg-green-50"
          }
        >
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              {message.includes("Error") ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
              <p
                className={
                  message.includes("Error") ? "text-red-900" : "text-green-900"
                }
              >
                {message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* View Result Modal */}
      <Dialog
        open={!!viewResultModal}
        onOpenChange={() => setViewResultModal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Result Details</DialogTitle>
          </DialogHeader>
          {viewResultModal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Student
                  </label>
                  <p className="font-semibold">{viewResultModal.studentName}</p>
                  <p className="text-sm text-gray-500">
                    {viewResultModal.studentId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Course
                  </label>
                  <p className="font-semibold">
                    {viewResultModal.course?.code}
                  </p>
                  <p className="text-sm text-gray-500">
                    {viewResultModal.course?.name}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    CA Mark
                  </label>
                  <p className="font-semibold">
                    {viewResultModal.camark || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Exam Score
                  </label>
                  <p className="font-semibold">
                    {viewResultModal.exam_score || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Total Score
                  </label>
                  <p className="font-semibold">{viewResultModal.score}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Grade
                  </label>
                  <Badge
                    variant={
                      viewResultModal.grade?.letter === "F"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {viewResultModal.grade?.letter || "N/A"}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <Badge
                    variant={viewResultModal.publish ? "default" : "secondary"}
                  >
                    {viewResultModal.publish ? "Published" : "Unpublished"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Semester
                </label>
                <p className="font-semibold">
                  {viewResultModal.semester?.name}
                </p>
                <p className="text-sm text-gray-500">
                  {viewResultModal.semester?.session}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Result Modal */}
      <Dialog
        open={!!editResultModal}
        onOpenChange={() => setEditResultModal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Result</DialogTitle>
            <DialogDescription>
              Update the scores and publish status for this student result.
            </DialogDescription>
          </DialogHeader>
          {editResultModal && (
            <div className="space-y-4">
              {/* Student and Course Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Student</p>
                    <p className="font-semibold">
                      {editResultModal.studentName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {editResultModal.studentId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Course</p>
                    <p className="font-semibold">
                      {editResultModal.course?.code}
                    </p>
                    <p className="text-sm text-gray-500">
                      {editResultModal.course?.name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Form */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ca_mark">CA Mark</Label>
                  <Input
                    id="ca_mark"
                    type="number"
                    min="0"
                    max="30"
                    value={editFormData.ca_mark}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        ca_mark: e.target.value,
                      })
                    }
                    placeholder="0-30"
                  />
                </div>
                <div>
                  <Label htmlFor="exam_score">Exam Score</Label>
                  <Input
                    id="exam_score"
                    type="number"
                    min="0"
                    max="70"
                    value={editFormData.exam_score}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        exam_score: e.target.value,
                      })
                    }
                    placeholder="0-70"
                  />
                </div>
                <div>
                  <Label htmlFor="total_score">Total Score</Label>
                  <Input
                    id="total_score"
                    type="number"
                    min="0"
                    max="100"
                    value={editFormData.score}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        score: e.target.value,
                      })
                    }
                    placeholder="0-100"
                  />
                </div>
              </div>

              {/* Publish Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="publish"
                  checked={editFormData.publish}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      publish: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label htmlFor="publish">Publish this result</Label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditResultModal(null)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} disabled={resultsLoading}>
                  {resultsLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Result Modal */}
      <Dialog
        open={!!deleteResultModal}
        onOpenChange={() => setDeleteResultModal(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Result</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this result? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {deleteResultModal && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Delete Result</p>
                    <p className="text-red-700 text-sm">
                      Student: {deleteResultModal.studentName} (
                      {deleteResultModal.studentId})
                    </p>
                    <p className="text-red-700 text-sm">
                      Course: {deleteResultModal.course?.code} - Score:{" "}
                      {deleteResultModal.score}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteResultModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteResult}
                  disabled={resultsLoading}
                >
                  {resultsLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Result
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
