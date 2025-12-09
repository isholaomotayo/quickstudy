const boom = require("boom");
const mailTemplate = require("../email");
const { sgMail } = require("../services/emailService");
require("dotenv").config();

exports.supportController = async (req, reply) => {
  const { email, first_name, last_name, subject, message } = req.body;

  const sender = email;
  const reciever = `support.cdel@unn.edu.ng`;

  const emailTemplateParams = {
    subject: `New support request from ${sender}`,

    title: `${subject}`,
    body: `${message}`,
    name: `${first_name ? first_name : ""} ${last_name ? last_name : ""}`
  };

  const msg = {
    to: process.env.SUPPORT_EMAIL || reciever,
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
