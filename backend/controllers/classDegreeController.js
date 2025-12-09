// External Dependancies
const boom = require('boom');

// Get Data Models
const ClassDegree = require('../models/ClassDegree');
//Get knex

// Get ClassDegrees list
exports.getClassDegrees = async (req, reply) => {
  try {
    const countries  = await ClassDegree.fetchAll();
    return countries.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get an country by ID
exports.getClassDegreeById = async (req, reply) => {
  try {
    const id = req.params.id;
    const country = await new ClassDegree({ 'id': id }).fetch();
    return country;
  } catch (err) {

    throw boom.boomify(err);
  }
};

 //Add a new country
exports.addClassDegree = async (req, reply) => {
  try {
    const params = req.body;
    const country = ClassDegree.forge(params).save()
    return country;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing country
exports.updateClassDegree = async (req, reply) => {
  try {
    const id = req.params.id;
    const country = req.body;
    const { ...updateData } = country;
    const update = await ClassDegree.forge({'id':id}).save(updateData,{'patch':true})
    return update;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an country by id
exports.deleteClassDegree = async (req, reply) => {
  try {
    const id = req.params.id;
    const country = await new ClassDegree({id: id}).destroy();
    return country;
  } catch (err) {
    throw boom.boomify(err);
  }
}; 
