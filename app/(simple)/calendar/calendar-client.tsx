"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Download,
  Eye,
  FileText,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ParsedCalendarView } from "@/components/calendar/ParsedCalendarView";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GlassFileUpload,
  type GlassFileUploadRef,
} from "@/components/ui/glass-file-upload";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/AppContext";
// PDF parsing is now handled directly in the component
import { usePDFJS } from "../../../hooks/usePDFJS";

// Text extraction function (no LLM processing)
async function extractTextFromPDF(file: File): Promise<any> {
  try {
    // Client-side PDF parsing started

    // Check if file is PDF
    if (!file.type.includes("pdf")) {
      return {
        success: false,
        error: "File must be a PDF",
        input_type: "invalid",
      };
    }

    // Import pdfjs-dist using webpack.mjs which handles worker setup automatically
    const pdfjsLib = await import("pdfjs-dist/webpack.mjs");

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Load PDF document (worker is automatically configured by webpack.mjs)
    const loadingTask = pdfjsLib.getDocument({
      data: uint8Array,
    });

    const pdf = await loadingTask.promise;

    // Extract text from all pages
    let text = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        text += pageText + "\n";
      } catch (pageError) {
        // Continue with other pages
      }
    }

    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: "No text content extracted from PDF",
        input_type: "pdf",
        parsing_method: "pdfjs-dist",
      };
    }

    // Text extraction completed - return just the text
    return {
      success: true,
      text: text,
      extracted_at: new Date().toISOString(),
      parsing_method: "pdfjs-dist-webpack",
      input_type: "pdf",
      text_length: text.length,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      input_type: "pdf",
      parsing_method: "pdfjs-dist",
    };
  }
}

interface Institution {
  id: number;
  name: string;
  school_calendar?: string;
  calendar_data?: {
    academic_year?: string;
    semesters?: Array<any>;
    events?: Array<any>;
    terms?: Array<any>;
    holidays?: Array<any>;
    exam_periods?: Array<any>;
    registration_periods?: Array<any>;
    raw_text?: string;
    parsed_at?: string;
  };
}

interface CalendarData {
  institution: Institution;
}

