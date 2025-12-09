"use client";

import { useState, useEffect } from "react";
import { ROLE_GROUPS } from "@/lib/roles";
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
    Users,
    UserPlus,
    Search,
    Filter,
    MoreHorizontal,
    Download,
    RefreshCw,
    Eye,
    Edit,
    Trash2,
    UserCheck,
    UserX,
    Mail, TrendingUp, BarChart3,
    PieChart,
    Clock, GraduationCap
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useUserStats, useUsersData } from "@/hooks/useDashboardData";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";
import ViewUserModal from "./ViewUserModal";
import StudentProfileModal from "./StudentProfileModal";
import ConfirmationDialog from "./ConfirmationDialog";
import {
    permanentlyDeleteUser,
    deactivateUser,
    toggleUserStatus,
} from "../actions/user-actions";
import { toast } from "sonner";
import {
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    ResponsiveContainer, Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend, Line,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis, Area,
    ComposedChart
} from "recharts";

export default function UserManagement() {
  const { userData } = useApp();
  const institutionId = userData?.institution_id;

  // SWR hooks for data fetching
  const {
    data: userStats,
    error: userStatsError,
    isLoading: userStatsLoading,
    mutate: mutateUserStats,
  } = useUserStats(institutionId);

  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("overview");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [viewUserModalOpen, setViewUserModalOpen] = useState(false);
  const [studentProfileModalOpen, setStudentProfileModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>();

  // Confirmation dialog states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [toggleStatusConfirmOpen, setToggleStatusConfirmOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    userId: string;
    userName: string;
    action: "delete" | "activate" | "deactivate";
    currentStatus?: boolean;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Users data hook with filters
  const {
    data: usersData,
    error: usersError,
    isLoading: usersLoading,
    mutate: mutateUsers,
  } = useUsersData(
    institutionId,
    searchTerm || undefined,
    roleFilter === "all" ? undefined : roleFilter,
    statusFilter === "all" ? undefined : statusFilter,
    1000 // Fetch more data for client-side pagination - increased limit
  );

  // Extract users array from the comprehensive data object
  const allUsers = usersData?.users || [];

  // Client-side pagination
  const totalPages = Math.ceil(allUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const users = allUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, departmentFilter, facultyFilter]);

  // Extract departments and faculties from the comprehensive users data
  const departments = usersData?.departments || [];
  const faculties = usersData?.faculties || [];

  // Use the same loading and error states since they come from the same API call
  const departmentsError = usersError;
  const facultiesError = usersError;
  const departmentsLoading = usersLoading;
  const facultiesLoading = usersLoading;
  const mutateDepartments = mutateUsers;
  const mutateFaculties = mutateUsers;

  const handleRefresh = () => {
    mutateUserStats();
    mutateUsers();
    mutateDepartments();
    mutateFaculties();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
  };

  const handleCreateUser = () => {
    setCreateUserModalOpen(true);
  };

  const handleEditUser = (userId: string) => {
    setSelectedUserId(userId);
    setEditUserModalOpen(true);
  };

  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setViewUserModalOpen(true);
  };

  const handleManageStudentProfile = (userId: string) => {
    setSelectedUserId(userId);
    setStudentProfileModalOpen(true);
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    setConfirmationData({
      userId,
      userName,
      action: "delete",
    });
    setDeleteConfirmOpen(true);
  };

  const handleToggleUserStatus = (
    userId: string,
    currentStatus: boolean,
    userName: string
  ) => {
    setConfirmationData({
      userId,
      userName,
      action: currentStatus ? "deactivate" : "activate",
      currentStatus,
    });
    setToggleStatusConfirmOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!confirmationData) return;

    setIsProcessing(true);
    try {
      const result = await permanentlyDeleteUser(confirmationData.userId);
      if (result.success) {
        toast.success(result.message);
        handleRefresh();
      } else {
        if (result.canDeactivate) {
          // Show option to deactivate instead
          toast.error(result.error, {
            description: result.details,
            action: {
              label: "Deactivate Instead",
              onClick: async () => {
                setDeleteConfirmOpen(false);
                const deactivateResult = await deactivateUser(
                  confirmationData.userId
                );
                if (deactivateResult.success) {
                  toast.success(deactivateResult.message);
                  handleRefresh();
                } else {
                  toast.error(deactivateResult.error);
                }
              },
            },
          });
        } else {
          toast.error(result.error, {
            description: result.details,
          });
        }
      }
    } finally {
      setIsProcessing(false);
      setConfirmationData(null);
    }
  };

  const confirmToggleUserStatus = async () => {
    if (!confirmationData) return;

    setIsProcessing(true);
    try {
      const result = await toggleUserStatus(
        confirmationData.userId,
        confirmationData.action === "activate"
      );
      if (result.success) {
        toast.success(result.message);
        handleRefresh();
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsProcessing(false);
      setConfirmationData(null);
    }
  };

  const handleModalSuccess = () => {
    handleRefresh();
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      SUPERADMIN: { color: "bg-gray-100 text-gray-800", label: "Super Admin" },
      SYSADMIN: { color: "bg-gray-200 text-gray-900", label: "Sys Admin" },
      ADMIN: { color: "bg-red-100 text-red-800", label: "Admin" },
      PROGRAMME_COORDINATOR: { color: "bg-indigo-100 text-indigo-800", label: "Programme Coordinator" },
      HOD: { color: "bg-purple-100 text-purple-800", label: "HOD" },
      PROGRAMME_EXAM_OFFICER: { color: "bg-orange-100 text-orange-800", label: "Programme Exam Officer" },
      FACILITATOR: { color: "bg-cyan-100 text-cyan-800", label: "Facilitator" },
      ETUTOR: { color: "bg-teal-100 text-teal-800", label: "eTutor" },
      STAFF: { color: "bg-blue-100 text-blue-800", label: "Staff" },
      LECTURER: { color: "bg-blue-200 text-blue-900", label: "Lecturer" },
      STUDENT: { color: "bg-green-100 text-green-800", label: "Student" },
      APPLICANT: { color: "bg-yellow-100 text-yellow-800", label: "Applicant" },
      AFFILIATE: { color: "bg-pink-100 text-pink-800", label: "Affiliate" },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || {
      color: "bg-gray-100 text-gray-800",
      label: role,
    };

    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge className="bg-green-100 text-green-800">
        <UserCheck className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <UserX className="h-3 w-3 mr-1" />
        Inactive
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

  const getActiveUsersPercentage = () => {
    if (!userStats?.totalUsers) return 0;
    return Math.round(
      ((userStats.activeUsers || 0) / userStats.totalUsers) * 100
    );
  };

  const getNewUsersGrowth = () => {
    const newUsers = userStats?.newUsersThisMonth || 0;
    const totalUsers = userStats?.totalUsers || 0;
    if (totalUsers === 0) return 0;
    return Math.round((newUsers / totalUsers) * 100);
  };

  const getUsersByRoleStats = () => {
    return userStats?.usersByRole || [];
  };

  const getRecentUsers = () => {
    return users?.slice(0, 5) || [];
  };

  const getInactiveUsers = () => {
    return users?.filter((user) => !user.active) || [];
  };

  // Helper function to format role names
  const formatRoleName = (role: string) => {
    return role
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Chart data preparation
  const getPieChartData = () => {
    const roleData = getUsersByRoleStats();
    const colors = ["#ef4444", "#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];

    return roleData.map((role, index) => ({
      name: formatRoleName(role.role),
      value: role.count,
      color: colors[index % colors.length],
    }));
  };

  const getRadarChartData = () => {
    const roleData = getUsersByRoleStats();
    const maxValue = Math.max(...roleData.map((role) => role.count), 1);

    return roleData.map((role) => ({
      role: formatRoleName(role.role),
      users: role.count,
      fullMark: maxValue * 1.2, // Add some padding to the max value
    }));
  };

  const getBarChartData = () => {
    const roleData = getUsersByRoleStats();
    return roleData.map((role) => ({
      role: formatRoleName(role.role),
      users: role.count,
    }));
  };

  const getActivityTrendData = () => {
    // Mock data for user activity trends - in real app, this would come from the API
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((month, index) => ({
      month,
      newUsers: Math.floor(Math.random() * 50) + 10,
      activeUsers: Math.floor(Math.random() * 200) + 100,
      totalUsers: (index + 1) * 50 + Math.floor(Math.random() * 30),
    }));
  };

  const getStatusDistributionData = () => {
    if (!usersData?.stats) return [];

    const active = usersData.stats.activeUsers || 0;
    const total = usersData.stats.totalUsers || 0;
    const inactive = total - active;

    return [
      { name: "Active Users", value: active, color: "#10B981" },
      { name: "Inactive Users", value: inactive, color: "#EF4444" },
    ];
  };

  const getDepartmentChartData = () => {
    return (
      departments?.map((dept) => ({
        name: dept.name,
        staff: dept.staffCount,
        students: dept.studentCount,
      })) || []
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setDepartmentFilter("all");
    setFacultyFilter("all");
  };

  // Loading states
  const isLoading =
    userStatsLoading || usersLoading || departmentsLoading || facultiesLoading;
  const hasError =
    !!userStatsError || !!usersError || !!departmentsError || !!facultiesError;

  // Error handling - errors are handled by SWR automatically

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading user data</p>
          <Button onClick={handleRefresh}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">
            Manage users, roles, and access permissions
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleCreateUser}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
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
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-blue-900">
              {userStats?.totalUsers?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-blue-700">
              +{userStats?.newUsersThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-green-900">
              Active Users
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-green-900">
              {userStats?.activeUsers?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-green-700">
              {getActiveUsersPercentage()}% of total users
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-100 border-purple-200 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-violet-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-purple-900">
              New Users
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-purple-900">
              {userStats?.newUsersThisMonth?.toLocaleString() || "0"}
            </div>
            <p className="text-xs text-purple-700">
              +{getNewUsersGrowth()}% growth rate
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-orange-900">
              Inactive Users
            </CardTitle>
            <UserX className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-orange-900">
              {getInactiveUsers().length}
            </div>
            <p className="text-xs text-orange-700">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* User Management Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-4"
      >
        <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white"
          >
            Users
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-pink-600 data-[state=active]:text-white"
          >
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Distribution by Role - Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Users by Role Distribution
                </CardTitle>
                <CardDescription>
                  Visual breakdown of users across different roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={getRadarChartData()}>
                      <PolarGrid />
                      <PolarAngleAxis
                        dataKey="role"
                        tick={{ fontSize: 12 }}
                        className="text-sm"
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, "dataMax"]}
                        tick={{ fontSize: 10 }}
                        tickCount={4}
                      />
                      <Radar
                        name="Users"
                        dataKey="users"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      <Tooltip
                        formatter={(value, name) => [value, "Users"]}
                        labelFormatter={(label) => `Role: ${label}`}
                      />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Users
                </CardTitle>
                <CardDescription>Latest user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getRecentUsers().map((user) => (
                    <div
                      key={user.id.toString()}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {user.first_name.charAt(0)}
                            {user.last_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRoleBadge(user.role)}
                        <span className="text-xs text-gray-400">
                          {formatDate(user.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    User Management ({allUsers.length} loaded)
                  </CardTitle>
                  <CardDescription>
                    View and manage users in the system • Showing{" "}
                    {startIndex + 1}-{Math.min(endIndex, allUsers.length)} of{" "}
                    {allUsers.length} loaded users
                    {allUsers.length >= 1000 && (
                      <span className="text-amber-600 ml-2">
                        • Use search to find more users
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
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
                  <Button variant="outline" onClick={clearFilters}>
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Advanced Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name, username, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                    <SelectItem value="SYSADMIN">Sys Admin</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="PROGRAMME_COORDINATOR">Programme Coordinator</SelectItem>
                    <SelectItem value="HOD">HOD</SelectItem>
                    <SelectItem value="PROGRAMME_EXAM_OFFICER">Programme Exam Officer</SelectItem>
                    <SelectItem value="FACILITATOR">Facilitator</SelectItem>
                    <SelectItem value="ETUTOR">eTutor</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="LECTURER">Lecturer</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="APPLICANT">Applicant</SelectItem>
                    <SelectItem value="AFFILIATE">Affiliate</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name} ({dept.userCount || 0} users)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Faculties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Faculties</SelectItem>
                    {faculties?.map((faculty) => (
                      <SelectItem
                        key={faculty.id}
                        value={faculty.id.toString()}
                      >
                        {faculty.name} ({faculty.userCount} users)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Reg No./Staff No.</TableHead>
                      <TableHead>Department/Faculty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                          Loading users...
                        </TableCell>
                      </TableRow>
                    ) : users?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users?.map((user) => (
                        <TableRow key={user.id.toString()}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                              <div className="text-xs text-gray-400">
                                @{user.username}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {user.role === "STUDENT" ? (
                                user.student_reg_no ? (
                                  <div className="font-mono text-blue-600 font-medium">
                                    {user.student_reg_no}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">No reg no.</span>
                                )
                              ) : (user.role === "STAFF" || user.role === "LECTURER" || user.role === "HOD") ? (
                                user.staff_no ? (
                                  <div className="font-mono text-green-600 font-medium">
                                    {user.staff_no}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">No staff no.</span>
                                )
                              ) : (
                                <span className="text-gray-400 text-xs">N/A</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              {user.department && user.department !== "N/A" && (
                                <div className="text-sm">
                                  <span className="font-medium">
                                    {user.department}
                                  </span>
                                  {user.faculty && user.faculty !== "N/A" && (
                                    <div className="text-xs text-gray-500">
                                      {user.faculty}
                                    </div>
                                  )}
                                </div>
                              )}
                              {(!user.department ||
                                user.department === "N/A") && (
                                <span className="text-gray-400 text-sm">
                                  Not assigned
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(user.active)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="text-xs text-gray-500">
                                Role: {formatRoleName(user.role)}
                              </div>
                              {ROLE_GROUPS.ALL_STAFF.includes(user.role as any) ? (
                                <div className="text-xs text-gray-400">
                                  Staff Member
                                </div>
                              ) : user.role === "STUDENT" ? (
                                <div className="text-xs text-gray-400">
                                  Student
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">
                                  {formatRoleName(user.role)}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500">
                            {formatDate(user.created_at)}
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
                                  onClick={() =>
                                    handleViewUser(user.id.toString())
                                  }
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleEditUser(user.id.toString())
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit User
                                </DropdownMenuItem>
                                {user.role === "STUDENT" && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleManageStudentProfile(user.id.toString())
                                    }
                                  >
                                    <GraduationCap className="mr-2 h-4 w-4" />
                                    Manage Student
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleToggleUserStatus(
                                      user.id.toString(),
                                      user.active,
                                      `${user.first_name} ${user.last_name}`
                                    )
                                  }
                                >
                                  {user.active ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" />
                                      Deactivate User
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      Activate User
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() =>
                                    handleDeleteUser(
                                      user.id.toString(),
                                      `${user.first_name} ${user.last_name}`
                                    )
                                  }
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete User
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
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const pageNum =
                            Math.max(
                              1,
                              Math.min(totalPages - 4, currentPage - 2)
                            ) + i;
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
                        }
                      )}
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
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Main Analytics Grid - Cleaner Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Large Activity Trend Chart - Takes up 2 columns */}
            <Card className="lg:col-span-2 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  User Activity Trends
                </CardTitle>
                <CardDescription>
                  Monthly user growth and activity patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={getActivityTrendData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: "#e0e0e0" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        axisLine={{ stroke: "#e0e0e0" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="totalUsers"
                        fill="url(#colorTotal)"
                        stroke="#8884d8"
                        fillOpacity={0.3}
                        name="Total Users"
                      />
                      <Bar dataKey="newUsers" fill="#82ca9d" name="New Users" />
                      <Line
                        type="monotone"
                        dataKey="activeUsers"
                        stroke="#ff7300"
                        strokeWidth={3}
                        dot={{ fill: "#ff7300", strokeWidth: 2, r: 4 }}
                        name="Active Users"
                      />
                      <defs>
                        <linearGradient
                          id="colorTotal"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8884d8"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8884d8"
                            stopOpacity={0.1}
                          />
                        </linearGradient>
                      </defs>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution Donut - Takes up 1 column */}
            <Card className="lg:col-span-1 hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-green-600" />
                  User Status
                </CardTitle>
                <CardDescription>
                  Active vs Inactive distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={getStatusDistributionData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {getStatusDistributionData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [value, name]}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        wrapperStyle={{ fontSize: "11px" }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateUserModal
        open={createUserModalOpen}
        onOpenChange={setCreateUserModalOpen}
        onSuccess={handleModalSuccess}
        departments={departments}
        faculties={faculties}
      />

      <EditUserModal
        open={editUserModalOpen}
        onOpenChange={setEditUserModalOpen}
        onSuccess={handleModalSuccess}
        userId={selectedUserId}
        departments={departments}
        faculties={faculties}
      />

      <ViewUserModal
        open={viewUserModalOpen}
        onOpenChange={setViewUserModalOpen}
        userId={selectedUserId}
      />

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete User"
        description={
          confirmationData
            ? `Are you sure you want to permanently delete ${confirmationData.userName}? This action cannot be undone. If the user has existing records, they will need to be removed first.`
            : ""
        }
        confirmText="Delete User"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDeleteUser}
        isLoading={isProcessing}
      />

      <ConfirmationDialog
        open={toggleStatusConfirmOpen}
        onOpenChange={setToggleStatusConfirmOpen}
        title={
          confirmationData?.action === "activate"
            ? "Activate User"
            : "Deactivate User"
        }
        description={
          confirmationData
            ? `Are you sure you want to ${confirmationData.action} ${
                confirmationData.userName
              }? This will ${
                confirmationData.action === "activate" ? "enable" : "disable"
              } their access to the system.`
            : ""
        }
        confirmText={
          confirmationData?.action === "activate"
            ? "Activate User"
            : "Deactivate User"
        }
        cancelText="Cancel"
        variant={
          confirmationData?.action === "activate" ? "default" : "warning"
        }
        onConfirm={confirmToggleUserStatus}
        isLoading={isProcessing}
      />

      {/* Student Profile Management Modal */}
      <StudentProfileModal
        open={studentProfileModalOpen}
        onOpenChange={setStudentProfileModalOpen}
        onSuccess={handleModalSuccess}
        userId={selectedUserId}
      />
    </div>
  );
}
