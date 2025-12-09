const boom = require("boom");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { v1: uuid } = require("uuid");
const mailTemplate = require("../email");
const { sgMail } = require("../services/emailService");
const setPaginationHeaders = require("../helpers/utils").setPaginationHeaders;
require("dotenv").config({
  path: "../../.env",
});
const Bookshelf = require("../config/connection").Bookshelf;

const saltRounds = process.env.SALT_ROUNDS || 10;

const checkAccess = require("../helpers/utils").checkAccess;
// Get all users
exports.getUsers = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "STUDENT",
    "AFFILIATE",
  ];
  let { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const isHigherAccess = "ADMIN,SUPERADMIN".indexOf(validatedUser.role) > -1;
  let query = User.forge();

  if (filterKey == "referral_code") {
    if (filterValue != validatedUser.username && !isHigherAccess) {
      throw boom.boomify("Improper access");
    }

    if (isHigherAccess) {
      [filterKey, filterValue] = ["", ""];
      query
        .where("referral_code", "<>", "UNN")
        .where("referral_code", "<>", "");
    }
  } else if (validatedUser.role == "STAFF") {
    // Should improve on this via staff.department->programmes->students->users
    query.where("institution_id", +validatedUser.institution_id);
  } else if (validatedUser.role == "HOD") {
    // Should improve on this via staff.department->programmes->students->users
    query.where("institution_id", +validatedUser.institution_id);
  } else if (validatedUser.role == "ADMIN") {
    query.where("institution_id", +validatedUser.institution_id);
  } else if (validatedUser.role == "SUPERADMIN") {
    // Don't filter
  } else {
    query.where("id", +validatedUser.id);
  }

  const { pgsize = 500, pg = 1, ...req_query } = req.query;
  if (filterKey && filterValue) query.where(filterKey, filterValue);
  else if (req_query) {
    for (var key in req_query) {
      if (typeof req_query[key] == "object") {
        query.where(key, "IN", req_query[key]);
      } else {
        query.where(key, req_query[key]);
      }
    }
  }

  try {
    const users = await query.fetchPage({
      pageSize: pgsize,
      page: pg,
      withRelated: ["student", "staff", "affiliate"],
    });

    if (users.pagination) setPaginationHeaders(reply, users.pagination);

    return users;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get an user by ID
exports.getUserById = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
    "STUDENT",
    "APPLICANT",
    "AFFILIATE",
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const id = req.params.id;
    const user = await User.where({ id: req.params.id }).fetch({
      withRelated: ["student", "staff", "affiliate"],
    }); //this works too

    //const user = await new User({ 'id': id }).fetch();

    return user;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new user
exports.addUser = async (req, reply) => {
  try {
    const params = req.body;
    const code = uuid();
    //convert email to lowercase
    params.email = params.email.toLowerCase();
    params.code = code;
    // hash their password
    const password = await bcrypt.hash(params.password, saltRounds);
    params.password = password;
    return Bookshelf.transaction((trx) => {
      const result = User.forge(params).save(null, { transacting: trx });
      return result;
    })
      .then((user) => {
        const email = params.email;

        //DONE : Add email support with sendgrid
        // Email user
        const emailTemplateParams = {
          subject: `Welcome to ${process.env.NAME}`,
          email,
          activate: `${process.env.API_URL}/api/verify?code=${code}-${user.get(
            "id"
          )}`,
          name: user.get("first_name"),
          organization: process.env.NAME,
        };

        const msg = {
          to: email,
          from: process.env.SUPPORT_EMAIL,
          subject: emailTemplateParams.subject,
          text: `Hi, welcome to ${process.env.NAME},  use the link :  ${emailTemplateParams.activate} to activate your account`,

          html:
            mailTemplate.header +
            mailTemplate.hero() +
            mailTemplate.prebody +
            `Hi, welcome to ${process.env.NAME},  use the link : <a href="${emailTemplateParams.activate}" > Verification Link </a> to activate your account` +
            mailTemplate.footer(
              emailTemplateParams.activate,
              "Activate Account"
            ),
        };

        sgMail
          .send(msg)
          .then((response) => console.log(response))

          .catch(async (error) => {
            console.log(JSON.stringify(error));
          });

        return User.where({ id: user.get("id") }).fetch();
      })
      .then((result) => {
        return result;
      })
      .catch((error) => {
        if (error.toString().includes("users_email_unique")) {
          throw new errors.ConflictError("User with this email already exists");
        }

        if (error.toString().includes("users_phone_unique")) {
          throw new errors.ConflictError(
            "User with this phone number already exists"
          );
        }

        if (error.toString().includes("users_state_id_foreign")) {
          throw new errors.NotFoundError("State does not exists");
        }

        if (error.toString().includes("users_city_id_foreign")) {
          throw new errors.NotFoundError("City does not exists");
        }

        throw error;
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing user
exports.updateUser = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
    "STUDENT",
    "APPLICANT",
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const id = req.params.id;
    const user = req.body;
    const { ...updateData } = user;
    const update = await User.forge({ id: id }).save(updateData, {
      patch: true,
    });
    return update;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an user by id
exports.deleteUser = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
    "STUDENT",
    "APPLICANT",
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    const id = req.params.id;
    const user = await new User({ id: id }).destroy();
    return user;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get all student applicants
exports.getApplicants = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  try {
    let query = User.where("role", "APPLICANT");

    const applicants = await query.fetchAll({
      withRelated: ["student", "student.programme", "student.semester"],
    });

    return applicants;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get a user by username
exports.getUserByUsername = async (req, reply) => {
  try {
    const username = req.params.username;
    let query = User.where("username", username);

    const user = await query.fetch();

    return user;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.checkUserWithUsernameExists = async (req, reply) => {
  const { username } = req.params;
  const { checkRelated } = req.query;
  let withRelated = [];

  if (checkRelated) withRelated = [checkRelated];
  try {
    const user = await User.where("username", username).fetch({ withRelated });

    return (
      (user &&
        ((checkRelated &&
          user.relations &&
          user.relations[checkRelated] &&
          1) ||
          (!checkRelated && 1))) ||
      0
    );
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.searchUser = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  let { searchValue } = req.query;
  searchValue = searchValue.trim();

  try {
    const user = await User.where(
      "institution_id",
      validatedUser.institution_id
    )
      .query(function (qb) {
        qb.where("email", "LIKE", searchValue + "%")
          .orWhere("username", "LIKE", searchValue + "%")
          .orWhere("role", searchValue.toUpperCase());
      })
      .fetchAll({
        withRelated: ["student.programme", "staff", "affiliate"],
      });

    return user;
  } catch (err) {
    throw boom.boomify(err);
  }
};
