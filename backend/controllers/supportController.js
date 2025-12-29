const boom = require("boom");
const mailTemplate = require("../email");
const { sgMail } = require("../services/emailService");
const Institution = require("../models/Institution");
require("dotenv").config();

exports.supportController = async (req, reply) => {
  const { email, first_name, last_name, subject, message, institution_id } = req.body;

  const sender = email;
  
  // Fetch institution data for support email
  let supportEmail = process.env.SUPPORT_EMAIL || "support.cdel@unn.edu.ng";
  try {
    const institutionId = institution_id || 1; // Default to institution id 1
    const institution = await Institution.where({ id: institutionId }).fetch({ require: false });
    if (institution) {
      supportEmail = institution.get("support_mail") || institution.get("email") || supportEmail;
    }
  } catch (err) {
    console.log("Error fetching institution for support email:", err);
    // Use fallback email if fetch fails
  }
  
  const reciever = supportEmail;

  const emailTemplateParams = {
    subject: `New support request from ${sender}`,

    title: `${subject}`,
    body: `${message}`,
    name: `${first_name ? first_name : ""} ${last_name ? last_name : ""}`
  };

  const msg = {
    to: reciever,
    from: sender,
    subject: emailTemplateParams.subject,
    text: emailTemplateParams.title,

    html:
      mailTemplate.header +
      `<h2>Subject: ${emailTemplateParams.title}</h2>
    
    <p>Body: ${emailTemplateParams.body}</p>
    `
  };

  sgMail
    .send(msg)
    .then(res => {
      console.log(res);
    })
    .catch(e => {
      console.log(e);
      throw boom.boomify(e);
    });

  return "success";
};
