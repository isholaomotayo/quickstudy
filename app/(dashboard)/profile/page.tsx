"use client";

import {
  BookOpen,
  Calendar,
  Camera,
  CreditCard,
  Download,
  Edit3,
  Eye,
  EyeOff, MapPin,
  Phone,
  Save,
  Shield, User,
  X
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
  const [userId, setUserId] = useState<string | null>(null);
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
  const [wantsPasswordChange, setWantsPasswordChange] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
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
      const data = response.data; // API wrapper returns {data: profileObject}

      // Set institution data for ID card
      setInstitutionData(data.institution || null);
      setStudentData(data || null);
      setUserId(data.user?.id?.toString() || null);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-muted-foreground/40 border-t-primary"></div>
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

      // Use the new unified profile endpoint with api-wrapper
      const response = await api.put("/api/profile", payload);
      toast.success(response.data.message || "Profile updated successfully");

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
    setWantsPasswordChange(false);
    await fetchProfileData(); // Reset form data
  };

  const handlePasswordUpdate = async () => {
    if (!passwordData.currentPassword) {
      toast.error("Enter your current password first.");
      return;
    }

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error("Enter and confirm your new password.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (!userId) {
      toast.error("Unable to update password. Please reload and try again.");
      return;
    }

    try {
      setPasswordSaving(true);
      await api.post(`/api/changePassword/${userId}`, {
        old_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      toast.success("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setWantsPasswordChange(false);
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    } finally {
      setPasswordSaving(false);
    }
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
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
          <p className="text-sm text-muted-foreground">
            Keep your QuickStudy details aligned across devices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                size="sm"
                className="gap-2"
                disabled={saving}
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save changes"}
              </Button>
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="gap-2"
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
              Edit profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left Column - Profile Info */}
        <div className="space-y-4">
          {/* Profile Picture & Basic Info */}
          <Card className="border border-border bg-card shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-20 w-20 border border-border/80 shadow-sm">
                    <AvatarImage
                      src={profileData.avatar || "/images/student-avatar.png"}
                      alt="Profile"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                      {profileData.firstName?.[0]}
                      {profileData.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>

                  {/* Upload Progress Overlay */}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 rounded-full bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center text-foreground">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mb-1"></div>
                      <div className="text-[11px] font-medium">{uploadProgress}%</div>
                    </div>
                  )}

                  {isEditing && !isUploadingAvatar && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-foreground/10 opacity-0 group-hover:opacity-100 transition-all duration-150 flex items-center justify-center cursor-pointer backdrop-blur-[1px]">
                        <Camera className="w-5 h-5 text-foreground" />
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

                <div className="flex-1 space-y-1">
                  <h2 className="text-lg font-semibold text-foreground">
                    {profileData.firstName} {profileData.lastName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {profileData.program}
                  </p>
                  <Badge variant="outline" className="border-primary/20 text-primary">
                    {profileData.studentId}
                  </Badge>
                </div>
              </div>

         
            </CardContent>
          </Card>

          {/* Course Registration Stats */}
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-foreground text-base">
                <BookOpen className="w-4 h-4 text-primary" />
                Course registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Registered</p>
                  <div className="text-xl font-semibold text-foreground">
                    {profileData.registeredCourses || "0"}
                  </div>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Approved</p>
                  <div className="text-xl font-semibold text-foreground">
                    {profileData.approvedCourses || "0"}
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Approval progress</span>
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
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all duration-300"
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

          {/* ID Card Download */} 
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-foreground text-base">
                <CreditCard className="w-4 h-4 text-primary" />
                Student ID card
                {!hasIDCardSetup() && (
                  <Badge className="ml-2 bg-destructive/10 text-destructive text-xs border border-destructive/30">
                    Setup required
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                {hasIDCardSetup()
                  ? "Download a print-ready copy of your ID."
                  : "Your institution has not configured ID templates yet."}
              </p>
              {hasIDCardSetup() ? (
                <Button onClick={printIDCardFn} size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Print ID card
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  <Download className="w-4 h-4" />
                  Unavailable
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="xl:col-span-2 space-y-4">
          {/* Personal Information */}
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground text-base">
                <User className="w-4 h-4 text-primary" />
                Personal information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={profileData.firstName || ""}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={profileData.lastName || ""}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherName">Other name</Label>
                <Input
                  id="otherName"
                  value={profileData.otherName || ""}
                  onChange={(e) => handleInputChange("otherName", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profileData.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="phone"
                    className="pl-10"
                    value={profileData.phone || ""}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="address"
                    className="pl-10"
                    value={profileData.address || ""}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of birth</Label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="dateOfBirth"
                    type="date"
                    className="pl-10"
                    value={profileData.dateOfBirth || ""}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Input
                  id="gender"
                  value={profileData.gender || ""}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Marital status</Label>
                <Input
                  id="maritalStatus"
                  value={profileData.maritalStatus || ""}
                  onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stateOrigin">State of origin</Label>
                <Input
                  id="stateOrigin"
                  value={profileData.stateOrigin || ""}
                  onChange={(e) => handleInputChange("stateOrigin", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lgaOrigin">LGA of origin</Label>
                <Input
                  id="lgaOrigin"
                  value={profileData.lgaOrigin || ""}
                  onChange={(e) => handleInputChange("lgaOrigin", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground text-base">
                <BookOpen className="w-4 h-4 text-primary" />
                Academic information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1.5">
                <Label>Student ID</Label>
                <div className="p-3 bg-muted/40 rounded-md font-mono text-foreground">
                  {profileData.studentId}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Program</Label>
                <div className="p-3 bg-muted/40 rounded-md text-foreground">
                  {profileData.program}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Current semester</Label>
                <div className="p-3 bg-muted/40 rounded-md text-foreground">
                  {profileData.semester}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Enrollment date</Label>
                <div className="p-3 bg-muted/40 rounded-md text-foreground">
                  {profileData.enrollmentDate}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Settings */}
          <Card className="border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground text-base">
                <Shield className="w-4 h-4 text-primary" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-foreground">
                        Password protection
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Keep your login secure
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      Active
                    </Badge>
                    {!wantsPasswordChange && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        onClick={() => setWantsPasswordChange(true)}
                      >
                        Change password
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {wantsPasswordChange && (
                <div className="pt-2 border-t border-border">
                  <h4 className="font-medium text-foreground mb-3">
                    Change password
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter current password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            handlePasswordChange("currentPassword", e.target.value)
                          }
                          disabled={passwordSaving}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={passwordSaving}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {passwordData.currentPassword && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New password</Label>
                          <Input
                            type="password"
                            placeholder="Enter new password"
                            value={passwordData.newPassword}
                            onChange={(e) =>
                              handlePasswordChange("newPassword", e.target.value)
                            }
                            disabled={passwordSaving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm new password</Label>
                          <Input
                            type="password"
                            placeholder="Confirm new password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              handlePasswordChange("confirmPassword", e.target.value)
                            }
                            disabled={passwordSaving}
                          />
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={handlePasswordUpdate}
                        disabled={passwordSaving}
                        className="gap-2"
                      >
                        {passwordSaving ? "Updating..." : "Save password"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setWantsPasswordChange(false);
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                        }}
                        disabled={passwordSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
    </div>
  );
}
