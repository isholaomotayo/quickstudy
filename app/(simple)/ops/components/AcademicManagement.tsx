"use client";

import { useState, useEffect } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap,
  BookOpen,
  Users,
  TrendingUp,
  Calendar,
  FileText,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Eye,
  TrendingDown,
  Building,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import {
  useAcademicData,
  useFacultiesData,
  useDepartmentsData,
  useProgrammesData,
  useCoursesData,
  useGradeDefinitionsData,
  useGrades,
  useAcademicEventsData,
  useStudentPerformanceData,
} from "@/hooks/useDashboardData";

interface AcademicMetric {
  id: string;
  name: string;
  value: number | string;
  change: number;
  changeType: "increase" | "decrease";
  period: string;
}

interface GradeRecord {
  id: number;
  studentName: string;
  studentId: string;
  course: string;
  courseCode: string;
  grade: string;
  score: number;
  semester: string;
  academicYear: string;
  instructor: string;
  status: "published" | "pending" | "draft";
}

interface AcademicEvent {
  id: number;
  title: string;
  type:
    | "exam"
    | "assignment"
    | "holiday"
    | "meeting"
    | "deadline"
    | "registration"
    | "event";
  date: string;
  description: string;
  department: string;
  status: "upcoming" | "ongoing" | "completed";
  semesterName?: string;
  academicYear?: string;
  semester?: number;
  location?: string;
  priority?: string;
}

interface StudentPerformance {
  id: number;
  studentName: string;
  studentId: string;
  department: string;
  level: string;
  gpa: number;
  cgpa: number;
  coursesCompleted: number;
  coursesEnrolled: number;
  academicStanding: "good" | "warning" | "probation";
}

interface Grade {
  id: number;
  name: string;
  weight?: number;
  min_score?: number;
  max_score?: number;
  point: number;
  institution_id: number;
}

