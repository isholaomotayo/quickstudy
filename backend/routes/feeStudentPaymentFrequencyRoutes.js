//endpoints and routes for all feestudent
const feeStudentPaymentFrequencyController = require('../controllers/feeStudentPaymentFrequencyController');
const feeStudentPaymentFrequencyDoc = require('../documentation/feeStudentPaymentFrequencyDoc');

const routes = [
  {
    method: 'GET',
    url: '/api/feestudentpaymentfrequency',
    handler:
      feeStudentPaymentFrequencyController.getFeeStudentPaymentFrequencys,
    schema: feeStudentPaymentFrequencyDoc.getFeeStudentPaymentFrequencys
  },
  {
    method: 'POST',
    url: '/api/feestudentpaymentfrequency',
    handler: feeStudentPaymentFrequencyController.addFeeStudentPaymentFrequency,
    schema: feeStudentPaymentFrequencyDoc.addFeeStudentPaymentFrequency
  },
  {
    method: 'GET',
    url: '/api/feestudentpaymentfrequency/:id',
    handler:
      feeStudentPaymentFrequencyController.getFeeStudentPaymentFrequencyById,
    schema: feeStudentPaymentFrequencyDoc.getFeeStudentPaymentFrequencyById
  },
  {
    method: 'PUT',
    url: '/api/feestudentpaymentfrequency/:id',
    handler:
      feeStudentPaymentFrequencyController.updateFeeStudentPaymentFrequency,
    schema: feeStudentPaymentFrequencyDoc.updateFeeStudentPaymentFrequency
  },
  {
    method: 'DELETE',
    url: '/api/feestudentpaymentfrequency/:id',
    handler:
      feeStudentPaymentFrequencyController.deleteFeeStudentPaymentFrequency,
    schema: feeStudentPaymentFrequencyDoc.deleteFeeStudentPaymentFrequency
  },
  {
    method: 'DELETE',
    url: '/api/feestudentpaymentfrequency/cascadedelete/:fee_student_id',
    handler:
      feeStudentPaymentFrequencyController.cascadeDeleteFeeStudentPaymentFrequency,
    schema:
      feeStudentPaymentFrequencyDoc.cascadeDeleteFeeStudentPaymentFrequency
  }
];

module.exports = routes;
