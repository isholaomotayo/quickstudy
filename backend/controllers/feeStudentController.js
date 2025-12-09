// External Dependancies
const boom = require('boom');
const checkAccess = require('../helpers/utils').checkAccess;

// Get Data Models
const FeeStudent = require('../models/FeeStudent');

// Get all feestudents
exports.getFeeStudents = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'STUDENT'];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    let query = FeeStudent.forge();

    if (req.query) {
      for (var key in req.query) {
        if (typeof req.query[key] == 'object') {
          query.where(key, 'IN', req.query[key]);
        } else {
          query.where(key, req.query[key]);
        }
      }
    }

    const feeStudent = await query.fetchAll({
      withRelated: ['student', 'semester']
    });
    return feeStudent.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get a feestudent by ID
exports.getFeeStudentById = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'STUDENT'];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too

    const feeStudent = await new FeeStudent({ id: id }).fetch({
      withRelated: ['student', 'semester']
    });

    return feeStudent;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new feestudent
exports.addFeeStudent = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'STUDENT'];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const params = req.body;
    const feeStudent = await FeeStudent.forge(params).save();
    return feeStudent.fetch({
      withRelated: ['student', 'semester']
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing feestudent
exports.updateFeeStudent = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'STUDENT'];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const feeStudent = req.body;
    const { ...updateData } = feeStudent;
    const update = await FeeStudent.forge({ id: id }).save(updateData, {
      patch: true
    });
    return update.fetch({
      withRelated: ['student', 'semester']
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an feestudent by id
exports.deleteFeeStudent = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'STUDENT'];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const feeStudent = await new FeeStudent({ id: id }).destroy();
    return feeStudent;
  } catch (err) {
    throw boom.boomify(err);
  }
};
