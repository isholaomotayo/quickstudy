//endpoints and routes for all semesters
const semesterController = require('../controllers/semesterController');

const semesterDoc = require('../documentation/semesterDoc');

const semesterRoutes = [
  {
    method: 'GET',
    url: '/api/semester',
    handler: semesterController.getSemesters,
    schema: semesterDoc.getSemesters
  },
  {
    method: 'POST',
    url: '/api/semester',
    handler: semesterController.addSemester,
    schema: semesterDoc.addSemester
  },
  {
    method: 'GET',
    url: '/api/semester/:id',
    handler: semesterController.getSemesterById,
    schema: semesterDoc.getSemesterById
  },
  {
    method: 'PUT',
    url: '/api/semester/:id',
    handler: semesterController.updateSemester,
    schema: semesterDoc.updateSemester
  },
  {
    method: 'DELETE',
    url: '/api/semester/:id',
    handler: semesterController.deleteSemester,
    schema: semesterDoc.deleteSemester
  }
];

module.exports = semesterRoutes;
