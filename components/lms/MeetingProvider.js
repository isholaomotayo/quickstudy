import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import GoogleMeetEmbed from "./GoogleMeetEmbed";

// Dynamically import Jitsi to avoid SSR issues
const JaaSMeeting = dynamic(
  () => import("@jitsi/react-sdk").then(({ JaaSMeeting }) => JaaSMeeting),
  { ssr: false }
);

/**
 * Meeting Provider Component
 * Supports both Google Meet and Jitsi as fallback
 */
export default function MeetingProvider({
  roomName = "Live Classroom",
  userInfo = "Student",
  courseCode,
  courseName,
  preferredProvider = "googlemeet", // 'googlemeet' or 'jitsi'
}) {
  const [meetingProvider, setMeetingProvider] = useState(preferredProvider);
  const [meetingUrl, setMeetingUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchParams = useSearchParams();
  const userInfoQ = searchParams.get("userInfo");
  const roomNameQ = searchParams.get("roomName");
  const providerQ = searchParams.get("provider");
  const courseId = searchParams.get("courseId");

  // Override provider if specified in URL
  useEffect(() => {
    if (providerQ && ["googlemeet", "jitsi"].includes(providerQ)) {
      setMeetingProvider(providerQ);
    }
  }, [providerQ]);

  // Generate Google Meet link
  const createGoogleMeetLink = async () => {
    try {
      const params = new URLSearchParams({
        action: "create-meeting",
        courseCode: courseCode || "CLASSROOM",
        courseId: courseId,
        courseName: courseName || roomNameQ || roomName,
        usePersistent: "true", // Use persistent rooms for courses
      });

      const response = await fetch(`/api/google-meet?${params}`);
      const data = await response.json();

      if (data.success) {
        return {
          url: data.meetingUrl,
          cached: data.cached,
        };
      } else {
        throw new Error(data.error || "Failed to create Google Meet room");
      }
    } catch (error) {
      console.error("Google Meet creation failed:", error);
      if (error.message.includes("API not configured")) {
        throw new Error(
          "Google Calendar API not configured. Please set up Google credentials."
        );
      }
      throw error;
    }
  };

  // Initialize meeting
  useEffect(() => {
    const initializeMeeting = async () => {
      setLoading(true);
      setError(null);

      // Only create room if required params are available
      if (!roomNameQ || !providerQ) {
        setLoading(false);
        setError(
          "Meeting parameters missing. Please provide room name and provider."
        );
        return;
      }

      try {
        if (meetingProvider === "googlemeet") {
          const meetingData = await createGoogleMeetLink();
          setMeetingUrl(meetingData.url);
          if (meetingData.cached) {
            toast.success("Using existing Google Meet room");
          } else {
            toast.success("Google Meet room created successfully");
          }
        }
      } catch (err) {
        console.warn(
          "Failed to create Google Meet, falling back to Jitsi:",
          err
        );
        setMeetingProvider("jitsi");
        setError(
          `Google Meet failed: ${err.message}. Using Jitsi as fallback.`
        );
        toast.error("Google Meet unavailable, switching to Jitsi");
      } finally {
        setLoading(false);
      }
    };

    initializeMeeting();
  }, [roomNameQ, providerQ, meetingProvider, courseCode, courseName]);

  const switchProvider = (provider) => {
    setMeetingProvider(provider);
    setMeetingUrl(null);
    setError(null);
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "400px" }}
      >
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="sr-only">Loading meeting...</span>
          </div>
          <p>Setting up your live classroom...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Provider Selection */}
      <div className="mb-3 d-flex justify-content-center">
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn btn-sm ${
              meetingProvider === "googlemeet"
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
            onClick={() => switchProvider("googlemeet")}
          >
            Google Meet
          </button>
          <button
            type="button"
            className={`btn btn-sm ${
              meetingProvider === "jitsi"
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
            onClick={() => switchProvider("jitsi")}
          >
            Jitsi (Fallback)
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning text-center mb-3">
          <small>{error}</small>
        </div>
      )}

      {/* Google Meet Integration (embed) */}
      {meetingProvider === "googlemeet" && meetingUrl && (
        <GoogleMeetEmbed meetingUrl={meetingUrl} />
      )}

      {/* Jitsi Integration */}
      {meetingProvider === "jitsi" && (
        <JaaSMeeting
          roomName={`vpaas-magic-cookie-f23cdcd0b28640c69d79e5d090885939/${
            roomNameQ || roomName
          }`}
          configOverwrite={{
            startWithAudioMuted: true,
            disableModeratorIndicator: true,
            startScreenSharing: true,
            enableEmailInStats: false,
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          }}
          userInfo={{
            displayName: userInfoQ ?? userInfo,
          }}
          onApiReady={(externalApi) => {
            // Custom event listeners can be added here
            console.log("Jitsi API ready");
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = "600px";
            iframeRef.style.width = "100%";
          }}
        />
      )}
    </div>
  );
}
