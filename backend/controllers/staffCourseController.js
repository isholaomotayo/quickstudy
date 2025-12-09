// External Dependancies
const boom = require("boom");

// Get Data Models
const StaffCourse = require("../models/StaffCourse");

// Get all staffCourses
exports.getStaffCourses = async (req, reply) => {
  try {
    let query = StaffCourse.forge();

    if (req.query) {
      let filter_params = req.query;
      query.where(filter_params);
    }

    const staffCourse = await query.fetchAll({
      withRelated: ["staff.user", "course"]
    });
    return staffCourse.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get a staffCourse by ID
exports.getStaffCourseById = async (req, reply) => {
  try {
    const id = req.params.id;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too

    const staffCourse = await new StaffCourse({ id: id }).fetch({
      withRelated: ["staff", "course"]
    });

    return staffCourse;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new staffCourse
exports.addStaffCourse = async (req, reply) => {
  try {
    const params = req.body;

    let data = [];
    if (
      typeof params.staff_id == "object" &&
      typeof params.course_id != "object"
    ) {
      // more than one staff assigned to a course
      params.staff_id.map(staff_id =>
        data.push({
          staff_id: staff_id,
          course_id: params.course_id
        })
      );
    } else if (
      typeof params.staff_id != "object" &&
      typeof params.course_id == "object"
    ) {
      // a staff assigned to  more than one course
      params.course_id.map(course_id =>
        data.push({
          staff_id: params.staff_id,
          course_id: course_id
        })
      );
    } else if (
      typeof params.staff_id == "object" &&
      typeof params.course_id == "object"
    ) {
      // a staff assigned to  more than one course
      params.staff_id.map(staff_id =>
        params.course_id.map(course_id =>
          data.push({
            staff_id: staff_id,
            course_id: course_id
          })
        )
      );
    } else {
      data = params;
    }
    return await StaffCourse.collection(data)
      .invokeThen("save")
      .then(function(result) {
        // ... allthe first model in the collection that has been saved

        try {
          return result[0].fetch({
            withRelated: ["staff.user", "course"]
          });
        } catch (err) {
          //console.log(err);
          throw boom.boomify(err);
        }
      });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing staffCourse
exports.updateStaffCourse = async (req, reply) => {
  try {
    const id = req.params.id;
    const staffCourse = req.body;
    const { ...updateData } = staffCourse;
    const update = await StaffCourse.forge({ id: id }).save(updateData, {
      patch: true
    });
    return update.fetch({ withRelated: ["staff.user", "Course"] });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an staffCourse by id
exports.deleteStaffCourse = async (req, reply) => {
  try {
    const id = req.params.id;
    const staffCourse = await new StaffCourse({ id: id }).destroy();
    return staffCourse;
  } catch (err) {
    throw boom.boomify(err);
  }
};
