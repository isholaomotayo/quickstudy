const boom = require("boom");
const checkAccess = require("../helpers/utils").checkAccess;
const Student = require("../models/Student");
const { sgMail } = require("../services/emailService");
const User = require("../models/User");
const { rejectionMail } = require("../email/rejectionEmail");
require("dotenv").config();

exports.rejectApplicant = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "LECTURER"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  const studentId = req.params.id;
  const { user_id, reason } = req.body;

  if (!reason) {
    const error = new Error("No reason provided");
    return boom.boomify(error);
  }
  let data;

  const body = {
    admitted: false,
    semester_admitted_id: null,
    session_admitted_id: null
  };

  console.log(process.env.SENDGRID_API_KEY);
  try {
    const update = await User.forge({ id: +user_id }).save(
      { role: "DECLINED APPLICANT" },
      {
        patch: true
      }
    );

    const name = `${update.attributes.first_name} ${update.attributes.last_name}`;
    const email = update.attributes.email;

    const emailTemplateParams = {
      subject: `Admission Response for ${name}`,
      title: `Admission Response for ${name}`
    };
    const html = rejectionMail(name, reason);

    data = await Student.forge({ id: +studentId })
      .fetch({
        withRelated: ["user", "programme", "semester"]
      })
      .then(student => {
        student.set(body).save();

        return student;
      });

    const msg = {
      to: email,
      from: process.env.SUPPORT_EMAIL,
      subject: emailTemplateParams.subject,
      text: emailTemplateParams.title,
      html
    };

    await sgMail.send(msg);
  } catch (e) {
    console.log(e);
    if (e.response) {
      console.error(e.response.body);
      console.log(e.response.body);
      throw boom.boomify(e);
    }
  }

  return data;
};
