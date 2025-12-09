//endpoints and routes for all fee student
const feeProperties = {
  id: { type: 'integer' },
  name: { type: 'string' },
  description: { type: 'string' },
  institution_id: { type: 'integer' },
  amount: { type: 'number' },
  frequency: { type: 'integer' },
  optional: { type: 'integer' },
  compulsory: { type: 'integer' },
  isession_id: { type: 'integer' },
  faculty_id: { type: 'integer' },
  department_id: { type: 'integer' },
  programme_id: { type: 'integer' },
  level_id: { type: 'integer' }
};

const feeStudentProperties = {
  id: { type: 'integer' },
  name: { type: 'string' },
  payment_plan: {
    type: 'string',
    enum: ['PAY IN FULL', 'PER SESSION', 'PER SEMESTER', 'MONTHLY']
  },
  student_id: { type: 'integer' },
  semester_id: { type: 'integer' },
  total_amount: { type: 'number' },

  fees: {
    type: 'object',
    properties: {
      item: {
        type: 'object',
        properties: feeProperties
      }
    }
  }
};

const swagger = {
  getFeeStudents: {
    tags: ['Fee-Student'],
    description: 'Get all fee student in the database',
    summary: 'Get all fee student in the database'
  },
  getFeeStudentById: {
    tags: ['Fee-Student'],
    description: 'Retrieve a fee student from the database using the id',
    summary: 'Retrieve a fee student from the database',
    params: { id: { type: 'integer' } }
  },
  addFeeStudent: {
    tags: ['Fee-Student'],
    description: 'Add new Feestudent to the database',
    summary: 'Adds new Feestudent to the database',
    params: {},
    body: {
      type: 'object',
      required: ['student_id', 'semester_id', 'payment_plan', 'name'],
      properties: feeStudentProperties
    },
    response: {
      200: {
        description: 'New Feestudent',
        type: 'object',
        properties: feeStudentProperties
      }
    }
  },
  updateFeeStudent: {
    tags: ['Fee-Student'],
    description: 'Updates a fee student in the database',
    summary: 'Updates a fee student in the database',
    params: { id: { type: 'integer' } },
    body: {
      type: 'object',
      properties: feeStudentProperties
    }
  },
  deleteFeeStudent: {
    tags: ['Fee-Student'],
    description: 'Deletes a fee student from the database using the id',
    summary: 'Deletes a fee student from the database',
    params: { id: { type: 'integer' } }
  }
};

module.exports = swagger;
