"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  MessageSquare,
  WifiOff,
  ServerCrash
} from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ForumError({ error, reset }: ErrorPageProps) {
  const router = useRouter();
  useEffect(() => {
    // Log the error to monitoring service
    console.error("Forum error:", error);
  }, [error]);

  const getErrorDetails = () => {
    const message = error.message.toLowerCase();
    
    if (message.includes("network") || message.includes("fetch")) {
      return {
        icon: WifiOff,
        title: "Connection Problem",
        description: "We're having trouble connecting to our servers. Please check your internet connection and try again.",
        color: "text-blue-600"
      };
    }
    
    if (message.includes("server") || message.includes("500")) {
      return {
        icon: ServerCrash,
        title: "Server Error",
        description: "Our servers are experiencing issues. Our team has been notified and is working to fix the problem.",
        color: "text-red-600"
      };
    }
    
    if (message.includes("unauthorized") || message.includes("403")) {
      return {
        icon: AlertTriangle,
        title: "Access Denied",
        description: "You don't have permission to access this forum. Please make sure you're logged in with the correct account.",
        color: "text-orange-600"
      };
    }
    
    return {
      icon: AlertTriangle,
      title: "Something went wrong",
      description: "We encountered an unexpected error while loading the forum. This could be a temporary issue.",
      color: "text-red-600"
    };
  };

  const errorDetails = getErrorDetails();
  const IconComponent = errorDetails.icon;

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <GlassCard className="max-w-md w-full p-8 text-center">
        <div className="space-y-6">
          {/* Error Icon */}
          <div className={`w-16 h-16 mx-auto ${errorDetails.color} bg-gradient-to-br from-red-50 to-orange-50 rounded-full flex items-center justify-center`}>
            <IconComponent className="w-8 h-8" />
          </div>

          {/* Error Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {errorDetails.title}
            </h1>
            <p className="text-gray-600 leading-relaxed">
              {errorDetails.description}
            </p>
          </div>

          {/* Error Details (Development) */}
          {process.env.NODE_ENV === "development" && (
            <details className="text-left bg-gray-50 rounded-lg p-4">
              <summary className="font-medium text-gray-700 cursor-pointer mb-2">
                Technical Details
              </summary>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap break-words">
                {error.message}
                {error.digest && `\nError ID: ${error.digest}`}
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={reset}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="flex-1 bg-white/70 border-white/30"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.refresh()}
                className="flex-1 bg-white/70 border-white/30"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
            </div>
          </div>

          {/* Help Text */}
          <div className="text-sm text-gray-500">
            <p>If the problem persists, please contact support or try accessing the forum from a different device.</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}