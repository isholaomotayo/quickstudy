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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  DollarSign,
  Calendar,
  Users,
  Building,
  GraduationCap,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useFeesData } from "@/hooks/useDashboardData";

interface Fee {
  id: string;
  name: string;
  description?: string;
  amount?: number;
  optional: boolean;
  frequency?: number;
  compulsory: boolean;
  active: boolean;
  monthly?: number;
  monthlyParts?: number;
  semesterly?: number;
  semesterlyParts?: number;
  sessionly?: number;
  sessionlyParts?: number;
  institutionId?: number;
  sessionId?: number;
  facultyId?: number;
  departmentId?: number;
  programmeId?: number;
  levelId?: number;
  institution?: { id: number; name: string };
  faculty?: { id: number; name: string };
  department?: { id: number; name: string };
  programme?: { id: number; name: string };
  level?: { id: number; name: string };
  session?: { id: number; name: string };
  createdAt?: string;
  updatedAt?: string;
}

function FeeManagementContent() {
  const { userData, isLoading: userDataLoading } = useApp();

  // Don't render until user data is loaded
  if (userDataLoading || !userData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    optional: false,
    frequency: "",
    compulsory: false,
    active: true,
    monthly: "",
    monthlyParts: "",
    semesterly: "",
    semesterlyParts: "",
    sessionly: "",
    sessionlyParts: "",
    sessionId: "",
    facultyId: "",
    departmentId: "",
    programmeId: "",
    levelId: "",
  });

  const {
    data: feesData,
    isLoading: feesLoading,
    mutate,
  } = useFeesData(userData?.institution_id, 1, 50);

  const fees = feesData?.fees || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      amount: "",
      optional: false,
      frequency: "",
      compulsory: false,
      active: true,
      monthly: "",
      monthlyParts: "",
      semesterly: "",
      semesterlyParts: "",
      sessionly: "",
      sessionlyParts: "",
      sessionId: "",
      facultyId: "",
      departmentId: "",
      programmeId: "",
      levelId: "",
    });
  };

  const handleCreateFee = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/dashboard/fees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          institutionId: userData.institution_id,
          amount: formData.amount ? parseFloat(formData.amount) : null,
          monthly: formData.monthly ? parseFloat(formData.monthly) : null,
          monthlyParts: formData.monthlyParts
            ? parseInt(formData.monthlyParts)
            : 0,
          semesterly: formData.semesterly
            ? parseFloat(formData.semesterly)
            : null,
          semesterlyParts: formData.semesterlyParts
            ? parseInt(formData.semesterlyParts)
            : 0,
          sessionly: formData.sessionly ? parseFloat(formData.sessionly) : null,
          sessionlyParts: formData.sessionlyParts
            ? parseInt(formData.sessionlyParts)
            : 0,
          sessionId: formData.sessionId ? parseInt(formData.sessionId) : null,
          facultyId: formData.facultyId ? parseInt(formData.facultyId) : null,
          departmentId: formData.departmentId
            ? parseInt(formData.departmentId)
            : null,
          programmeId: formData.programmeId
            ? parseInt(formData.programmeId)
            : null,
          levelId: formData.levelId ? parseInt(formData.levelId) : null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        mutate();
        setIsCreateModalOpen(false);
        resetForm();
        alert("Fee created successfully!");
      } else {
        alert(result.error || "Failed to create fee");
      }
    } catch (error) {
      console.error("Error creating fee:", error);
      alert("Failed to create fee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFee = async () => {
    if (!selectedFee) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/dashboard/fees/${selectedFee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          amount: formData.amount ? parseFloat(formData.amount) : null,
          monthly: formData.monthly ? parseFloat(formData.monthly) : null,
          monthlyParts: formData.monthlyParts
            ? parseInt(formData.monthlyParts)
            : 0,
          semesterly: formData.semesterly
            ? parseFloat(formData.semesterly)
            : null,
          semesterlyParts: formData.semesterlyParts
            ? parseInt(formData.semesterlyParts)
            : 0,
          sessionly: formData.sessionly ? parseFloat(formData.sessionly) : null,
          sessionlyParts: formData.sessionlyParts
            ? parseInt(formData.sessionlyParts)
            : 0,
          sessionId: formData.sessionId ? parseInt(formData.sessionId) : null,
          facultyId: formData.facultyId ? parseInt(formData.facultyId) : null,
          departmentId: formData.departmentId
            ? parseInt(formData.departmentId)
            : null,
          programmeId: formData.programmeId
            ? parseInt(formData.programmeId)
            : null,
          levelId: formData.levelId ? parseInt(formData.levelId) : null,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        mutate();
        setIsEditModalOpen(false);
        setSelectedFee(null);
        resetForm();
        alert("Fee updated successfully!");
      } else {
        alert(result.error || "Failed to update fee");
      }
    } catch (error) {
      console.error("Error updating fee:", error);
      alert("Failed to update fee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFee = async () => {
    if (!selectedFee) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/dashboard/fees/${selectedFee.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (response.ok) {
        mutate();
        setIsDeleteModalOpen(false);
        setSelectedFee(null);
        alert("Fee deleted successfully!");
      } else {
        alert(result.error || "Failed to delete fee");
      }
    } catch (error) {
      console.error("Error deleting fee:", error);
      alert("Failed to delete fee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (fee: Fee) => {
    setSelectedFee(fee);
    setFormData({
      name: fee.name,
      description: fee.description || "",
      amount: fee.amount?.toString() || "",
      optional: fee.optional,
      frequency: fee.frequency?.toString() || "",
      compulsory: fee.compulsory,
      active: fee.active,
      monthly: fee.monthly?.toString() || "",
      monthlyParts: fee.monthlyParts?.toString() || "",
      semesterly: fee.semesterly?.toString() || "",
      semesterlyParts: fee.semesterlyParts?.toString() || "",
      sessionly: fee.sessionly?.toString() || "",
      sessionlyParts: fee.sessionlyParts?.toString() || "",
      sessionId: fee.sessionId?.toString() || "",
      facultyId: fee.facultyId?.toString() || "",
      departmentId: fee.departmentId?.toString() || "",
      programmeId: fee.programmeId?.toString() || "",
      levelId: fee.levelId?.toString() || "",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (fee: Fee) => {
    setSelectedFee(fee);
    setIsDeleteModalOpen(true);
  };

  if (feesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Fee Management</h2>
          <p className="text-sm sm:text-base text-gray-600">
            Manage institutional fees and payment structures
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Fee</DialogTitle>
              <DialogDescription>
                Add a new fee structure for your institution
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Fee Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Tuition Fee"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Fee description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly">Monthly Amount (₦)</Label>
                  <Input
                    id="monthly"
                    type="number"
                    value={formData.monthly}
                    onChange={(e) =>
                      setFormData({ ...formData, monthly: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semesterly">Semesterly Amount (₦)</Label>
                  <Input
                    id="semesterly"
                    type="number"
                    value={formData.semesterly}
                    onChange={(e) =>
                      setFormData({ ...formData, semesterly: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionly">Sessionly Amount (₦)</Label>
                  <Input
                    id="sessionly"
                    type="number"
                    value={formData.sessionly}
                    onChange={(e) =>
                      setFormData({ ...formData, sessionly: e.target.value })
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="optional"
                    checked={formData.optional}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, optional: !!checked })
                    }
                  />
                  <Label htmlFor="optional">Optional</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="compulsory"
                    checked={formData.compulsory}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, compulsory: !!checked })
                    }
                  />
                  <Label htmlFor="compulsory">Compulsory</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, active: !!checked })
                    }
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateFee} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Fee"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Fees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fees ({fees.length} total)</CardTitle>
          <CardDescription>
            Manage all institutional fees and payment structures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{fee.name}</div>
                        {fee.description && (
                          <div className="text-sm text-muted-foreground">
                            {fee.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {fee.amount && (
                          <div className="font-medium">
                            {formatCurrency(fee.amount)}
                          </div>
                        )}
                        {fee.monthly && (
                          <div className="text-sm text-muted-foreground">
                            Monthly: {formatCurrency(fee.monthly)}
                          </div>
                        )}
                        {fee.semesterly && (
                          <div className="text-sm text-muted-foreground">
                            Semesterly: {formatCurrency(fee.semesterly)}
                          </div>
                        )}
                        {fee.sessionly && (
                          <div className="text-sm text-muted-foreground">
                            Sessionly: {formatCurrency(fee.sessionly)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {fee.optional && (
                          <Badge variant="secondary">Optional</Badge>
                        )}
                        {fee.compulsory && (
                          <Badge variant="default">Compulsory</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={fee.active ? "default" : "secondary"}
                        className="flex items-center gap-1 w-fit"
                      >
                        {fee.active ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {fee.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {fee.department && (
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {fee.department.name}
                          </div>
                        )}
                        {fee.programme && (
                          <div className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {fee.programme.name}
                          </div>
                        )}
                        {fee.level && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {fee.level.name}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditModal(fee)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteModal(fee)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Fee</DialogTitle>
            <DialogDescription>
              Update the fee structure details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Fee Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Tuition Fee"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount (₦)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Fee description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-monthly">Monthly Amount (₦)</Label>
                <Input
                  id="edit-monthly"
                  type="number"
                  value={formData.monthly}
                  onChange={(e) =>
                    setFormData({ ...formData, monthly: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-semesterly">Semesterly Amount (₦)</Label>
                <Input
                  id="edit-semesterly"
                  type="number"
                  value={formData.semesterly}
                  onChange={(e) =>
                    setFormData({ ...formData, semesterly: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sessionly">Sessionly Amount (₦)</Label>
                <Input
                  id="edit-sessionly"
                  type="number"
                  value={formData.sessionly}
                  onChange={(e) =>
                    setFormData({ ...formData, sessionly: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-optional"
                  checked={formData.optional}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, optional: !!checked })
                  }
                />
                <Label htmlFor="edit-optional">Optional</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-compulsory"
                  checked={formData.compulsory}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, compulsory: !!checked })
                  }
                />
                <Label htmlFor="edit-compulsory">Compulsory</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-active"
                  checked={formData.active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, active: !!checked })
                  }
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditFee} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Fee"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this fee? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          {selectedFee && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium">{selectedFee.name}</h4>
                {selectedFee.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedFee.description}
                  </p>
                )}
                {selectedFee.amount && (
                  <p className="text-sm text-gray-600 mt-1">
                    Amount: {formatCurrency(selectedFee.amount)}
                  </p>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFee}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Fee"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FeeManagement() {
  return <FeeManagementContent />;
}
