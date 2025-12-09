// External Dependancies
const Bookshelf = require('../config/connection').Bookshelf;
const cascadeDelete = require('bookshelf-cascade-delete');
Bookshelf.plugin(cascadeDelete);

const FeeStudentPaymentFrequency = Bookshelf.Model.extend(
  {
    tableName: 'fee_student_payment_frequency',
    hasTimestamps: true,
    feestudent() {
      return this.belongsTo('FeeStudent');
    },
    student() {
      return this.belongsTo('Student');
    }
  }
  //,
  //   feestudentpayments: function() {
  //     return this.hasMany('FeeStudentPayment');
  //   }
  // },
  // {
  //   dependents: ['feestudentpayments']
  // }
);

module.exports = Bookshelf.model(
  'FeeStudentPaymentFrequency',
  FeeStudentPaymentFrequency
);
