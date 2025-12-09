const courseModuleController = require('../controllers/courseModuleController');
const courseModuleDoc = require('../documentation/courseModuleDoc');

const routes = [
  {
    method: 'GET',
    url: '/api/coursemodule',
    handler: courseModuleController.list,
    schema: courseModuleDoc.list
  },
  {
    method: 'GET',
    url: '/api/coursemodule/:id',
    handler: courseModuleController.get,
    schema: courseModuleDoc.get
  },
  {
    method: 'POST',
    url: '/api/coursemodule',
    handler: courseModuleController.add,
    schema: courseModuleDoc.add
  },
  {
    method: 'PUT',
    url: '/api/coursemodule/:id',
    handler: courseModuleController.update,
    schema: courseModuleDoc.update
  },
  {
    method: 'DELETE',
    url: '/api/coursemodule/:id',
    handler: courseModuleController.delete,
    schema: courseModuleDoc.delete
  }
];

module.exports = routes;
