//endpoints and routes for all feestudent
const feeStudentPaymentController = require('../controllers/feeStudentPaymentController');
const feeStudentPaymentDoc = require('../documentation/feeStudentPaymentDoc');

const routes = [
  {
    method: 'GET',
    url: '/api/feestudentpayment',
    handler: feeStudentPaymentController.getFeeStudentPayments,
    schema: feeStudentPaymentDoc.getFeeStudentPayments
  },
  {
    method: 'POST',
    url: '/api/feestudentpayment',
    handler: feeStudentPaymentController.addFeeStudentPayment,
    schema: feeStudentPaymentDoc.addFeeStudentPayment
  },
  {
    method: 'GET',
    url: '/api/feestudentpayment/:id',
    handler: feeStudentPaymentController.getFeeStudentPaymentById,
    schema: feeStudentPaymentDoc.getFeeStudentPaymentById
  },
  {
    method: 'PUT',
    url: '/api/feestudentpayment/:id',
    handler: feeStudentPaymentController.updateFeeStudentPayment,
    schema: feeStudentPaymentDoc.updateFeeStudentPayment
  },
  {
    method: 'DELETE',
    url: '/api/feestudentpayment/:id',
    handler: feeStudentPaymentController.deleteFeeStudentPayment,
    schema: feeStudentPaymentDoc.deleteFeeStudentPayment
  }
];

module.exports = routes;
