"use client";

import {
    AlertCircle,
    BookOpen,
    CheckCircle,
    Clock,
    Loader2,
    Trash2,
    Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/AppContext";
import { api } from "@/lib/api-wrapper";

interface Course {
  id: number;
  code: string;
  name: string;
  units: number;
  semester_position?: number;
}

interface Programme {
  id: number;
  name: string;
}

interface Level {
  id: number;
  name: string;
}

interface ProgrammeCourse {
  id: number;
  course: Course;
  programme: Programme;
  level_id: number;
  semester_position: number;
}

interface StudentCourse {
  id: number;
  course: Course;
  level: Level;
  approval_status: boolean;
  course_id: number;
}

interface Student {
  id: string;
  programme_id: number;
  semester_admitted_id: number;
  entry_level_id: number;
}

interface CourseRegistrationData {
  student: Student;
  studentCourses: StudentCourse[];
  courseList: ProgrammeCourse[];
  currentSemesterId: number | null;
  semesterPosition: number;
  currentLevelId: number | null;
}

export function CourseRegistrationClient() {
  const router = useRouter();
  const { userData, isLoading: userLoading } = useUser();
  const [data, setData] = useState<CourseRegistrationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<Set<number>>(
    new Set()
  );
  const [registering, setRegistering] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    courseId: number | null;
    courseName: string;
    courseCode: string;
  }>({
    isOpen: false,
    courseId: null,
    courseName: "",
    courseCode: "",
  });

  useEffect(() => {
    if (!userLoading && userData) {
      fetchData();
    }
  }, [userLoading, userData]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated and is a student
      if (!userData) {
        router.push("/signin");
        return;
      }

      if (userData.role !== "STUDENT") {
        setError("Access denied. Student access required.");
        return;
      }

      // Fetch all registration data in a single request
      const response = await api.get("/api/course-register");

      // Extract data from response (api-wrapper returns { data: {...} }, and the API returns { success, data: {...} })
      const apiResponse = response.data || response;
      const registrationData = apiResponse.data || apiResponse;

      // Structure the data
      setData({
        student: registrationData.student,
        studentCourses: registrationData.studentCourses || [],
        courseList: registrationData.courseList || [],
        currentSemesterId: registrationData.currentSemesterId || 1,
        semesterPosition: registrationData.semesterPosition || 1,
        currentLevelId: registrationData.currentLevelId || 1,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load course registration data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const coursesByLevel = useMemo(() => {
    if (!data?.courseList) return {};

    return data.courseList.reduce((acc, programmeCourse) => {
      const { level_id } = programmeCourse;
      if (!acc[level_id]) {
        acc[level_id] = [];
      }
      acc[level_id].push(programmeCourse);
      return acc;
    }, {} as Record<number, ProgrammeCourse[]>);
  }, [data?.courseList]);

  const registeredCourseIds = useMemo(() => {
    const ids = new Set(data?.studentCourses?.map((sc) => sc.course_id) || []);
    // This recalculates whenever studentCourses changes (including after deletion)
    // ensuring courses become selectable again when unregistered
    return ids;
  }, [data?.studentCourses]);

  const handleCourseSelection = (courseId: number, checked: boolean) => {
    if (registeredCourseIds.has(courseId)) {
      const course = data?.courseList.find((pc) => pc.course.id === courseId);
      toast.error(
        `You've already registered for ${course?.course.name || "this course"}`
      );
      return;
    }

    setSelectedCourses((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(courseId);
      } else {
        newSet.delete(courseId);
      }
      return newSet;
    });
  };

  const handleRegister = async () => {
    if (selectedCourses.size === 0) {
      toast.error("Please select at least one course to register");
      return;
    }

    if (!data) {
      toast.error("Registration data not available");
      return;
    }

    setRegistering(true);

    try {
      const registrationPromises = Array.from(selectedCourses).map(
        (courseId) => {
          const course = data.courseList.find(
            (pc) => pc.course.id === courseId
          );

          return api.post("/api/studentcourse", {
            student_id: parseInt(data.student.id),
            course_id: courseId,
            semester_id: data.currentSemesterId,
            level_id: data.currentLevelId || data.student.entry_level_id,
            units: course?.course.units || 3,
          });
        }
      );

      const results = await Promise.allSettled(registrationPromises);

      // Extract successful registrations
      const successfulRegistrations = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => {
          if (result.status === "fulfilled") {
            const response = result.value;
            // api-wrapper returns { data: { success, data, user } }
            const apiResponse = response.data || response;
            return apiResponse.data || apiResponse;
          }
          return null;
        })
        .filter(Boolean);

      const failed = results.length - successfulRegistrations.length;

      if (successfulRegistrations.length > 0) {
        toast.success(
          `Successfully registered for ${successfulRegistrations.length} course(s)!`
        );
        setSelectedCourses(new Set());

        // Update local state with new registrations instead of fetching all data
        if (data) {
          const newCourses = successfulRegistrations.map((reg: any) => {
            // Find the course from courseList to get additional info
            const courseFromList = data.courseList.find(
              (pc) => pc.course.id === (reg.course_id || reg.course?.id)
            );

            return {
              id: reg.id,
              course_id: reg.course_id || reg.course?.id,
              course: reg.course,
              level: reg.level || courseFromList?.level || null,
              approval_status: reg.approval_status || false,
              cleared: reg.cleared || false,
              created_at: reg.created_at || new Date().toISOString(),
            };
          });

          setData({
            ...data,
            studentCourses: [...newCourses, ...data.studentCourses],
          });
        }
      }

      if (failed > 0) {
        toast.error(
          `Failed to register for ${failed} course(s). Please try again.`
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("Registration failed. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  const handleDeleteCourse = (
    studentCourseId: number,
    courseName: string,
    courseCode: string
  ) => {
    setDeleteDialog({
      isOpen: true,
      courseId: studentCourseId,
      courseName,
      courseCode,
    });
  };

  const confirmDeleteCourse = async () => {
    if (!deleteDialog.courseId) return;

    setDeletingCourse(deleteDialog.courseId);

    try {
      await api.delete(`/api/studentcourse/${deleteDialog.courseId}`);

      toast.success(
        `Successfully removed "${deleteDialog.courseCode}" from your registrations`
      );

      // Update local state by removing the deleted course
      // This will also update registeredCourseIds automatically via useMemo
      // making the course selectable again in the available courses list
      if (data) {
        const updatedStudentCourses = data.studentCourses.filter(
          (sc) => sc.id !== deleteDialog.courseId
        );

        setData({
          ...data,
          studentCourses: updatedStudentCourses,
        });
      }

      // Close dialog
      setDeleteDialog({
        isOpen: false,
        courseId: null,
        courseName: "",
        courseCode: "",
      });
    } catch (err) {
      console.error("Delete course error:", err);
      toast.error("Failed to delete course registration. Please try again.");
    } finally {
      setDeletingCourse(null);
    }
  };

  const cancelDeleteCourse = () => {
    setDeleteDialog({
      isOpen: false,
      courseId: null,
      courseName: "",
      courseCode: "",
    });
  };

  // Show loading if user authentication is still being checked
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <div className="space-y-2 pl-4">
                        {[1, 2].map((j) => (
                          <div key={j} className="flex items-center space-x-3">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 flex-1" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!userData) {
    router.push("/signin");
    return null;
  }

  // Show access denied for non-students
  if (userData.role !== "STUDENT") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Student access is required to view this page.
            </p>
            <Button onClick={() => router.push("/")}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                      <div className="space-y-2 pl-4">
                        {[1, 2].map((j) => (
                          <div key={j} className="flex items-center space-x-3">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 flex-1" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Loading Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {error || "Failed to load course registration data"}
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={fetchData}>Try Again</Button>
              <Button
                variant="outline"
                onClick={() => router.push("/student/student-courses")}
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Course Registration
            </h1>
          </div>
          <p className="text-gray-600">
            Select courses for the current semester. Please ensure you only
            register for courses relevant to your current level.
          </p>
        </div>

        {/* Alert for guidance */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You can only select courses you haven't previously registered for.
            Selected courses will be submitted for approval. You can delete
            pending registrations that haven't been approved yet.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Available Courses
              </CardTitle>
              <CardAction>
                <Badge variant="secondary">
                  {selectedCourses.size} selected
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              {Object.keys(coursesByLevel).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No courses available for registration</p>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-2">
                  {Object.entries(coursesByLevel)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([levelId, courses]) => (
                      <AccordionItem
                        key={levelId}
                        value={levelId}
                        className="border rounded-lg"
                      >
                        <AccordionTrigger className="px-4 hover:no-underline hover:bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Level {levelId}</Badge>
                            <span className="text-sm text-gray-500">
                              ({courses.length} courses)
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4">
                          <div className="space-y-3">
                            {courses
                              .sort(
                                (a, b) =>
                                  a.semester_position - b.semester_position
                              )
                              .map((programmeCourse) => {
                                const isRegistered = registeredCourseIds.has(
                                  programmeCourse.course.id
                                );
                                const isSelected = selectedCourses.has(
                                  programmeCourse.course.id
                                );

                                return (
                                  <div
                                    key={programmeCourse.course.id}
                                    className={`flex items-start gap-3 p-3 border rounded-md transition-colors ${
                                      isRegistered
                                        ? "bg-gray-50 border-gray-200"
                                        : isSelected
                                        ? "bg-blue-50 border-blue-200"
                                        : "bg-white border-gray-200 hover:bg-gray-50"
                                    }`}
                                  >
                                    <Checkbox
                                      id={`course-${programmeCourse.course.id}`}
                                      checked={isSelected}
                                      disabled={isRegistered}
                                      onCheckedChange={(checked) =>
                                        handleCourseSelection(
                                          programmeCourse.course.id,
                                          !!checked
                                        )
                                      }
                                      className="mt-1"
                                    />
                                    <div className="flex-1 space-y-1">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <label
                                            htmlFor={`course-${programmeCourse.course.id}`}
                                            className={`text-sm font-medium cursor-pointer ${
                                              isRegistered
                                                ? "text-gray-500"
                                                : "text-gray-900"
                                            }`}
                                          >
                                            {programmeCourse.course.code}
                                          </label>
                                          <p
                                            className={`text-sm ${
                                              isRegistered
                                                ? "text-gray-400"
                                                : "text-gray-600"
                                            }`}
                                          >
                                            {programmeCourse.course.name}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {programmeCourse.course.units} units
                                          </Badge>
                                          {isRegistered && (
                                            <Badge
                                              variant="outline"
                                              className="text-xs text-gray-500"
                                            >
                                              Registered
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                          Semester{" "}
                                          {programmeCourse.semester_position ||
                                            "Any"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              )}
            </CardContent>
          </Card>

          {/* Registered Courses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Previously Registered Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.studentCourses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No previously registered courses</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.studentCourses.map((studentCourse, index) => (
                    <div
                      key={studentCourse.id}
                      className="flex items-center justify-between p-3 border rounded-md bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {studentCourse.course.code}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-sm text-gray-600">
                            {studentCourse.course.name}
                          </span>
                        </div>
                        {studentCourse.level && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">
                              {studentCourse.level.name}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {studentCourse.approval_status ? (
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-700 border-green-200"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        ) : (
                          <>
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-700 border-yellow-200"
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteCourse(
                                  studentCourse.id,
                                  studentCourse.course.name,
                                  studentCourse.course.code
                                )
                              }
                              disabled={deletingCourse === studentCourse.id}
                              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                            >
                              {deletingCourse === studentCourse.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Register Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRegister}
            disabled={selectedCourses.size === 0 || registering}
            size="lg"
            className="px-8"
          >
            {registering ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Register {selectedCourses.size} Course
                {selectedCourses.size !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => !open && cancelDeleteCourse()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Delete Course Registration
            </DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to remove this course from your
              registrations?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {deleteDialog.courseCode}
                </p>
                <p className="text-sm text-gray-600">
                  {deleteDialog.courseName}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                This action cannot be undone. You'll need to register again if
                you change your mind.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={cancelDeleteCourse}
              disabled={deletingCourse === deleteDialog.courseId}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteCourse}
              disabled={deletingCourse === deleteDialog.courseId}
            >
              {deletingCourse === deleteDialog.courseId ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Course
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
