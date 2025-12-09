//endpoints and routes for all feestudent
const feeStudentController = require('../controllers/feeStudentController');
const feeStudentDoc = require('../documentation/feeStudentDoc');

const routes = [
  {
    method: 'GET',
    url: '/api/feestudent',
    handler: feeStudentController.getFeeStudents,
    schema: feeStudentDoc.getFeeStudents
  },
  {
    method: 'POST',
    url: '/api/feestudent',
    handler: feeStudentController.addFeeStudent,
    schema: feeStudentDoc.addFeeStudent
  },
  {
    method: 'GET',
    url: '/api/feestudent/:id',
    handler: feeStudentController.getFeeStudentById,
    schema: feeStudentDoc.getFeeStudentById
  },
  {
    method: 'PUT',
    url: '/api/feestudent/:id',
    handler: feeStudentController.updateFeeStudent,
    schema: feeStudentDoc.updateFeeStudent
  },
  {
    method: 'DELETE',
    url: '/api/feestudent/:id',
    handler: feeStudentController.deleteFeeStudent,
    schema: feeStudentDoc.deleteFeeStudent
  }
];

module.exports = routes;
