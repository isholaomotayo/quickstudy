"use client";

import { useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function NotificationsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Notifications page error:", error);
  }, [error]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mt-2">
          We encountered an error while loading your notifications.
        </p>
      </div>

      {/* Error Card */}
      <GlassCard className="text-center py-12">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Failed to load notifications
            </h2>
            <p className="text-muted-foreground">
              {error.message || "An unexpected error occurred while fetching your notifications."}
            </p>
            {error.digest && (
              <p className="text-xs text-gray-400 font-mono">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            
            <Button variant="outline" asChild className="gap-2">
              <Link href="/">
                <Home className="w-4 h-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Help Text */}
      <GlassCard>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Need help?</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>If this problem persists, you can try the following:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Check your internet connection</li>
              <li>Clear your browser cache and cookies</li>
              <li>Try refreshing the page in a few minutes</li>
              <li>Contact support if the issue continues</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}