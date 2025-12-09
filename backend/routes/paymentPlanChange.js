//endpoints and routes for all feestudent
const paymentPlanChange = require("../controllers/paymentPlanChange");
const paymentPlanChangeDoc = require("../documentation/paymentPlanChangeDoc");

const routes = [
  {
    method: "POST",
    url: "/api/paymentplan",
    handler: paymentPlanChange.paymentPlanChange,
    schema: paymentPlanChangeDoc.paymentPlanChange
  }
  //   ,
  //   {
  //     method: 'POST',
  //     url: '/api/feestudent',
  //     handler: feeStudentController.addFeeStudent,
  //     schema: feeStudentDoc.addFeeStudent
  //   },
  //   {
  //     method: 'GET',
  //     url: '/api/feestudent/:id',
  //     handler: feeStudentController.getFeeStudentById,
  //     schema: feeStudentDoc.getFeeStudentById
  //   },
  //   {
  //     method: 'PUT',
  //     url: '/api/feestudent/:id',
  //     handler: feeStudentController.updateFeeStudent,
  //     schema: feeStudentDoc.updateFeeStudent
  //   },
  //   {
  //     method: 'DELETE',
  //     url: '/api/feestudent/:id',
  //     handler: feeStudentController.deleteFeeStudent,
  //     schema: feeStudentDoc.deleteFeeStudent
  //   }
];

module.exports = routes;
