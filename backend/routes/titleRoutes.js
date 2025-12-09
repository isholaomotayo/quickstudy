//endpoints and routes for all titles
const titleController = require('../controllers/titleController');
const titleDoc = require('../documentation/titleDoc');

const routes = [
  {
    method: 'GET',
    url: '/api/title',
    handler: titleController.getTitles,
    schema: titleDoc.getTitles
  },
  {
    method: 'POST',
    url: '/api/title',
    handler: titleController.addTitle,
    schema: titleDoc.addTitle
  },
  {
    method: 'GET',
    url: '/api/title/:id',
    handler: titleController.getTitleById,
    schema: titleDoc.getTitleById
  },
  {
    method: 'PUT',
    url: '/api/title/:id',
    handler: titleController.updateTitle,
    schema: titleDoc.updateTitle
  },
  {
    method: 'DELETE',
    url: '/api/title/:id',
    handler: titleController.deleteTitle,
    schema: titleDoc.deleteTitle
  }
];

module.exports = routes;
