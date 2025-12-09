// External Dependancies
const boom = require('boom');

// Get Data Models
const Title = require('../models/Title');
//Get knex

// Get titles list
exports.getTitles = async (req, reply) => {
  try {
    const titles  = await Title.fetchAll();
    
    //return titles.serialize(); this works too
    return titles.models;

  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get an title by ID
exports.getTitleById = async (req, reply) => {
  try {
    const id = req.params.id;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too

    const title = await new Title({ 'id': id }).fetch();
    
    return title;
    
  } catch (err) {

    throw boom.boomify(err);
  }
};

 //Add a new title
 exports.addTitle = async (req, reply) => {
  try {
    const params = req.body;
    const title = Title.forge(params).save()
    return title;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing title
exports.updateTitle = async (req, reply) => {
  try {
    const id = req.params.id;
    const title = req.body;
    const { ...updateData } = title;
    const update = await Title.forge({'id':id}).save(updateData,{'patch':true})
    return update;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an title by id
exports.deleteTitle = async (req, reply) => {
  try {
    const id = req.params.id;
    const title = await new Title({id: id}).destroy();
    return title;
  } catch (err) {
    throw boom.boomify(err);
  }
}; 
