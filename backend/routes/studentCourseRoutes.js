//endpoints and routes for all studentcourse
const studentCourseController = require("../controllers/studentCourseController");
const studentCourseDoc = require("../documentation/studentCourseDoc");

const routes = [
  {
    method: "GET",
    url: "/api/studentcourse",
    handler: studentCourseController.getStudentCourses,
    schema: studentCourseDoc.getStudentCourses,
  },
  {
    method: "GET",
    url: "/api/studentcourse/course/:course_id/semesters",
    handler: studentCourseController.getCourseSemesters,
    schema: {
      summary: "Get available semesters for a course",
      tags: ["Student Course"],
      params: {
        type: "object",
        properties: {
          course_id: { type: "string" },
        },
        required: ["course_id"],
      },
    },
  },
  {
    method: "POST",
    url: "/api/studentcourse",
    handler: studentCourseController.addStudentCourse,
    schema: studentCourseDoc.addStudentCourse,
  },
  {
    method: "GET",
    url: "/api/studentcourse/:id",
    handler: studentCourseController.getStudentCourseById,
    schema: studentCourseDoc.getStudentCourseById,
  },
  {
    method: "PUT",
    url: "/api/studentcourse/:id",
    handler: studentCourseController.updateStudentCourse,
    schema: studentCourseDoc.updateStudentCourse,
  },
  {
    method: "DELETE",
    url: "/api/studentcourse/:id",
    handler: studentCourseController.deleteStudentCourse,
    schema: studentCourseDoc.deleteStudentCourse,
  },
  {
    method: "GET",
    url: "/api/studentcourse/studentid/:student_id",
    handler: studentCourseController.getStudentCourseByStudentId,
    schema: studentCourseDoc.getStudentCourseByStudentId,
  },
  {
    method: "GET",
    url: "/api/studentcourse/search",
    handler: studentCourseController.getStudentCourseBySearchParams,
    schema: studentCourseDoc.getStudentCourseBySearchParams,
  },
  {
    method: "POST",
    url: "/api/bulk/studentcourse",
    handler: studentCourseController.bulkAddStudentCourse,
    schema: studentCourseDoc.bulkAddStudentCourse,
  },
];

module.exports = routes;
