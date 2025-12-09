//endpoints and routes for all staff
const staffController = require('../controllers/staffController');
const staffDoc = require('../documentation/staffDoc');

const routes = [
  {
    method: 'GET',
    url: '/api/staff',
    handler: staffController.getStaff,
    schema: staffDoc.getStaff
  },
  {
    method: 'POST',
    url: '/api/staff',
    handler: staffController.addStaff,
    schema: staffDoc.addStaff
  },
  {
    method: 'GET',
    url: '/api/staff/:id',
    handler: staffController.getStaffById,
    schema: staffDoc.getStaffById
  },
  {
    method: 'PUT',
    url: '/api/staff/:id',
    handler: staffController.updateStaff,
    schema: staffDoc.updateStaff
  },
  {
    method: 'DELETE',
    url: '/api/staff/:id',
    handler: staffController.deleteStaff,
    schema: staffDoc.deleteStaff
  }
];

module.exports = routes;
