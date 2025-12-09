// External Dependancies
const boom = require('boom');

// Get Data Models
const ResultBatch = require('../models/ResultBatch');

// Get all resultBatches
exports.getResultBatches = async (req, reply) => {
  try {
    const resultBatch = await ResultBatch.fetchAll({
      withRelated: ['semester', 'course']
    });
    return resultBatch.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get resultBatchs by Student ID with published set as true
exports.getResultBatchById = async (req, reply) => {
  try {
    const id = req.params.id;

    const resultBatch = await new ResultBatch({ id: id }).fetch({
      withRelated: ['semester', 'course']
    });

    return resultBatch;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new resultBatch
exports.addResultBatch = async (req, reply) => {
  try {
    const params = req.body;
    const resultBatch = await ResultBatch.forge(params).save();
    return resultBatch.fetch({
      withRelated: ['semester', 'course']
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing resultBatch
exports.updateResultBatch = async (req, reply) => {
  try {
    const id = req.params.id;
    const resultBatch = req.body;
    const { ...updateData } = resultBatch;
    const update = await ResultBatch.forge({ id: id }).save(updateData, {
      patch: true
    });
    return update.fetch({
      withRelated: ['semester', 'course']
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an resultBatch by id
exports.deleteResultBatch = async (req, reply) => {
  try {
    const id = req.params.id;
    const resultBatch = await new ResultBatch({ id: id }).destroy();
    return resultBatch;
  } catch (err) {
    throw boom.boomify(err);
  }
};
