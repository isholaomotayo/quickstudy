"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Download,
  Printer,
  FileText,
  Share2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface ExportResultsProps {
  onExport: (format: "pdf" | "print") => void;
  isExporting: boolean;
}

export function ExportResults({ onExport, isExporting }: ExportResultsProps) {
  const [exportStatus, setExportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  const handleExport = async (format: "pdf" | "print") => {
    try {
      setExportStatus("idle");
      await onExport(format);
      setExportStatus("success");

      // Reset status after 3 seconds
      setTimeout(() => setExportStatus("idle"), 3000);
    } catch (error) {
      setExportStatus("error");
      setTimeout(() => setExportStatus("idle"), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Academic Results",
          text: "Check out my academic performance!",
          url: window.location.href,
        });
      } catch (error) {
        // Error sharing - user can still copy link manually
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setExportStatus("success");
      setTimeout(() => setExportStatus("idle"), 3000);
    }
  };

  return (
    <Card className="bg-card border border-border">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-foreground">
          <FileText className="h-5 w-5" />
          <span>Export & Share</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </Button>

          <Button
            onClick={handlePrint}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </Button>

          <Button
            onClick={handleShare}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>

        {/* Status Messages */}
        {exportStatus === "success" && (
          <div className="flex items-center space-x-2 mt-3 text-emerald-600 dark:text-emerald-300">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Export completed successfully!</span>
          </div>
        )}

        {exportStatus === "error" && (
          <div className="flex items-center space-x-2 mt-3 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Export failed. Please try again.</span>
          </div>
        )}

        {isExporting && (
          <div className="flex items-center space-x-2 mt-3 text-primary">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-muted/40 border-t-primary"></div>
            <span className="text-sm">Generating export...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
