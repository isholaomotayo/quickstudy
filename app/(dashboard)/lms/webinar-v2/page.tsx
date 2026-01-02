import { Suspense } from "react";
import WebinarContentClient from "./webinar-content-client";

// Server Component - reads searchParams
export default async function WebinarPage({
  searchParams,
}: {
  searchParams: {
    roomName?: string;
    userInfo?: string;
    courseCode?: string;
    courseName?: string;
    provider?: string;
  };
}) {
  const roomName = searchParams.roomName;
  const userInfo = searchParams.userInfo;
  const courseCode = searchParams.courseCode;
  const courseName = searchParams.courseName;
  const provider = searchParams.provider || "googlemeet";

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

        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[600px]">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Loading webinar...</p>
              </div>
            </div>
          }
        >
          <WebinarContentClient
            roomName={roomName}
            userInfo={userInfo}
            courseCode={courseCode}
            courseName={courseName}
            provider={provider}
          />
        </Suspense>
      </div>
    </div>
  );
}
