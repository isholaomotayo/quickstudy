//endpoints and routes for all lgas
const lgaProperties = {
  id: { type: 'integer' },
  name: { type: 'string' },
  state_id: { type: 'integer' }
};

const swagger = {
    //endpoint for all lgas
  getLgas: {
    tags:['Lga'],
    description: 'Get all lgas in the database',
    summary: 'Get all lgas in the database'
  },

  getLgaById: {
    tags:['Lga'],
    description: 'Retrieve a lga from the database using the id',
    summary: 'Retrieve a lga from the database',
    params: { id: { type: 'integer' } }
    //body: {},
  },
  addLga: {
    tags:['Lga'],
    description: 'Adds a new lga to the database',
    summary: 'Adds a new lga to the database',
    params: {},
    body: {
      type: 'object',
      required: ['name'],
      properties: lgaProperties
    }
  },

  updateLga: {
    tags:['Lga'],
    description: 'Updates an new lga in the database',
    summary: 'Updates an lga in the database',
    params: { id: { type: 'integer' } },
    body: {
      type: 'object',
      properties: lgaProperties
    }
  },
  deleteLga: {
    tags:['Lga'],
    description: 'Delete an lga from the database using the id',
    summary: 'Delete an lga from the database',
    params: { id: { type: 'integer' } },
  },
};


module.exports = swagger;
