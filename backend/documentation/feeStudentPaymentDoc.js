//endpoints and routes for all feeStudentPayment
const feeStudentPaymentProperties = {
  id: { type: 'integer' },
  transaction_id: { type: 'string' },
  fee_student_payment_frequency_id: { type: 'integer' },
  reference: { type: 'string' },
  amount: { type: 'number' },
  transaction_amount: { type: 'number' }
};

const swagger = {
  getFeeStudentPayments: {
    tags: ['Fee-Student-Payment'],
    description: 'Get all feeStudentPayment in the database',
    summary: 'Get all feeStudentPayment in the database'
  },
  addFeeStudentPayment: {
    tags: ['Fee-Student-Payment'],
    description: 'Add new feeStudentPayment to the database',
    summary: 'Adds new feeStudentPayment to the database',
    params: {},
    body: {
      type: 'object',
      required: ['fee_student_payment_frequency_id'],
      properties: feeStudentPaymentProperties
    }
  },
  getFeeStudentPaymentById: {
    tags: ['Fee-Student-Payment'],
    description: 'Retrieve a feeStudentPayment from the database using the id',
    summary: 'Retrieve a feeStudentPayment from the database',
    params: { id: { type: 'integer' } }
  },
  updateFeeStudentPayment: {
    tags: ['Fee-Student-Payment'],
    description: 'Updates a feeStudentPayment in the database',
    summary: 'Updates a feeStudentPayment in the database',
    params: { id: { type: 'integer' } },
    body: {
      type: 'object',
      properties: feeStudentPaymentProperties
    }
  },
  deleteFeeStudentPayment: {
    tags: ['Fee-Student-Payment'],
    description: 'Deletes a feeStudentPayment from the database using the id',
    summary: 'Deletes a feeStudentPayment from the database',
    params: { id: { type: 'integer' } }
  }
};

module.exports = swagger;
