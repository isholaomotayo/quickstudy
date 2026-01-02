"use client";

import {
  BookOpen,
  Plus,
  Eye,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AsyncSelect from "react-select/async";
import { api } from "@/lib/api-wrapper";

interface Programme {
  id: number;
  name: string;
  prefix?: string | null;
  value: number;
  label: string;
}

interface StudentProfile {
  id: string;
  programme_id: number | null;
  is_active: boolean;
  application_type: string;
  status: boolean;
  admitted: boolean;
  programme?: Programme;
}

export default function ProgramsManagement() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentProfiles, setStudentProfiles] = useState<StudentProfile[]>([]);
  const [activeStudent, setActiveStudent] = useState<StudentProfile | null>(
    null
  );
  const [availablePrograms, setAvailablePrograms] = useState<Programme[]>([]);
  const [showApplicationDialog, setShowApplicationDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Programme | null>(
    null
  );
  const [applying, setApplying] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchStudentProfiles();
    fetchAvailablePrograms();
  }, []);

  const fetchStudentProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get("/api/student/context");
      setStudentProfiles(data.students || []);
      setActiveStudent(data.activeStudent || null);
    } catch (error) {
      console.error("Error fetching student profiles:", error);
      toast.error("Failed to load student profiles");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailablePrograms = useCallback(async () => {
    try {
      const data = await api.get("/api/programmes");
      setAvailablePrograms(data.programmes || []);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  }, []);

  // Async search function for react-select
  const loadProgramOptions = async (
    inputValue: string
  ): Promise<Programme[]> => {
    try {
      const data = await api.get(
        `/api/programmes?search=${encodeURIComponent(inputValue)}`
      );

      // Filter out programs the user has already applied for
      const appliedProgramIds = studentProfiles
        .filter((student) => student.programme_id)
        .map((student) => student.programme_id);

      return (data.programmes || []).filter(
        (program: Programme) => !appliedProgramIds.includes(program.id)
      );
    } catch (error) {
      console.error("Error loading program options:", error);
      return [];
    }
  };

  const handleSwitchProgram = async (studentId: string) => {
    if (switching) return;

    try {
      setSwitching(true);
      const data = await api.put("/api/student/context", {
        activeStudentId: studentId,
      });

      setStudentProfiles(data.students || []);
      setActiveStudent(data.activeStudent || null);
      toast.success("Program switched successfully!");

      // Reload the page to update the context throughout the app
      window.location.reload();
    } catch (error: any) {
      console.error("Error switching program:", error);
      toast.error(error.message || "Failed to switch program");
      toast.error("Failed to switch program");
    } finally {
      setSwitching(false);
    }
  };

  const handleApplyForProgram = async () => {
    if (!selectedProgram || applying) return;

    // Redirect to applicant flow with additional application flag
    toast.success(`Redirecting to application for ${selectedProgram.name}...`);

    // Redirect to modern application process with additional application flag and preselected program
    router.push(`/get-started?additional=true&programme=${selectedProgram.id}`);
  };

  const getStatusBadge = (student: StudentProfile) => {
    if (student.admitted && student.status) {
      return <Badge className="bg-green-100 text-green-800">Enrolled</Badge>;
    } else if (student.status) {
      return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getApplicationTypeLabel = (type: string) => {
    return type === "NEW" ? "Initial Application" : "Additional Application";
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Program Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your academic program enrollments
          </p>
        </div>

        <Dialog
          open={showApplicationDialog}
          onOpenChange={setShowApplicationDialog}
        >
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Apply for Additional Program
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Additional Program</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="program">Select Program</Label>
                <AsyncSelect
                  cacheOptions
                  loadOptions={loadProgramOptions}
                  defaultOptions
                  value={selectedProgram}
                  onChange={(program) =>
                    setSelectedProgram(program as Programme)
                  }
                  placeholder="Search for a program to apply for..."
                  noOptionsMessage={({ inputValue }) =>
                    inputValue.length === 0
                      ? "Type to search for programs"
                      : "No programs found"
                  }
                  className="mt-1"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "40px",
                      borderColor: "#e2e8f0",
                      "&:hover": {
                        borderColor: "#cbd5e1",
                      },
                    }),
                    option: (base, { isFocused, isSelected }) => ({
                      ...base,
                      backgroundColor: isSelected
                        ? "#3b82f6"
                        : isFocused
                        ? "#f1f5f9"
                        : "white",
                      color: isSelected ? "white" : "#374151",
                      "&:hover": {
                        backgroundColor: isSelected ? "#3b82f6" : "#f1f5f9",
                      },
                    }),
                  }}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApplicationDialog(false);
                    setSelectedProgram(null);
                  }}
                  disabled={applying}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyForProgram}
                  disabled={!selectedProgram || applying}
                >
                  {applying ? "Starting..." : "Start Application"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {/* Current Active Program */}
        {activeStudent && (
          <Card className="border-2 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center text-blue-900">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Currently Active Program
                </CardTitle>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {activeStudent.programme?.name || "Unknown Program"}
                  </h3>
                  <p className="text-gray-600">
                    {getApplicationTypeLabel(activeStudent.application_type)}
                  </p>
                  <div className="mt-2">{getStatusBadge(activeStudent)}</div>
                </div>
                <div className="flex items-center justify-end">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/student")}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other Programs */}
        <Card>
          <CardHeader>
            <CardTitle>All Programs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentProfiles.map((student) => (
                <div
                  key={student.id}
                  className={`p-4 border rounded-lg ${
                    student.is_active
                      ? "border-blue-200 bg-blue-50/30"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">
                          {student.programme?.name || "Unknown Program"}
                        </h3>
                        {student.is_active && (
                          <Badge className="bg-green-100 text-green-800">
                            Current
                          </Badge>
                        )}
                        {getStatusBadge(student)}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {getApplicationTypeLabel(student.application_type)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!student.is_active && student.admitted && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSwitchProgram(student.id)}
                          disabled={switching}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          {switching
                            ? "Switching..."
                            : "Switch to this Program"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {studentProfiles.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No program enrollments found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
