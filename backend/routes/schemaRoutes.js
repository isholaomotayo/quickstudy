const schemaController = require('../controllers/schemaController');

const routes = [
  {
    method: 'GET',
    url: '/api/schema/:table',
    handler: schemaController.get,
  }
];

module.exports = routes;
