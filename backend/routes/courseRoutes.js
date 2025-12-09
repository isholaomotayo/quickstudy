const courseController = require('../controllers/courseController');
const courseDoc = require('../documentation/courseDoc');

const routes = [
  {
    method: 'GET',
    url: '/api/course',
    handler: courseController.list,
    schema: courseDoc.list
  },
  {
    method: 'GET',
    url: '/api/course/:id',
    handler: courseController.get,
    schema: courseDoc.get
  },
  {
    method: 'POST',
    url: '/api/course',
    handler: courseController.add,
    schema: courseDoc.add
  },
  {
    method: 'PUT',
    url: '/api/course/:id',
    handler: courseController.update,
    schema: courseDoc.update
  },
  {
    method: 'DELETE',
    url: '/api/course/:id',
    handler: courseController.delete,
    schema: courseDoc.delete
  }
];

module.exports = routes;
