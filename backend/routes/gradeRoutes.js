//endpoints and routes for all staff
const gradeController = require('../controllers/gradeController');
const gradeDoc = require('../documentation/gradeDoc');

const gradeRoutes = [
  {
    method: 'GET',
    url: '/api/grade',
    handler: gradeController.getGrades,
    schema: gradeDoc.getGrades
  },
  {
    method: 'POST',
    url: '/api/grade',
    handler: gradeController.addGrade,
    schema: gradeDoc.addGrade
  },
  {
    method: 'GET',
    url: '/api/grade/:id',
    handler: gradeController.getGradeById,
    schema: gradeDoc.getGradeById
  },
  {
    method: 'PUT',
    url: '/api/grade/:id',
    handler: gradeController.updateGrade,
    schema: gradeDoc.updateGrade
  },
  {
    method: 'DELETE',
    url: '/api/grade/:id',
    handler: gradeController.deleteGrade,
    schema: gradeDoc.deleteGrade
  }
];

module.exports = gradeRoutes;
