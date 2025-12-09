// External Dependancies
const boom = require("boom");

// Get Data Models
const Grade = require("../models/Grade");

// Get grades list
exports.getGrades = async (req, reply) => {
  try {
    const grades = await Grade.fetchAll();

    if (!grades.models || grades.models.length === 0) {
      console.log("No grades found in database");
      throw new Error(
        "No grades configured in the system. Please contact administrator to set up grades."
      );
    }

    return grades.models;
  } catch (err) {
    console.error("Error fetching grades:", err);
    throw boom.boomify(err);
  }
};

// Get an grade by ID
exports.getGradeById = async (req, reply) => {
  try {
    const id = req.params.id;
    const grade = await new Grade({ id: id }).fetch();
    return grade;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new grade
exports.addGrade = async (req, reply) => {
  try {
    const params = req.body;
    const grade = await Grade.forge(params).save();
    return grade;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing grade
exports.updateGrade = async (req, reply) => {
  try {
    const id = req.params.id;
    const grade = req.body;
    const { ...updateData } = grade;
    const update = await Grade.forge({ id: id }).save(updateData, {
      patch: true,
    });
    return update;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete a grade by id
exports.deleteGrade = async (req, reply) => {
  try {
    const id = req.params.id;
    const grade = await new Grade({ id: id }).destroy();
    return grade;
  } catch (err) {
    throw boom.boomify(err);
  }
};
