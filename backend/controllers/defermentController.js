const boom = require("boom");
const checkAccess = require("../helpers/utils").checkAccess;

// TODO
// Work on names
// change all email details to admin
// accept user details
// debug why student data is not being returned;

// Get Data Models
const Staff = require("../models/Staff");
const Student = require("../models/Student");
const mailTemplate = require("../email");
const { sgMail } = require("../services/emailService");
require("dotenv").config();

// get mail templates;

const defermentModule = require("../email/defermentModuleEmail");

exports.getAllDeferredStudents = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  // variable for all the students who have deferred
  let deferredStudents;

  try {
    // fetch all the admitted students whose admission status is deferred or pending
    deferredStudents = await Student.query({
      where: { admission_status: "DEFERRED" },
      orWhere: { admission_status: "PENDING" },
    }).fetchAll({
      withRelated: [
        "programme",
        {
          user: (query) => {
            query.where("role", "STUDENT");
          },
        },
        "semester",
      ],
    });

    // filter students who have empty user relations
    deferredStudents = deferredStudents.filter(
      (m) => Object.entries(m.relations.user.attributes).length !== 0
    );

    //return the deferred students
    return deferredStudents;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getDeferedStudentById = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  // extract student id from req params
  let { id } = req.params,
    deferredStudent;

  try {
    // fetch the deferred student with that particular id
    deferredStudent = await Student.where({ id })
      .query({
        where: { admission_status: "DEFERRED" },
      })
      .fetch({
        withRelated: ["user", "programme", "semester"],
      });
  } catch (err) {
    throw boom.boomify(err);
  }
  // return the deferred student
  return deferredStudent;
};

exports.deferProcessByStudent = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  // students name from validated user object
  const name = `${!!validatedUser.first_name ? validatedUser.first_name : ""} ${
    !!validatedUser.other_name ? validatedUser.other_name : ""
  } ${!!validatedUser.last_name ? validatedUser.last_name : ""}`;

  // student matric no from validated user object
  const matricNo = !!validatedUser.student.reg_no
    ? validatedUser.student.reg_no
    : "";

  // deferment_duration from request body
  const duration = !!req.body.deferment_duration
    ? req.body.deferment_duration
    : "";

  // deferment_reason from request body
  const reason = !!req.body.deferment_reason ? req.body.deferment_reason : "";

  // get email templates
  const defered = defermentModule.defermentModuleEmail(
    name,
    matricNo,
    duration,
    reason
  );

  // const director = 'boniface.nworgu@unn.edu.ng'
  const testingMails = [
    "boniface.nworgu@unn.edu.ng",
    "ebere.kalu@unn.edu.ng",
    "support.cdel@unn.edu.ng",
  ];
  let student,
    success,
    { id } = req.params;

  try {
    // retrieve all the admins that would need to be notified for the deferrment or resumption process
    const staff = await Staff.fetchAll({
      withRelated: [
        {
          user: (query) => {
            query.where("role", "ADMIN");
          },
        },
      ],
    });

    let filteredStaff = staff.filter(
      (m) => Object.entries(m.relations.user.attributes).length !== 0
    );

    let adminEmails = [];

    filteredStaff.forEach((x) => {
      if (!!x.relations.user.attributes.email) {
        adminEmails = adminEmails.concat(x.relations.user.attributes.email);
      }
    });

    // if the request coming in by the student is for deferrment then
    if (req.body.admission_status === "PENDING") {
      const emailTemplateParams = {
        subject: defered.defermentSubject,

        title: defered.defermentSubject,
        body: defered.defermentMessage,
      };
      const html = defermentModule.deferStart(name, matricNo, duration, reason);
      // change the students admission status to pending
      student = await Student.forge({ id: id })
        .fetch({
          withRelated: ["user", "programme", "semester"],
        })
        .then((student) => {
          student.set(req.body).save();
          // console.log(student);
        });

      // send a mail to the director and admins of the student's request
      const msg = {
        to: testingMails,
        from: process.env.SUPPORT_EMAIL,
        subject: emailTemplateParams.subject,
        text: emailTemplateParams.title,

        html,
      };

      sgMail
        .send(msg)
        .then((res) => {
          success = true;
          console.log(res);
        })
        .catch((e) => {
          success = false;
          console.log(e);
          throw boom.boomify(e);
        });

      student = await new Student({ id: id }).fetch({
        withRelated: ["user", "programme", "semester"],
      });
    }
    // else the request is for resumption, then
    else {
      const emailTemplateParams = {
        subject: defered.resumptionSubject,

        title: defered.resumptionSubject,
        body: defered.resumptionMessage,
      };
      // send a mail to the director and admins of the student's request for resumption
      const msg = {
        to: testingMails,
        from: process.env.SUPPORT_EMAIL,
        subject: emailTemplateParams.subject,
        text: emailTemplateParams.title,

        html:
          mailTemplate.header +
          `<h2>Subject: ${emailTemplateParams.title}</h2>
        
        <p>
        ${emailTemplateParams.body}
        </p>
        `,
      };

      sgMail
        .send(msg)
        .then((res) => {
          success = true;
          console.log(res);
        })
        .catch((e) => {
          success = false;
          console.log(e);
          throw boom.boomify(e);
        });

      student = await new Student({ id: id }).fetch({
        withRelated: ["user", "programme", "semester"],
      });
    }
  } catch (err) {
    throw boom.boomify(err);
  }

  // return the student and a success variable

  return student;
};

