//endpoints and routes for all feeStudentPaymentFrequency
const feeStudentPaymentFrequencyProperties = {
  id: { type: 'integer' },
  student_id: { type: 'integer' },
  fee_student_id: { type: 'integer' },
  payment_plan: { type: 'string' },
  payment_amount: { type: 'number' },
  total_amount: { type: 'number' }
};

const swagger = {
  getFeeStudentPaymentFrequencys: {
    tags: ['Fee-Student-Payment-Frequency'],
    description: 'Get all feeStudentPaymentFrequency in the database',
    summary: 'Get all feeStudentPaymentFrequency in the database'
  },
  addFeeStudentPaymentFrequency: {
    tags: ['Fee-Student-Payment-Frequency'],
    description: 'Add new feeStudentPaymentFrequency to the database',
    summary: 'Adds new feeStudentPaymentFrequency to the database',
    params: {},
    body: {
      type: 'object',
      required: ['student_id', 'fee_student_id'],
      properties: feeStudentPaymentFrequencyProperties
    }
  },
  getFeeStudentPaymentFrequencyById: {
    tags: ['Fee-Student-Payment-Frequency'],
    description:
      'Retrieve a feeStudentPaymentFrequency from the database using the id',
    summary: 'Retrieve a feeStudentPaymentFrequency from the database',
    params: { id: { type: 'integer' } }
  },
  updateFeeStudentPaymentFrequency: {
    tags: ['Fee-Student-Payment-Frequency'],
    description: 'Updates a feeStudentPaymentFrequency in the database',
    summary: 'Updates a feeStudentPaymentFrequency in the database',
    params: { id: { type: 'integer' } },
    body: {
      type: 'object',
      properties: feeStudentPaymentFrequencyProperties
    }
  },
  deleteFeeStudentPaymentFrequency: {
    tags: ['Fee-Student-Payment-Frequency'],
    description:
      'Deletes a feeStudentPaymentFrequency from the database using the id',
    summary: 'Deletes a feeStudentPaymentFrequency from the database',
    params: { id: { type: 'integer' } }
  },
  cascadeDeleteFeeStudentPaymentFrequency: {
    tags: ['Fee-Student-Payment-Frequency'],
    description:
      'Cascade Deletes a feeStudentPaymentFrequency and its associated feestudentpayment from the database using the id',
    summary:
      'Cascade Deletes a feeStudentPaymentFrequency and its associated feestudentpayment from the database',
    params: { fee_student_id: { type: 'integer' } }
  }
};

module.exports = swagger;
