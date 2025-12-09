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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
    Loader2,
    User,
    Mail,
    Phone, Calendar, Building2
} from "lucide-react";

interface ViewUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: string;
  phone?: string;
  active: boolean;
  staff?: any[];
  student?: any[];
  created_at: string;
  updated_at: string;
}

export default function ViewUserModal({
  open,
  onOpenChange,
  userId,
}: ViewUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // Load user data when modal opens and userId changes
  useEffect(() => {
    if (open && userId) {
      loadUserData();
    }
  }, [open, userId]);

  const loadUserData = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`);
      const result = await response.json();

      if (response.ok && result.success && result.user) {
        setUserData(result.user);
      } else {
        toast.error(result.error || "Failed to load user data");
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user data");
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRoleName = (role: string) => {
    return role
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { color: "bg-red-100 text-red-800", label: "Admin" },
      HOD: { color: "bg-purple-100 text-purple-800", label: "HOD" },
      STAFF: { color: "bg-blue-100 text-blue-800", label: "Staff" },
      STUDENT: { color: "bg-green-100 text-green-800", label: "Student" },
      APPLICANT: { color: "bg-yellow-100 text-yellow-800", label: "Applicant" },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || {
      color: "bg-gray-100 text-gray-800",
      label: role,
    };

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this user.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading user data...
          </div>
        ) : userData ? (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Full Name
                    </label>
                    <p className="text-lg font-semibold">
                      {userData.first_name} {userData.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Username
                    </label>
                    <p className="font-medium">@{userData.username}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Role
                    </label>
                    <div className="mt-1">{getRoleBadge(userData.role)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Status
                    </label>
                    <div className="mt-1">
                      {getStatusBadge(userData.active)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p>{userData.email}</p>
                  </div>
                </div>

                {userData.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Phone
                      </label>
                      <p>{userData.phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Organizational Information */}
            {(userData.staff && userData.staff.length > 0) ||
            (userData.student && userData.student.length > 0) ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Organizational Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userData.staff && userData.staff.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Staff Information
                      </label>
                      {userData.staff.map((staff, index) => (
                        <div key={index} className="mt-2">
                          {staff.title && <p>Title: {staff.title}</p>}
                          {staff.designation && (
                            <p>Designation: {staff.designation}</p>
                          )}
                          {staff.staff_no && (
                            <p>Staff Number: {staff.staff_no}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {userData.student && userData.student.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Student Information
                      </label>
                      {userData.student.map((student, index) => (
                        <div key={index} className="mt-2 space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {student.reg_no && (
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <label className="text-xs font-medium text-blue-700">
                                  Registration Number
                                </label>
                                <p className="font-mono text-lg font-semibold text-blue-900">
                                  {student.reg_no}
                                </p>
                              </div>
                            )}
                            {student.programme && (
                              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <label className="text-xs font-medium text-green-700">
                                  Programme
                                </label>
                                <p className="font-semibold text-green-900">
                                  {student.programme.name}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <label className="text-xs font-medium text-gray-500">Status</label>
                              <p className={student.status ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                {student.status ? "Active" : "Inactive"}
                              </p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500">Admitted</label>
                              <p className={student.admitted ? "text-green-600 font-medium" : "text-orange-600 font-medium"}>
                                {student.admitted ? "Yes" : "No"}
                              </p>
                            </div>
                            {student.gender && (
                              <div>
                                <label className="text-xs font-medium text-gray-500">Gender</label>
                                <p>{student.gender}</p>
                              </div>
                            )}
                            {student.title && (
                              <div>
                                <label className="text-xs font-medium text-gray-500">Title</label>
                                <p>{student.title}</p>
                              </div>
                            )}
                          </div>

                          {(student.session || student.semester || student.level) && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              {student.session && (
                                <div>
                                  <label className="text-xs font-medium text-gray-500">Admitted Session</label>
                                  <p>{student.session.name}</p>
                                </div>
                              )}
                              {student.semester && (
                                <div>
                                  <label className="text-xs font-medium text-gray-500">Admitted Semester</label>
                                  <p>{student.semester.name}</p>
                                </div>
                              )}
                              {student.level && (
                                <div>
                                  <label className="text-xs font-medium text-gray-500">Entry Level</label>
                                  <p>{student.level.name}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {(student.marital_status || student.employment_status) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {student.marital_status && (
                                <div>
                                  <label className="text-xs font-medium text-gray-500">Marital Status</label>
                                  <p>{student.marital_status}</p>
                                </div>
                              )}
                              {student.employment_status && (
                                <div>
                                  <label className="text-xs font-medium text-gray-500">Employment Status</label>
                                  <p>{student.employment_status}</p>
                                </div>
                              )}
                            </div>
                          )}

                          {student.address && (
                            <div>
                              <label className="text-xs font-medium text-gray-500">Address</label>
                              <p className="text-sm">{student.address}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : null}

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Account Created
                  </label>
                  <p>{formatDate(userData.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Last Updated
                  </label>
                  <p>{formatDate(userData.updated_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    User ID
                  </label>
                  <p className="font-mono text-sm">{userData.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No user data available</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
