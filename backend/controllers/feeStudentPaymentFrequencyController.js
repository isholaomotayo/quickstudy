// External Dependancies
const boom = require('boom');
const checkAccess = require('../helpers/utils').checkAccess;

// Get Data Models
const FeeStudentPaymentFrequency = require('../models/FeeStudentPaymentFrequency');
const FeeStudent = require('../models/FeeStudent');

// Get all feestudentpaymentfrequencys
exports.getFeeStudentPaymentFrequencys = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'STUDENT'];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    let query = FeeStudentPaymentFrequency.forge();

    if (req.query) {
      for (var key in req.query) {
        if (typeof req.query[key] == 'object') {
          query.where(key, 'IN', req.query[key]);
        } else {
          query.where(key, req.query[key]);
        }
      }
    }

    const feeStudentPaymentFrequency = await query.fetchAll({
      withRelated: ['student', 'feestudent']
    });
    return feeStudentPaymentFrequency.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get a feestudentpaymentfrequency by ID
exports.getFeeStudentPaymentFrequencyById = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'STUDENT'];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too

    const feeStudentPaymentFrequency = await new FeeStudentPaymentFrequency({
      id: id
    }).fetch({
      withRelated: ['student', 'feestudent'] // , 'feestudent'
    });

    return feeStudentPaymentFrequency;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new feestudentpaymentfrequency
exports.addFeeStudentPaymentFrequency = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'STUDENT'];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const params = req.body;
    const paymentPlan = req.body.payment_plan;
    const feeStudentId = req.body.fee_student_id;
    const feeName = await getFeeStudentName(feeStudentId);

    let no_inserts;
    let data = [];

    if (paymentPlan === 'MONTHLY') {
      //insert the data 12tiimes in the db
      no_inserts = 18;
    } else if (paymentPlan === 'PAY IN FULL') {
      no_inserts = 1;
    } else if (paymentPlan === 'PER SESSION') {
      no_inserts = 2;
    } else if (paymentPlan === 'PER SEMESTER') {
      no_inserts = 4;
    }
    if (
      (paymentPlan == 'PER SEMESTER' || paymentPlan == 'PER SESSION') &&
      feeName == 'Pre-MBA School Fees'
    ) {
      //Pre MBA fees
      no_inserts = 1;
    }
    if (paymentPlan == 'MONTHLY' && feeName == 'Pre-MBA School Fees') {
      //Pre MBA fees
      no_inserts = 5;
    }

    for (let i = 0; i < no_inserts; i++) {
      data.push(params);
    }

    return await FeeStudentPaymentFrequency.collection(data)
      .invokeThen('save')
      .then(function(result) {
        // ... all models in the collection have been saved
        return result[0].fetch({
          withRelated: ['student', 'feestudent']
        });
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing feestudentpaymentfrequency
exports.updateFeeStudentPaymentFrequency = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'STUDENT'];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const feeStudentPaymentFrequency = req.body;
    const { ...updateData } = feeStudentPaymentFrequency;
    const update = await FeeStudentPaymentFrequency.forge({ id: id }).save(
      updateData,
      {
        patch: true
      }
    );
    return update.fetch({
      withRelated: ['student']
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an feestudentpaymentfrequency by id
exports.deleteFeeStudentPaymentFrequency = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD', 'STAFF', 'STUDENT'];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const feeStudentPaymentFrequency = await new FeeStudentPaymentFrequency({
      id: id
    }).destroy();
    return feeStudentPaymentFrequency;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an feestudentpaymentfrequency by fee_student_id
exports.cascadeDeleteFeeStudentPaymentFrequency = async (req, res) => {
  try {
    if (req.params.fee_student_id) {
      await new FeeStudentPaymentFrequency({
        fee_student_id: req.params.fee_student_id
      }).destroy();
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};
async function getFeeStudentName(fee_student_id) {
  //const feeStudent = await FeeStudent.where('id', fee_student_id).fetch();
  const feeStudent = await new FeeStudent({
    id: fee_student_id
  }).fetch();

  if (!(feeStudent && feeStudent.id)) return;
  return feeStudent.attributes.name;
}
