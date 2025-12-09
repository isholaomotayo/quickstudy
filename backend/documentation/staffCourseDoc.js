//endpoints and routes for all staffcourse
const staffCourseProperties = {
  id: { type: 'integer' },
  staff_id: { type: 'integer' },
  course_id: { type: 'integer' }
};

const swagger = {
  getStaffcourses: {
    tags: ['StaffCourse'],
    description: 'Get all staffcourse in the database',
    summary: 'Get all staffcourse in the database',
    query: {
      type: 'object',
      properties: staffCourseProperties
    }
  },
  addStaffcourse: {
    tags: ['StaffCourse'],
    description: 'Add new Staffcourse to the database',
    summary: 'Adds new Staffcourse to the database',
    params: {},
    body: {
      type: 'object',
      required: ['staff_id', 'course_id'],
      properties: staffCourseProperties
    }
  },
  getStaffcourseById: {
    tags: ['StaffCourse'],
    description: 'Retrieve a staffcourse from the database using the id',
    summary: 'Retrieve a staffcourse from the database',
    params: { id: { type: 'integer' } }
  },
  updateStaffcourse: {
    tags: ['StaffCourse'],
    description: 'Updates a staffcourse in the database',
    summary: 'Updates a staffcourse in the database',
    params: { id: { type: 'integer' } },
    body: {
      type: 'object',
      properties: staffCourseProperties
    }
  },
  deleteStaffcourse: {
    tags: ['StaffCourse'],
    description: 'Deletes a staffcourse from the database using the id',
    summary: 'Deletes a staffcourse from the database',
    params: { id: { type: 'integer' } }
  }
};

module.exports = swagger;
