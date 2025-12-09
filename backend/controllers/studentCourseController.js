// External Dependancies
const boom = require("boom");
const checkAccess = require("../helpers/utils").checkAccess;
const setPaginationHeaders = require("../helpers/utils").setPaginationHeaders;
const mailTemplate = require("../email");
const { sgMail } = require("../services/emailService");
// Get Data Models
const StudentCourse = require("../models/StudentCourse");

const Student = require("../models/Student");

// Get available semesters for a course
exports.getCourseSemesters = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const courseId = req.params.course_id;

    // Use raw SQL query to get distinct semesters efficiently
    const knex = require("../config/connection").knex;

    const semesters = await knex("student_course")
      .join("semester", "student_course.semester_id", "semester.id")
      .where("student_course.course_id", courseId)
      .distinct("semester.id", "semester.name")
      .orderBy("semester.name");

    return semesters;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get all studentcourses
exports.getStudentCourses = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    let query = StudentCourse.forge();

    const { pgsize = 500, pg = 1, ...req_query } = req.query;
    if (filterKey && filterValue) query.where(filterKey, +filterValue);
    else if (req_query) {
      for (var key in req_query) {
        if (key === "pgsize" || key === "pg" || key === "all") continue;
        if (typeof req_query[key] == "object") {
          query.where(key, "IN", req_query[key]);
        } else {
          query.where(key, req_query[key]);
        }
      }
    }
    if (req.query.all) {
      const studentCourses = await query.fetchAll({
        withRelated: [
          {
            "student.user": (query) => {
              query.select("id", "first_name", "last_name", "email");
            },
          },
          {
            course: (query) => {
              query.select("id", "code", "name", "units");
            },
          },
          {
            level: (query) => {
              query.select("id", "name");
            },
          },
          {
            semester: (query) => {
              query.select("id", "name", "position");
            },
          },
        ],
      });

      // Log semester distribution for debugging
      const semesterCounts = {};
      studentCourses.models.forEach((sc, index) => {
        const semester = sc.related("semester");
        if (semester) {
          const semesterName = semester.get("name");
          semesterCounts[semesterName] =
            (semesterCounts[semesterName] || 0) + 1;
        } else {
          console.log(
            `Student course ${sc.get("id")} has no semester relationship`
          );
        }
      });

      return studentCourses;
    } else {
      const studentCourses = await query.fetchPage({
        pageSize: pgsize,
        page: pg,
        withRelated: [
          {
            "student.user": (query) => {
              query.select("id", "first_name", "last_name", "email");
            },
          },
          {
            course: (query) => {
              query.select("id", "code", "name", "units");
            },
          },
          {
            level: (query) => {
              query.select("id", "name");
            },
          },
          {
            semester: (query) => {
              query.select("id", "name", "position");
            },
          },
        ],
      });

      if (studentCourses.pagination)
        setPaginationHeaders(reply, studentCourses.pagination);

      return studentCourses;
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};
// Get a studentcourse by ID
exports.getStudentCourseById = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too

    const studentCourse = await new StudentCourse({ id: id }).fetch({
      withRelated: [
        {
          student: (query) => {
            query.select("id", "reg_no", "user_id");
          },
        },
        {
          course: (query) => {
            query.select("id", "code", "name", "units");
          },
        },
        {
          level: (query) => {
            query.select("id", "name");
          },
        },
        {
          semester: (query) => {
            query.select("id", "name", "position");
          },
        },
      ],
    });

    return studentCourse;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new studentcourse
