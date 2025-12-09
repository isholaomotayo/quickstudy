//endpoints and routes for all states
const stateProperties = {
  id: { type: 'integer' },
  name: { type: 'string' },
  code: { type: 'string' },
  country_id: { type: 'integer' }
};

const swagger = {
    //endpoint for all states
  getStates: {
    tags:['State'],
    description: 'Get all states in the database',
    summary: 'Get all states in the database'
  },

  getStateById: {
    tags:['State'],
    description: 'Retrieve a state from the database using the id',
    summary: 'Retrieve a state from the database',
    params: { id: { type: 'integer' } }
    //body: {},
  },
  addState: {
    tags:['State'],
    description: 'Adds a new state to the database',
    summary: 'Adds a new state to the database',
    params: {},
    body: {
      type: 'object',
      required: ['name'],
      properties: stateProperties
    }
  },

  updateState: {
    tags:['State'],
    description: 'Updates an new state in the database',
    summary: 'Updates an state in the database',
    params: { id: { type: 'integer' } },
    body: {
      type: 'object',
      properties: stateProperties
    }
  },
  deleteState: {
    tags:['State'],
    description: 'Delete an state from the database using the id',
    summary: 'Delete an state from the database',
    params: { id: { type: 'integer' } },
    
  },
};


module.exports = swagger;