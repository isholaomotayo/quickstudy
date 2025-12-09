// External Dependancies
const boom = require('boom');

// Get Data Models
const State = require('../models/State');
const Student = require('../models/Student');
//Get knex

// Get states list
exports.getStates = async (req, reply) => {
  try {
    const states = await State.fetchAll();

    //return states.serialize(); this works too
    return states.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get an state by ID
exports.getStateById = async (req, reply) => {
  try {
    const id = req.params.id;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too

    const state = await new State({ id: id }).fetch({
      withRelated: ['country']
    });

    return state;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new state
exports.addState = async (req, reply) => {
  try {
    const params = req.body;
    const state = State.forge(params).save();
    return state;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing state
exports.updateState = async (req, reply) => {
  try {
    const id = req.params.id;
    const state = req.body;
    const { ...updateData } = state;
    const update = await State.forge({ id: id }).save(updateData, {
      patch: true
    });
    return update;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an state by id
exports.deleteState = async (req, reply) => {
  try {
    const id = req.params.id;
    const state = await new State({ id: id }).destroy();
    return state;
  } catch (err) {
    throw boom.boomify(err);
  }
};
