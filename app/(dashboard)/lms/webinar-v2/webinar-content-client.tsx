"use client";

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

export default function WebinarContentClient({
  roomName,
  userInfo,
  courseCode,
  courseName,
  provider,
}: {
  roomName?: string;
  userInfo?: string;
  courseCode?: string;
  courseName?: string;
  provider?: string;
}) {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <MeetingProviderClient
        roomName={roomName}
        userInfo={userInfo}
        courseCode={courseCode}
        courseName={courseName}
        preferredProvider={provider || "googlemeet"}
      />
    </div>
  );
}

