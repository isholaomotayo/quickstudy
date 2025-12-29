const googleMeetService = require('../../backend/services/googleMeetService');

/**
 * Google OAuth callback endpoint
 * Handles the authorization code exchange for tokens
 */
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { code, error, state } = req.query;

    if (error) {
      console.error('Google OAuth error:', error);
      return res.status(400).send(`
        <html>
          <body>
            <h2>Google Authorization Error</h2>
            <p>Error: ${error}</p>
            <p>Please try the authorization process again.</p>
            <a href="/api/google-meet?action=auth-url">Try Again</a>
          </body>
        </html>
      `);
    }

    if (!code) {
      return res.status(400).json({ error: 'Authorization code not provided' });
    }

    try {
      // Exchange authorization code for tokens
      const tokens = await googleMeetService.getTokens(code);

      // Display tokens to user for manual configuration
      return res.status(200).send(`
        <html>
          <head>
            <title>Google Meet Setup Complete</title>
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
              .success { color: #28a745; background: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .tokens { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 5px; padding: 20px; margin: 20px 0; }
              .token-value { background: #e9ecef; padding: 10px; border-radius: 3px; font-family: monospace; word-break: break-all; margin: 10px 0; }
              .warning { color: #856404; background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .step { margin: 15px 0; padding-left: 20px; }
            </style>
          </head>
          <body>
            <h1>🎉 Google Meet Setup Successful!</h1>
            
            <div class="success">
              <strong>Authorization completed successfully!</strong><br>
              Your Google Calendar API is now connected and ready to create Google Meet rooms.
            </div>

            <h2>📋 Add These Tokens to Your .env File</h2>
            
            <div class="tokens">
              <h3>Access Token:</h3>
              <div class="token-value">GOOGLE_ACCESS_TOKEN=${tokens.access_token || 'Not provided'}</div>
              
              <h3>Refresh Token:</h3>
              <div class="token-value">GOOGLE_REFRESH_TOKEN=${tokens.refresh_token || 'Not provided'}</div>
              
              ${tokens.scope ? `<h3>Granted Scopes:</h3><div class="token-value">${tokens.scope}</div>` : ''}
            </div>

            <h2>⚡ Next Steps</h2>
            <div class="step">1. Copy the tokens above to your <code>.env</code> file</div>
            <div class="step">2. Restart your application to load the new environment variables</div>
            <div class="step">3. Test Google Meet creation on any course page</div>
            <div class="step">4. Google Meet rooms will now be created automatically!</div>

            <div class="warning">
              <strong>Security Note:</strong><br>
              Keep these tokens secure and never commit them to version control.<br>
              The refresh token allows long-term access to your Google Calendar.
            </div>

            <h2>🧪 Test Your Integration</h2>
            <p>Once you've added the tokens and restarted:</p>
            <div class="step">• Go to any course page in your LMS</div>
            <div class="step">• Click "Google Meet Classroom"</div>
            <div class="step">• A real Google Meet room should be created</div>
            <div class="step">• The meeting URL will be cached for future use</div>

            <p><strong>Your Google Meet integration is now ready! 🚀</strong></p>
            
            <a href="/lms/courses" style="display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px;">Go to Courses</a>
          </body>
        </html>
      `);

    } catch (tokenError) {
      console.error('Token exchange failed:', tokenError);
      return res.status(500).send(`
        <html>
          <body>
            <h2>Token Exchange Failed</h2>
            <p>Error: ${tokenError.message}</p>
            <p>Please check your Google OAuth configuration and try again.</p>
            <a href="/api/google-meet?action=auth-url">Try Again</a>
          </body>
        </html>
      `);
    }

  } catch (error) {
    console.error('Google auth callback error:', error);
    return res.status(500).json({
      error: 'Internal server error during authentication',
      message: error.message
    });
  }
}

// Prevent static generation
export function getServerSideProps() {
  return { props: {} };
}