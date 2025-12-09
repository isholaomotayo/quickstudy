//endpoints and routes for all staffCourse
const staffCourseController = require('../controllers/staffCourseController');
const staffCourseDoc = require('../documentation/staffCourseDoc');

const routes = [
  {
    method: 'GET',
    url: '/api/staffcourse',
    handler: staffCourseController.getStaffCourses,
    schema: staffCourseDoc.getStaffCourses
  },
  {
    method: 'POST',
    url: '/api/staffcourse',
    handler: staffCourseController.addStaffCourse,
    schema: staffCourseDoc.addStaffCourse
  },
  {
    method: 'GET',
    url: '/api/staffcourse/:id',
    handler: staffCourseController.getStaffCourseById,
    schema: staffCourseDoc.getStaffCourseById
  },
  {
    method: 'PUT',
    url: '/api/staffcourse/:id',
    handler: staffCourseController.updateStaffCourse,
    schema: staffCourseDoc.updateStaffCourse
  },
  {
    method: 'DELETE',
    url: '/api/staffcourse/:id',
    handler: staffCourseController.deleteStaffCourse,
    schema: staffCourseDoc.deleteStaffCourse
  }
];

module.exports = routes;
