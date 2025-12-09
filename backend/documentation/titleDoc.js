//endpoints and routes for all titles
const titleProperties = {
  id: { type: 'integer' },
  name: { type: 'string' }
};

const swagger = {
    //endpoint for all titles
  getTitles: {
    tags:['Title'],
    description: 'Get all titles in the database',
    summary: 'Get all titles in the database'
  },

  getTitleById: {
    tags:['Title'],
    description: 'Retrieve a title from the database using the id',
    summary: 'Retrieve a title from the database',
    params: { id: { type: 'integer' } }
    //body: {},
  },
  addTitle: {
    tags:['Title'],
    description: 'Adds a new title to the database',
    summary: 'Adds a new title to the database',
    params: {},
    body: {
      type: 'object',
      required: ['name'],
      properties: titleProperties
    }
  },

  updateTitle: {
    tags:['Title'],
    description: 'Updates an new title in the database',
    summary: 'Updates an title in the database',
    params: { id: { type: 'integer' } },
    body: {
      type: 'object',
      properties: titleProperties
    }
  },
  deleteTitle: {
    tags:['Title'],
    description: 'Delete an title from the database using the id',
    summary: 'Delete an title from the database',
    params: { id: { type: 'integer' } },
  },
};

module.exports = swagger;
