//endpoints and routes for all lgas
const lgaController = require('../controllers/lgaController');
const lgaDoc = require('../documentation/lgaDoc');

const lgaRoutes = [
  {
    method: 'GET',
    url: '/api/lga',
    handler: lgaController.getLgas,
    schema: lgaDoc.getLgas
  },
  {
    method: 'POST',
    url: '/api/lga',
    handler: lgaController.addLga,
    schema: lgaDoc.addLga
  },
  {
    method: 'GET',
    url: '/api/lga/:id',
    handler: lgaController.getLgaById,
    schema: lgaDoc.getLgaById
  },
  {
    method: 'PUT',
    url: '/api/lga/:id',
    handler: lgaController.updateLga,
    schema: lgaDoc.updateLga
  },
  {
    method: 'DELETE',
    url: '/api/lga/:id',
    handler: lgaController.deleteLga,
    schema: lgaDoc.deleteLga
  }
];

module.exports = lgaRoutes;
