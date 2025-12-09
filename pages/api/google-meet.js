const googleMeetService = require("../../backend/services/googleMeetService");
const CourseMeeting = require("../../backend/models/CourseMeeting");

/**
 * API endpoint for Google Meet operations
 * GET /api/google-meet?action=create-meeting&courseCode=CS101&courseName=Introduction to Computer Science
 * POST /api/google-meet - Create or retrieve meeting via Calendar API
 */
export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { action, courseCode, courseName, courseId, usePersistent } =
        req.query;

      if (action === "create-meeting") {
        if (!courseCode) {
          return res.status(400).json({
            error: "Course code is required",
            fallbackToJitsi: true,
          });
        }

        try {
          // Check if we have an existing active meeting for this course
          if (courseId) {
            console.log("Checking for existing meeting:", courseId);
            let existingMeeting = null;
            try {
              existingMeeting = await CourseMeeting.findByProvider(
                courseId,
                "googlemeet"
              );
            } catch (err) {
              if (
                err.name === "CustomError" &&
                err.message === "EmptyResponse"
              ) {
                // No meeting found, continue to create new
                existingMeeting = null;
              } else {
                throw err;
              }
            }
            if (existingMeeting && existingMeeting.isActive()) {
              return res.status(200).json({
                success: true,
                meetingUrl: existingMeeting.get("meeting_url"),
                courseCode,
                courseName,
                cached: true,
              });
            }
          }

          const courseData = {
            code: courseCode,
            name: courseName || courseCode,
          };

          const options = {
            usePersistent: usePersistent === "true",
          };

          // Step 1: Create Meet space
          const meetingUrl = await googleMeetService._createOpenMeetSpace();

          // Step 2: Create Calendar event and attach Meet URL
          const now = new Date();
          const start = now.toISOString();
          const end = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
          let calendarEvent = null;
          try {
            calendarEvent = await googleMeetService.createCalendarEventWithMeet(
              {
                summary: courseName || courseCode,
                description: `Course: ${courseCode} - ${courseName}`,
                start,
                end,
              },
              meetingUrl
            );
          } catch (calError) {
            console.warn("Calendar event creation failed:", calError);
          }

          // Store the meeting in database if courseId is provided
          if (courseId && meetingUrl) {
            try {
              await CourseMeeting.forge({
                course_id: courseId,
                course_code: courseCode,
                meeting_provider: "googlemeet",
                meeting_url: meetingUrl,
                is_active: true,
                is_persistent: usePersistent === "true",
                expires_at:
                  usePersistent === "true"
                    ? null
                    : new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                meeting_data: {
                  courseName,
                  createdAt: new Date().toISOString(),
                  calendarEventId: calendarEvent?.id,
                  calendarEventLink: calendarEvent?.htmlLink,
                },
              }).save();
            } catch (dbError) {
              console.warn("Failed to save meeting to database:", dbError);
              // Continue anyway, meeting was created successfully
            }
          }

          return res.status(200).json({
            success: true,
            meetingUrl,
            courseCode,
            courseName,
            calendarEventId: calendarEvent?.id,
            calendarEventLink: calendarEvent?.htmlLink,
            cached: false,
          });
        } catch (error) {
          console.error("Google Meet creation failed:", error);
          return res.status(500).json({
            error: "Failed to create Google Meet room",
            message: error.message,
            fallbackToJitsi: true,
          });
        }
      }

      if (action === "auth-url") {
        try {
          const authUrl = googleMeetService.getAuthUrl();
          return res.status(200).json({ authUrl });
        } catch (error) {
          return res.status(500).json({
            error: "Failed to generate auth URL",
            message: "Google Calendar API not configured",
          });
        }
      }

      return res.status(400).json({ error: "Invalid action" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Google Meet API error:", error);
    return res.status(500).json({
      error: "Failed to process meeting request",
      message: error.message,
      fallbackToJitsi: true,
    });
  }
}
