"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Calendar, GraduationCap,
  FileText,
  CheckCircle,
  XCircle, BookOpen, Eye,
  Download,
  Loader2
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import toast from "react-hot-toast";

interface ApplicationData {
  id: string;
  firstName: string;
  lastName: string;
  otherName?: string;
  email: string;
  phone: string;
  avatar?: string;
  status: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    regNo?: string;
    title?: string;
    gender?: string;
    dateOfBirth?: string;
    maritalStatus?: string;
    employmentStatus?: string;
    address?: string;
    refFirstName?: string;
    refLastName?: string;
    refPhone?: string;
    refAddress?: string;
    institutionName?: string;
    institutionType?: string;
    courseStudied?: string;
    degreeType?: string;
    degreeGrade?: string;
    graduationYear?: string;
    idCard?: string;
    institutionCertificates?: string[];
    programmeId?: number;
    programme?: any;
    entryLevelId?: number;
    level?: any;
    admitted: boolean;
    status: boolean;
  };
}

interface Programme {
  id: number;
  name: string;
  code?: string;
  department?: {
    id: number;
    name: string;
    faculty?: {
      id: number;
      name: string;
    };
  };
}

interface Level {
  id: number;
  name: string;
  description?: string;
}

interface Session {
  id: number;
  name: string;
}

interface Document {
  name: string;
  url: string;
  isPdf: boolean;
}

interface ViewApplicationModalProps {
  applicationId: string;
  isOpen: boolean;
  onClose: () => void;
  onApplicationUpdated?: () => void;
}

