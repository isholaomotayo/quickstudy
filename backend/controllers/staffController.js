// External Dependancies
const boom = require("boom");
const checkAccess = require("../helpers/utils").checkAccess;

// Get Data Models
const Staff = require("../models/Staff");

const Bookshelf = require("../config/connection").Bookshelf;
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { v1: uuid } = require("uuid");
const saltRounds = process.env.SALT_ROUNDS || 10;
// Get all staff
exports.getStaff = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "LECTURER", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    let query = Staff.forge();

    if (validatedUser.role == "HOD") {
      // Should improve on this via staff.department->programmes->students->users
      query.where("department_id", +validatedUser.department_id);
    } else if (validatedUser.role == "ADMIN") {
      // TODO: Find how to filter this
    } else if (validatedUser.role == "SUPERADMIN") {
      // Don't filter
    } else {
      query.where("id", +validatedUser.staff.id);
    }

    if (req.query) {
      for (var key in req.query) {
        if (typeof req.query[key] == "object") {
          query.where(key, "IN", req.query[key]);
        } else {
          query.where(key, req.query[key]);
        }
      }
    }

    const staff = await query.fetchAll({
      withRelated: ["user", "department.faculty"],
    });
    return staff.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get a staff by ID
exports.getStaffById = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "LECTURER", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    // console.log(req.cookies.user);
    const id = req.params.id;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too

    const staff = await new Staff({ id: id }).fetch({
      withRelated: ["user", "department.faculty"],
    });

    return staff;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new staff
exports.addStaff = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "LECTURER", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const params = req.body;
    if (!req.body.user_id) {
      //user_id is not sent, create user profile before creating staff profile

      const newReq = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        other_name: req.body.other_name,
        phone: req.body.phone,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        institution_id: validatedUser.institution_id || req.body.institution_id,
        role: req.body.role || "STAFF",
      };

      const code = uuid();
      //convert email to lowercase
      newReq.email = newReq.email.toLowerCase();
      newReq.code = code;
      // hash their password
      const password = await bcrypt.hash(newReq.password, saltRounds);
      newReq.password = password;

      return Bookshelf.transaction(async (trx) => {
        // Create user first
        const user = await User.forge(newReq).save(null, { transacting: trx });
        const userId = user.get("id");

        // Create staff profile
        const newParams = {
          user_id: userId,
          staff_no: req.body.staff_no,
          level: req.body.level,
          address: req.body.address,
          designation: req.body.designation,
          department_id: req.body.department_id,
        };

        const staff = await Staff.forge(newParams).save(null, {
          transacting: trx,
        });

        // Fetch the complete staff record with user details
        const result = await Staff.where({ id: staff.get("id") }).fetch({
          withRelated: ["user", "department.faculty"],
          transacting: trx,
        });

        return result;
      }).catch((error) => {
        if (error.toString().includes("user_username_unique")) {
          throw new Error("User with this username already exists");
        }
        if (error.toString().includes("users_email_unique")) {
          throw new Error("User with this email already exists");
        }
        if (error.toString().includes("users_phone_unique")) {
          throw new Error("User with this phone number already exists");
        }
        if (error.toString().includes("not-null constraint")) {
          throw new Error("A required field has been set to null");
        }
        throw error;
      });
    } else {
      const staff = await Staff.forge(params).save();
      return staff;
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing staff
exports.updateStaff = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "LECTURER", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const data = req.body;
    const { ...updateData } = data;

    const update = await Staff.forge({ id: id })
      .fetch({ withRelated: ["user", "department"] })
      .then((staff) => {
        return staff.set(data).save();
      });
    return update.fetch({ withRelated: ["user", "department"] });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an staff by id
exports.deleteStaff = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const staff = await new Staff({ id: id }).destroy();
    return staff;
  } catch (err) {
    throw boom.boomify(err);
  }
};
