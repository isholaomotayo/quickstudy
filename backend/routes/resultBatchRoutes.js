//endpoints and routes for all resultbatch
const resultBatchController = require('../controllers/resultBatchController');
const resultBatchDoc = require('../documentation/resultBatchDoc');

const routes = [
  {
    method: 'GET',
    url: '/api/resultbatch',
    handler: resultBatchController.getResultBatches,
    schema: resultBatchDoc.getResultBatches
  },
  {
    method: 'POST',
    url: '/api/resultbatch',
    handler: resultBatchController.addResultBatch,
    schema: resultBatchDoc.addResultBatch
  },
  {
    method: 'GET',
    url: '/api/resultbatch/:id',
    handler: resultBatchController.getResultBatchById,
    schema: resultBatchDoc.getResultBatchById
  },
  {
    method: 'PUT',
    url: '/api/resultbatch/:id',
    handler: resultBatchController.updateResultBatch,
    schema: resultBatchDoc.updateResultBatch
  },
  {
    method: 'DELETE',
    url: '/api/resultbatch/:id',
    handler: resultBatchController.deleteResultBatch,
    schema: resultBatchDoc.deleteResultBatch
  }
];

module.exports = routes;
