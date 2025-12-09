const bcrypt = require("bcryptjs");
const { v1: uuid } = require("uuid");
const boom = require("boom");
const User = require("../models/User");
const FeeStudentPaymentFrequency = require("../models/FeeStudentPaymentFrequency");
const { sgMail } = require("../services/emailService");
const mailTemplate = require("../email");
require("dotenv").config();

const saltRounds = process.env.SALT_ROUNDS || 10;

exports.makeLoggedinUser = async (user, reply) => {
  delete user.attributes.password;
  delete user.attributes.account_active;
  const userWithToken = { ...user.attributes };

  // Add any discovered child properties
  user.relations &&
    Object.entries(user.relations).forEach(([childKey, childObj]) => {
      if (Object.keys(childObj).length) userWithToken[childKey] = childObj;
    });

  userWithToken.student && delete userWithToken.student.attributes.inst_cert;

  const token = await reply.jwtSign(userWithToken, {
    expiresIn: 86400 * 60, // expires in 60 Days
  });

  try {
    reply.setCookie("token", token, {
      maxAge: 1000 * 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "none",
      secure: true,
    });
    // reply.setCookie("userId", user.id, {
    //   maxAge: 1000 * 60 * 60 * 24 * 365,
    //   path: "/"
    // });
    // reply.setCookie("role", user.attributes.role, {
    //   maxAge: 1000 * 60 * 60 * 24 * 365,
    //   path: "/"
    // });
    // reply.setCookie("userData",
    // JSON.stringify({
    //   id: user.id,
    //   institution_id: userWithToken.institution_id,
    //   username: userWithToken.username,
    //   first_name: userWithToken.first_name,
    //   last_name: userWithToken.last_name,
    //   role: userWithToken.role,
    //   avatar: userWithToken.avatar || ""
    // }), {
    //   maxAge: 1000 * 60 * 60 * 24 * 365,
    //   path: "/"
    // });
  } catch (e) {
    console.log(e);
  }
  userWithToken.token = token;
  //console.log(user, userWithToken)

  return userWithToken;
};

exports.login = async (req, reply) => {
  const { email, password } = req.body;

  return User.where({
    email: email,
  })
    .fetch({ withRelated: ["staff", "student"], require: true })
    .then(async (person) => {
      //console.log(">>>>>>>>>>>>>>>", person);
      const userValidtion = await bcrypt.compare(
        password,
        person.get("password")
      );
      const accountActive = person.get("account_active");

      if (userValidtion && accountActive) {
        return person;
      } else if (!accountActive) {
        throw new Error(
          "Authentication was not successful. Your account has been deactivated. Please contact support."
        );
      }

      throw new Error(
        "Authentication was not successful. Invalid Account credential provided"
      );
    })
    .then((result) => {
      // console.log(result.attributes);
      const msg = {
        to: result.attributes.email,
        from: process.env.SUPPORT_EMAIL,
        subject: "New Login Notification",
        text: "A new Login has taken place on your account. If this action was not taken by you please notify your administrator immediately and change your password",
        html:
          mailTemplate.header +
          mailTemplate.hero() +
          mailTemplate.prebody +
          "<strong>A new Login has taken place on your account. If this action was not taken by you please notify your administrator immediately and change your password</strong>" +
          mailTemplate.footer(
            process.env.FRONTEND_URL + "/changePassword",
            "Change Password"
          ),
      };

      // sgMail
      //   .send(msg)
      //   .then(response => console.log(response))

      //   .catch(async error => {
      //     console.log(JSON.stringify(error));
      //   });

      return result;
    })
    .then(async (result) => {
      //console.log(result);
      const resultWithToken = await exports.makeLoggedinUser(result, reply);

      reply.send(resultWithToken);
    })
    .catch(async (error) => {
      if (error.message == "EmptyResponse") {
        // Make error message more descriptive
        let err = boom.unauthorized(
          "Authentication was not successful. Invalid Account credentials provided"
        );
        reply.code(err.output.statusCode);
        throw err;
      } else if (error.message.includes("Your account has been deactivated")) {
        let err = boom.unauthorized(
          "Authentication was not successful. Your account has been deactivated. Please contact support."
        );
        reply.code(err.output.statusCode);
        throw err;
      }
      throw boom.boomify(error);
    });
};

exports.codeLogin = async (req, reply) => {
  const { code } = req.body;

  return User.where({ code })
    .fetch({ withRelated: ["student"], require: true })
    .then(async (result) => {
      const numPayments = await FeeStudentPaymentFrequency.where({
        student_id: result.id,
        status: 1,
      }).count();

      if (numPayments > 0) {
        reply.code(401);
        throw boom.unauthorized(
          "Already made payments. Please login to continue."
        );
      }

      const resultWithToken = await exports.makeLoggedinUser(result, reply);
      reply.send(resultWithToken);
    })
    .catch(async (error) => {
      if ((error.message = "EmptyResponse")) {
        // Make error message more descriptive
        const err = boom.unauthorized("Authentication was not successful.");
        reply.code(err.output.statusCode);
        throw err;
      }
      throw boom.boomify(error);
    });

  return user;
};

/**
 * Verify a new user user
 * @param {Object} req Fastify request object
 * @param {object} res Fastify response object
 */
