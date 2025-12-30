"use client";

import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CgpaErrorProps {
  error: string | Error;
}

export function CgpaError({ error }: CgpaErrorProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <Card className="border border-border bg-card">
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="text-lg font-medium text-foreground">
            Error Loading CGPA Data
          </h3>
          <p className="text-sm text-destructive">{errorMessage}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            Refresh Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


