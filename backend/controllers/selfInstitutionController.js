const boom = require("boom");
const Institution = require("../models/Institution");
const User = require("../models/User");
const Staff = require("../models/Staff");
const bcrypt = require("bcryptjs");
const { v1: uuid } = require("uuid");
const mailTemplate = require("../email");
const { sgMail } = require("../services/emailService");
require("dotenv").config();
const Bookshelf = require("../config/connection").Bookshelf;
const checkAccess = require("../helpers/utils").checkAccess;
const saltRounds = process.env.SALT_ROUNDS || 10;

exports.createInstitution = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  const params = req.body;

  params.token = uuid();
  params.email = params.email.toLowerCase();
  try {
    return Bookshelf.transaction((trx) => {
      const newInstitution = new Institution(params).save(null, {
        transacting: trx,
      });

      return newInstitution;
    }).then((institution) => {
      const email = params.email;

      const emailTemplateParams = {
        subject: `Welcome to ${process.env.NAME}`,
        email,
        activate: `${process.env.FRONTEND_URL}/self-institution?token=${
          params.token
        }-${institution.get("id")}`,
        name: institution.get("name"),
        organization: process.env.NAME,
      };

      const msg = {
        to: email,
        from: process.env.SUPPORT_EMAIL,
        subject: emailTemplateParams.subject,
        text: `Hi, welcome to ${process.env.NAME},  use the link :  ${emailTemplateParams.activate} to activate your institution. `,

        html:
          mailTemplate.header +
          mailTemplate.hero() +
          mailTemplate.prebody +
          `Hi, welcome to ${process.env.NAME},  use the link : <a href="${emailTemplateParams.activate}" > Activation Link </a> to activate your institution.` +
          "\n This link will expire in 1 hour." +
          mailTemplate.footer(
            emailTemplateParams.activate,
            "Activate Institution"
          ),
      };
      sgMail
        .send(msg)
        .then((response) => response)
        .catch(async (error) => {
          console.log(JSON.stringify(error));
          throw boom.boomify(error);
        });

      console.log("institution logger", institution.get("id"));

      return Institution.where({ id: institution.get("id") }).fetch();
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.resendEmail = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  const email = req.body.email.toLowerCase();

  try {
    const newInstitution = await new Institution({ email })
      .fetch()
      .then((inst) => {
        inst.set("token", uuid());

        const emailTemplateParams = {
          subject: `Welcome to ${process.env.NAME}`,
          email,
          activate: `${
            process.env.FRONTEND_URL
          }/self-institution?token=${inst.get("token")}-${inst.get("id")}`,
          name: inst.get("name"),
          organization: process.env.NAME,
        };

        const msg = {
          to: email,
          from: process.env.SUPPORT_EMAIL,
          subject: emailTemplateParams.subject,
          text: `Hi, welcome to ${process.env.NAME},  use the link :  ${emailTemplateParams.activate} to activate your institution.`,

          html:
            mailTemplate.header +
            mailTemplate.hero() +
            mailTemplate.prebody +
            `Hi, welcome to ${process.env.NAME},  use the link : <a href="${emailTemplateParams.activate}" > Activation Link </a> to activate your institution. ` +
            "\n This link will expire in 1 hour." +
            mailTemplate.footer(
              emailTemplateParams.activate,
              "Activate Institution"
            ),
        };
        sgMail
          .send(msg)
          .then((response) => console.log(response))

          .catch(async (error) => {
            console.log(JSON.stringify(error));
          });

        return inst;
      });
    return newInstitution;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.updateInstitution = async (req, reply) => {
  const params = req.body;

  let { token } = req.body;

  delete params.token;

  if (!token) {
    throw new Error("You are not authorized to make this request.");
  }

  token = token.split("-");
  const insitutionId = token[token.length - 1];

  return Institution.where({ id: insitutionId })
    .fetch()
    .then((inst) => {
      const now = new Date();
      const then = new Date(inst.get("updated_at"));

      const isRecent = (then.getTime() - now.getTime()) / (1000 * 60);

      if (isRecent > 70 || !inst.get("token")) {
        const err = boom.unauthorized(
          "Activation link has expired. Please request for a new activation link"
        );
        reply.code(err.output.statusCode);
        throw err;
      }

      return inst.save(params).then((res) => res);
    })
    .catch((error) => {
      if (error.message === "EmptyResponse") {
        const err = boom.unauthorized(
          `Invalid request. could not activate this institution`
        );
        reply.code(err.output.statusCode);
        throw err;
      }

      throw error;
    });
};

exports.addUser = async (req, reply) => {
  let { token } = req.body;

  if (!token) {
    throw new Error("You are not authorized to make this request.");
  }
  token = token.split("-");
  const insitutionId = token[token.length - 1];

  const validateToken = await Institution.where({ id: insitutionId })
    .fetch()
    .then((inst) => {
      const now = new Date();
      const then = new Date(inst.get("updated_at"));

      const isRecent = (then.getTime() - now.getTime()) / (1000 * 60);

      if (isRecent > 70 || !inst.get("token")) {
        const err = boom.unauthorized(
          "Activation link has expired. Please request for a new activation link"
        );
        reply.code(err.output.statusCode);
        throw err;
      }
      return inst.save({ token: null }).then((res) => res);
    })
    .catch((error) => {
      if (error.message === "EmptyResponse") {
        const err = boom.unauthorized(
          `Invalid request. could not activate this institution`
        );
        reply.code(err.output.statusCode);
        throw err;
      }

      throw error;
    });

  try {
    const params = req.body;
    params.email = params.email.toLowerCase();
    params.institution_id = insitutionId;

    const newUser = {
      first_name: params.first_name,
      last_name: params.last_name,
      other_name: params.other_name,
      phone: params.phone,
      email: params.email,
      avatar: params.avatar,
      username: params.username,
      password: params.password,
      institution_id: params.institution_id,
      role: "ADMIN",
    };

    const code = uuid();
    //convert email to lowercase
    newUser.code = code;
    // hash their password
    const password = await bcrypt.hash(newUser.password, saltRounds);
    newUser.password = password;

    return Bookshelf.transaction((trx) => {
      const result = new User(newUser).save(null, { transacting: trx });
      return result;
    })
      .then((user) => {
        const userId = user.get("id");
        const newParams = {
          user_id: userId,
          dob: req.body.dob,
          address: req.body.address,
          gender: req.body.gender,
        };
        // console.log(req.body, '>>>', newUser, newParams)
        return Bookshelf.transaction((trx) => {
          const staff = Staff.forge(newParams).save(null, {
            transacting: trx,
          });
          return staff;
        })
          .then((staff) => {
            return Staff.where({ id: staff.get("id") }).fetch();
          })
          .then((result) => {
            return result;
          })
          .catch((error) => {
            if (error.toString().includes("not-null constraint")) {
              throw new Error("A required field has been set to null");
            }

            throw error;
          });
      })
      .then((result) => {
        return result;
      })
      .catch((error) => {
        if (error.toString().includes("user_username_unique")) {
          throw new Error("User with this username already exists");
        }
        if (error.toString().includes("users_email_unique")) {
          throw new Error("User with this email already exists");
        }

        if (error.toString().includes("users_phone_unique")) {
          throw new Error("User with this phone number already exists");
        }

        throw error;
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};