exports.verify = async (req, reply, next) => {
  const token = req.query.code.split("-");
  const personId = token[token.length - 1]; // Get the person Id form the token
  const id = parseInt(personId, 10);

  token.pop(); // Remove last item from this array
  const userToken = token.join("-");
  const code = userToken.trim();

  return User.where({ id, code })
    .fetch({ require: true })
    .then((person) => {
      return person.save({
        active: true,
      });
    })
    .then((response) => {
      // Redirecto to DOMAIN

      reply.redirect(process.env.FRONTEND_URL + "/login?verification=success");
    })
    .catch((error) => {
      reply.redirect(process.env.FRONTEND_URL + `/login?verification=fail`);
    });
};
/**
 * Change  password of a single user using his existing password
 * @param {object} req Fastify request object
 */
exports.changePassword = async (req, reply) => {
  const { id } = req.params;
  const { old_password, new_password } = req.body;

  return User.where({ id })
    .fetch({
      require: true,
    })
    .then((person) => {
      return bcrypt.compare(old_password, person.get("password"));
    })
    .then((response) => {
      if (response === false) {
        const err = boom.unauthorized("Password change was not successful");
        reply.code(err.output.statusCode);
        throw err;
      }

      return bcrypt.hash(new_password, saltRounds);
    })
    .then((hash) => {
      // Change password
      const result = {};
      result.password = hash;
      return new User({ id }).save(result, { patch: true });
    })
    .then((person) => {
      /**
       * If User is about to change password, make sure it's hashed.
       */
      return person;
    })
    .catch((error) => {
      if (error.message === "EmptyResponse") {
        const err = boom.unauthorized(
          "Authentication was not successful. Invalid Account credentials provided"
        );
        reply.code(err.output.statusCode);
      }

      throw boom.boomify(error);
    });
};

/**
 * Initiate a password reset process
 * @param {Object} req Fastify request object
 */
exports.startPasswordReset = async (req, reply) => {
  const { email } = req.body;

  return User.where({
    email: email,
  })
    .fetch({ require: true })
    .then((person) => {
      // Reset user password
      // console.log("current  person", person.attributes.reset_code);
      const reset_code = person.attributes.reset_code
        ? person.attributes.reset_code
        : uuid();
      // console.log(reset_code);
      return person.save({ reset_code });
    })
    .then((result) => {
      // Email user a reset code.
      //DONE Add sendgird email and send based on template

      const emailTemplateParams = {
        subject: `Hi ${result.get(
          "first_name"
        )}, you requested a password change`,
        name: `${result.get("first_name")} ${result.get("last_name")}`,
        email: result.attributes.email,
        link: `${process.env.FRONTEND_URL}/login?resetPassword=${result.get(
          "reset_code"
        )}-${result.get("id")}`,
        organization: process.env.NAME,
      };
      // console.log(emailTemplateParams);

      const msg = {
        to: emailTemplateParams.email,
        from: process.env.SUPPORT_EMAIL,
        subject: emailTemplateParams.subject,
        text: `Hi, you have requested a password change,  use the link : ${emailTemplateParams.link} to reset your password`,

        html:
          mailTemplate.header +
          mailTemplate.hero() +
          mailTemplate.prebody +
          `Hi, you have requested a password change, <br> use the link :   <a href="${emailTemplateParams.link}" > Reset Password </a> to reset your password` +
          mailTemplate.footer(emailTemplateParams.link, "Change Password"),
      };

      sgMail
        .send(msg)
        .then((response) => null)

        .catch(async (error) => {
          // console.log(JSON.stringify(error));
        });

      return { result: "email has been successfully sent" };
    })
    .catch((error) => {
      // Authentication was not successful.
      if (error.message === "EmptyResponse") {
        const err = boom.unauthorized(
          "Authentication was not successful. Invalid Account credentials provided"
        );
        reply.code(err.output.statusCode);
        throw err;
      }

      throw boom.boomify(error);
    });
};

/**
 * Completes an already initiated password reset
 * @param {Object} req Fastify request object
 */
exports.resetPassword = async (req, reply) => {
  const { password, resetCode } = req.body;
  const token = resetCode.split("-");
  const personId = token[token.length - 1]; // Get the person Id form the token
  const id = parseInt(personId, 10);

  token.pop(); // Remove last item from this array
  const userToken = token.join("-");
  const reset_code = userToken.trim();

  return User.where({ id, reset_code })
    .fetch({ require: true })
    .then(async (person) => {
      // Is this rest recent?

      const now = new Date();
      const then = new Date(person.get("updated_at"));

      // To calculate the time difference of two dates
      const isRecent = (then.getTime() - now.getTime()) / (1000 * 60);
      // 70 minues. 60 minutes (DB default) + 10 minutes. So, ideally, it's 10min.
      if (isRecent > 70) {
        const err = boom.unauthorized("Token has expired for this user");
        reply.code(err.output.statusCode);
        throw err;
      }

      const hash = await bcrypt.hash(password, saltRounds);

      const data = { password: hash, reset_code: null };

      return person.save(data).then((person) => person);
    })

    .catch((error) => {
      if (error.message === "EmptyResponse") {
        const err = boom.unauthorized(
          `Invalid request. could not reset password for user: ${personId}`
        );
        reply.code(err.output.statusCode);
        throw err;
      }

      throw error;
    });
};
