// External Dependancies
const Bookshelf = require('../config/connection').Bookshelf;

const FeeStudentPayment = Bookshelf.Model.extend({
  tableName: 'fee_student_payment',
  hasTimestamps: true,
  feestudentpaymentfrequency() {
    return this.belongsTo('FeeStudentPaymentFrequency');
  }
});

module.exports = Bookshelf.model('FeeStudentPayment', FeeStudentPayment);