export function CalendarClient() {
  const router = useRouter();
  const { userData, isLoading: userLoading } = useUser();
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [parsedCalendarData, setParsedCalendarData] = useState<any>(null);
  const [parsingStatus, setParsingStatus] = useState<
    "idle" | "parsing" | "success" | "error"
  >("idle");
  const [previewMode, setPreviewMode] = useState<
    "pdf" | "fullscreen" | "parsed"
  >("pdf");
  const [deleting, setDeleting] = useState(false);
  const fileUploadRef = useRef<GlassFileUploadRef>(null);

  // Check if user has upload permissions
  const canUpload =
    userData && ["ADMIN", "SUPERADMIN", "STAFF"].includes(userData.role);

  // Use PDF.js hook for better handling
  const pdfjs = usePDFJS(async (pdfjsLib) => {
    // PDF.js loaded successfully
  });

  // Handle file selection and immediate text extraction (no LLM yet)
  const handleFilesChange = async (files: any[]) => {
    setSelectedFiles(files);

    // Reset parsing state
    setParsedCalendarData(null);
    setParsingStatus("idle");

    if (files.length > 0) {
      const selectedFile = files[0].file;

      // Only extract text if it's a PDF and PDF.js is loaded
      if (selectedFile.type.includes("pdf") && pdfjs) {
        setParsingStatus("parsing");
        toast.loading("Extracting text from PDF...", { id: "parse-pdf" });

        try {
          const extractResult = await extractTextFromPDF(selectedFile);

          if (extractResult.success && extractResult.text) {
            // Store the extracted text for later LLM processing
            setParsedCalendarData({
              raw_text: extractResult.text,
              extracted_at: new Date().toISOString(),
              file_name: selectedFile.name,
              text_length: extractResult.text.length,
            });
            setParsingStatus("success");
            toast.success(
              "PDF text extracted successfully! Ready for upload.",
              { id: "parse-pdf" }
            );
          } else {
            setParsingStatus("error");
            toast.error("Failed to extract text from PDF", { id: "parse-pdf" });
          }
        } catch (error) {
          setParsingStatus("error");
          toast.error("Error extracting text from PDF", { id: "parse-pdf" });
        }
      } else if (selectedFile.type.includes("pdf") && !pdfjs) {
        setParsingStatus("error");
        toast.error("PDF.js not loaded yet", { id: "parse-pdf" });
      }
    }
  };

  // Redirect to login if not authenticated (must be in useEffect to avoid render-time updates)
  useEffect(() => {
    if (!userLoading && !userData) {
      router.push("/signin");
    }
  }, [userLoading, userData, router]);

  useEffect(() => {
    if (!userLoading && userData) {
      fetchData();
    }
  }, [userLoading, userData]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userData) {
        router.push("/signin");
        return;
      }

      const response = await fetch("/api/institution/params", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userData.institution_id }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch institution data");
      }

      const institution = await response.json();
      setData({ institution });

      // Set initial preview mode to parsed if calendar data is available
      if (institution.calendar_data && institution.school_calendar) {
        setPreviewMode("parsed");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load calendar data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !userData) return;

    // Start the upload simulation
    if (fileUploadRef.current?.startUpload) {
      fileUploadRef.current.startUpload();
    }

    setUploading(true);

    try {
      const selectedFile = selectedFiles[0].file; // Access the actual File object

      // Step 1: Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", "ilearn");

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/emergingplatforms/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!cloudinaryResponse.ok) {
        const errorText = await cloudinaryResponse.text();
        console.error(
          "Cloudinary upload error:",
          cloudinaryResponse.status,
          errorText
        );
        throw new Error(
          `Failed to upload file to cloud storage: ${cloudinaryResponse.status} ${cloudinaryResponse.statusText}`
        );
      }

      const { secure_url } = await cloudinaryResponse.json();

      // Process the extracted text with LLM when user uploads
      let calendarData: any = null;

      if (parsedCalendarData && parsedCalendarData.raw_text) {
        toast.loading("Structuring calendar data with AI...", {
          id: "llm-structure",
        });

        // Fire and forget - don't wait for response
        fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || process.env.API_URL
          }/api/calendar/structure`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              rawText: parsedCalendarData.raw_text,
              institutionId: userData.institution_id,
            }),
          }
        )
          .then(() => {
            toast.success("Calendar structured and saved successfully!", {
              id: "llm-structure",
            });
          })
          .catch(() => {
            toast.error("Failed to structure calendar with AI", {
              id: "llm-structure",
            });
          });
      }

      // Step 3: Update institution with calendar URL (structured data already saved)
      const updatePayload: any = {
        school_calendar: secure_url,
      };

      const updateResponse = await fetch(
        `/api/institution/${userData.institution_id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to update calendar URL");
      }

      const successMessage =
        calendarData && calendarData.semesters
          ? `School calendar uploaded successfully! Parsed ${
              calendarData.semesters.length
            } semesters with ${calendarData.semesters.reduce(
              (total, semester) => total + (semester.events?.length || 0),
              0
            )} events.`
          : "School calendar uploaded successfully! (PDF only - AI structuring failed)";

      toast.success(successMessage);
      setUploadDialog(false);
      setSelectedFiles([]);

      // Refresh data to show new calendar
      await fetchData();
    } catch (err) {
      toast.error("Failed to upload calendar. Please try again.");
      toast.dismiss("parse-calendar");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    if (data?.institution.school_calendar) {
      const link = document.createElement("a");
      link.href = data.institution.school_calendar;
      link.download = "school-calendar.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started");
    }
  };

  const handleDelete = async () => {
    if (!userData) return;

    setDeleting(true);

    try {
      const response = await fetch(
        `/api/institution/${userData.institution_id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            school_calendar: null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove calendar");
      }

      toast.success("School calendar removed successfully");
      setDeleteDialog(false);
      await fetchData();
    } catch (err) {
      toast.error("Failed to remove calendar. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  // Show loading if user authentication is still being checked or if not authenticated
  if (userLoading || !userData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-96 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-96 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full border border-border bg-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Loading Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {error || "Failed to load calendar data"}
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={fetchData}>Try Again</Button>
              <Button variant="outline" onClick={() => router.push("/")}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                School Calendar
              </h1>
            </div>
            {canUpload && (
              <div className="flex items-center gap-2">
                {data.institution.school_calendar && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteDialog(true)}
                    className="text-destructive border border-destructive/40 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button onClick={() => setUploadDialog(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  {data.institution.school_calendar
                    ? "Update Calendar"
                    : "Upload Calendar"}
                </Button>
              </div>
            )}
          </div>

          {/* Institution and Status Info */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-muted-foreground">
                Academic calendar for <strong>{data.institution.name}</strong>
              </p>
              {data.institution.school_calendar && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-400/50"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Calendar Available
                  </Badge>
                  {data.institution.calendar_data && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border border-primary/40"
                  >
                      <Calendar className="h-3 w-3 mr-1" />
                      Smart Calendar
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            {data.institution.school_calendar && (
              <div className="flex items-center gap-2">
                <Button onClick={handleDownload} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={() =>
                    window.open(data.institution.school_calendar, "_blank")
                  }
                  variant="outline"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
            )}
          </div>

          {canUpload && (
            <div className="pt-2 border-t border-border/60">
              <p className="text-xs text-muted-foreground">
                As a {userData.role.toLowerCase()}, you can upload and manage
                the school calendar.
              </p>
            </div>
          )}
        </div>

        {/* Main calendar area - full width */}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {data.institution.calendar_data
                ? "Smart Calendar"
                : "Calendar Document"}
            </CardTitle>
            {data.institution.school_calendar && (
              <CardAction>
                <div className="flex items-center gap-2">
                  {data.institution.calendar_data && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPreviewMode(previewMode === "pdf" ? "parsed" : "pdf")
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {previewMode === "parsed" ? "PDF View" : "Smart View"}
                    </Button>
                  )}
                </div>
              </CardAction>
            )}
          </CardHeader>
          <CardContent>
            {data.institution.school_calendar ? (
              <>
                {/* Show parsed calendar view when available and in parsed mode */}
                {data.institution.calendar_data && previewMode === "parsed" ? (
                  <ParsedCalendarView
                    calendarData={data.institution.calendar_data}
                    institutionName={data.institution.name}
                  />
                ) : (
                  /* Show PDF view when no parsed data or in PDF mode */
                  <div
                    className={`bg-muted/30 border border-border/60 rounded-lg overflow-hidden ${
                      previewMode === "fullscreen"
                        ? "h-screen"
                        : "aspect-[210/297] h-auto"
                    }`}
                  >
                    <iframe
                      src={`${data.institution.school_calendar}#toolbar=0&navpanes=0`}
                      className="w-full h-full border-0"
                      title="School Calendar"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-[210/297] bg-muted/30 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">
                    No calendar uploaded
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    {canUpload
                      ? "Upload a PDF calendar to get started"
                      : "Contact your administrator to upload the calendar"}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* No Calendar Alert - shown only when no calendar exists */}
        {!data.institution.school_calendar && (
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                No Calendar Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No calendar is currently available.
                  {canUpload && " Upload one using the button above."}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload School Calendar
            </DialogTitle>
            <DialogDescription>
              Select a PDF file to upload as the school calendar. This will
              replace the current calendar if one exists.
            </DialogDescription>
          </DialogHeader>

          <GlassFileUpload
            ref={fileUploadRef}
            onFilesChange={handleFilesChange}
            maxFiles={1}
            maxSize={10 * 1024 * 1024} // 10MB
            acceptedTypes={["application/pdf"]}
            multiple={false}
            showPreview={false}
            className="w-full"
          />

          {/* PDF.js Loading Status */}
          {!pdfjs && (
            <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-400/50 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
              <span className="text-sm text-amber-700 dark:text-amber-300">
                Loading PDF.js library...
              </span>
            </div>
          )}

          {/* Parsing Status Indicator */}
          {parsingStatus === "parsing" && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/40 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-primary">
                Parsing PDF calendar...
              </span>
            </div>
          )}

          {parsingStatus === "success" && parsedCalendarData && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-400/50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                <span className="text-sm text-emerald-700 dark:text-emerald-300">
                  PDF text extracted successfully! Ready for upload and AI
                  structuring.
                </span>
              </div>
            </div>
          )}

          {parsingStatus === "error" && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/40 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">
                PDF parsed but LLM structuring failed. Please check your
                OpenRouter API key configuration.
              </span>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialog(false);
                setSelectedFiles([]);
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={
                selectedFiles.length === 0 ||
                uploading ||
                parsingStatus === "parsing"
              }
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Calendar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-lg bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Remove School Calendar
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently remove the school calendar?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {data?.institution.school_calendar && (
            <div className="bg-destructive/10 border border-destructive/40 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className=" h-10 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-destructive">
                    Current Calendar
                  </p>
                  <p className="text-xs text-destructive ">
                    {data.institution.name} Academic Calendar
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-amber-500/10 border border-amber-400/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Warning</p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Students and staff will no longer be able to access the school
                  calendar until a new one is uploaded.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Calendar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
