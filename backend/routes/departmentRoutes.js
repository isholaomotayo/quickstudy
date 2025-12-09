const departmentController = require('../controllers/departmentController');
const departmentDoc = require('../documentation/departmentDoc');

const routes = [
  {
    method: 'GET',
    url: '/api/department',
    handler: departmentController.list,
    schema: departmentDoc.list
  },
  {
    method: 'GET',
    url: '/api/department/:id',
    handler: departmentController.get,
    schema: departmentDoc.get
  },
  {
    method: 'POST',
    url: '/api/department',
    handler: departmentController.add,
    schema: departmentDoc.add
  },
  {
    method: 'PUT',
    url: '/api/department/:id',
    handler: departmentController.update,
    schema: departmentDoc.update
  },
  {
    method: 'DELETE',
    url: '/api/department/:id',
    handler: departmentController.delete,
    schema: departmentDoc.delete
  }
];

module.exports = routes;
