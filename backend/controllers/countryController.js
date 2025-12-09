// External Dependancies
const boom = require('boom');

// Get Data Models
const Country = require('../models/Country');
//Get knex

// Get countries list
exports.getCountries = async (req, reply) => {
  try {
    const countries  = await Country.fetchAll();
    return countries.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get an country by ID
exports.getCountryById = async (req, reply) => {
  try {
    const id = req.params.id;
    const country = await new Country({ 'id': id }).fetch();
    return country;
  } catch (err) {

    throw boom.boomify(err);
  }
};

 //Add a new country
exports.addCountry = async (req, reply) => {
  try {
    const params = req.body;
    const country = Country.forge(params).save()
    return country;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing country
exports.updateCountry = async (req, reply) => {
  try {
    const id = req.params.id;
    const country = req.body;
    const { ...updateData } = country;
    const update = await Country.forge({'id':id}).save(updateData,{'patch':true})
    return update;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an country by id
exports.deleteCountry = async (req, reply) => {
  try {
    const id = req.params.id;
    const country = await new Country({id: id}).destroy();
    return country;
  } catch (err) {
    throw boom.boomify(err);
  }
}; 
