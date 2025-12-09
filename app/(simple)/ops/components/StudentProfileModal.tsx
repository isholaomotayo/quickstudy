"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpdateStudentFormData } from "../actions/user-actions";
import { toast } from "sonner";
import {
  Loader2,
  RefreshCw,
  User,
  GraduationCap,
  Calendar, Save, School
} from "lucide-react";

interface StudentProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  userId?: string;
}

interface StudentData {
  id: string;
  reg_no?: string;
  user_id: string;
  title?: string;
  gender?: string;
  dob?: string;
  nationality_id?: number;
  state_origin_id?: number;
  lga_id?: number;
  address?: string;
  marital_status?: string;
  employment_status?: string;
  status?: boolean;
  admitted?: boolean;
  programme_id?: number;
  semester_admitted_id?: number;
  session_admitted_id?: number;
  entry_level_id?: number;
  programme?: {
    id: number;
    name: string;
    code: string;
  };
  session?: {
    id: number;
    name: string;
  };
  semester?: {
    id: number;
    name: string;
  };
  level?: {
    id: number;
    name: string;
  };
}

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone?: string;
  institution_id: number;
  student: StudentData[];
}

export default function StudentProfileModal({
  open,
  onOpenChange,
  onSuccess,
  userId,
}: StudentProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isGeneratingRegNo, setIsGeneratingRegNo] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<Partial<UpdateStudentFormData>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load user data when modal opens and userId changes
  useEffect(() => {
    if (open && userId) {
      loadUserData();
    }
  }, [open, userId]);

  // Update form data when student data changes
  useEffect(() => {
    if (studentData) {
      setFormData({
        studentId: studentData.id,
        reg_no: studentData.reg_no || "",
        programme_id: studentData.programme_id,
        semester_admitted_id: studentData.semester_admitted_id,
        session_admitted_id: studentData.session_admitted_id,
        entry_level_id: studentData.entry_level_id,
        status: studentData.status,
        admitted: studentData.admitted,
        title: studentData.title || "",
        gender: studentData.gender || "",
        dob: studentData.dob ? studentData.dob.split('T')[0] : "",
        nationality_id: studentData.nationality_id,
        state_origin_id: studentData.state_origin_id,
        lga_id: studentData.lga_id,
        address: studentData.address || "",
        marital_status: studentData.marital_status || "",
        employment_status: studentData.employment_status || "",
      });
    }
  }, [studentData]);

  const loadUserData = async () => {
    if (!userId) return;

    setIsLoadingUser(true);
    try {
      const response = await fetch(`/api/users/${userId}`);
      const result = await response.json();

      if (response.ok && result.success && result.user) {
        const user = result.user;
        console.log("Loaded user data:", user);
        setUserData(user);
        
        if (user.student && user.student.length > 0) {
          console.log("Student data:", user.student[0]);
          setStudentData(user.student[0]);
        } else {
          toast.error("No student profile found for this user");
          onOpenChange(false);
        }
      } else {
        toast.error(result.error || "Failed to load user data");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user data");
      onOpenChange(false);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleInputChange = (field: keyof UpdateStudentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Clean the form data - remove undefined values and convert empty strings to undefined for optional fields
      const cleanedFormData = { ...formData };
      
      // Handle numeric fields - if they are null or empty string, remove them from the payload
      const numericFields = ['programme_id', 'semester_admitted_id', 'session_admitted_id', 'entry_level_id', 'nationality_id', 'state_origin_id', 'lga_id'];
      numericFields.forEach(field => {
        if (cleanedFormData[field as keyof typeof cleanedFormData] === null || 
            cleanedFormData[field as keyof typeof cleanedFormData] === undefined ||
            cleanedFormData[field as keyof typeof cleanedFormData] === '') {
          delete cleanedFormData[field as keyof typeof cleanedFormData];
        }
      });

      const response = await fetch('/api/students/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanedFormData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message);
        onSuccess?.();
        loadUserData(); // Reload data to show updates
      } else {
        if (result.details) {
          // Handle validation errors
          const newErrors: Record<string, string> = {};
          result.details.forEach((error: any) => {
            newErrors[error.path[0]] = error.message;
          });
          setErrors(newErrors);
        } else {
          toast.error(result.error || "Failed to update student profile");
        }
      }
    } catch (error) {
      console.error("Error updating student profile:", error);
      toast.error("Failed to update student profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateNewRegNo = async () => {
    if (!studentData || !userData) {
      toast.error("Student data or user data not available");
      return;
    }

    if (!studentData.id || !userData.institution_id) {
      toast.error("Missing required data: Student ID or Institution ID");
      console.error("Missing data:", { 
        studentId: studentData.id, 
        institutionId: userData.institution_id,
        studentData,
        userData 
      });
      return;
    }

    setIsGeneratingRegNo(true);
    try {
      const payload = {
        studentId: studentData.id,
        institutionId: userData.institution_id,
      };

      console.log("Generating reg number with payload:", payload);

      const response = await fetch('/api/students/generate-reg-no', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message);
        setFormData(prev => ({ 
          ...prev, 
          reg_no: result.registration_number 
        }));
        loadUserData(); // Reload to show new reg number
      } else {
        console.error("API error response:", result);
        toast.error(result.error || "Failed to generate new registration number");
      }
    } catch (error) {
      console.error("Error generating registration number:", error);
      toast.error("Failed to generate new registration number");
    } finally {
      setIsGeneratingRegNo(false);
    }
  };

  if (isLoadingUser) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="xl" className="max-h-[95vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Loading Student Profile</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading student profile...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!userData || !studentData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Manage Student Profile - {userData.first_name} {userData.last_name}
          </DialogTitle>
          <DialogDescription>
            Update student information, registration number, and academic details.
          </DialogDescription>
        </DialogHeader>

        {/* Student Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <User className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Registration Number</p>
                  <p className="text-lg font-semibold">
                    {studentData.reg_no || "Not assigned"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Programme</p>
                  <p className="text-lg font-semibold">
                    {studentData.programme?.name || "Not assigned"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <div className="flex gap-2">
                    <Badge variant={studentData.status ? "default" : "secondary"}>
                      {studentData.status ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant={studentData.admitted ? "default" : "outline"}>
                      {studentData.admitted ? "Admitted" : "Not Admitted"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <School className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Session</p>
                  <p className="text-lg font-semibold">
                    {studentData.session?.name || "Not assigned"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic" className="text-sm">Basic Info</TabsTrigger>
              <TabsTrigger value="academic" className="text-sm">Academic</TabsTrigger>
              <TabsTrigger value="personal" className="text-sm">Personal</TabsTrigger>
              <TabsTrigger value="settings" className="text-sm">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Registration & Identity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg_no">Registration Number</Label>
                      <div className="flex gap-2">
                        <Input
                          id="reg_no"
                          value={formData.reg_no || ""}
                          onChange={(e) => handleInputChange("reg_no", e.target.value)}
                          placeholder="Enter registration number"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateNewRegNo}
                          disabled={isGeneratingRegNo}
                        >
                          {isGeneratingRegNo ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {errors.reg_no && (
                        <p className="text-sm text-red-600">{errors.reg_no}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Select
                        value={formData.title || ""}
                        onValueChange={(value) => handleInputChange("title", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select title" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mr">Mr</SelectItem>
                          <SelectItem value="Ms">Ms</SelectItem>
                          <SelectItem value="Mrs">Mrs</SelectItem>
                          <SelectItem value="Dr">Dr</SelectItem>
                          <SelectItem value="Prof">Prof</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender || ""}
                        onValueChange={(value) => handleInputChange("gender", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={formData.dob || ""}
                        onChange={(e) => handleInputChange("dob", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Note: In a real implementation, you'd want to fetch and populate 
                      programmes, sessions, semesters, and levels from the database */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Current Programme</Label>
                      <div className="p-2 bg-gray-50 rounded border">
                        {studentData.programme?.name || "Not assigned"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Admitted Session</Label>
                      <div className="p-2 bg-gray-50 rounded border">
                        {studentData.session?.name || "Not assigned"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Admitted Semester</Label>
                      <div className="p-2 bg-gray-50 rounded border">
                        {studentData.semester?.name || "Not assigned"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Entry Level</Label>
                      <div className="p-2 bg-gray-50 rounded border">
                        {studentData.level?.name || "Not assigned"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="marital_status">Marital Status</Label>
                      <Select
                        value={formData.marital_status || ""}
                        onValueChange={(value) => handleInputChange("marital_status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select marital status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SINGLE">Single</SelectItem>
                          <SelectItem value="MARRIED">Married</SelectItem>
                          <SelectItem value="DIVORCED">Divorced</SelectItem>
                          <SelectItem value="WIDOWED">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="employment_status">Employment Status</Label>
                      <Select
                        value={formData.employment_status || ""}
                        onValueChange={(value) => handleInputChange("employment_status", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EMPLOYED">Employed</SelectItem>
                          <SelectItem value="UNEMPLOYED">Unemployed</SelectItem>
                          <SelectItem value="SELF_EMPLOYED">Self Employed</SelectItem>
                          <SelectItem value="STUDENT">Student</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-full space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address || ""}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter full address"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Student Status</Label>
                      <div className="text-sm text-gray-500">
                        Enable or disable student account
                      </div>
                    </div>
                    <Switch
                      checked={formData.status || false}
                      onCheckedChange={(checked) => handleInputChange("status", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Admission Status</Label>
                      <div className="text-sm text-gray-500">
                        Mark student as admitted
                      </div>
                    </div>
                    <Switch
                      checked={formData.admitted || false}
                      onCheckedChange={(checked) => handleInputChange("admitted", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}