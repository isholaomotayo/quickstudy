//endpoints and routes for all studentresult
const studentResultProperties = {
  id: { type: 'integer' },
  student_course_id: { type: 'integer' },
  score: { type: 'number' },
  cumulative_point: { type: 'number' },
  grade_id: { type: 'integer' },
  student_id: { type: 'integer' },

  student_course_ids: {
    type: 'array',
    items: { type: 'integer' }
  }
};

const swagger = {
  getStudentResults: {
    tags: ['Student-Result'],
    description: 'Get all studentresult in the database',
    summary: 'Get all studentresult in the database'
  },
  addStudentResult: {
    tags: ['Student-Result'],
    description: 'Add new Studentresult to the database',
    summary: 'Adds new Studentresult to the database',
    params: {},
    body: {
      type: 'object',
      required: ['student_course_id', 'score'],
      properties: studentResultProperties
    },
    response: {
      200: {
        description: 'New Studentresult',
        type: 'object',
        properties: studentResultProperties
      }
    }
  },
  getStudentResultByStudentId: {
    tags: ['Student-Result'],
    description: 'Retrieve studentresults from the database using a student id',
    summary: 'Retrieve studentresults from the database using a student id',
    params: { student_id: { type: 'integer' } }
  },
  updateStudentResult: {
    tags: ['Student-Result'],
    description: 'Updates a studentresult in the database',
    summary: 'Updates a studentresult in the database',
    params: { id: { type: 'integer' } },
    body: {
      type: 'object',
      properties: studentResultProperties
    }
  },
  deleteStudentResult: {
    tags: ['Student-Result'],
    description: 'Deletes a studentresult from the database using the id',
    summary: 'Deletes a studentresult from the database',
    params: { id: { type: 'integer' } }
  }
};

module.exports = swagger;
