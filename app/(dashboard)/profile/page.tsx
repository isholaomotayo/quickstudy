"use client";

import {
  BookOpen,
  Calendar,
  Camera,
  CreditCard,
  Download,
  Edit3,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ComponentValue } from "./idcard";
import { api } from "@/lib/api-wrapper";

export default function UserProfile() {
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    otherName: "",
    email: "",
    phone: "",
    avatar: "",
    address: "",
    dateOfBirth: "",
    studentId: "",
    program: "",
    semester: "",
    enrollmentDate: "",
    bio: "",
    gender: "",
    maritalStatus: "",
    stateOrigin: "",
    lgaOrigin: "",
    registeredCourses: "",
    approvedCourses: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showIDCard, setShowIDCard] = useState(false);
  const [institutionData, setInstitutionData] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const idCardRef = useRef<HTMLDivElement>(null);

  // ID Card print handlers
  const handleIDCardAfterPrint = useCallback(() => {
    toast.success("ID Card printed successfully!");
  }, []);

  const handleIDCardBeforePrint = useCallback(() => {
    if (!profileData || !profileData.firstName) {
      toast.error("Profile data not loaded yet. Please wait and try again.");
    }
    return Promise.resolve();
  }, [profileData]);

  // useReactToPrint hook for ID Card (using contentRef for functional component)
  const printIDCardFn = useReactToPrint({
    contentRef: idCardRef,
    documentTitle: `${profileData?.firstName || "Student"}_${
      profileData?.lastName || "ID"
    }_Card`,
    onAfterPrint: handleIDCardAfterPrint,
    onBeforePrint: handleIDCardBeforePrint,
  } as any);

  const buttonRender = (id) => {
    return null;
  };

  useEffect(() => {
    setMounted(true);
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Use the new unified profile endpoint with api-wrapper
      const response = await api.get("/api/profile");
      const data = response.data.data;

      // Set institution data for ID card
      setInstitutionData(data.institution || null);
      setStudentData(data || null);
      // Map API data to component state
      setProfileData({
        firstName: data.user?.first_name,
        lastName: data.user?.last_name,
        otherName: data.user?.other_name,
        email: data.user?.email,
        phone: data.user?.phone,
        avatar: data.user?.avatar,
        address: data.student?.address,
        dateOfBirth: data.student?.dob ? data.student.dob.split("T")[0] : "",
        studentId: data.student?.reg_no,
        program: data.student?.programme?.name,
        semester:
          data.student?.current_semester?.name ||
          data.student?.semester?.name ||
          "",
        enrollmentDate: data.student?.created_at
          ? new Date(data.student.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : "",
        bio: data.user?.bio,
        gender: data.student?.gender,
        maritalStatus: data.student?.marital_status,
        stateOrigin: data.student?.state_origin,
        lgaOrigin: data.student?.lga_origin,
        registeredCourses:
          data.student?.registered_courses_count?.toString() || "0",
        approvedCourses:
          data.student?.approved_courses_count?.toString() || "0",
      });
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        user: {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          other_name: profileData.otherName,
          phone: profileData.phone,
        },
        student: {
          address: profileData.address,
          dob: profileData.dateOfBirth,
          gender: profileData.gender,
          marital_status: profileData.maritalStatus,
          state_origin: profileData.stateOrigin,
          lga_origin: profileData.lgaOrigin,
        },
      };

      // TODO: Handle password change separately
      // if (passwordData.currentPassword && passwordData.newPassword && passwordData.confirmPassword) {
      //   // Handle password change via separate endpoint
      // }

      // Use the new unified profile endpoint with api-wrapper
      const response = await api.put("/api/profile", payload);
      toast.success(response.data.message || "Profile updated successfully");

      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setIsEditing(false);
      await fetchProfileData(); // Refresh data
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    setIsEditing(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    await fetchProfileData(); // Reset form data
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      setUploadProgress(0);

      // Create FormData for upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ilearn");
      formData.append("tags", "user avatar");

      // Upload to Cloudinary with progress tracking using XMLHttpRequest
      const avatarUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
          }
        });

        xhr.onreadystatechange = () => {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              resolve(response.secure_url);
            } else {
              reject(new Error("Upload failed"));
            }
          }
        };

        xhr.onerror = () => reject(new Error("Upload failed"));

        xhr.open(
          "POST",
          "https://api.cloudinary.com/v1_1/emergingplatforms/image/upload"
        );
        xhr.send(formData);
      });

      // Update profile data with new avatar URL
      setProfileData((prev) => ({ ...prev, avatar: avatarUrl }));

      // Update in backend
      await api.put("/api/profile", {
        user: {
          avatar: avatarUrl,
        },
      });

      toast.success("Profile photo updated successfully");
    } catch (error) {
      console.error("Error updating avatar:", error);
      toast.error("Failed to update profile photo");
    } finally {
      setIsUploadingAvatar(false);
      setUploadProgress(0);
    }
  };

  // Check if institution has ID card setup
  const hasIDCardSetup = () => {
    return (
      institutionData &&
      institutionData.id_card &&
      institutionData.id_card.front &&
      institutionData.id_card.back
    );
  };

  return (
    <>
      {/* Edit Profile Button - moved to top right */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                size="sm"
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                disabled={saving}
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
                disabled={saving}
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Picture & Basic Info */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-in slide-in-from-left duration-700">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <Avatar className="w-40 h-40 border-4 border-white/20 backdrop-blur-sm shadow-2xl">
                    <AvatarImage
                      src={profileData.avatar || "/images/student-avatar.png"}
                      alt="Profile"
                    />
                    <AvatarFallback className="bg-white/10 backdrop-blur-md text-blue-700 text-2xl font-bold border border-white/20">
                      {profileData.firstName?.[0]}
                      {profileData.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  {/* Upload Progress Overlay */}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md rounded-full flex flex-col items-center justify-center text-white animate-in fade-in duration-300">
                      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mb-2"></div>
                      <div className="text-xs font-medium mb-2 animate-pulse">
                        Uploading...
                      </div>
                      <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden mb-1">
                        <div
                          className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 transition-all duration-300 ease-out rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs font-bold text-emerald-300">
                        {uploadProgress}%
                      </div>
                    </div>
                  )}

                  {isEditing && !isUploadingAvatar && (
                    <>
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center cursor-pointer">
                        <Camera className="w-8 h-8 text-white drop-shadow-lg" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
                        disabled={isUploadingAvatar}
                      />
                    </>
                  )}
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="text-blue-600 font-medium">
                    {profileData.program}
                  </p>
                  <Badge className="bg-emerald-100 text-emerald-700">
                    {profileData.studentId}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Registration Stats */}
          <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0 shadow-xl animate-in slide-in-from-left duration-700 delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Course Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {profileData.registeredCourses || "0"}
                      </div>
                      <div className="text-sm opacity-90">
                        Total Courses Registered
                      </div>
                      <div className="text-xs opacity-75 mt-1">
                        Courses you've enrolled in this semester
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {profileData.approvedCourses || "0"}
                      </div>
                      <div className="text-sm opacity-90">Courses Approved</div>
                      <div className="text-xs opacity-75 mt-1">
                        Courses confirmed by academic office
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress indicator */}
              <div className="pt-2 border-t border-white/20">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Registration Progress</span>
                  <span>
                    {(() => {
                      const registered = parseInt(
                        profileData.registeredCourses || "0"
                      );
                      const approved = parseInt(
                        profileData.approvedCourses || "0"
                      );

                      if (registered === 0) return "0%";

                      const percentage = Math.round(
                        (approved / registered) * 100
                      );
                      return isNaN(percentage) ? "0%" : `${percentage}%`;
                    })()}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2 transition-all duration-300"
                    style={{
                      width: (() => {
                        const registered = parseInt(
                          profileData.registeredCourses || "0"
                        );
                        const approved = parseInt(
                          profileData.approvedCourses || "0"
                        );

                        if (registered === 0) return "0%";

                        const percentage = Math.round(
                          (approved / registered) * 100
                        );
                        return isNaN(percentage)
                          ? "0%"
                          : `${Math.min(percentage, 100)}%`;
                      })(),
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ID Card Download - Beautiful Gradient Card */}
          <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0 shadow-xl animate-in slide-in-from-left duration-700 delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Student ID Card
                {!hasIDCardSetup() && (
                  <Badge className="ml-2 bg-red-500/80 text-white text-xs">
                    Setup Required
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm opacity-90 mb-2">
                      {hasIDCardSetup()
                        ? "Download your official student ID card"
                        : "ID Card setup not available"}
                    </div>
                    <div className="text-xs opacity-75">
                      {hasIDCardSetup()
                        ? "Print-ready format with your photo and details"
                        : "Institution hasn't configured ID card templates"}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                </div>

                {hasIDCardSetup() ? (
                  <button
                    className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 cursor-pointer transform hover:scale-105"
                    onClick={printIDCardFn}
                    type="button"
                  >
                    <Download className="w-4 h-4" />
                    Print ID Card
                  </button>
                ) : (
                  <Button
                    className="w-full mt-4 bg-gray-500/50 hover:bg-gray-400/50 text-white border border-gray-300/20 cursor-not-allowed transition-all duration-300"
                    size="sm"
                    disabled
                    onClick={() =>
                      toast.error(
                        "ID Card templates not configured by institution"
                      )
                    }
                  >
                    <Download className="w-4 h-4 mr-2" />
                    ID Card Not Available
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-8 space-y-6">
          {/* Personal Information */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-in slide-in-from-right duration-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {profileData.firstName || "Not set"}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {profileData.lastName || "Not set"}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        readOnly
                        disabled
                        className="flex-1 bg-gray-100"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md flex-1">
                        {profileData.email || "Not set"}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) =>
                          handleInputChange("phone", e.target.value)
                        }
                        className="flex-1"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md flex-1">
                        {profileData.phone || "Not set"}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    {isEditing ? (
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) =>
                          handleInputChange("address", e.target.value)
                        }
                        className="flex-1"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md flex-1">
                        {profileData.address}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {isEditing ? (
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) =>
                          handleInputChange("dateOfBirth", e.target.value)
                        }
                        className="flex-1"
                      />
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-md flex-1">
                        {profileData.dateOfBirth
                          ? new Date(
                              profileData.dateOfBirth
                            ).toLocaleDateString()
                          : "Not set"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      rows={4}
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-md">
                      {profileData.bio}
                    </div>
                  )}
                </div> */}
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-in slide-in-from-right duration-700 delay-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <BookOpen className="w-5 h-5" />
                Academic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Student ID</Label>
                  <div className="p-3 bg-gray-50 rounded-md font-mono">
                    {profileData.studentId}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Program</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    {profileData.program}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Admitted Semester</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    {profileData.semester}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Enrollment Date</Label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    {profileData.enrollmentDate}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Settings */}
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-in slide-in-from-right duration-700 delay-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Shield className="w-5 h-5" />
                Security & Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Security Status Overview */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 mb-3">
                  Security Status
                </h4>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        Password Protection
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Active
                  </Badge>
                </div>

                {/* <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bell className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          Email Notifications
                        </div>
                        <div className="text-xs text-gray-500">
                          Course updates & announcements
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      Enabled
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Settings className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          Account Settings
                        </div>
                        <div className="text-xs text-gray-500">
                          Profile preferences & privacy
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-orange-100 text-orange-800"
                    >
                      Configured
                    </Badge>
                  </div> */}
              </div>

              {/* Password Change Section */}
              <div className="pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-4">
                  Change Password
                </h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          handlePasswordChange(
                            "currentPassword",
                            e.target.value
                          )
                        }
                        disabled={!isEditing}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={!isEditing}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {isEditing && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            handlePasswordChange("newPassword", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm New Password
                        </Label>
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            handlePasswordChange(
                              "confirmPassword",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden ID Card Component for Printing */}
      {mounted && studentData && (
        <div style={{ display: "none" }}>
          {React.createElement(ComponentValue as any, {
            ref: idCardRef,
            firstName: studentData.user?.first_name,
            lastName: studentData.user?.last_name,
            studentId: studentData.student?.reg_no,
            faculty: studentData.student?.programme?.department?.faculty?.name,
            department: studentData.student?.programme?.department?.name,
            programme:
              studentData.student?.programme?.prefix ||
              studentData.student?.programme?.name ||
              "",
            endYear: (
              new Date(
                studentData.student?.current_semester?.end_date
              ).getFullYear() + 1
            ).toString(),
            avatar: studentData.user?.avatar,
            frontImage: institutionData?.id_card?.front,
            backImage: institutionData?.id_card?.back,
            institutionLogo: institutionData?.logo,
          })}
        </div>
      )}
    </>
  );
}
