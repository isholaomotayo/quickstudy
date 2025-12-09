const { google } = require("googleapis");
require("dotenv").config();

/**
 * Google Meet Service for creating meeting links
 * Supports both Calendar API integration and direct Meet links
 */
class GoogleMeetService {
  /**
   * Create a Google Calendar event and attach the Meet URL
   * @param {Object} eventDetails - { summary, description, start, end }
   * @param {string} meetUrl - Google Meet URL to attach
   * @returns {Promise<Object>} Calendar event data
   */
  async createCalendarEventWithMeet(eventDetails, meetUrl) {
    if (!this.calendar) {
      throw new Error("Google Calendar API not configured.");
    }
    const { summary, description, start, end } = eventDetails;
    try {
      const event = {
        summary: summary || "Live Classroom Meeting",
        description: (description || "Google Meet link:") + "\n" + meetUrl,
        start: {
          dateTime: start,
          timeZone: "Africa/Lagos",
        },
        end: {
          dateTime: end,
          timeZone: "Africa/Lagos",
        },
        // Optionally, add attendees, reminders, etc.
      };
      const { data } = await this.calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });
      return data;
    } catch (error) {
      console.error("Failed to create calendar event:", error);
      throw new Error("Could not create Google Calendar event.");
    }
  }
  constructor() {
    this.auth = null;
    this.calendar = null;
    // NEW: Add the Meet API client
    this.meet = null;
    this.initializeAuth();
  }

  /**
   * Initialize Google OAuth2 client
   */
  initializeAuth() {
    try {
      this.auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      // Set credentials if available
      if (process.env.GOOGLE_ACCESS_TOKEN && process.env.GOOGLE_REFRESH_TOKEN) {
        this.auth.setCredentials({
          access_token: process.env.GOOGLE_ACCESS_TOKEN,
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        });
      }

      this.calendar = google.calendar({ version: "v3", auth: this.auth });
      // NEW: Initialize the Meet API client
      this.meet = google.meet({ version: "v2", auth: this.auth });
    } catch (error) {
      console.warn("Google Meet service not configured:", error.message);
    }
  }

  /**
   * NEW: Helper function to create an "Open" Google Meet space directly.
   * This bypasses the Workspace default "Trusted" setting.
   * @returns {Promise<string>} The URI for the open Google Meet space.
   */
  async _createOpenMeetSpace() {
    if (!this.meet) {
      throw new Error("Google Meet API not configured.");
    }
    try {
      // FINAL FIX: The client library expects the payload to be nested under a 'resource'
      // key, which contains the 'space' object.
      const { data } = await this.meet.spaces.create({
        requestBody: {
          config: {
            accessType: "OPEN",
          },
        },
      });
      // We return the meetingUri, which is the hangout link.
      return data.meetingUri;
    } catch (error) {
      console.error("Failed to create open Google Meet space:", error);
      throw new Error(
        "Could not create an open Google Meet space via Meet API."
      );
    }
  }

  /**
   * Get OAuth authorization URL for setup
   * @returns {string} Authorization URL
   */
  getAuthUrl() {
    if (!this.auth) {
      throw new Error("OAuth client not initialized");
    }

    // UPDATED: Add the new scope for the Google Meet API
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
      "https://www.googleapis.com/auth/meetings.space.created",
    ];

    return this.auth.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
    });
  }

  /**
   * Exchange authorization code for tokens
   * @param {string} code - Authorization code from OAuth flow
   * @returns {Promise<Object>} Tokens
   */
  async getTokens(code) {
    if (!this.auth) {
      throw new Error("OAuth client not initialized");
    }

    const { tokens } = await this.auth.getToken(code);
    this.auth.setCredentials(tokens);
    return tokens;
  }
}

module.exports = new GoogleMeetService();
