// External Dependancies
const boom = require("boom");
const checkAccess = require("../helpers/utils").checkAccess;

// Get Data Models
const Fee = require("../models/Fee");

// Get all fee
exports.getFees = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    let query = Fee.forge();

    if (req.query) {
      for (var key in req.query) {
        if (typeof req.query[key] == "object") {
          query.where(key, "IN", req.query[key]);
        } else {
          query.where(key, req.query[key]);
        }
      }
    }

    const fee = await query.fetchAll({
      withRelated: ["session"]
    });

    return fee.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get a fee by ID
exports.getFeeById = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too

    const fee = await new Fee({ id: id }).fetch();

    return fee;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new fee
exports.addFee = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  req.body.institution_id = validatedUser.institution_id;
  try {
    const fee = await Fee.forge(req.body).save();
    return fee;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing fee
exports.updateFee = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const fee = req.body;
    fee.session_id = fee.session_id === 0 ? null : fee.session_id;
    fee.faculty_id = fee.faculty_id === 0 ? null : fee.faculty_id;
    fee.department_id = fee.department_id === 0 ? null : fee.department_id;
    fee.programme_id = fee.programme_id === 0 ? null : fee.programme_id;
    fee.level_id = fee.level_id === 0 ? null : fee.level_id;
    const { ...updateData } = fee;
    const update = await Fee.forge({ id: id }).save(updateData, {
      patch: true
    });
    return update.fetch();
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an fee by id
exports.deleteFee = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const fee = await new Fee({ id: id }).destroy();
    return fee;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get all fee
exports.getFeesByParams = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    //let feeQuery = Fee.forge();
    // let feeQuery;

    // if (req.query) {
    //   feeQuery = Fee.query(function(qb) {
    //     for (var key in req.query) {
    //       if (typeof req.query[key] == 'object') {
    //         qb.andWhere(function() {
    //           this.where(key, 'IN', req.query[key]).orWhere(key, null);
    //         });
    //       } else {
    //         //qb.andWhere(key, req.query[key]);
    //         console.log(key);
    //         qb.andWhere(function(e) {
    //           e.where(key, req.query[key]).orWhere(key, null);
    //         });
    //         console.log(key);
    //       }
    //     }
    //   });
    // }
    // const fee = await feeQuery.fetchAll({
    //   debug: true,
    //   withRelated: ['session']
    // });

    const fee = await Fee.query(function(qb) {
      // qb.andWhere(function() {
      //   this.where('active', req.query['active']).orWhere('active', null);
      // });
      qb.andWhere(function() {
        this.where("institution_id", req.query["institution_id"]).orWhere(
          "institution_id",
          null
        );
      });
      qb.andWhere(function() {
        this.where("level_id", req.query["level_id"]).orWhere("level_id", null);
      });
    }).fetchAll({ withRelated: ["session"] });

    return fee.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};
