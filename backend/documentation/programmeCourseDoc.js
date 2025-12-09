//endpoints and routes for all Programmecourse
const programmeCourseProperties = {
  id: { type: 'integer' },
  programme_id: { type: 'integer' },
  course_id: { type: 'integer' },
  level_id: { type: 'integer' },
  units: { type: 'integer' },
  semester_position: { type: 'integer' }
};

const swagger = {
  getProgrammeCourses: {
    tags: ['Programme-Course'],
    description: 'Get all ProgrammeCourse in the database',
    summary: 'Get all ProgrammeCourse in the database'
  },
  addProgrammeCourse: {
    tags: ['Programme-Course'],
    description: 'Add new ProgrammeCourse to the database',
    summary: 'Adds new ProgrammeCourse to the database',
    params: {},
    body: {
      type: 'object',
      required: ['course_id'],
      properties: programmeCourseProperties
    }
  },
  getProgrammeCourseById: {
    tags: ['Programme-Course'],
    description: 'Retrieve a ProgrammeCourse from the database using the id',
    summary: 'Retrieve a ProgrammeCourse from the database',
    params: { id: { type: 'integer' } }
  },
  updateProgrammeCourse: {
    tags: ['Programme-Course'],
    description: 'Updates a ProgrammeCourse in the database',
    summary: 'Updates a ProgrammeCourse in the database',
    params: { id: { type: 'integer' } },
    body: {
      type: 'object',
      properties: programmeCourseProperties
    }
  },
  deleteProgrammeCourse: {
    tags: ['Programme-Course'],
    description: 'Deletes a ProgrammeCourse from the database using the id',
    summary: 'Deletes a ProgrammeCourse from the database',
    params: { id: { type: 'integer' } }
  },
  getProgrammeCourseByProgrammeId: {
    tags: ['Programme-Course'],
    description:
      'Retrieve ProgrammeCourses from the database using the Programme id',
    summary: 'Retrieve ProgrammeCourses from the database',
    params: { programme_id: { type: 'integer' } }
  },
  getProgrammeCourseBySearchParams: {
    tags: ['Programme-Course'],
    description:
      'Retrieve ProgrammeCourses from the database using the search parameters specified',
    summary: 'Retrieve ProgrammeCourses from the database',

    query: programmeCourseProperties
  }
};

module.exports = swagger;