exports.addStudentCourse = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const params = req.body;

    // Add user tracking fields
    const studentCourseData = {
      ...params,
      created_by: validatedUser.id,
      updated_by: validatedUser.id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const studentCourse = await StudentCourse.forge(studentCourseData).save();
    return studentCourse.fetch({
      withRelated: [
        {
          student: (query) => {
            query.select("id", "reg_no", "user_id");
          },
        },
        {
          course: (query) => {
            query.select("id", "code", "name", "units");
          },
        },
        {
          level: (query) => {
            query.select("id", "name");
          },
        },
        {
          semester: (query) => {
            query.select("id", "name", "position");
          },
        },
      ],
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing studentcourse
exports.updateStudentCourse = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const studentCourse = req.body;
    const { ...updateData } = studentCourse;

    // Add updated_by and updated_at fields
    updateData.updated_by = validatedUser.id;
    updateData.updated_at = new Date();

    const update = await StudentCourse.forge({ id: id }).save(updateData, {
      patch: true,
    });
    return update.fetch({
      withRelated: [
        {
          "student.user": (query) => {
            query.select("id", "first_name", "last_name", "email");
          },
        },
        {
          course: (query) => {
            query.select("id", "code", "name", "units");
          },
        },
        {
          level: (query) => {
            query.select("id", "name");
          },
        },
        {
          semester: (query) => {
            query.select("id", "name", "position");
          },
        },
      ],
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an studentcourse by id
exports.deleteStudentCourse = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const studentCourse = await new StudentCourse({ id: id }).destroy();
    return studentCourse;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get a studentcourse by Student ID
exports.getStudentCourseByStudentId = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const isMinimal = req.query.fields === "minimal";

    let withRelatedConfig;

    if (isMinimal) {
      // Minimal fields - only what's needed for the student-courses page
      withRelatedConfig = [
        {
          course: (query) => {
            query.select("id", "code", "name");
          },
        },
      ];
    } else {
      // Full fields - existing configuration
      withRelatedConfig = [
        {
          "student.user": (query) => {
            query.select("id", "first_name", "last_name", "email");
          },
        },
        {
          course: (query) => {
            query.select("id", "code", "name", "units");
          },
        },
        {
          level: (query) => {
            query.select("id", "name");
          },
        },
        {
          semester: (query) => {
            query.select("id", "name", "position");
          },
        },
      ];
    }

    const studentCourse = await StudentCourse.where({
      student_id: req.params.student_id,
    }).fetchAll({
      withRelated: withRelatedConfig,
    });

    // Debug logging for minimal mode
    if (isMinimal) {
      if (studentCourse.length > 0) {
      }
    }

    return studentCourse;
  } catch (err) {
    throw boom.boomify(err);
  }
};
// Get Programme Courses by Search Params
exports.getStudentCourseBySearchParams = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    let filter_params = {};

    const studentId = req.query.student_id;
    if (studentId) {
      filter_params = {
        ...filter_params,
        student_id: studentId,
      };
    }

    const levelId = req.query.level_id;
    if (levelId) {
      filter_params = {
        ...filter_params,
        level_id: levelId,
      };
    }

    const courseId = req.query.course_id;
    if (courseId) {
      filter_params = {
        ...filter_params,
        course_id: courseId,
      };
    }

    const courseIds = req.query.course_ids;

    let studentCourse = StudentCourse.where(filter_params);

    if (courseIds) {
      studentCourse.where("course_id", "IN", courseIds);
    }
    return await studentCourse.fetchAll({
      withRelated: [
        {
          student: (query) => {
            query.select("id", "reg_no", "user_id");
          },
        },
        {
          course: (query) => {
            query.select("id", "code", "name", "units");
          },
        },
        {
          level: (query) => {
            query.select("id", "name");
          },
        },
        {
          semester: (query) => {
            query.select("id", "name", "position");
          },
        },
      ],
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Bulk add studentcourses
exports.bulkAddStudentCourse = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const params = req.body;

    // Add user tracking fields to all records
    const paramsWithUserInfo = params.map((param) => ({
      ...param,
      created_by: validatedUser.id,
      updated_by: validatedUser.id,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    const studentCourse = await StudentCourse.collection(paramsWithUserInfo)
      .invokeThen("save")

      .then((res) => {
        const msg = {
          to: process.env.SUPPORT_EMAIL,
          from: process.env.SUPPORT_EMAIL,
          subject: `Notification of Course Registration for ${validatedUser.first_name} ${validatedUser.last_name}`,
          text: `Hello Support,
        ${validatedUser.first_name} ${validatedUser.last_name} with email ${validatedUser.email} has registered for courses. Please approve.
\n
        Regards,
        `,

          html:
            mailTemplate.header +
            mailTemplate.hero() +
            mailTemplate.prebody +
            `Hello Support,
          ${validatedUser.first_name} ${validatedUser.last_name} with email ${validatedUser.email}  has registered for courses. Please approve.
  \n
          Regards,
          `,
        };

        sgMail
          .send(msg)
          .then((response) => console.log(response))

          .catch(async (error) => {
            console.log(JSON.stringify(error));
          });

        return res;
      });

    return studentCourse;
  } catch (err) {
    throw boom.boomify(err);
  }
};
