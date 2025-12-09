// External Dependancies
const boom = require('boom');
const checkAccess = require('../helpers/utils').checkAccess;

// Get Data Models
const FeeStudentPayment = require('../models/FeeStudentPayment');

// Get all feestudents
exports.getFeeStudentPayments = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'STUDENT'];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    let query = FeeStudentPayment.forge();

    if (req.query) {
      for (var key in req.query) {
        if (typeof req.query[key] == 'object') {
          query.where(key, 'IN', req.query[key]);
        } else {
          query.where(key, req.query[key]);
        }
      }
    }

    const feeStudentPayment = await query.fetchAll({
      withRelated: ['feestudentpaymentfrequency']
    });
    return feeStudentPayment.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get a feestudent by ID
exports.getFeeStudentPaymentById = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'STUDENT'];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too

    const feeStudentPayment = await new FeeStudentPayment({ id: id }).fetch({
      withRelated: ['feestudentpaymentfrequency']
    });

    return feeStudentPayment;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new feestudent
exports.addFeeStudentPayment = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'STUDENT'];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const params = req.body;
    const feeStudentPayment = await FeeStudentPayment.forge(params).save();
    return feeStudentPayment.fetch({
      withRelated: ['feestudentpaymentfrequency.feestudent']
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing feestudent
exports.updateFeeStudentPayment = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'STUDENT'];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const feeStudentPayment = req.body;
    const { ...updateData } = feeStudentPayment;
    const update = await FeeStudentPayment.forge({ id: id }).save(updateData, {
      patch: true
    });
    return update.fetch({
      withRelated: ['feestudentpaymentfrequency']
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an feestudent by id
exports.deleteFeeStudentPayment = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'STUDENT'];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const feeStudentPayment = await new FeeStudentPayment({ id: id }).destroy();
    return feeStudentPayment;
  } catch (err) {
    throw boom.boomify(err);
  }
};
