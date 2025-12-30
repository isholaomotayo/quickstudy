import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  createCalendarEventWithMeet,
  createOpenMeetSpace,
  getAuthUrl,
  exchangeCodeForTokens,
} from "@/lib/services/google-meet-service";
import { authenticateUser } from "@/lib/api-auth";

/**
 * GET /api/google-meet
 * Handles Google Meet operations:
 * - action=create-meeting: Create or retrieve a meeting for a course
 * - action=auth-url: Get OAuth authorization URL
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    // OAuth flow - no auth required
    if (action === "auth-url") {
      try {
        const authUrl = getAuthUrl();
        return NextResponse.json({
          success: true,
          authUrl,
        });
      } catch (error: any) {
        return NextResponse.json(
          {
            success: false,
            error: error.message || "Failed to generate auth URL",
          },
          { status: 500 }
        );
      }
    }

    // OAuth callback - no auth required
    if (action === "callback") {
      const code = searchParams.get("code");
      if (!code) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing authorization code",
          },
          { status: 400 }
        );
      }

      try {
        const tokens = await exchangeCodeForTokens(code);
        return NextResponse.json({
          success: true,
          message: "Authorization successful. Add these to your .env file:",
          tokens: {
            GOOGLE_ACCESS_TOKEN: tokens.access_token,
            GOOGLE_REFRESH_TOKEN: tokens.refresh_token,
          },
        });
      } catch (error: any) {
        return NextResponse.json(
          {
            success: false,
            error: error.message || "Failed to exchange authorization code",
          },
          { status: 500 }
        );
      }
    }

    // Create meeting - requires authentication
    if (action === "create-meeting") {
      const authResult = await authenticateUser();

      if (!authResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: authResult.error || "Authentication required",
          },
          { status: authResult.statusCode || 401 }
        );
      }

      const courseId = searchParams.get("courseId");
      const courseCode = searchParams.get("courseCode") || "CLASSROOM";
      const courseName = searchParams.get("courseName") || "Live Classroom";
      const usePersistent = searchParams.get("usePersistent") === "true";

      // If courseId is provided, check for existing persistent meeting
      if (courseId && usePersistent) {
        try {
          const existingMeeting = await prisma.course_meetings.findFirst({
            where: {
              course_id: parseInt(courseId),
              is_persistent: true,
              is_active: true,
              OR: [
                { expires_at: null },
                { expires_at: { gt: new Date() } },
              ],
            },
            orderBy: {
              created_at: "desc",
            },
          });

          if (existingMeeting && existingMeeting.meeting_url) {
            return NextResponse.json({
              success: true,
              meetingUrl: existingMeeting.meeting_url,
              cached: true,
            });
          }
        } catch (error) {
          console.error("Error checking for existing meeting:", error);
          // Continue to create new meeting if check fails
        }
      }

      // Create new meeting
      try {
        const now = new Date();
        const start = now.toISOString();
        // For persistent meetings, set end date far in the future (1 year)
        const end = usePersistent
          ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour for temporary

        const meetingResult = await createCalendarEventWithMeet({
          summary: courseName,
          description: `Course: ${courseCode} - ${courseName}`,
          start,
          end,
        });

        // Store meeting in database if courseId is provided
        if (courseId) {
          try {
            await prisma.course_meetings.create({
              data: {
                course_id: parseInt(courseId),
                course_code: courseCode,
                meeting_provider: "googlemeet",
                meeting_url: meetingResult.meetingUrl,
                meeting_id: meetingResult.meetingId || null,
                meeting_data: JSON.stringify({
                  calendarEventId: meetingResult.calendarEventId,
                  calendarEventLink: meetingResult.calendarEventLink,
                  courseName,
                  createdAt: new Date().toISOString(),
                }),
                is_active: true,
                is_persistent: usePersistent,
                expires_at: usePersistent ? null : new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours for temporary
              },
            });
          } catch (dbError) {
            console.error("Error storing meeting in database:", dbError);
            // Continue even if database storage fails
          }
        }

        return NextResponse.json({
          success: true,
          meetingUrl: meetingResult.meetingUrl,
          cached: false,
        });
      } catch (error: any) {
        console.error("Error creating Google Meet:", error);
        return NextResponse.json(
          {
            success: false,
            error: error.message || "Failed to create Google Meet room",
          },
          { status: 500 }
        );
      }
    }

    // Default: create a simple meeting without course association
    try {
      const authResult = await authenticateUser();

      if (!authResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: authResult.error || "Authentication required",
          },
          { status: authResult.statusCode || 401 }
        );
      }

      const meetingUrl = await createOpenMeetSpace();

      return NextResponse.json({
        success: true,
        meetingUrl,
        cached: false,
      });
    } catch (error: any) {
      console.error("Error creating open Meet space:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || "Failed to create Google Meet room",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Unexpected error in Google Meet API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

