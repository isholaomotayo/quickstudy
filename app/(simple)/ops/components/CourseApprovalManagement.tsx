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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  RefreshCw,
  Users,
  BookOpen,
  Calendar,
  AlertCircle,
  CheckSquare,
  FileText,
  UserCheck,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useRoles } from "@/hooks/useRoles";

interface CourseRegistration {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  programme: string;
  department: string;
  semester: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  registeredBy: string;
  registeredAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface CourseApprovalStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  awaitingApproval: number;
}

export default function CourseApprovalManagement() {
  const { userData } = useApp();
  const { 
    hasCourseApprovalAccess, 
    canApproveCourseRegistration,
    isProgrammeCoordinator,
    isProgrammeExamOfficer 
  } = useRoles();

  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [programmeFilter, setProgrammeFilter] = useState("all");
  const [registrations, setRegistrations] = useState<CourseRegistration[]>([]);
  const [statistics, setStatistics] = useState<CourseApprovalStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    awaitingApproval: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<CourseRegistration | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [viewDetailsRegistration, setViewDetailsRegistration] = useState<CourseRegistration | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [approvingAll, setApprovingAll] = useState(false);
  const [availableProgrammes, setAvailableProgrammes] = useState<{id: number, name: string}[]>([]);
  const [showApproveAllDialog, setShowApproveAllDialog] = useState(false);
  const [pendingRegistrationsCount, setPendingRegistrationsCount] = useState(0);

  // Check if user has access to course approval features
  if (isProgrammeExamOfficer()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Limited Access
          </h3>
          <p className="text-gray-600 max-w-md">
            Programme Exam Officers can only manage results, not course approvals. 
            Contact your Programme Coordinator or Administrator for course approval matters.
          </p>
        </div>
      </div>
    );
  }

  if (!canApproveCourseRegistration()) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">
            You don't have permission to approve course registrations.
          </p>
        </div>
      </div>
    );
  }

  const fetchCourseRegistrations = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        status: activeTab === "all" ? "all" : activeTab,
        search: searchTerm,
        programme: programmeFilter,
        priority: priorityFilter,
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      const response = await fetch(`/api/course-approvals?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch course registrations');
      }

      const data = await response.json();
      
      if (data.success) {
        setRegistrations(data.data.registrations || []);
        setStatistics(data.data.statistics || {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          awaitingApproval: 0,
        });
        setTotalPages(data.data.pagination?.totalPages || 1);
        setAvailableProgrammes(data.data.availableProgrammes || []);
      } else {
        throw new Error(data.message || 'Failed to fetch course registrations');
      }

    } catch (error) {
      console.error('Error fetching course registrations:', error);
      // Set empty data on error
      setRegistrations([]);
      setStatistics({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        awaitingApproval: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.institution_id) {
      fetchCourseRegistrations();
    }
  }, [activeTab, searchTerm, programmeFilter, priorityFilter, currentPage, userData?.institution_id]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [activeTab, searchTerm, programmeFilter, priorityFilter]);

  const handleApprove = async (registrationId: string) => {
    try {
      const response = await fetch('/api/course-approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          registrationId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve registration');
      }

      const data = await response.json();
      
      if (data.success) {
        // Refresh data to show updated state
        fetchCourseRegistrations();
      } else {
        throw new Error(data.message || 'Failed to approve registration');
      }
    } catch (error) {
      console.error('Error approving registration:', error);
      // Could show a toast notification here
      alert('Error approving registration: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleApproveAllClick = () => {
    const pendingRegistrations = registrations.filter(r => r.status === 'PENDING');
    
    if (pendingRegistrations.length === 0) {
      // Use a toast or alert for this case since it's just informational
      alert('No pending registrations to approve on this page.');
      return;
    }

    setPendingRegistrationsCount(pendingRegistrations.length);
    setShowApproveAllDialog(true);
  };

  const handleApproveAllConfirm = async () => {
    try {
      setApprovingAll(true);
      const pendingRegistrations = registrations.filter(r => r.status === 'PENDING');

      // Approve each registration
      const approvalPromises = pendingRegistrations.map(registration =>
        fetch('/api/course-approvals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'approve',
            registrationId: registration.id
          })
        })
      );

      await Promise.all(approvalPromises);
      
      // Close dialog and refresh data
      setShowApproveAllDialog(false);
      fetchCourseRegistrations();
      
    } catch (error) {
      console.error('Error approving all registrations:', error);
      alert('Error approving some registrations. Please try again.');
    } finally {
      setApprovingAll(false);
    }
  };

  const handleReject = async (registrationId: string, reason: string) => {
    try {
      const response = await fetch('/api/course-approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          registrationId,
          rejectionReason: reason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject registration');
      }

      const data = await response.json();
      
      if (data.success) {
        setShowRejectionDialog(false);
        setRejectionReason("");
        setSelectedRegistration(null);
        // Refresh data to show updated state
        fetchCourseRegistrations();
      } else {
        throw new Error(data.message || 'Failed to reject registration');
      }
    } catch (error) {
      console.error('Error rejecting registration:', error);
      // Could show a toast notification here
      alert('Error rejecting registration: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'REGISTERED':
        return <Badge className="bg-blue-100 text-blue-800">Registered</Badge>;
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="default" className="text-xs">Medium</Badge>;
      case 'LOW':
        return <Badge variant="secondary" className="text-xs">Low</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{priority}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Course Approval Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage and approve student course registrations
          </p>
        </div>
        <div className="flex gap-2">
          {canApproveCourseRegistration() && registrations.some(r => r.status === 'PENDING') && (
            <Button 
              onClick={handleApproveAllClick}
              disabled={approvingAll}
              className="bg-green-600 hover:bg-green-700"
            >
              {approvingAll ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve All Page
                </>
              )}
            </Button>
          )}
          <Button onClick={fetchCourseRegistrations} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statistics.awaitingApproval}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{statistics.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statistics.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Search</label>
              <Input
                placeholder="Search student, course, or programme..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Programme</label>
              <Select value={programmeFilter} onValueChange={setProgrammeFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programmes</SelectItem>
                  {availableProgrammes.map((programme) => (
                    <SelectItem key={programme.id} value={programme.name}>
                      {programme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="HIGH">High Priority</SelectItem>
                  <SelectItem value="MEDIUM">Medium Priority</SelectItem>
                  <SelectItem value="LOW">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending">Pending ({statistics.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({statistics.approved})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({statistics.rejected})</TabsTrigger>
          <TabsTrigger value="all">All ({statistics.total})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Registrations</CardTitle>
              <CardDescription>
                {registrations.length} registrations found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-center">
                          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-gray-500">No registrations found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    registrations.map((registration) => (
                      <TableRow key={registration.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{registration.studentName}</div>
                            <div className="text-sm text-gray-500">{registration.studentEmail}</div>
                            <div className="text-xs text-gray-400">ID: {registration.studentId}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{registration.courseName}</div>
                            <div className="text-sm text-gray-500">{registration.courseCode}</div>
                            <div className="text-xs text-gray-400">{registration.semester}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{registration.programme}</div>
                            <div className="text-sm text-gray-500">{registration.department}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getPriorityBadge(registration.priority)}</TableCell>
                        <TableCell>{getStatusBadge(registration.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{formatDate(registration.registeredAt)}</div>
                            <div className="text-xs text-gray-500">by {registration.registeredBy}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 cursor-pointer hover:bg-blue-50"
                              onClick={() => {
                                setViewDetailsRegistration(registration);
                                setShowDetailsDialog(true);
                              }}
                              title="View Details"
                            >
                              <Eye className="h-3 w-3 text-blue-600" />
                            </Button>
                            {canApproveCourseRegistration() && registration.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
                                  onClick={() => handleApprove(registration.id)}
                                  title="Approve Registration"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                  onClick={() => {
                                    setSelectedRegistration(registration);
                                    setShowRejectionDialog(true);
                                  }}
                                  title="Reject Registration"
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        className="w-8"
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              Complete information about this course registration
            </DialogDescription>
          </DialogHeader>
          
          {viewDetailsRegistration && (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center">
                  <UserCheck className="w-5 h-5 mr-2" />
                  Student Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-sm">{viewDetailsRegistration.studentName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Student ID</label>
                    <p className="text-sm">{viewDetailsRegistration.studentId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm">{viewDetailsRegistration.studentEmail}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Programme</label>
                    <p className="text-sm">{viewDetailsRegistration.programme}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Department</label>
                    <p className="text-sm">{viewDetailsRegistration.department}</p>
                  </div>
                </div>
              </div>

              {/* Course Information */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Course Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Course Name</label>
                    <p className="text-sm">{viewDetailsRegistration.courseName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Course Code</label>
                    <p className="text-sm">{viewDetailsRegistration.courseCode}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Semester</label>
                    <p className="text-sm">{viewDetailsRegistration.semester}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Priority</label>
                    <p className="text-sm">{getPriorityBadge(viewDetailsRegistration.priority)}</p>
                  </div>
                </div>
              </div>

              {/* Registration Status */}
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Registration Status
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Current Status</label>
                    <p className="text-sm">{getStatusBadge(viewDetailsRegistration.status)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Registered At</label>
                    <p className="text-sm">{formatDate(viewDetailsRegistration.registeredAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Registered By</label>
                    <p className="text-sm">{viewDetailsRegistration.registeredBy}</p>
                  </div>
                  {viewDetailsRegistration.approvedBy && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Approved By</label>
                        <p className="text-sm">{viewDetailsRegistration.approvedBy}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Approved At</label>
                        <p className="text-sm">{viewDetailsRegistration.approvedAt ? formatDate(viewDetailsRegistration.approvedAt) : 'N/A'}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {canApproveCourseRegistration() && viewDetailsRegistration.status === 'PENDING' && (
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedRegistration(viewDetailsRegistration);
                      setShowRejectionDialog(true);
                      setShowDetailsDialog(false);
                    }}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      handleApprove(viewDetailsRegistration.id);
                      setShowDetailsDialog(false);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Approve All Confirmation Dialog */}
      <Dialog open={showApproveAllDialog} onOpenChange={setShowApproveAllDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Approve All Registrations
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve all pending registrations on this page?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-900">
                  {pendingRegistrationsCount} Pending Registration{pendingRegistrationsCount !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-green-700 mt-1">
                  All selected registrations will be approved and students will gain access to their courses.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-800">
                This action cannot be undone. Make sure you have reviewed all registrations before proceeding.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowApproveAllDialog(false)}
              disabled={approvingAll}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveAllConfirm}
              disabled={approvingAll}
              className="bg-green-600 hover:bg-green-700"
            >
              {approvingAll ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve All ({pendingRegistrationsCount})
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Course Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this course registration.
              This will be communicated to the student and administrator.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRegistration && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">Registration Details</h4>
                <p className="text-sm text-gray-600">
                  Student: {selectedRegistration.studentName}
                </p>
                <p className="text-sm text-gray-600">
                  Course: {selectedRegistration.courseName} ({selectedRegistration.courseCode})
                </p>
                <p className="text-sm text-gray-600">
                  Programme: {selectedRegistration.programme}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Rejection Reason *</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why this registration is being rejected..."
                  rows={3}
                  className="mt-1"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectionDialog(false);
                    setRejectionReason("");
                    setSelectedRegistration(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedRegistration.id, rejectionReason)}
                  disabled={!rejectionReason.trim()}
                >
                  Reject Registration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}