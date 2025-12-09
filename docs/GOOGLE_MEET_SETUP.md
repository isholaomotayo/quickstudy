# Google Meet Integration Setup

This guide walks you through setting up Google Meet integration for your LMS.

## Why This Setup is Required

Unlike Jitsi, Google Meet requires **actual meeting rooms to be created** through the Google Calendar API. You cannot simply generate arbitrary meeting URLs - each meeting must be created through Google's servers first.

## Setup Steps

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the **Google Calendar API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure the consent screen if prompted
4. Choose "Web application"
5. Add authorized redirect URIs:
   ```
   http://localhost:8080/api/google-auth
   https://yourdomain.com/api/google-auth
   ```
6. Save and note down:
   - **Client ID**
   - **Client Secret**

### 3. Environment Configuration

Add these to your `.env` file:

```env
# Google Meet Integration
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8080/api/google-auth
GOOGLE_WORKSPACE_DOMAIN=yourdomain.edu
```

### 4. Get Access Tokens

You'll need to get access and refresh tokens:

1. Visit: `/api/google-meet?action=auth-url`
2. Follow the OAuth flow
3. Add the returned tokens to your `.env`:
   ```env
   GOOGLE_ACCESS_TOKEN=your_access_token
   GOOGLE_REFRESH_TOKEN=your_refresh_token
   ```

## How It Works

### Meeting Creation Process

1. **Course Page Load**: User clicks "Google Meet Classroom"
2. **API Call**: Frontend calls `/api/google-meet?action=create-meeting`
3. **Calendar Event**: Server creates a Google Calendar event with Meet integration
4. **Meeting URL**: Google returns an actual Meet URL (e.g., `https://meet.google.com/abc-def-ghi`)
5. **Database Storage**: Meeting is stored for reuse
6. **User Join**: Users can now join the real Google Meet room

### Meeting Types

- **Persistent Meetings**: Long-lasting rooms for courses (up to 1 year)
- **Temporary Meetings**: 24-hour rooms for specific sessions

### Fallback Behavior

If Google Meet fails for any reason:
- Automatic fallback to Jitsi
- Clear error messages to users
- No interruption to the learning experience

## Verification Requirements

**Good News**: You do NOT need the expensive $15k-$75k verification for this use case because:
- We only use **standard scopes** (Calendar API)
- No access to sensitive user data
- Internal use within your institution

## Cost Considerations

- **Google Calendar API**: Free for reasonable usage
- **Google Meet**: Included with Google Workspace
- **Verification**: Not required for internal/institutional use

## Testing the Integration

1. Set up the environment variables
2. Restart your application
3. Go to any course page
4. Click "Google Meet Classroom"
5. Should create and redirect to a real Google Meet room

## Troubleshooting

### "Invalid video call name" Error
- This means Google Meet creation failed
- Check your API credentials
- Verify Calendar API is enabled
- Check server logs for specific error messages

### "API not configured" Error
- Missing environment variables
- Incorrect client ID/secret
- Calendar API not enabled

### Fallback to Jitsi
- This is normal behavior when Google Meet fails
- Users can still join via Jitsi
- Check logs to diagnose Google Meet issues

## Production Considerations

1. **Domain Verification**: Verify your domain in Google Cloud Console
2. **HTTPS**: Use HTTPS for all redirect URIs in production
3. **Rate Limits**: Monitor Google Calendar API usage
4. **Error Monitoring**: Set up monitoring for failed meeting creations

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check server logs in your terminal
3. Verify all environment variables are set correctly
4. Test the auth flow: `/api/google-meet?action=auth-url`