export default function ViewApplicationModal({
  applicationId,
  isOpen,
  onClose,
  onApplicationUpdated,
}: ViewApplicationModalProps) {
  const { userData } = useApp();
  const [application, setApplication] = useState<ApplicationData | null>(null);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedProgrammeId, setSelectedProgrammeId] = useState<number | null>(
    null
  );
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmitting, setIsAdmitting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch application details
  useEffect(() => {
    if (isOpen && applicationId) {
      fetchApplicationDetails();
    }
  }, [isOpen, applicationId]);

  // Track changes in programme and level selections
  useEffect(() => {
    if (application) {
      const originalProgrammeId = application.student?.programmeId;
      const originalLevelId = application.student?.entryLevelId;
      const hasChanges =
        selectedProgrammeId !== originalProgrammeId ||
        selectedLevelId !== originalLevelId;
      setHasChanges(hasChanges);
    }
  }, [selectedProgrammeId, selectedLevelId, application]);

  // Fetch programmes and levels
  useEffect(() => {
    if (isOpen) {
      fetchProgrammesLevelsAndSessions();
    }
  }, [isOpen, userData?.institution_id]);

  const fetchApplicationDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/dashboard/applications/${applicationId}`
      );
      if (response.ok) {
        const data = await response.json();
        setApplication(data.application);
        setSelectedProgrammeId(data.application.student?.programmeId || null);
        setSelectedLevelId(data.application.student?.entryLevelId || null);
      } else {
        toast.error("Failed to fetch application details");
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
      toast.error("Failed to fetch application details");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgrammesLevelsAndSessions = async () => {
    try {
      const [programmesResponse, levelsResponse, sessionsResponse] =
        await Promise.all([
          fetch(
            `/api/dashboard/programmes?institutionId=${userData?.institution_id}`
          ),
          fetch(
            `/api/dashboard/levels?institutionId=${userData?.institution_id}`
          ),
          fetch(
            `/api/dashboard/sessions?institutionId=${userData?.institution_id}`
          ),
        ]);

      if (programmesResponse.ok) {
        const programmesData = await programmesResponse.json();
        setProgrammes(programmesData);
      }

      if (levelsResponse.ok) {
        const levelsData = await levelsResponse.json();
        setLevels(levelsData);
      }
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData.sessions);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSaveSelections = async () => {
    if (!selectedProgrammeId || !selectedLevelId) {
      toast.error("Please select both programme and level before saving");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/dashboard/applications/${applicationId}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            programmeId: selectedProgrammeId,
            levelId: selectedLevelId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Programme and level selections saved successfully");
        setHasChanges(false);
        // Refresh application data to reflect changes
        fetchApplicationDetails();
        // Close the modal after successful save
        onClose();
      } else {
        toast.error(data.error || "Failed to save selections");
      }
    } catch (error) {
      console.error("Error saving selections:", error);
      toast.error("Failed to save selections");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdmitApplicant = async () => {
    if (!selectedProgrammeId || !selectedLevelId || !selectedSessionId) {
      toast.error(
        "Please select programme, level, and session before admitting"
      );
      return;
    }

    setIsAdmitting(true);
    try {
      const response = await fetch(
        `/api/dashboard/applications/${applicationId}/admit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            programmeId: selectedProgrammeId,
            levelId: selectedLevelId,
            sessionId: selectedSessionId,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Applicant admitted successfully");
        onApplicationUpdated?.();
        onClose();
      } else {
        toast.error(data.error || "Failed to admit applicant");
      }
    } catch (error) {
      console.error("Error admitting applicant:", error);
      toast.error("Failed to admit applicant");
    } finally {
      setIsAdmitting(false);
    }
  };

  const handleRejectApplicant = async () => {
    setIsRejecting(true);
    try {
      const response = await fetch(
        `/api/dashboard/applications/${applicationId}/reject`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: "Application rejected by administrator",
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Application rejected successfully");
        onApplicationUpdated?.();
        onClose();
      } else {
        toast.error(data.error || "Failed to reject application");
      }
    } catch (error) {
      console.error("Error rejecting applicant:", error);
      toast.error("Failed to reject applicant");
    } finally {
      setIsRejecting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  const renderDocuments = (student: any): Document[] => {
    const documents: Document[] = [];

    if (student.idCard) {
      documents.push({
        name: "Identity Card",
        url: student.idCard,
        isPdf: student.idCard.toLowerCase().includes(".pdf"),
      });
    }

    if (student.institutionCertificates?.length > 0) {
      student.institutionCertificates.forEach((cert: string, index: number) => {
        documents.push({
          name: `Institution Certificate ${index + 1}`,
          url: cert,
          isPdf: cert.toLowerCase().includes(".pdf"),
        });
      });
    }

    return documents;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        size="full"
        className="max-w-7xl max-h-[95vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            View Application Details
          </DialogTitle>
          <DialogDescription>
            Review applicant information and make admission decisions
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading application details...</span>
          </div>
        ) : application ? (
          <div className="space-y-6">
            {/* Header with Avatar and Basic Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={application.avatar}
                      alt={`${application.firstName} ${application.lastName}`}
                    />
                    <AvatarFallback className="text-lg">
                      {application.firstName[0]}
                      {application.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-semibold">
                        {application.firstName} {application.otherName}{" "}
                        {application.lastName}
                      </h3>
                      <Badge
                        variant={getStatusBadgeVariant(application.status)}
                      >
                        {application.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {application.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {application.phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Applied:{" "}
                        {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Programme and Level Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Programme & Level Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Programme
                  </label>
                  <Select
                    value={selectedProgrammeId?.toString()}
                    onValueChange={(value) =>
                      setSelectedProgrammeId(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select programme" />
                    </SelectTrigger>
                    <SelectContent>
                      {programmes.map((programme) => (
                        <SelectItem
                          key={programme.id}
                          value={programme.id.toString()}
                        >
                          {programme.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Entry Level
                  </label>
                  <Select
                    value={selectedLevelId?.toString()}
                    onValueChange={(value) =>
                      setSelectedLevelId(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level.id} value={level.id.toString()}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Session to Admit
                  </label>
                  <Select
                    value={selectedSessionId?.toString()}
                    onValueChange={(value) =>
                      setSelectedSessionId(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((session) => (
                        <SelectItem
                          key={session.id}
                          value={session.id.toString()}
                        >
                          {session.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {application.student && (
              <>
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Gender
                      </label>
                      <p className="mt-1">
                        {application.student.gender || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Date of Birth
                      </label>
                      <p className="mt-1">
                        {application.student.dateOfBirth
                          ? new Date(
                              application.student.dateOfBirth
                            ).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Marital Status
                      </label>
                      <p className="mt-1">
                        {application.student.maritalStatus || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Employment Status
                      </label>
                      <p className="mt-1">
                        {application.student.employmentStatus || "N/A"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Address
                      </label>
                      <p className="mt-1">
                        {application.student.address || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Academic History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Academic History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Institution Name
                      </label>
                      <p className="mt-1">
                        {application.student.institutionName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Institution Type
                      </label>
                      <p className="mt-1">
                        {application.student.institutionType || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Course Studied
                      </label>
                      <p className="mt-1">
                        {application.student.courseStudied || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Degree Type
                      </label>
                      <p className="mt-1">
                        {application.student.degreeType || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Grade
                      </label>
                      <p className="mt-1">
                        {application.student.degreeGrade || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Year of Graduation
                      </label>
                      <p className="mt-1">
                        {application.student.graduationYear || "N/A"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Uploaded Documents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {renderDocuments(application.student).map(
                        (doc, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 text-center"
                          >
                            <div className="mb-2">
                              {doc.isPdf ? (
                                <FileText className="h-8 w-8 mx-auto text-red-500" />
                              ) : (
                                <img
                                  src={doc.url}
                                  alt={doc.name}
                                  className="h-16 w-16 object-cover mx-auto rounded"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    target.nextElementSibling?.classList.remove(
                                      "hidden"
                                    );
                                  }}
                                />
                              )}
                              <FileText className="h-8 w-8 mx-auto text-gray-400 hidden" />
                            </div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => window.open(doc.url, "_blank")}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Failed to load application details
            </p>
          </div>
        )}

        <DialogFooter className="flex items-center gap-3">
          {!selectedProgrammeId || !selectedLevelId || !selectedSessionId ? (
            <p className="text-sm text-red-500 mr-auto">
              Select programme, level, and session to enable actions
            </p>
          ) : null}

          <Button variant="outline" onClick={onClose}>
            Close
          </Button>

          {hasChanges && (
            <Button
              variant="secondary"
              onClick={handleSaveSelections}
              disabled={!selectedProgrammeId || !selectedLevelId || isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Selections
            </Button>
          )}

          {application?.status === "pending" && (
            <>
              <Button
                variant="destructive"
                onClick={handleRejectApplicant}
                disabled={isRejecting}
              >
                {isRejecting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject
              </Button>

              <Button
                onClick={handleAdmitApplicant}
                disabled={
                  !selectedProgrammeId ||
                  !selectedLevelId ||
                  !selectedSessionId ||
                  isAdmitting
                }
              >
                {isAdmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Admit Student
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
