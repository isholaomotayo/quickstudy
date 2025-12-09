//endpoints and routes for all country
const countryProperties = {
  id: { type: 'integer' },
  name: { type: 'string' }
};

const swagger = {
  getCountries: {
    tags: ['Country'],
    description: 'Get all country in the database',
    summary: 'Get all country in the database',
    response: {
      200: {
        description: 'Array containing all grades',
        type: 'array',
        items: { type: 'object', properties: countryProperties }
      }
    }
  },
  addCountry: {
    tags: ['Country'],
    description: 'Add new Country to the database',
    summary: 'Adds new Country to the database',
    params: {},
    body: {
      type: 'object',
      required: ['name'],
      properties: countryProperties
    },
    response: {
      200: {
        description: 'New Country',
        type: 'object',
        properties: countryProperties
      }
    }
  },
  getCountryById: {
    tags: ['Country'],
    description: 'Retrieve a country from the database using the id',
    summary: 'Retrieve a country from the database',
    params: { id: { type: 'integer' } }
  },
  updateCountry: {
    tags: ['Country'],
    description: 'Updates a country in the database',
    summary: 'Updates a country in the database',
    params: { id: { type: 'integer' } },
    body: {
      type: 'object',
      properties: countryProperties
    }
  },
  deleteCountry: {
    tags: ['Country'],
    description: 'Deletes a country from the database using the id',
    summary: 'Deletes a country from the database',
    params: { id: { type: 'integer' } }
  }
};

module.exports = swagger;
