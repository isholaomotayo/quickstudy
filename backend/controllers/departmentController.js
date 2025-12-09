const boom = require('boom');
const Department = require('../models/Department');
const Institution = require('../models/Institution');
const checkAccess = require('../helpers/utils').checkAccess;

// Get all Departments
exports.list = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN'];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  let query = Department.forge().orderBy('id', 'desc'),
    preFetched = false,
    departments = [];
  
  if (validatedUser.role == "STAFF") {
    query.where("id", +validatedUser.staff.department_id)
  } else if (validatedUser.role == "HOD") {
    query.where("id", +validatedUser.staff.department_id);
  } else if (validatedUser.role == "ADMIN") {
    preFetched = true
    let wr = { withRelated: "departments" }

    if (filterKey && filterValue) {
      wr = { withRelated: {
          "departments": query => {
            query.where(filterKey, +filterValue)
          }
      }}
    }

    const institution = await Institution.where(
      "id",
      validatedUser.institution_id
    ).fetch(wr);

    if (
      institution &&
      institution.relations &&
      institution.relations.departments
    ) {
      departments = institution.relations.departments
    }
    //console.log('>>>>>>>admin departments>>>>>>>>>', departments.models)
  } else if (validatedUser.role == "SUPERADMIN") {
    // Don't filter
  } else {
    // Incase we add a new role and forget to filter ;)
    throw boom.boomify("Improper access")
  }

  if (filterKey && filterValue && !preFetched) query.where(filterKey, +filterValue)
  
  try {
    if (!preFetched) departments = await query.fetchAll({ withRelated: ['faculty'] })
    if (departments.models) departments = departments.models

    return departments
  } catch (err) {
    throw boom.boomify(err)
  }
}

exports.get = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD'];
  // const { validatedUser, filterKey, filterValue } = checkAccess(
  //   req,
  //   reply,
  //   allowedRoles
  // );

  try {
    const department = await Department.where('id', req.params.id).fetch({
      withRelated: ['faculty', 'programmes']
    });
    //const Department = await Department.forge({id: req.params.id}).fetch();
    return department;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.add = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN'];
  // const { validatedUser, filterKey, filterValue } = checkAccess(
  //   req,
  //   reply,
  //   allowedRoles
  // );

  try {
    const newDepartment = await Department.forge(req.body).save();

    return newDepartment.fetch({ withRelated: ['faculty'] });
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.update = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN', 'HOD'];
  // const { validatedUser, filterKey, filterValue } = checkAccess(
  //   req,
  //   reply,
  //   allowedRoles
  // );

  try {
    const department = await Department.where('id', req.params.id).fetch({
      withRelated: ['faculty']
    });
    if (department) {
      department.set(req.body);
      await department.save();
    }

    return department;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.delete = async (req, reply) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN'];
  // const { validatedUser, filterKey, filterValue } = checkAccess(
  //   req,
  //   reply,
  //   allowedRoles
  // );

  try {
    const info = await Department.where('id', req.params.id).destroy();
    return info;
  } catch (err) {
    throw boom.boomify(err);
  }
};
