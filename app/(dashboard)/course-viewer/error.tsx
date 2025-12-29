"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CourseViewerError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Course viewer error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-border bg-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-xl font-semibold text-foreground">
            Something went wrong
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            We encountered an error while loading the course content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/30 p-3 border border-border/60">
            <p className="text-sm text-muted-foreground">
              {error.message || "An unexpected error occurred"}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={reset} className="w-full" variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
