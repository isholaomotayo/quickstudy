import React from "react";

/**
 * GoogleMeetEmbed
 * Embeds a Google Meet room using an iframe (may not work for all users)
 * If embedding fails, shows a join button as fallback.
 * @param {string} meetingUrl - The Google Meet URL to embed
 */
const GoogleMeetEmbed = ({ meetingUrl }) => {
  React.useEffect(() => {
    if (meetingUrl) {
      window.location.href = meetingUrl;
    }
  }, [meetingUrl]);

  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="sr-only">Loading meeting...</span>
      </div>
      <p>Redirecting to your Google Meet classroom...</p>
    </div>
  );
};

export default GoogleMeetEmbed;
