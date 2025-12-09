const courseLessonController = require('../controllers/courseLessonController');
const courseLessonDoc = require('../documentation/courseLessonDoc');

const routes = [
  {
    method: 'GET',
    url: '/api/courselesson',
    handler: courseLessonController.list,
    schema: courseLessonDoc.list
  },
  {
    method: 'GET',
    url: '/api/courselesson/:id',
    handler: courseLessonController.get,
    schema: courseLessonDoc.get
  },
  {
    method: 'POST',
    url: '/api/courselesson',
    handler: courseLessonController.add,
    schema: courseLessonDoc.add
  },
  {
    method: 'PUT',
    url: '/api/courselesson/:id',
    handler: courseLessonController.update,
    schema: courseLessonDoc.update
  },
  {
    method: 'DELETE',
    url: '/api/courselesson/:id',
    handler: courseLessonController.delete,
    schema: courseLessonDoc.delete
  }
];

module.exports = routes;
