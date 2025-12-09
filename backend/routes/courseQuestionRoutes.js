const courseQuestionController = require('../controllers/courseQuestionController');
const courseQuestionDoc = require('../documentation/courseQuestionDoc');

const routes = [
  {
    method: 'GET',
    url: '/api/coursequestion',
    handler: courseQuestionController.list,
    schema: courseQuestionDoc.list
  },
  {
    method: 'GET',
    url: '/api/coursequestion/:id',
    handler: courseQuestionController.get,
    schema: courseQuestionDoc.get
  },
  {
    method: 'POST',
    url: '/api/coursequestion',
    handler: courseQuestionController.add,
    schema: courseQuestionDoc.add
  },
  {
    method: 'PUT',
    url: '/api/coursequestion/:id',
    handler: courseQuestionController.update,
    schema: courseQuestionDoc.update
  },
  {
    method: 'DELETE',
    url: '/api/coursequestion/:id',
    handler: courseQuestionController.delete,
    schema: courseQuestionDoc.delete
  }
];

module.exports = routes;
