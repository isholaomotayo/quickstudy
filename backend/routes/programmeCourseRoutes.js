//endpoints and routes for all Programmecourse
const programmeCourseController = require('../controllers/programmeCourseController');
const programmeCourseDoc = require('../documentation/programmeCourseDoc');

const routes = [
  {
    method: 'GET',
    url: '/api/programmecourse',
    handler: programmeCourseController.getProgrammeCourses,
    schema: programmeCourseDoc.getProgrammeCourses
  },
  {
    method: 'POST',
    url: '/api/programmecourse',
    handler: programmeCourseController.addProgrammeCourse,
    schema: programmeCourseDoc.addProgrammeCourse
  },
  {
    method: 'GET',
    url: '/api/programmecourse/:id',
    handler: programmeCourseController.getProgrammeCourseById,
    schema: programmeCourseDoc.getProgrammeCourseById
  },
  {
    method: 'PUT',
    url: '/api/programmecourse/:id',
    handler: programmeCourseController.updateProgrammeCourse,
    schema: programmeCourseDoc.updateProgrammeCourse
  },
  {
    method: 'DELETE',
    url: '/api/programmecourse/:id',
    handler: programmeCourseController.deleteProgrammeCourse,
    schema: programmeCourseDoc.deleteProgrammeCourse
  },
  {
    method: 'GET',
    url: '/api/programmecourse/programmeid/:programme_id',
    handler: programmeCourseController.getProgrammeCourseByProgrammeId,
    schema: programmeCourseDoc.getProgrammeCourseByProgrammeId
  },
  {
    method: 'GET',
    url: '/api/programmecourse/search',
    handler: programmeCourseController.getProgrammeCourseBySearchParams,
    schema: programmeCourseDoc.getProgrammeCourseBySearchParams
  },
];

module.exports = routes;
