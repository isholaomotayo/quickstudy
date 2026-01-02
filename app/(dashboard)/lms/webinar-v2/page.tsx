"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import MeetingProvider from "@/components/lms/MeetingProvider";

// Dynamically import MeetingProvider to avoid SSR issues with Jitsi
const MeetingProviderClient = dynamic(() => Promise.resolve(MeetingProvider), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Loading webinar...</p>
      </div>
    </div>
  ),
});

function WebinarContent() {
  const searchParams = useSearchParams();
  const roomName = searchParams.get("roomName") || undefined;
  const userInfo = searchParams.get("userInfo") || undefined;
  const courseCode = searchParams.get("courseCode") || undefined;
  const courseName = searchParams.get("courseName") || undefined;
  const provider = searchParams.get("provider") || "googlemeet";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Live Classroom
          </h1>
          <p className="text-muted-foreground">
            {courseName
              ? `${courseCode} - ${courseName}`
              : "Join your live classroom session"}
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border p-6">
          <MeetingProviderClient
            roomName={roomName}
            userInfo={userInfo}
            courseCode={courseCode}
            courseName={courseName}
            preferredProvider={provider}
          />
        </div>
      </div>
    </div>
  );
}

export default function WebinarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading webinar...</p>
          </div>
        </div>
      }
    >
      <WebinarContent />
    </Suspense>
  );
}
