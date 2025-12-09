// External Dependancies
const boom = require('boom');

// Get Data Models
const Lga = require('../models/Lga');
//Get knex

// Get lgas list
exports.getLgas = async (req, reply) => {
  try {
    const lgas  = await Lga.fetchAll();
    
    //return lgas.serialize(); this works too
    return lgas.models;

  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get an lga by ID
exports.getLgaById = async (req, reply) => {
  try {
    const id = req.params.id;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too

    const lga = await new Lga({ 'id': id }).fetch({withRelated: ['state.country']});
    
    return lga;
    
  } catch (err) {

    throw boom.boomify(err);
  }
};

 //Add a new lga
 exports.addLga = async (req, reply) => {
  try {
    const params = req.body;
    const lga = Lga.forge(params).save()
    return lga;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing lga
exports.updateLga = async (req, reply) => {
  try {
    const id = req.params.id;
    const lga = req.body;
    const { ...updateData } = lga;
    const update = await Lga.forge({'id':id}).save(updateData,{'patch':true})
    return update;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an lga by id
exports.deleteLga = async (req, reply) => {
  try {
    const id = req.params.id;
    const lga = await new Lga({id: id}).destroy();
    return lga;
  } catch (err) {
    throw boom.boomify(err);
  }
}; 
