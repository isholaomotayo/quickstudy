//endpoints and routes for all country
const countryController = require('../controllers/countryController');
const countryDoc = require('../documentation/countryDoc');

const countryRoutes = [
  {
    method: 'GET',
    url: '/api/country',
    handler: countryController.getCountries,
    schema: countryDoc.getCountries
  },
  {
    method: 'POST',
    url: '/api/country',
    handler: countryController.addCountry,
    schema: countryDoc.addCountry
  },
  {
    method: 'GET',
    url: '/api/country/:id',
    handler: countryController.getCountryById,
    schema: countryDoc.getCountryById
  },
  {
    method: 'PUT',
    url: '/api/country/:id',
    handler: countryController.updateCountry,
    schema: countryDoc.updateCountry
  },
  {
    method: 'DELETE',
    url: '/api/country/:id',
    handler: countryController.deleteCountry,
    schema: countryDoc.deleteCountry
  }
];

module.exports = countryRoutes;
