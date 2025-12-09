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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Plus,
  Users,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import {
  useCourseStats,
  useCoursesData,
  useProgrammesData,
  useLevelsData,
  useDepartmentsData,
  useFacultiesData,
} from "@/hooks/useDashboardData";
import { createCourseAction } from "@/app/(simple)/ops/actions/departments";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Define types for course objects
interface Course {
  id: number;
  name: string;
  code: string;
  description?: string;
  units: number;
  published: boolean;
  created_at: Date;
  department?: {
    id: number;
    name: string;
    faculty?: {
      id: number;
      name: string;
    };
  };
  programme_course?: Array<{
    id: number;
    programme?: {
      id: number;
      name: string;
    };
    level?: {
      id: number;
      name: string;
    };
  }>;
  _count?: {
    student_course: number;
  };
}

export default function CourseManagement() {
  const { userData } = useApp();
  const institutionId = userData?.institution_id;

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // State for course creation modal
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [courseForm, setCourseForm] = useState({
    name: "",
    code: "",
    description: "",
    units: 3,
    departmentId: "",
    programmes: [],
    levelId: "",
    semesterPosition: 1,
  });

  // State for course details modal
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // State for course edit modal
  const [showEditCourse, setShowEditCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // State for confirmation dialogs
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // SWR hooks for data fetching
  const {
    data: courseStats,
    error: courseStatsError,
    isLoading: courseStatsLoading,
    mutate: mutateCourseStats,
  } = useCourseStats();
  // Get faculties data for filtering
  const {
    data: faculties,
    error: facultiesError,
    isLoading: facultiesLoading,
  } = useFacultiesData(institutionId);

  // Get departments data for filtering - filter by selected faculty
  const selectedFacultyId =
    facultyFilter !== "all"
      ? faculties?.find((faculty) => faculty.name === facultyFilter)?.id
      : undefined;

  const {
    data: departments,
    error: departmentsError,
    isLoading: departmentsLoading,
  } = useDepartmentsData(institutionId);

  // Get programmes data for filters and course creation
  // Filter programmes by selected department
  const selectedDepartmentId =
    departmentFilter !== "all"
      ? departments?.find((dept) => dept.name === departmentFilter)?.id
      : undefined;

  const {
    data: programmes,
    error: programmesError,
    isLoading: programmesLoading,
  } = useProgrammesData(institutionId, selectedDepartmentId);

  // Get levels data for filters
  const {
    data: levels,
    error: levelsError,
    isLoading: levelsLoading,
  } = useLevelsData(institutionId);

  // Get filter IDs for better performance
  const selectedProgrammeId =
    programFilter !== "all" ? parseInt(programFilter) : undefined;

  const selectedLevelId =
    levelFilter !== "all" ? parseInt(levelFilter) : undefined;

  // Get courses data with server-side filtering
  const {
    data: allCourses,
    error: coursesError,
    isLoading: coursesLoading,
    mutate: mutateCourses,
  } = useCoursesData(
    searchTerm || undefined, // search
    selectedFacultyId?.toString(), // faculty ID
    selectedDepartmentId?.toString(), // department ID
    selectedProgrammeId?.toString(), // programme ID
    selectedLevelId?.toString(), // level ID
    statusFilter === "all" ? undefined : statusFilter, // status
    100 // Fetch more data for client-side pagination
  );

  // Debug logging
  useEffect(() => {
    console.log("Programmes data:", programmes);
    console.log("Programmes error:", programmesError);
    console.log("Programmes loading:", programmesLoading);
    console.log("Institution ID:", institutionId);
    console.log("Departments data:", departments);
    console.log("Department filter:", departmentFilter);
    console.log("Selected department ID:", selectedDepartmentId);
    console.log("Program filter:", programFilter);
    console.log("Selected programme ID:", selectedProgrammeId);
    console.log("Level filter:", levelFilter);
    console.log("Selected level ID:", selectedLevelId);
  }, [
    programmes,
    programmesError,
    programmesLoading,
    institutionId,
    departments,
    departmentFilter,
    selectedDepartmentId,
    programFilter,
    selectedProgrammeId,
    levelFilter,
    selectedLevelId,
  ]);

  // Server-side filtering is now handled by the API
  // No need for client-side filtering
  const filteredCourses = allCourses || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const courses = filteredCourses.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    facultyFilter,
    departmentFilter,
    programFilter,
    levelFilter,
    statusFilter,
  ]);

  // Reset filters when parent filter changes (maintain hierarchy)
  useEffect(() => {
    setDepartmentFilter("all");
    setProgramFilter("all");
  }, [facultyFilter]);

  useEffect(() => {
    setProgramFilter("all");
  }, [departmentFilter]);

  const handleRefresh = () => {
    mutateCourseStats();
    mutateCourses();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
  };

  // Course action handlers
  const handleViewDetails = (course: Course) => {
    setSelectedCourse(course);
    setShowCourseDetails(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowEditCourse(true);
  };

  const handleDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      // Check if course has enrollments
      if (
        courseToDelete._count?.student_course &&
        courseToDelete._count.student_course > 0
      ) {
        alert(
          "Cannot delete course with enrolled students. Please remove all enrollments first."
        );
        setShowDeleteConfirm(false);
        setCourseToDelete(null);
        return;
      }

      // TODO: Implement delete course API call
      console.log("Deleting course:", courseToDelete.id);

      // For now, just show success message
      alert("Course deleted successfully");
      setShowDeleteConfirm(false);
      setCourseToDelete(null);
      mutateCourses();
      mutateCourseStats();
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course");
    }
  };

  // Create course handler
  const handleCreateCourse = async () => {
    if (!courseForm.name || !courseForm.code || !courseForm.departmentId) {
      alert("Please fill in all required fields");
      return;
    }

    setIsCreating(true);
    try {
      const result = await createCourseAction(
        courseForm.name,
        courseForm.code,
        courseForm.description,
        courseForm.units,
        parseInt(courseForm.departmentId),
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
          departmentId: "",
          programmes: [],
          levelId: "",
          semesterPosition: 1,
        });
        setShowCreateCourse(false);
        mutateCourses(); // Refresh courses data
        mutateCourseStats(); // Refresh stats
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

  const getStatusBadge = (published: boolean | null) => {
    return published ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Published
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Unpublished
      </Badge>
    );
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Management</h2>
          <p className="text-gray-600">
            Manage courses, enrollments, and course content
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setShowCreateCourse(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={courseStatsLoading || coursesLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                courseStatsLoading || coursesLoading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-blue-900">
              Total Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-blue-900">
              {courseStats?.totalCourses?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-blue-700">Across all departments</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-green-900">
              Active Courses
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-green-900">
              {courseStats?.activeCourses?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-green-700">Currently running</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-purple-900">
              Total Enrollments
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-purple-900">
              {courseStats?.totalEnrollments?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-purple-700">Student enrollments</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-orange-900">
              Departments
            </CardTitle>
            <BookOpen className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-orange-900">
              {courseStats?.coursesByDepartment?.length || "0"}
            </div>
            <p className="text-xs text-orange-700">Active departments</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Course Management ({filteredCourses.length} total)
              </CardTitle>
              <CardDescription>
                View and manage all courses in the system • Showing{" "}
                {startIndex + 1}-{Math.min(endIndex, filteredCourses.length)} of{" "}
                {filteredCourses.length}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Items per page:
              </span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses by name, code, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={facultyFilter} onValueChange={setFacultyFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Faculties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                {faculties?.map((faculty) => (
                  <SelectItem key={faculty.id} value={faculty.name}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments?.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={programFilter} onValueChange={setProgramFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                {programmes && programmes.length > 0 ? (
                  programmes.map((program) => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                      {program.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-programs" disabled>
                    No programs available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {levels?.map((level) => (
                  <SelectItem key={level.id} value={level.id.toString()}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="unpublished">Unpublished</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Courses Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Programme</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coursesLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Loading courses...
                    </TableCell>
                  </TableRow>
                ) : courses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{course.name}</div>
                          <div className="text-sm text-gray-500">
                            {course.code}
                          </div>
                          {course.description && (
                            <div className="text-xs text-gray-400 truncate max-w-xs">
                              {course.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {course.department?.faculty?.name || (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {course.department?.name || (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {course.programme_course &&
                        course.programme_course.length > 0 ? (
                          <div className="space-y-1">
                            {course.programme_course
                              .slice(0, 2)
                              .map((pc, idx) => (
                                <div key={idx} className="text-sm">
                                  {pc.programme?.name}
                                </div>
                              ))}
                            {course.programme_course.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{course.programme_course.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {course.programme_course &&
                        course.programme_course.length > 0 ? (
                          <div className="space-y-1">
                            {course.programme_course
                              .slice(0, 2)
                              .map((pc, idx) => (
                                <div key={idx} className="text-sm">
                                  {pc.level?.name || "Not assigned"}
                                </div>
                              ))}
                            {course.programme_course.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{course.programme_course.length - 2} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {course.units}
                      </TableCell>
                      <TableCell>{getStatusBadge(course.published)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">
                            {course._count?.student_course || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(course.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(course)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditCourse(course)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Course
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteCourse(course)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Course
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum =
                      Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                      i;
                    if (pageNum > totalPages) return null;
                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Course Modal */}
      <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Add a new course to the system. Fill in the required information
              below.
            </DialogDescription>
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
                      units: parseInt(e.target.value) || 3,
                    })
                  }
                  min="1"
                  max="6"
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
                rows={3}
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

      {/* Course Details Modal */}
      <Dialog open={showCourseDetails} onOpenChange={setShowCourseDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
            <DialogDescription>
              View detailed information about the course
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Basic Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Course Name:</span>{" "}
                      {selectedCourse.name}
                    </div>
                    <div>
                      <span className="font-medium">Course Code:</span>{" "}
                      {selectedCourse.code}
                    </div>
                    <div>
                      <span className="font-medium">Credit Units:</span>{" "}
                      {selectedCourse.units}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>{" "}
                      {getStatusBadge(selectedCourse.published)}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>{" "}
                      {formatDate(selectedCourse.created_at)}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Academic Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium">Faculty:</span>{" "}
                      {selectedCourse.department?.faculty?.name ||
                        "Not assigned"}
                    </div>
                    <div>
                      <span className="font-medium">Department:</span>{" "}
                      {selectedCourse.department?.name || "Not assigned"}
                    </div>
                    <div>
                      <span className="font-medium">Programmes:</span>
                      {selectedCourse.programme_course &&
                      selectedCourse.programme_course.length > 0 ? (
                        <ul className="list-disc list-inside mt-1">
                          {selectedCourse.programme_course.map((pc, idx) => (
                            <li key={idx}>
                              {pc.programme?.name} (Level:{" "}
                              {pc.level?.name || "Not assigned"})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        " Not assigned"
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Enrollments:</span>{" "}
                      {selectedCourse._count?.student_course || 0}
                    </div>
                  </div>
                </div>
              </div>
              {selectedCourse.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-gray-700">{selectedCourse.description}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCourseDetails(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Course Modal */}
      <Dialog open={showEditCourse} onOpenChange={setShowEditCourse}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update course information</DialogDescription>
          </DialogHeader>
          {editingCourse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editCourseName">Course Name *</Label>
                  <Input
                    id="editCourseName"
                    defaultValue={editingCourse.name}
                    placeholder="e.g. Data Structures"
                  />
                </div>
                <div>
                  <Label htmlFor="editCourseCode">Course Code *</Label>
                  <Input
                    id="editCourseCode"
                    defaultValue={editingCourse.code}
                    placeholder="e.g. CSC301"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editCourseUnits">Credit Units</Label>
                  <Input
                    id="editCourseUnits"
                    type="number"
                    defaultValue={editingCourse.units}
                    min="1"
                    max="6"
                  />
                </div>
                <div>
                  <Label htmlFor="editCourseStatus">Status</Label>
                  <Select
                    defaultValue={
                      editingCourse.published ? "published" : "unpublished"
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="unpublished">Unpublished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="editCourseDesc">Description</Label>
                <Textarea
                  id="editCourseDesc"
                  defaultValue={editingCourse.description || ""}
                  placeholder="Course description..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditCourse(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // TODO: Implement edit course functionality
                alert("Edit course functionality will be implemented");
                setShowEditCourse(false);
              }}
            >
              Update Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {courseToDelete && (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800">
                  Course to be deleted:
                </h4>
                <p className="text-red-700 mt-1">
                  <strong>{courseToDelete.name}</strong> ({courseToDelete.code})
                </p>
                {courseToDelete._count?.student_course &&
                  courseToDelete._count.student_course > 0 && (
                    <p className="text-red-600 text-sm mt-2">
                      ⚠️ This course has {courseToDelete._count.student_course}{" "}
                      enrolled students. You cannot delete it until all
                      enrollments are removed.
                    </p>
                  )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCourse}
              disabled={
                courseToDelete?._count?.student_course
                  ? courseToDelete._count.student_course > 0
                  : false
              }
            >
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
