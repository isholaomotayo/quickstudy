const facultyController = require('../controllers/facultyController');
const facultyDoc = require('../documentation/facultyDoc');

const routes = [
  {
    method: 'GET',
    url: '/api/faculty',
    handler: facultyController.list,
    schema: facultyDoc.list
  },
  {
    method: 'GET',
    url: '/api/faculty/:id',
    handler: facultyController.get,
    schema: facultyDoc.get
  },
  {
    method: 'POST',
    url: '/api/faculty',
    handler: facultyController.add,
    schema: facultyDoc.add
  },
  {
    method: 'PUT',
    url: '/api/faculty/:id',
    handler: facultyController.update,
    schema: facultyDoc.update
  },
  {
    method: 'DELETE',
    url: '/api/faculty/:id',
    handler: facultyController.delete,
    schema: facultyDoc.delete
  }
];

module.exports = routes;
