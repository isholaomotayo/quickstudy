//endpoints and routes for all classdegree
const classDegreeController = require('../controllers/classDegreeController');
const classDegreeDoc = require('../documentation/classDegreeDoc');

const classDegreeRoutes = [
  {
    method: 'GET',
    url: '/api/classdegree',
    handler: classDegreeController.getClassDegrees,
    schema: classDegreeDoc.getClassDegrees
  },
  {
    method: 'POST',
    url: '/api/classdegree',
    handler: classDegreeController.addClassDegree,
    schema: classDegreeDoc.addClassDegree
  },
  {
    method: 'GET',
    url: '/api/classdegree/:id',
    handler: classDegreeController.getClassDegreeById,
    schema: classDegreeDoc.getClassDegreeById
  },
  {
    method: 'PUT',
    url: '/api/classdegree/:id',
    handler: classDegreeController.updateClassDegree,
    schema: classDegreeDoc.updateClassDegree
  },
  {
    method: 'DELETE',
    url: '/api/classdegree/:id',
    handler: classDegreeController.deleteClassDegree,
    schema: classDegreeDoc.deleteClassDegree
  }
];

module.exports = classDegreeRoutes;
