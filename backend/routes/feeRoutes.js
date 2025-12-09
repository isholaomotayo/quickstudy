//endpoints and routes for all fee
const feeController = require('../controllers/feeController');
const feeDoc = require('../documentation/feeDoc');

const feeRoutes = [
  {
    method: 'GET',
    url: '/api/fee',
    handler: feeController.getFees,
    schema: feeDoc.getFees
  },
  {
    method: 'GET',
    url: '/api/fee/params',
    handler: feeController.getFeesByParams,
    schema: feeDoc.getFeesByParams
  },
  {
    method: 'POST',
    url: '/api/fee',
    handler: feeController.addFee,
    schema: feeDoc.addFee
  },
  {
    method: 'GET',
    url: '/api/fee/:id',
    handler: feeController.getFeeById,
    schema: feeDoc.getFeeById
  },
  {
    method: 'PUT',
    url: '/api/fee/:id',
    handler: feeController.updateFee,
    schema: feeDoc.updateFee
  },
  {
    method: 'DELETE',
    url: '/api/fee/:id',
    handler: feeController.deleteFee,
    schema: feeDoc.deleteFee
  }
];

module.exports = feeRoutes;