exports.deferProcessByAdmin = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  let student,
    success,
    // retrieve student id from req params
    { id } = req.params;

  // get the student's name from req body
  const name = `${!!req.body.user.first_name ? req.body.user.first_name : ""} ${
    !!req.body.user.other_name ? req.body.user.other_name : ""
  } ${!!req.body.user.last_name ? req.body.user.last_name : ""}`;

  // const email = req.body.user.email;

  // get deferment email templates
  const defered = defermentModule.defermentModuleEmail(name);
  const reciever = req.body.user.email; //req.body.user.email;

  delete req.body.user;
  try {
    // if this is a resumption process
    if (req.body.admission_status === "ACTIVE") {
      const emailTemplateParams = {
        subject: `Resumption Request Response`,

        title: `Resumption Request Response`,
        body: defered.resumptionSuccess,
      };

      // change the student's admission status to active
      student = await Student.forge({ id: id })
        .fetch({
          withRelated: ["user", "programme", "semester"],
        })
        .then((student) => {
          student.set(req.body).save();
          // console.log(student);

          // mail the student of a successful resumption process
          const msg = {
            to: reciever, //student.relations.user.attributes.email,
            from: process.env.SUPPORT_EMAIL,
            subject: emailTemplateParams.subject,
            text: emailTemplateParams.title,

            html:
              mailTemplate.header +
              `<h2>Subject: ${emailTemplateParams.title}</h2>
            
            <p>${emailTemplateParams.body}</p>
            `,
          };

          sgMail
            .send(msg)
            .then((res) => {
              success = true;
              console.log(res);
            })
            .catch((e) => {
              success = false;
              console.log(e);
              throw boom.boomify(e);
            });
        });

      student = await new Student({ id: id }).fetch({
        withRelated: ["user", "programme", "semester"],
      });
    }
    // else if this is a deferment process
    else {
      const emailTemplateParams = {
        subject: `Deferment Request Response`,

        title: `Deferment Request Response`,
        body: defered.defermentSuccess,
      };

      // change the student's admission status to deferred
      student = await Student.forge({ id: id })
        .fetch({
          withRelated: ["user", "programme", "semester"],
        })
        .then((student) => {
          student.set(req.body).save();
          // console.log(student);

          // mail student of successful deferment
          const msg = {
            to: reciever, //student.relations.user.attributes.email,
            from: process.env.SUPPORT_EMAIL,
            subject: emailTemplateParams.subject,
            text: emailTemplateParams.title,

            html:
              mailTemplate.header +
              `<h2>Subject: ${emailTemplateParams.title}</h2>
            
            <p>${emailTemplateParams.body}</p>
            `,
          };

          sgMail
            .send(msg)
            .then((res) => {
              success = true;
              console.log(res);
            })
            .catch((e) => {
              success = false;
              console.log(e);
              throw boom.boomify(e);
            });
        });
      student = await new Student({ id: id }).fetch({
        withRelated: ["user", "programme", "semester"],
      });
    }
  } catch (err) {
    throw boom.boomify(err);
  }

  // return the student and a success message

  return student;
};
