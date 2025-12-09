//endpoints and routes for all semesters
const semesterProperties = {
  id: { type: 'integer' },
  name: { type: 'string' },
  session_id: { type: 'integer' },
  position: { type: 'integer' },
  start_date: { type: 'string' },
  end_date: { type: 'string' },
  institution_id: { type: 'integer' },
};

const swagger = {
    //endpoint for all semesters
  getSemesters: {
    tags:['Semester'],
    description: 'Get all semesters in the database',
    summary: 'Get all semesters in the database'
  },

  getSemesterById: {
    tags:['Semester'],
    description: 'Retrieve a semester from the database using the id',
    summary: 'Retrieve a semester from the database',
    params: { id: { type: 'integer' } }
    //body: {},
  },
  addSemester: {
    tags:['Semester'],
    description: 'Adds a new semester to the database',
    summary: 'Adds a new semester to the database',
    params: {},
    body: {
      type: 'object',
      required: ['name'],
      properties: semesterProperties
    }
  },

  updateSemester: {
    tags:['Semester'],
    description: 'Updates an new semester in the database',
    summary: 'Updates an semester in the database',
    params: { id: { type: 'integer' } },
    body: {
      type: 'object',
      properties: semesterProperties
    }
  },
  deleteSemester: {
    tags:['Semester'],
    description: 'Delete an semester from the database using the id',
    summary: 'Delete an semester from the database',
    params: { id: { type: 'integer' } },
  },
};

module.exports = swagger;
