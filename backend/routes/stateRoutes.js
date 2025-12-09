//endpoints and routes for all states
const stateController = require('../controllers/stateController');
const stateDoc = require('../documentation/stateDoc');

const routes = [
  {
    method: 'GET',
    url: '/api/state',
    handler: stateController.getStates,
    schema: stateDoc.getStates
  },
  {
    method: 'GET',
    url: '/api/state/:id',
    handler: stateController.getStateById,
    schema: stateDoc.getStateById
  },
  {
    method: 'POST',
    url: '/api/state',
    handler: stateController.addState,
    schema: stateDoc.addState
  },
  {
    method: 'PUT',
    url: '/api/state/:id',
    handler: stateController.updateState,
    schema: stateDoc.updateState
  },
  {
    method: 'DELETE',
    url: '/api/state/:id',
    handler: stateController.deleteState,
    schema: stateDoc.deleteState
  }
];

module.exports = routes;
