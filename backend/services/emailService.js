const brevo = require("@getbrevo/brevo");
require("dotenv").config();

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

/**
 * Send email using Brevo
 * @param {Object} emailData - Email data object
 * @param {string} emailData.to - Recipient email address
 * @param {string} emailData.from - Sender email address
 * @param {string} emailData.subject - Email subject
 * @param {string} emailData.html - HTML content
 * @param {string} emailData.text - Plain text content (optional)
 * @returns {Promise} - Promise that resolves to email response
 */
const sendEmail = async (emailData) => {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    // Set recipient
    sendSmtpEmail.to = [{ email: emailData.to }];

    // Set sender
    sendSmtpEmail.sender = { email: emailData.from };

    // Set subject
    sendSmtpEmail.subject = emailData.subject;

    // Set content
    if (emailData.html) {
      sendSmtpEmail.htmlContent = emailData.html;
    }
    if (emailData.text) {
      sendSmtpEmail.textContent = emailData.text;
    }

    // Send email
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully via Brevo:");
    return response;
  } catch (error) {
    console.error("Error sending email via Brevo:", error);
    throw error;
  }
};

/**
 * SendGrid compatibility wrapper
 * Provides the same interface as SendGrid for easy migration
 */
const brevoMail = {
  send: sendEmail,
  setApiKey: (apiKey) => {
    // This is handled in the initialization above
    // Keeping for compatibility with existing code
  },
};

module.exports = {
  sendEmail,
  brevoMail,
  // Export for backward compatibility with SendGrid naming
  sgMail: brevoMail,
};
