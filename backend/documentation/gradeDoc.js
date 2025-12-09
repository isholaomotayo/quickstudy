//endpoints and routes for all staff
const gradeProperties = {
  id: { type: 'integer' },
  name: { type: 'string', value: 'Test' },
  weight: { type: 'integer' },
  min_score: { type: 'integer' },
  max_score: { type: 'integer' },
  institution_id: { type: 'integer' }
};

const swagger = {
  //endpoint for all grades
  getGrades: {
    tags: ['Grade'],
    description: 'Get all grades in the database',
    summary: 'Get all grades in the database',
    response: {
      200: {
        description: 'Array containing all grades',
        type: 'array',
        items: { type: 'object', properties: gradeProperties }
      }
    }
  },

  getGradeById: {
    tags: ['Grade'],
    description: 'Retrieve an grade from the database using the id',
    summary: 'Retrieve an grade from the database',
    params: { id: { type: 'integer' } }
    //body: {},
  },
  addGrade: {
    tags: ['Grade'],
    description: 'Adds a new grade to the database',
    summary: 'Adds a new grade to the database',
    params: {},
    body: {
      type: 'object',
      required: ['name'],
      properties: gradeProperties
    }
  },

  updateGrade: {
    tags: ['Grade'],
    description: 'Updates an new grade in the database',
    summary: 'Updates an grade in the database',
    params: { id: { type: 'integer' } },
    body: {
      type: 'object',
      properties: gradeProperties
    }
  },
  deleteGrade: {
    tags: ['Grade'],
    description: 'Delete an grade from the database using the id',
    summary: 'Delete an grade from the database',
    params: { id: { type: 'integer' } }
  }
};

module.exports = swagger;
