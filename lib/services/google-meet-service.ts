/**
 * Google Meet Service
 * Handles Google Calendar API integration for creating Google Meet rooms
 */

import { google } from "googleapis";

interface CalendarEventOptions {
  summary: string;
  description?: string;
  start: string; // ISO 8601 format
  end: string; // ISO 8601 format
}

interface MeetingResult {
  meetingUrl: string;
  meetingId?: string;
  calendarEventId?: string;
  calendarEventLink?: string;
}

/**
 * Get authenticated Google Calendar client
 */
function getCalendarClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const accessToken = process.env.GOOGLE_ACCESS_TOKEN;

  if (!clientId || !clientSecret) {
    throw new Error("Google Calendar API not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  // Set credentials
  if (refreshToken) {
    oauth2Client.setCredentials({
      refresh_token: refreshToken,
      ...(accessToken && { access_token: accessToken }),
    });
  } else if (accessToken) {
    oauth2Client.setCredentials({
      access_token: accessToken,
    });
  } else {
    throw new Error("Google Calendar API not configured. Missing GOOGLE_REFRESH_TOKEN or GOOGLE_ACCESS_TOKEN");
  }

  return {
    auth: oauth2Client,
    calendar: google.calendar({ version: "v3", auth: oauth2Client }),
  };
}

/**
 * Refresh access token if needed
 */
async function ensureValidToken(auth: any) {
  try {
    // Try to refresh the token
    const { credentials } = await auth.refreshAccessToken();
    auth.setCredentials(credentials);
    return credentials.access_token;
  } catch (error) {
    console.error("Failed to refresh Google access token:", error);
    throw new Error("Failed to refresh Google access token. Please re-authenticate.");
  }
}

/**
 * Create a Google Calendar event with Meet integration
 * This automatically creates a Google Meet link
 */
export async function createCalendarEventWithMeet(
  options: CalendarEventOptions
): Promise<MeetingResult> {
  try {
    const { auth, calendar } = getCalendarClient();

    // Ensure we have a valid token
    await ensureValidToken(auth);

    // Create calendar event with Meet integration
    const event = {
      summary: options.summary,
      description: options.description || "",
      start: {
        dateTime: options.start,
        timeZone: "UTC",
      },
      end: {
        dateTime: options.end,
        timeZone: "UTC",
      },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      requestBody: event,
    });

    const meetingUrl = response.data.hangoutLink;
    const meetingId = response.data.conferenceData?.entryPoints?.[0]?.uri?.replace("https://meet.google.com/", "");
    const calendarEventId = response.data.id || undefined;
    const calendarEventLink = response.data.htmlLink || undefined;

    if (!meetingUrl) {
      throw new Error("Failed to create Google Meet link. No hangoutLink in response.");
    }

    return {
      meetingUrl,
      meetingId,
      calendarEventId,
      calendarEventLink,
    };
  } catch (error: any) {
    console.error("Error creating Google Calendar event with Meet:", error);
    
    if (error.message?.includes("not configured")) {
      throw error;
    }
    
    if (error.code === 401 || error.code === 403) {
      throw new Error("Google Calendar API authentication failed. Please check your credentials and re-authenticate.");
    }
    
    throw new Error(`Failed to create Google Meet: ${error.message || "Unknown error"}`);
  }
}

/**
 * Create a simple Google Meet space (without calendar event)
 * This creates a quick meeting link
 */
export async function createOpenMeetSpace(): Promise<string> {
  try {
    const { auth, calendar } = getCalendarClient();

    // Ensure we have a valid token
    await ensureValidToken(auth);

    // Create a temporary calendar event just to get a Meet link
    const now = new Date();
    const start = new Date(now.getTime());
    const end = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

    const result = await createCalendarEventWithMeet({
      summary: "Quick Meeting",
      start: start.toISOString(),
      end: end.toISOString(),
    });

    return result.meetingUrl;
  } catch (error: any) {
    console.error("Error creating open Meet space:", error);
    throw error;
  }
}

/**
 * Get OAuth authorization URL
 */
export function getAuthUrl(): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google Calendar API not configured. Missing required environment variables.");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent", // Force consent to get refresh token
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expiry_date: number;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Google Calendar API not configured. Missing required environment variables.");
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error("Failed to get access and refresh tokens from Google");
    }

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date || Date.now() + 3600 * 1000, // Default 1 hour
    };
  } catch (error: any) {
    console.error("Error exchanging code for tokens:", error);
    throw new Error(`Failed to exchange authorization code: ${error.message || "Unknown error"}`);
  }
}

