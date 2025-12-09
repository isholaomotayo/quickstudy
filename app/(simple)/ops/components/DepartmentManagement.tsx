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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useFacultiesData, useDepartmentsData } from "@/hooks/useDashboardData";

export default function DepartmentManagement() {
  const { userData } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | null
  >(null);
  const [showCreateDepartment, setShowCreateDepartment] = useState(false);
  const [showCreateProgramme, setShowCreateProgramme] = useState(false);
  const [showEditDepartment, setShowEditDepartment] = useState(false);
  const [showDepartmentDetails, setShowDepartmentDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<number | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Form states
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
  const [editDepartmentForm, setEditDepartmentForm] = useState({
    id: 0,
    name: "",
    code: "",
    description: "",
    facultyId: "",
  });

  // Data fetching
  const { data: faculties } = useFacultiesData(userData?.institution_id);
  const {
    data: departments,
    mutate: mutateDepartments,
    isLoading,
  } = useDepartmentsData(userData?.institution_id);

  // Filter departments based on search and faculty
  const filteredDepartments =
    departments?.filter((dept: any) => {
      const matchesSearch =
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFaculty =
        facultyFilter === "all" || dept.faculty?.name === facultyFilter;
      return matchesSearch && matchesFaculty;
    }) || [];

  // Pagination logic
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDepartments = filteredDepartments.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, facultyFilter, statusFilter]);

  const handleExportDepartments = () => {
    // TODO: Implement CSV export functionality
  };

  const handleRefreshData = () => {
    mutateDepartments();
  };

  // Action handlers
  const handleViewDetails = (deptId: number) => {
    setSelectedDepartmentId(deptId);
    setShowDepartmentDetails(true);
  };

  const handleEditDepartment = (deptId: number) => {
    const dept = departments?.find((d: any) => d.id === deptId);
    if (dept) {
      setEditDepartmentForm({
        id: dept.id,
        name: dept.name,
        code: dept.code,
        description: dept.description || "",
        facultyId:
          dept.faculty?.id?.toString() || dept.faculty_id?.toString() || "",
      });
      setSelectedDepartmentId(deptId);
      setShowEditDepartment(true);
    }
  };

  const handleAddProgram = (deptId: number) => {
    setSelectedDepartmentId(deptId);
    setShowCreateProgramme(true);
  };

  const handleDeleteDepartment = (deptId: number) => {
    setDepartmentToDelete(deptId);
    setShowDeleteConfirm(true);
  };

  // Create department handler
  const handleCreateDepartment = async () => {
    if (
      !departmentForm.name ||
      !departmentForm.code ||
      !departmentForm.facultyId
    ) {
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
        setDepartmentForm({
          name: "",
          code: "",
          description: "",
          facultyId: "",
        });
        setShowCreateDepartment(false);
        mutateDepartments();
      }
    } catch (error) {
      console.error("Error creating department:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Create programme handler
  const handleCreateProgramme = async () => {
    if (!programmeForm.name || !selectedDepartmentId) {
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
        setProgrammeForm({
          name: "",
          description: "",
          years: 4,
          prefix: "",
          regnoFormat: "",
        });
        setShowCreateProgramme(false);
        setSelectedDepartmentId(null);
        mutateDepartments();
      }
    } catch (error) {
      console.error("Error creating programme:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Update department handler
  const handleUpdateDepartment = async () => {
    if (
      !editDepartmentForm.name ||
      !editDepartmentForm.code ||
      !editDepartmentForm.facultyId
    ) {
      return;
    }

    setIsUpdating(true);
    try {
      const { updateDepartmentAction } = await import(
        "@/app/(simple)/ops/actions/departments"
      );
      const result = await updateDepartmentAction(
        editDepartmentForm.id,
        editDepartmentForm.name,
        editDepartmentForm.code,
        editDepartmentForm.description,
        parseInt(editDepartmentForm.facultyId)
      );

      if (result.success) {
        setShowEditDepartment(false);
        mutateDepartments();
      }
    } catch (error) {
      console.error("Error updating department:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Confirm delete department handler
  const confirmDeleteDepartment = async () => {
    if (!departmentToDelete) return;

    setIsDeleting(true);
    try {
      const { deleteDepartmentAction } = await import(
        "@/app/(simple)/ops/actions/departments"
      );
      const result = await deleteDepartmentAction(departmentToDelete);

      if (result.success) {
        setShowDeleteConfirm(false);
        setDepartmentToDelete(null);
        mutateDepartments();
      }
    } catch (error) {
      console.error("Error deleting department:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const facultyNames = faculties?.map((faculty: any) => faculty.name) || [];

  const totalStats = {
    totalStaff:
      departments?.reduce(
        (acc: number, dept: any) => acc + (dept.staffCount || 0),
        0
      ) || 0,
    totalStudents:
      departments?.reduce(
        (acc: number, dept: any) => acc + (dept.studentCount || 0),
        0
      ) || 0,
    totalCourses:
      departments?.reduce(
        (acc: number, dept: any) => acc + (dept.programmeCount || 0),
        0
      ) || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Department Management</h2>
          <p className="text-gray-600">
            Manage departments, faculties, and academic units
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportDepartments}>
            <Download className="h-4 w-4 mr-2" />
            Export
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
          <Button onClick={() => setShowCreateDepartment(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Departments
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all faculties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStats.totalStaff.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Faculty members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStats.totalStudents.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStats.totalCourses.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Departments</CardTitle>
          <CardDescription>
            Find and manage departments by name, faculty, or HOD
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, code, or HOD..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={facultyFilter} onValueChange={setFacultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                {facultyNames.map((faculty) => (
                  <SelectItem key={faculty} value={faculty}>
                    {faculty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Departments ({filteredDepartments.length})</CardTitle>
          <CardDescription>
            Manage academic departments and their resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>HOD</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedDepartments.map((dept: any) => (
                <TableRow key={dept.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium">{dept.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Code: {dept.code}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dept.description || "No description"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {dept.faculty?.name || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="font-medium">N/A</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {dept.email || "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {dept.phone || "N/A"}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        <span className="text-sm">
                          {dept.staffCount || 0} staff
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-3 w-3" />
                        <span className="text-sm">
                          {dept.studentCount || 0} students
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-3 w-3" />
                        <span className="text-sm">
                          {dept.programmeCount || 0} programs
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(dept.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditDepartment(dept.id)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Department
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAddProgram(dept.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Program
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteDepartment(dept.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Department
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredDepartments.length)} of{" "}
                {filteredDepartments.length} departments
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Rows per page:</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-16">
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
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage > totalPages - 3) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={
                          currentPage === pageNumber ? "default" : "outline"
                        }
                        size="sm"
                        className="h-8 w-8"
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
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Department Modal */}
      <Dialog
        open={showCreateDepartment}
        onOpenChange={setShowCreateDepartment}
      >
        <DialogContent className="max-w-md">
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
                  setDepartmentForm({
                    ...departmentForm,
                    code: e.target.value.toUpperCase(),
                  })
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
                rows={3}
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
                  min="1"
                  max="10"
                  value={programmeForm.years}
                  onChange={(e) =>
                    setProgrammeForm({
                      ...programmeForm,
                      years: parseInt(e.target.value) || 4,
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
                      prefix: e.target.value.toUpperCase(),
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
                rows={3}
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
            <Button
              onClick={handleCreateProgramme}
              disabled={isCreating || !selectedDepartmentId}
            >
              {isCreating ? "Creating..." : "Create Programme"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Department Modal */}
      <Dialog open={showEditDepartment} onOpenChange={setShowEditDepartment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editDeptName">Department Name *</Label>
              <Input
                id="editDeptName"
                value={editDepartmentForm.name}
                onChange={(e) =>
                  setEditDepartmentForm({
                    ...editDepartmentForm,
                    name: e.target.value,
                  })
                }
                placeholder="e.g. Computer Science"
              />
            </div>
            <div>
              <Label htmlFor="editDeptCode">Department Code *</Label>
              <Input
                id="editDeptCode"
                value={editDepartmentForm.code}
                onChange={(e) =>
                  setEditDepartmentForm({
                    ...editDepartmentForm,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g. CSC"
              />
            </div>
            <div>
              <Label htmlFor="editDeptFaculty">Faculty *</Label>
              <Select
                value={editDepartmentForm.facultyId}
                onValueChange={(value) =>
                  setEditDepartmentForm({
                    ...editDepartmentForm,
                    facultyId: value,
                  })
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
              <Label htmlFor="editDeptDesc">Description</Label>
              <Textarea
                id="editDeptDesc"
                value={editDepartmentForm.description}
                onChange={(e) =>
                  setEditDepartmentForm({
                    ...editDepartmentForm,
                    description: e.target.value,
                  })
                }
                placeholder="Department description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDepartment(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateDepartment} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Department Details Modal */}
      <Dialog
        open={showDepartmentDetails}
        onOpenChange={setShowDepartmentDetails}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Department Details</DialogTitle>
          </DialogHeader>
          {selectedDepartmentId && (
            <div className="space-y-4">
              {departments
                ?.filter((dept: any) => dept.id === selectedDepartmentId)
                .map((dept: any) => (
                  <div key={dept.id} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Department Name
                        </Label>
                        <div className="mt-1">{dept.name}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Department Code
                        </Label>
                        <div className="mt-1">{dept.code}</div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Faculty
                        </Label>
                        <div className="mt-1">
                          {dept.faculty?.name || "N/A"}
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">
                          Status
                        </Label>
                        <div className="mt-1">
                          <Badge variant="default">Active</Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Description
                      </Label>
                      <div className="mt-1">
                        {dept.description || "No description available"}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {dept.staffCount || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Staff Members
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {dept.studentCount || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Students
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {dept.programmeCount || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Programmes
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDepartmentDetails(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowDepartmentDetails(false);
                if (selectedDepartmentId) {
                  handleEditDepartment(selectedDepartmentId);
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this department? This action
              cannot be undone and will affect all associated programmes and
              staff.
            </p>
            {departmentToDelete && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="font-medium text-destructive">
                  {
                    departments?.find((d: any) => d.id === departmentToDelete)
                      ?.name
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  Code:{" "}
                  {
                    departments?.find((d: any) => d.id === departmentToDelete)
                      ?.code
                  }
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDepartmentToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteDepartment}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Department"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
