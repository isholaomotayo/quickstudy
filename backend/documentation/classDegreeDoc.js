//endpoints and routes for all classDegree
const classDegreeProperties = {
  id: { type: 'integer' },
  name: { type: 'string' },
  code: { type: 'string' },
  min_point: { type: 'number' },
  max_point: { type: 'number' },
};

const swagger = {
  getClassDegrees: {
    tags: ['Class-Degree'],
    description: 'Get all classDegree in the database',
    summary: 'Get all classDegree in the database',
    response: {
      200: {
        description: 'Array containing all grades',
        type: 'array',
        items: { type: 'object', properties: classDegreeProperties }
      }
    }
  },
  addClassDegree: {
    tags: ['Class-Degree'],
    description: 'Add new ClassDegree to the database',
    summary: 'Adds new ClassDegree to the database',
    params: {},
    body: {
      type: 'object',
      required: ['name'],
      properties: classDegreeProperties
    },
    response: {
      200: {
        description: 'New ClassDegree',
        type: 'object',
        properties: classDegreeProperties
      }
    }
  },
  getClassDegreeById: {
    tags: ['Class-Degree'],
    description: 'Retrieve a classDegree from the database using the id',
    summary: 'Retrieve a classDegree from the database',
    params: { id: { type: 'integer' } }
  },
  updateClassDegree: {
    tags: ['Class-Degree'],
    description: 'Updates a classDegree in the database',
    summary: 'Updates a classDegree in the database',
    params: { id: { type: 'integer' } },
    body: {
      type: 'object',
      properties: classDegreeProperties
    }
  },
  deleteClassDegree: {
    tags: ['Class-Degree'],
    description: 'Deletes a classDegree from the database using the id',
    summary: 'Deletes a classDegree from the database',
    params: { id: { type: 'integer' } }
  }
};

module.exports = swagger;
