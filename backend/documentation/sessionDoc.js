//endpoints and routes for all sessions
const sessionProperties = {
  id: { type: 'integer' },
  name: { type: 'string' },
  start_year: { type: 'string' },
  end_year: { type: 'string' }
};

const swagger = {
    //endpoint for all sessions
  getSessions: {
    tags:['Session'],
    description: 'Get all sessions in the database',
    summary: 'Get all sessions in the database'
  },

  getSessionById: {
    tags:['Session'],
    description: 'Retrieve a session from the database using the id',
    summary: 'Retrieve a session from the database',
    params: { id: { type: 'integer' } }
    //body: {},
  },
  addSession: {
    tags:['Session'],
    description: 'Adds a new session to the database',
    summary: 'Adds a new session to the database',
    params: {},
    body: {
      type: 'object',
      required: ['name','start_year','end_year'],
      properties: sessionProperties
    }
  },

  updateSession: {
    tags:['Session'],
    description: 'Updates an new session in the database',
    summary: 'Updates an session in the database',
    params: { id: { type: 'integer' } },
    body: {
      type: 'object',
      properties: sessionProperties
    }
  },
  deleteSession: {
    tags:['Session'],
    description: 'Delete an session from the database using the id',
    summary: 'Delete an session from the database',
    params: { id: { type: 'integer' } },
  },
};

module.exports = swagger;