export default function AcademicManagement() {
  const { userData } = useApp();
  const {
    data: academicData,
    isLoading,
    mutate,
  } = useAcademicData(userData?.institution_id);
  const [selectedSemester, setSelectedSemester] = useState("current");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Department management state
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | null
  >(null);
  const [showCreateDepartment, setShowCreateDepartment] = useState(false);
  const [showCreateProgramme, setShowCreateProgramme] = useState(false);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [eventFilters, setEventFilters] = useState({
    type: "all",
    status: "all",
  });

  // Grade management state
  const [showCreateGrade, setShowCreateGrade] = useState(false);
  const [showEditGrade, setShowEditGrade] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [showDeleteGradeConfirm, setShowDeleteGradeConfirm] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<Grade | null>(null);

  // Student performance search state
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [debouncedStudentSearch, setDebouncedStudentSearch] = useState("");

  // Fetch related data
  const { data: faculties } = useFacultiesData(userData?.institution_id);
  const { data: departments, mutate: mutateDepartments } = useDepartmentsData(
    userData?.institution_id
  );
  const { data: programmes, mutate: mutateProgrammes } = useProgrammesData(
    userData?.institution_id,
    selectedDepartmentId || undefined
  );
  const { data: courses, mutate: mutateCourses } = useCoursesData();

  // Real data hooks for academic management
  const { data: gradesData, isLoading: gradesLoading } =
    useGradeDefinitionsData(userData?.institution_id, 1, 10);

  // Grade configurations management hook
  const {
    data: gradesConfigData,
    isLoading: gradesConfigLoading,
    createGrade,
    updateGrade,
    deleteGrade,
  } = useGrades(userData?.institution_id);
  const {
    data: eventsData,
    isLoading: eventsLoading,
    mutate: mutateEvents,
  } = useAcademicEventsData(
    userData?.institution_id,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    1,
    10
  );
  const { data: performanceData, isLoading: performanceLoading } =
    useStudentPerformanceData(
      userData?.institution_id,
      undefined,
      undefined,
      undefined,
      undefined,
      debouncedStudentSearch,
      1,
      10
    );

  // Debounce student search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedStudentSearch(studentSearchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [studentSearchTerm]);

  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    code: "",
    description: "",
    facultyId: "",
  });
  const [programmeForm, setProgrammeForm] = useState({
    name: "",
    description: "",
    years: 4,
    prefix: "",
    regnoFormat: "",
  });
  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    description: "",
    units: 3,
    programmes: [] as number[],
    levelId: "",
    semesterPosition: 1,
  });
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    type: "event",
    eventDate: "",
    endDate: "",
    location: "",
    priority: "medium",
    semester: "1",
    isPublic: true,
  });
  const [gradeForm, setGradeForm] = useState({
    name: "",
    point: 0,
    minScore: "",
    maxScore: "",
    weight: "",
  });

  // Real academic metrics from database
  const academicMetrics: AcademicMetric[] = [
    {
      id: "1",
      name: "Total Students",
      value: academicData?.overview?.totalStudents?.toLocaleString() || "0",
      change: 5.2,
      changeType: "increase",
      period: "vs last semester",
    },
    {
      id: "2",
      name: "Average GPA",
      value: academicData?.overview?.averageGPA?.toFixed(2) || "0.00",
      change: 0.12,
      changeType: "increase",
      period: "vs last semester",
    },
    {
      id: "3",
      name: "Course Completions",
      value: academicData?.overview?.courseCompletions?.toLocaleString() || "0",
      change: 1.5,
      changeType: "increase",
      period: "vs last semester",
    },
    {
      id: "4",
      name: "Active Students",
      value: academicData?.overview?.activeStudents?.toLocaleString() || "0",
      change: 2.8,
      changeType: "increase",
      period: "vs last semester",
    },
  ];

  // Real grade records from API
  const gradeRecords: GradeRecord[] =
    gradesData?.grades?.map((grade) => ({
      id: grade.id,
      studentName: grade.studentName,
      studentId: grade.studentId,
      course: grade.course?.name || "Unknown Course",
      courseCode: grade.course?.code || "N/A",
      grade: grade.grade?.letter || grade.grade?.name || "N/A",
      score: grade.score,
      semester: grade.semester?.name || "N/A",
      academicYear: grade.semester?.session || "N/A",
      instructor: "N/A", // TODO: Add instructor info to API
      status: grade.publish ? "published" : "draft",
    })) || [];

  // Real academic events from API with filtering
  const allAcademicEvents: AcademicEvent[] =
    eventsData?.events?.map((event) => ({
      id: event.id,
      title: event.title || "Untitled Event",
      type: event.type as any,
      date: event.eventDate
        ? new Date(event.eventDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      description: event.description || "No description available",
      department: event.department?.name || "All Departments",
      status: event.status as any,
    })) || [];

  // Apply filters to academic events
  const academicEvents = allAcademicEvents.filter((event) => {
    if (eventFilters.type !== "all" && event.type !== eventFilters.type)
      return false;
    if (eventFilters.status !== "all" && event.status !== eventFilters.status)
      return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (event.title && event.title.toLowerCase().includes(searchLower)) ||
        (event.description &&
          event.description.toLowerCase().includes(searchLower)) ||
        (event.department &&
          event.department.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  // Real student performance data from API with database search
  const studentPerformance: StudentPerformance[] =
    performanceData?.students?.map((student) => ({
      id: student.id,
      studentName: student.studentName || "Unknown Student",
      studentId: student.studentId || "N/A",
      department: student.programme?.department?.name || "N/A",
      level:
        (student.currentLevel && student.currentLevel.replace(" Level", "")) ||
        "100",
      gpa: student.performance?.gpa || 0.0,
      cgpa: student.performance?.cgpa || 0.0,
      coursesCompleted: student.performance?.coursesCompleted || 0,
      coursesEnrolled: student.performance?.coursesEnrolled || 0,
      academicStanding: student.performance?.academicStanding || "good",
    })) || [];

  const getChangeColor = (changeType: "increase" | "decrease") => {
    return changeType === "increase" ? "text-green-600" : "text-red-600";
  };

  const getChangeIcon = (changeType: "increase" | "decrease") => {
    return changeType === "increase" ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      draft: { color: "bg-gray-100 text-gray-800", icon: FileText },
      upcoming: { color: "bg-blue-100 text-blue-800", icon: Calendar },
      ongoing: { color: "bg-orange-100 text-orange-800", icon: Clock },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      good: { color: "bg-green-100 text-green-800", icon: Award },
      warning: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
      probation: { color: "bg-red-100 text-red-800", icon: AlertCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getEventTypeIcon = (type: string) => {
    const iconMap = {
      exam: FileText,
      assignment: BookOpen,
      holiday: Calendar,
      meeting: Users,
      deadline: Clock,
      registration: Users,
      event: Calendar,
    };

    const Icon = iconMap[type as keyof typeof iconMap] || Calendar; // Fallback to Calendar icon
    return <Icon className="h-4 w-4" />;
  };

  const handleRefreshData = () => {
    mutate();
  };

  // Create department handler
  const handleCreateDepartment = async () => {
    if (
      !departmentForm.name ||
      !departmentForm.code ||
      !departmentForm.facultyId
    ) {
      alert("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const { createDepartmentAction } = await import(
        "@/app/(simple)/ops/actions/departments"
      );
      const result = await createDepartmentAction(
        departmentForm.name,
        departmentForm.code,
        departmentForm.description,
        parseInt(departmentForm.facultyId)
      );

      if (result.success) {
        // Reset form and close modal
        setDepartmentForm({
          name: "",
          code: "",
          description: "",
          facultyId: "",
        });
        setShowCreateDepartment(false);
        mutateDepartments(); // Refresh departments data
      } else {
        alert(result.error || "Failed to create department");
      }
    } catch (error) {
      console.error("Error creating department:", error);
      alert("Failed to create department");
    } finally {
      setIsCreating(false);
    }
  };

  // Create programme handler
  const handleCreateProgramme = async () => {
    if (!programmeForm.name || !selectedDepartmentId) {
      alert("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const { createProgrammeAction } = await import(
        "@/app/(simple)/ops/actions/departments"
      );
      const result = await createProgrammeAction(
        programmeForm.name,
        programmeForm.description,
        selectedDepartmentId,
        programmeForm.years,
        programmeForm.prefix,
        programmeForm.regnoFormat
      );

      if (result.success) {
        // Reset form and close modal
        setProgrammeForm({
          name: "",
          description: "",
          years: 4,
          prefix: "",
          regnoFormat: "",
        });
        setShowCreateProgramme(false);
        mutateProgrammes(); // Refresh programmes data
      } else {
        alert(result.error || "Failed to create programme");
      }
    } catch (error) {
      console.error("Error creating programme:", error);
      alert("Failed to create programme");
    } finally {
      setIsCreating(false);
    }
  };

  // Create course handler
  const handleCreateCourse = async () => {
    if (!courseForm.name || !courseForm.code || !selectedDepartmentId) {
      alert("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const { createCourseAction } = await import(
        "@/app/(simple)/ops/actions/departments"
      );
      const result = await createCourseAction(
        courseForm.name,
        courseForm.code,
        courseForm.description,
        courseForm.units,
        selectedDepartmentId,
        courseForm.programmes.length > 0 ? courseForm.programmes : undefined,
        courseForm.levelId ? parseInt(courseForm.levelId) : undefined,
        courseForm.semesterPosition
      );

      if (result.success) {
        // Reset form and close modal
        setCourseForm({
          name: "",
          code: "",
          description: "",
          units: 3,
          programmes: [],
          levelId: "",
          semesterPosition: 1,
        });
        setShowCreateCourse(false);
        mutateCourses(); // Refresh courses data
      } else {
        alert(result.error || "Failed to create course");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Failed to create course");
    } finally {
      setIsCreating(false);
    }
  };

  const handleExportGrades = () => {
    // TODO: Implement export functionality
  };

  const handleExportPerformance = () => {
    // TODO: Implement export functionality
  };

  // Create event handler
  const handleCreateEvent = async () => {
    if (!eventForm.title || !eventForm.eventDate) {
      alert("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/dashboard/academic-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: eventForm.title,
          body: eventForm.description,
          institutionId: userData?.institution_id,
          userId: userData?.id,
          type: eventForm.type,
          eventDate: eventForm.eventDate,
          endDate: eventForm.endDate || null,
          location: eventForm.location,
          priority: eventForm.priority,
          semester: parseInt(eventForm.semester),
        }),
      });

      if (response.ok) {
        // Reset form and close modal
        setEventForm({
          title: "",
          description: "",
          type: "event",
          eventDate: "",
          endDate: "",
          location: "",
          priority: "medium",
          semester: "1",
          isPublic: true,
        });
        setShowCreateEvent(false);
        // Refresh events data
        mutateEvents(); // This will refresh the academic events data
      } else {
        alert("Failed to create event");
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event");
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewEvent = (event: AcademicEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  // Grade delete confirmation handlers
  const handleDeleteGrade = (grade: Grade) => {
    setGradeToDelete(grade);
    setShowDeleteGradeConfirm(true);
  };

  const confirmDeleteGrade = async () => {
    if (!gradeToDelete) return;

    try {
      await deleteGrade(gradeToDelete.id);
      setShowDeleteGradeConfirm(false);
      setGradeToDelete(null);
      // The data will be refreshed automatically by SWR
    } catch (error: any) {
      console.error("Error deleting grade:", error);
      alert(error.message || "Failed to delete grade");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Academic Management</h2>
          <p className="text-gray-600">
            Manage grades, academic calendar, and student performance
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Semester</SelectItem>
              <SelectItem value="previous">Previous Semester</SelectItem>
              <SelectItem value="next">Next Semester</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportGrades}>
            <Download className="h-4 w-4 mr-2" />
            Export Grades
          </Button>
          <Button
            variant="outline"
            onClick={handleRefreshData}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Academic Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {academicMetrics.map((metric) => (
          <Card
            key={metric.id}
            className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100 border-gray-200 hover:shadow-lg transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-900">
                {metric.name}
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {metric.value}
              </div>
              <div
                className={`flex items-center gap-1 text-xs ${getChangeColor(
                  metric.changeType
                )}`}
              >
                {getChangeIcon(metric.changeType)}
                <span>{metric.change}%</span>
                <span className="text-gray-500">{metric.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Academic Management Tabs */}
      <Tabs defaultValue="departments" className="space-y-4">
        <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <TabsTrigger
            value="departments"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            Departments & Programs
          </TabsTrigger>
          <TabsTrigger
            value="grades"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
          >
            Grade Management
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-violet-600 data-[state=active]:text-white"
          >
            Academic Calendar
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white"
          >
            Student Performance
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Faculties & Departments */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Academic Structure
                      </CardTitle>
                      <CardDescription>
                        Manage faculties, departments, programs, and courses
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setShowCreateDepartment(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Department
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {faculties?.map((faculty: any) => (
                      <div key={faculty.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {faculty.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {faculty.description}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {departments?.filter(
                              (dept: any) => dept.faculty_id === faculty.id
                            ).length || 0}{" "}
                            departments
                          </Badge>
                        </div>

                        {/* Departments under this faculty */}
                        <div className="ml-4 space-y-3">
                          {departments
                            ?.filter(
                              (dept: any) => dept.faculty_id === faculty.id
                            )
                            .map((department: any) => (
                              <div
                                key={department.id}
                                className="border rounded-md p-3 bg-gray-50"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h4 className="font-medium">
                                      {department.name}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                      {department.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      {department._count?.staff || 0} staff
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setSelectedDepartmentId(department.id);
                                        setShowCreateProgramme(true);
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Program
                                    </Button>
                                  </div>
                                </div>

                                {/* Programs under this department */}
                                <div className="ml-4 space-y-2">
                                  {programmes
                                    ?.filter(
                                      (prog: any) =>
                                        prog.department_id === department.id
                                    )
                                    .map((programme: any) => (
                                      <div
                                        key={programme.id}
                                        className="flex items-center justify-between p-2 bg-white rounded border"
                                      >
                                        <div>
                                          <span className="font-medium text-sm">
                                            {programme.name}
                                          </span>
                                          <div className="text-xs text-gray-500">
                                            {programme.years} years •{" "}
                                            {programme._count?.student || 0}{" "}
                                            students
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {programme._count
                                              ?.programme_course || 0}{" "}
                                            courses
                                          </Badge>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => {
                                              setSelectedDepartmentId(
                                                department.id
                                              );
                                              setShowCreateCourse(true);
                                            }}
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Faculties</span>
                    <span className="font-semibold">
                      {faculties?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Departments</span>
                    <span className="font-semibold">
                      {departments?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Programs</span>
                    <span className="font-semibold">
                      {programmes?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Courses</span>
                    <span className="font-semibold">
                      {courses?.length || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => setShowCreateDepartment(true)}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Create Department
                  </Button>
                  <Button
                    onClick={() => setShowCreateProgramme(true)}
                    className="w-full justify-start"
                    variant="outline"
                    disabled={!selectedDepartmentId}
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Create Program
                  </Button>
                  <Button
                    onClick={() => setShowCreateCourse(true)}
                    className="w-full justify-start"
                    variant="outline"
                    disabled={!selectedDepartmentId}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Create Course
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Grade Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure and manage grading scale (A, B, C, D, F) with
                    corresponding points
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowCreateGrade(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Grade
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {gradesLoading ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading grade configurations...</span>
                </div>
              ) : gradesData?.grades?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Grade</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Score Range</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gradesData.grades.map((grade: any) => (
                      <TableRow key={grade.id}>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="font-semibold text-base px-3 py-1"
                          >
                            {grade.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-lg">
                          {parseFloat(grade.point).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {grade.minScore !== null && grade.maxScore !== null
                            ? `${grade.minScore}% - ${grade.maxScore}%`
                            : "Not specified"}
                        </TableCell>
                        <TableCell>
                          {grade.weight !== null && grade.weight !== undefined
                            ? `${grade.weight}%`
                            : "Not specified"}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedGrade(grade);
                                setGradeForm({
                                  name: grade.name,
                                  point: parseFloat(grade.point),
                                  minScore: grade.minScore?.toString() || "",
                                  maxScore: grade.maxScore?.toString() || "",
                                  weight: grade.weight?.toString() || "",
                                });
                                setShowEditGrade(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteGrade(grade)}
                            >
                              <AlertCircle className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">
                    No Grades Configured
                  </h3>
                  <p className="text-sm mb-4">
                    Set up your grading scale by adding grade configurations
                    like A, B, C, D, F
                  </p>
                  <Button onClick={() => setShowCreateGrade(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Grade
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Academic Calendar
                  </CardTitle>
                  <CardDescription>
                    Manage academic events, deadlines, and important dates from
                    institution calendar
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Calendar
                  </Button>
                  <Button onClick={() => setShowCreateEvent(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Event Filters */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Type:</label>
                  <Select
                    value={eventFilters.type}
                    onValueChange={(value) =>
                      setEventFilters({ ...eventFilters, type: value })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="exam">Exams</SelectItem>
                      <SelectItem value="assignment">Assignments</SelectItem>
                      <SelectItem value="holiday">Holidays</SelectItem>
                      <SelectItem value="meeting">Meetings</SelectItem>
                      <SelectItem value="deadline">Deadlines</SelectItem>
                      <SelectItem value="event">General Events</SelectItem>
                      <SelectItem value="registration">Registration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Status:</label>
                  <Select
                    value={eventFilters.status}
                    onValueChange={(value) =>
                      setEventFilters({ ...eventFilters, status: value })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </div>

              {/* Calendar Statistics */}
              {eventsData?.statistics && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {eventsData.statistics.totalEvents}
                    </div>
                    <div className="text-sm text-gray-600">Total Events</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {eventsData.statistics.upcomingEvents}
                    </div>
                    <div className="text-sm text-gray-600">Upcoming</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {eventsData.statistics.ongoingEvents}
                    </div>
                    <div className="text-sm text-gray-600">Ongoing</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-600">
                      {eventsData.statistics.completedEvents}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
              )}

              {/* Events List */}
              <div className="space-y-4">
                {eventsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading calendar events...</span>
                  </div>
                ) : academicEvents.length > 0 ? (
                  academicEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleViewEvent(event)}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-3 rounded-lg ${
                            event.status === "upcoming"
                              ? "bg-blue-100"
                              : event.status === "ongoing"
                              ? "bg-orange-100"
                              : "bg-gray-100"
                          }`}
                        >
                          {getEventTypeIcon(event.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{event.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {event.type.charAt(0).toUpperCase() +
                                event.type.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {event.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              <span>{event.department}</span>
                            </div>
                            {event.semesterName && (
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                <span>{event.semesterName}</span>
                              </div>
                            )}
                            {event.academicYear && (
                              <div className="flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                <span>{event.academicYear}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(event.status)}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement edit functionality
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">
                      {eventsData?.statistics?.hasCalendarData
                        ? "No events match your filters"
                        : "No Calendar Data Found"}
                    </h3>
                    <p className="text-sm mb-4">
                      {eventsData?.statistics?.hasCalendarData
                        ? "Try adjusting your filters or search terms"
                        : "This institution does not have calendar data configured. Events will be sourced from announcements instead."}
                    </p>
                    <Button onClick={() => setShowCreateEvent(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Event
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Student Performance</CardTitle>
                  <CardDescription>
                    Track student academic performance and standing
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search students, ID, department..."
                    className="w-64"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                  />
                  {performanceLoading && studentSearchTerm && (
                    <div className="flex items-center text-sm text-gray-500">
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Searching...
                    </div>
                  )}
                  <Button variant="outline" onClick={handleExportPerformance}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Standing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentPerformance.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {student.studentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.studentId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.department}</TableCell>
                      <TableCell>Level {student.level}</TableCell>
                      <TableCell className="font-medium">
                        {student.gpa.toFixed(2)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.cgpa.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {student.coursesCompleted}/{student.coursesEnrolled}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(student.academicStanding)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <BarChart3 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grade Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Grade Distribution
                </CardTitle>
                <CardDescription>
                  Current semester grade distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                {gradesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading grade distribution...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {gradesData?.statistics?.gradeDistribution?.length > 0 ? (
                      gradesData.statistics.gradeDistribution.map(
                        (dist: any) => {
                          const percentage =
                            gradesData.statistics.totalGrades > 0
                              ? Math.round(
                                  (dist.count /
                                    gradesData.statistics.totalGrades) *
                                    100
                                )
                              : 0;

                          // Determine color based on grade
                          let colorClass = "bg-gray-500";
                          if (dist.gradeLetter?.includes("A"))
                            colorClass = "bg-green-500";
                          else if (dist.gradeLetter?.includes("B"))
                            colorClass = "bg-blue-500";
                          else if (dist.gradeLetter?.includes("C"))
                            colorClass = "bg-yellow-500";
                          else if (
                            dist.gradeLetter?.includes("D") ||
                            dist.gradeLetter?.includes("F")
                          )
                            colorClass = "bg-red-500";

                          return (
                            <div
                              key={dist.gradeId}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 ${colorClass} rounded-full`}
                                ></div>
                                <span>
                                  {dist.gradeLetter || "Unknown"} Grades
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-medium">
                                  {percentage}%
                                </span>
                                <span className="text-sm text-gray-500 ml-2">
                                  ({dist.count})
                                </span>
                              </div>
                            </div>
                          );
                        }
                      )
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No grade data available</p>
                        <p className="text-sm">
                          Grades will appear here once students receive their
                          results
                        </p>
                      </div>
                    )}

                    {gradesData?.statistics?.totalGrades > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>
                            Total Grades: {gradesData.statistics.totalGrades}
                          </span>
                          <span>
                            Published: {gradesData.statistics.publishedCount}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Academic Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Academic Trends
                </CardTitle>
                <CardDescription>
                  Performance trends over semesters
                </CardDescription>
              </CardHeader>
              <CardContent>
                {performanceLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading performance metrics...</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Student Statistics */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Total Students
                        </span>
                        <span className="font-medium text-blue-600">
                          {performanceData?.statistics?.totalStudents?.toLocaleString() ||
                            academicData?.overview?.totalStudents?.toLocaleString() ||
                            "0"}
                        </span>
                      </div>

                      {performanceData?.statistics?.academicStanding && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-700">
                              Excellent Standing
                            </span>
                            <span className="font-medium">
                              {performanceData.statistics.academicStanding
                                .good || 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  ((performanceData.statistics.academicStanding
                                    .good || 0) /
                                    (performanceData.statistics.totalStudents ||
                                      1)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-yellow-700">Warning</span>
                            <span className="font-medium">
                              {performanceData.statistics.academicStanding
                                .warning || 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  ((performanceData.statistics.academicStanding
                                    .warning || 0) /
                                    (performanceData.statistics.totalStudents ||
                                      1)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-red-700">Probation</span>
                            <span className="font-medium">
                              {performanceData.statistics.academicStanding
                                .probation || 0}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  ((performanceData.statistics.academicStanding
                                    .probation || 0) /
                                    (performanceData.statistics.totalStudents ||
                                      1)) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Course Completion Rate */}
                    {performanceData?.statistics?.completionRateStats && (
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-medium flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          Course Completion Rates
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-green-700">High (≥80%)</span>
                            <span className="font-medium">
                              {performanceData.statistics.completionRateStats
                                .high || 0}{" "}
                              students
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-yellow-700">
                              Medium (60-79%)
                            </span>
                            <span className="font-medium">
                              {performanceData.statistics.completionRateStats
                                .medium || 0}{" "}
                              students
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-red-700">Low (&lt;60%)</span>
                            <span className="font-medium">
                              {performanceData.statistics.completionRateStats
                                .low || 0}{" "}
                              students
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fallback to basic metrics if no detailed data */}
                    {!performanceData?.statistics?.academicStanding && (
                      <div className="space-y-3 pt-4 border-t text-center">
                        <div className="flex items-center justify-between">
                          <span>Course Completions</span>
                          <span className="font-medium text-green-600">
                            {academicData?.overview?.courseCompletions?.toLocaleString() ||
                              "0"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Graduation Count</span>
                          <span className="font-medium text-purple-600">
                            {academicData?.overview?.graduationCount?.toLocaleString() ||
                              "0"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Department Modal */}
      <Dialog
        open={showCreateDepartment}
        onOpenChange={setShowCreateDepartment}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="deptName">Department Name *</Label>
              <Input
                id="deptName"
                value={departmentForm.name}
                onChange={(e) =>
                  setDepartmentForm({ ...departmentForm, name: e.target.value })
                }
                placeholder="e.g. Computer Science"
              />
            </div>
            <div>
              <Label htmlFor="deptCode">Department Code *</Label>
              <Input
                id="deptCode"
                value={departmentForm.code}
                onChange={(e) =>
                  setDepartmentForm({ ...departmentForm, code: e.target.value })
                }
                placeholder="e.g. CSC"
              />
            </div>
            <div>
              <Label htmlFor="deptFaculty">Faculty *</Label>
              <Select
                value={departmentForm.facultyId}
                onValueChange={(value) =>
                  setDepartmentForm({ ...departmentForm, facultyId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties?.map((faculty: any) => (
                    <SelectItem key={faculty.id} value={faculty.id.toString()}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="deptDesc">Description</Label>
              <Textarea
                id="deptDesc"
                value={departmentForm.description}
                onChange={(e) =>
                  setDepartmentForm({
                    ...departmentForm,
                    description: e.target.value,
                  })
                }
                placeholder="Department description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDepartment(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateDepartment} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Programme Modal */}
      <Dialog open={showCreateProgramme} onOpenChange={setShowCreateProgramme}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Programme</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="progName">Programme Name *</Label>
              <Input
                id="progName"
                value={programmeForm.name}
                onChange={(e) =>
                  setProgrammeForm({ ...programmeForm, name: e.target.value })
                }
                placeholder="e.g. Bachelor of Science in Computer Science"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="progYears">Duration (Years)</Label>
                <Input
                  id="progYears"
                  type="number"
                  value={programmeForm.years}
                  onChange={(e) =>
                    setProgrammeForm({
                      ...programmeForm,
                      years: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="progPrefix">Prefix</Label>
                <Input
                  id="progPrefix"
                  value={programmeForm.prefix}
                  onChange={(e) =>
                    setProgrammeForm({
                      ...programmeForm,
                      prefix: e.target.value,
                    })
                  }
                  placeholder="e.g. BSC"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="regnoFormat">Registration Number Format</Label>
              <Input
                id="regnoFormat"
                value={programmeForm.regnoFormat}
                onChange={(e) =>
                  setProgrammeForm({
                    ...programmeForm,
                    regnoFormat: e.target.value,
                  })
                }
                placeholder="e.g. CSC/2024/"
              />
            </div>
            <div>
              <Label htmlFor="progDesc">Description</Label>
              <Textarea
                id="progDesc"
                value={programmeForm.description}
                onChange={(e) =>
                  setProgrammeForm({
                    ...programmeForm,
                    description: e.target.value,
                  })
                }
                placeholder="Programme description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateProgramme(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateProgramme} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Programme"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Course Modal */}
      <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="courseName">Course Name *</Label>
                <Input
                  id="courseName"
                  value={courseForm.name}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, name: e.target.value })
                  }
                  placeholder="e.g. Data Structures"
                />
              </div>
              <div>
                <Label htmlFor="courseCode">Course Code *</Label>
                <Input
                  id="courseCode"
                  value={courseForm.code}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, code: e.target.value })
                  }
                  placeholder="e.g. CSC301"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="courseUnits">Credit Units</Label>
                <Input
                  id="courseUnits"
                  type="number"
                  value={courseForm.units}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      units: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="semPos">Semester Position</Label>
                <Select
                  value={courseForm.semesterPosition.toString()}
                  onValueChange={(value) =>
                    setCourseForm({
                      ...courseForm,
                      semesterPosition: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Semester</SelectItem>
                    <SelectItem value="2">Second Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="courseDesc">Description</Label>
              <Textarea
                id="courseDesc"
                value={courseForm.description}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, description: e.target.value })
                }
                placeholder="Course description..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateCourse(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCourse} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Event Modal */}
      <Dialog open={showCreateEvent} onOpenChange={setShowCreateEvent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Academic Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="eventTitle">Event Title *</Label>
              <Input
                id="eventTitle"
                value={eventForm.title}
                onChange={(e) =>
                  setEventForm({ ...eventForm, title: e.target.value })
                }
                placeholder="e.g. Mid-semester Examination"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="eventType">Event Type</Label>
                <Select
                  value={eventForm.type}
                  onValueChange={(value) =>
                    setEventForm({ ...eventForm, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">General Event</SelectItem>
                    <SelectItem value="exam">Examination</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="registration">Registration</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="eventSemester">Semester</Label>
                <Select
                  value={eventForm.semester}
                  onValueChange={(value) =>
                    setEventForm({ ...eventForm, semester: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="eventPriority">Priority</Label>
                <Select
                  value={eventForm.priority}
                  onValueChange={(value) =>
                    setEventForm({ ...eventForm, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventDate">Start Date *</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventForm.eventDate}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, eventDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={eventForm.endDate}
                  onChange={(e) =>
                    setEventForm({ ...eventForm, endDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <Label htmlFor="eventLocation">Location</Label>
              <Input
                id="eventLocation"
                value={eventForm.location}
                onChange={(e) =>
                  setEventForm({ ...eventForm, location: e.target.value })
                }
                placeholder="e.g. Main Auditorium, Online"
              />
            </div>
            <div>
              <Label htmlFor="eventDesc">Description *</Label>
              <Textarea
                id="eventDesc"
                value={eventForm.description}
                onChange={(e) =>
                  setEventForm({ ...eventForm, description: e.target.value })
                }
                placeholder="Event description and details..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateEvent(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEvent} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Details Modal */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && getEventTypeIcon(selectedEvent.type)}
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  {selectedEvent.type.charAt(0).toUpperCase() +
                    selectedEvent.type.slice(1)}
                </Badge>
                {getStatusBadge(selectedEvent.status)}
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Description
                  </Label>
                  <p className="text-sm mt-1">{selectedEvent.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Date
                    </Label>
                    <p className="text-sm mt-1">
                      {new Date(selectedEvent.date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">
                      Department
                    </Label>
                    <p className="text-sm mt-1">{selectedEvent.department}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
                <Button size="sm" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Calendar
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEventDetails(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Grade Modal */}
      <Dialog open={showCreateGrade} onOpenChange={setShowCreateGrade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Grade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="gradeName">Grade Name *</Label>
              <Input
                id="gradeName"
                value={gradeForm.name}
                onChange={(e) =>
                  setGradeForm({ ...gradeForm, name: e.target.value })
                }
                placeholder="e.g. A, B+, C, D, F"
              />
            </div>
            <div>
              <Label htmlFor="gradePoint">Grade Point *</Label>
              <Input
                id="gradePoint"
                type="number"
                step="0.01"
                value={gradeForm.point}
                onChange={(e) =>
                  setGradeForm({
                    ...gradeForm,
                    point: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="e.g. 4.0, 3.5, 3.0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minScore">Minimum Score (%)</Label>
                <Input
                  id="minScore"
                  type="number"
                  value={gradeForm.minScore}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, minScore: e.target.value })
                  }
                  placeholder="e.g. 90"
                />
              </div>
              <div>
                <Label htmlFor="maxScore">Maximum Score (%)</Label>
                <Input
                  id="maxScore"
                  type="number"
                  value={gradeForm.maxScore}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, maxScore: e.target.value })
                  }
                  placeholder="e.g. 100"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="gradeWeight">Weight (%)</Label>
              <Input
                id="gradeWeight"
                type="number"
                value={gradeForm.weight}
                onChange={(e) =>
                  setGradeForm({ ...gradeForm, weight: e.target.value })
                }
                placeholder="e.g. 100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateGrade(false);
                setGradeForm({
                  name: "",
                  point: 0,
                  minScore: "",
                  maxScore: "",
                  weight: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!gradeForm.name) {
                  alert("Grade name is required");
                  return;
                }

                setIsCreating(true);
                try {
                  await createGrade({
                    name: gradeForm.name,
                    point: gradeForm.point,
                    minScore: gradeForm.minScore
                      ? parseInt(gradeForm.minScore)
                      : undefined,
                    maxScore: gradeForm.maxScore
                      ? parseInt(gradeForm.maxScore)
                      : undefined,
                    weight: gradeForm.weight
                      ? parseInt(gradeForm.weight)
                      : undefined,
                  });

                  // Reset form and close modal
                  setGradeForm({
                    name: "",
                    point: 0,
                    minScore: "",
                    maxScore: "",
                    weight: "",
                  });
                  setShowCreateGrade(false);
                } catch (error: any) {
                  alert(error.message || "Failed to create grade");
                } finally {
                  setIsCreating(false);
                }
              }}
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Grade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Grade Modal */}
      <Dialog open={showEditGrade} onOpenChange={setShowEditGrade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Grade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editGradeName">Grade Name *</Label>
              <Input
                id="editGradeName"
                value={gradeForm.name}
                onChange={(e) =>
                  setGradeForm({ ...gradeForm, name: e.target.value })
                }
                placeholder="e.g. A, B+, C, D, F"
              />
            </div>
            <div>
              <Label htmlFor="editGradePoint">Grade Point *</Label>
              <Input
                id="editGradePoint"
                type="number"
                step="0.01"
                value={gradeForm.point}
                onChange={(e) =>
                  setGradeForm({
                    ...gradeForm,
                    point: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="e.g. 4.0, 3.5, 3.0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editMinScore">Minimum Score (%)</Label>
                <Input
                  id="editMinScore"
                  type="number"
                  value={gradeForm.minScore}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, minScore: e.target.value })
                  }
                  placeholder="e.g. 90"
                />
              </div>
              <div>
                <Label htmlFor="editMaxScore">Maximum Score (%)</Label>
                <Input
                  id="editMaxScore"
                  type="number"
                  value={gradeForm.maxScore}
                  onChange={(e) =>
                    setGradeForm({ ...gradeForm, maxScore: e.target.value })
                  }
                  placeholder="e.g. 100"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editGradeWeight">Weight (%)</Label>
              <Input
                id="editGradeWeight"
                type="number"
                value={gradeForm.weight}
                onChange={(e) =>
                  setGradeForm({ ...gradeForm, weight: e.target.value })
                }
                placeholder="e.g. 100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditGrade(false);
                setSelectedGrade(null);
                setGradeForm({
                  name: "",
                  point: 0,
                  minScore: "",
                  maxScore: "",
                  weight: "",
                });
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!gradeForm.name || !selectedGrade) {
                  alert("Grade name is required");
                  return;
                }

                setIsCreating(true);
                try {
                  await updateGrade(selectedGrade.id, {
                    name: gradeForm.name,
                    point: gradeForm.point,
                    minScore: gradeForm.minScore
                      ? parseInt(gradeForm.minScore)
                      : undefined,
                    maxScore: gradeForm.maxScore
                      ? parseInt(gradeForm.maxScore)
                      : undefined,
                    weight: gradeForm.weight
                      ? parseInt(gradeForm.weight)
                      : undefined,
                  });

                  // Reset form and close modal
                  setGradeForm({
                    name: "",
                    point: 0,
                    minScore: "",
                    maxScore: "",
                    weight: "",
                  });
                  setSelectedGrade(null);
                  setShowEditGrade(false);
                } catch (error: any) {
                  alert(error.message || "Failed to update grade");
                } finally {
                  setIsCreating(false);
                }
              }}
              disabled={isCreating}
            >
              {isCreating ? "Updating..." : "Update Grade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Grade Confirmation Dialog */}
      <Dialog
        open={showDeleteGradeConfirm}
        onOpenChange={setShowDeleteGradeConfirm}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this grade? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {gradeToDelete && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Delete Grade</p>
                  <p className="text-red-700 text-sm">
                    Grade: {gradeToDelete.name}
                  </p>
                  <p className="text-red-700 text-sm">
                    Score Range: {gradeToDelete.min_score}% -{" "}
                    {gradeToDelete.max_score}%
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteGradeConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteGrade}>
              Delete Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
