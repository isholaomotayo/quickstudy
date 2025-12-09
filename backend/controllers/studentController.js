// External Dependancies
const boom = require("boom");
const admissionEmail = require("../email/admissionEmail");
const preMbaAdmissionEmail = require("../email/preMbaAdmissionEmail");
const particularsAdmissionEmail = require("../email/particularsAdmissionEmail");
require("dotenv").config();
const {
  checkAccess,

  generateStudentRegNo2,
} = require("../helpers/utils");

const LevelCalculationService = require("../services/levelCalculationService");

const setPaginationHeaders = require("../helpers/utils").setPaginationHeaders;
const Bookshelf = require("../config/connection").Bookshelf;

// Get Data Models
const Student = require("../models/Student");
const Semester = require("../models/Semester");
const Session = require("../models/Session");
const StudentCourse = require("../models/StudentCourse");
const StudentGpa = require("../models/StudentGpa");
const StudentResult = require("../models/StudentResult");
const Programme = require("../models/Programme");
const { sgMail } = require("../services/emailService");

// Get all student
exports.getStudents = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
    "STUDENT",
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  const { pgsize = 200, pg = 1, ...req_query } = req.query;

  let query = Student.forge().orderBy("id", "desc");

  if (validatedUser.role == "STUDENT") {
    query.where("id", +validatedUser.student.id);
    withRelated = [];
  } else if ("STAFF,HOD".indexOf(validatedUser.role) > -1) {
    // TODO: seperate STAFF and filter further
    const dept_programmes = await Programme.where(
      "department_id",
      +validatedUser.staff.department_id
    ).fetchAll();

    if (
      dept_programmes &&
      dept_programmes.models &&
      dept_programmes.models.length
    ) {
      const programme_ids = dept_programmes.map((programme) => programme.id);
      if (programme_ids.length)
        query.where("programme_id", "IN", programme_ids);
    }
  } else if (validatedUser.role == "ADMIN") {
    query = Student.query("join", "user", "user.id", "student.user_id").where(
      "user.institution_id",
      +validatedUser.institution_id
    );
  } else if (validatedUser.role == "SUPERADMIN") {
    // Don't filter
  } else {
    // Incase we add a new role and forget to filter ;)
    throw boom.boomify("Improper access");
  }

  try {
    if (filterKey && filterValue) query.where(filterKey, filterValue);
    else if (req_query) {
      for (var key in req_query) {
        if (typeof req_query[key] == "object") {
          query.where(key, "IN", req_query[key]);
        } else {
          query.where(key, req_query[key]);
        }
      }
    }

    const students = await query.fetchPage({
      pageSize: pgsize,
      page: pg,
      withRelated: ["user", "programme", "semester", "fees"],
    });

    if (students.pagination) setPaginationHeaders(reply, students.pagination);

    return students;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get a student by ID
exports.getStudentById = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
    "STUDENT",
    "APPLICANT",
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too

    const student = await new Student({ id: id }).fetch({
      withRelated: ["user", "programme", "semester"],
    });

    return student;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new student
exports.addStudent = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STUDENT", "APPLICANT"];
  // const { validatedUser, filterKey, filterValue } = checkAccess(
  //   req,
  //   reply,
  //   allowedRoles
  // );

  try {
    const params = req.body;
    const student = Student.forge(params).save();
    return student;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing student
exports.updateStudent = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STUDENT", "APPLICANT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  let newAdmission = false;
  let studentData;
  try {
    const id = req.params.id;

    let newStudent = await Student.forge({ id: id })
      .fetch({})
      .then((student) => {
        student.set(req.body);

        newAdmission = student.hasChanged("admitted");
        return student.save();
      });

    studentData = await Student.forge({ id: id }).fetch({
      withRelated: ["user", "programme", "semester", "session"],
    });
    // console.log(studentData);
    await MatriculateStudent(studentData, newAdmission);

    return newStudent;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete an student by id
exports.deleteStudent = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const id = req.params.id;
    const student = await new Student({ id: id }).destroy();
    return student;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get a student by  userID
exports.getStudentByUserId = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
    "STUDENT",
    "APPLICANT",
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const user_id = req.params.user_id;
    //const car = await Car.where({ name: req.params.name }).fetch();  //this works too

    const student = await new Student({ user_id: user_id }).fetch({
      withRelated: ["user", "programme.department.faculty", "semester.session"],
    });

    return student;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get minimal student data by userID (optimized for performance)
exports.getStudentByUserIdMinimal = async (req, reply) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
    "STUDENT",
    "APPLICANT",
  ];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const user_id = req.params.user_id;

    // Only fetch the student ID - no related data needed
    const student = await new Student({ user_id: user_id }).fetch({
      columns: ["id", "user_id"],
    });

    return student;
  } catch (err) {
    throw boom.boomify(err);
  }
};

exports.getStudentDashboard = async (req, reply) => {
  const allowedRoles = ["STUDENT"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );
  const { student, user } = validatedUser;
  // Add programme name to student property
  if (!student.programme_name && student.programme_id) {
    const programme = await Programme.where({
      id: student.programme_id,
    }).fetch();
    student.programme_name = programme?.attributes?.name || null;
  }
  let allStudentResult,
    studentGpas,
    approvedRegistrationsSize = 0,
    unApprovedRegistrationsSize = 0;

  let currentSemesterId = await Semester.where({
    is_active: true,
    institution_id: validatedUser.institution_id,
  }).fetch();

  // Use centralized level calculation service
  const levelInfo = await LevelCalculationService.calculateStudentCurrentLevel(
    student.id,
    student.semester_admitted_id,
    student.entry_level_id,
    validatedUser.institution_id
  );

  student.current_semester =
    levelInfo.semesterName || currentSemesterId.attributes.name;
  student.current_level_id = levelInfo.levelId;
  student.current_level = levelInfo.levelDisplay;

  studentGpas = await StudentGpa.where(
    "student_id",
    validatedUser.student.id
  ).fetchAll({ withRelated: ["level", "semester", "classdegree"] });

  let allStudentCourses = await StudentCourse.where(
    "student_id",
    validatedUser.student.id
  ).fetchAll({
    withRelated: ["student.user", "course", "level", "semester"],
  });

  if (allStudentCourses.models.length > 0) {
    allStudentCourses = allStudentCourses.models;
    const approvedRegistrations = allStudentCourses.filter(
      (studentcourse) => studentcourse.attributes.approval_status === true
    );
    const unApprovedRegistrations = allStudentCourses.filter(
      (studentcourse) => studentcourse.attributes.approval_status !== true
    );

    approvedRegistrationsSize = approvedRegistrations.length;
    unApprovedRegistrationsSize = unApprovedRegistrations.length;

    const courseIds = allStudentCourses.map((course) => course.id);

    allStudentResult = await StudentResult.where("publish", true)
      .where("student_course_id", "IN", courseIds)
      .fetchAll({
        withRelated: [
          "grade",
          "studentcourse",
          "studentcourse.course",
          "studentcourse.level",
          "studentcourse.semester",
        ],
      });
  } else {
    allStudentResult = [];
  }

  studentGpas = studentGpas.models;

  let studentGpa = studentGpas[studentGpas.length - 1];

  // Check if student is admitted to a future session
  let isFutureStudent = false;
  let admittedSession = null;

  if (student.session_admitted_id) {
    try {
      const currentSession = await Session.where({ is_active: true }).fetch({
        require: false,
      });

      if (
        currentSession &&
        student.session_admitted_id > currentSession.get("id")
      ) {
        isFutureStudent = true;
        // Fetch the student's admitted session details
        const studentSession = await Session.where({
          id: student.session_admitted_id,
        }).fetch({ require: false });
        if (studentSession) {
          admittedSession = studentSession.attributes;
        }
      }
    } catch (error) {
      console.error("Error checking future student status:", error);
    }
  }

  // Remove the student prop from userData before returning
  const { student: _removed, ...userDataWithoutStudent } = validatedUser;

  return {
    student,
    studentGpa,
    allStudentResult,
    approvedRegistrationsSize,
    unApprovedRegistrationsSize,
    userData: userDataWithoutStudent,
    isFutureStudent,
    admittedSession,
  };
};

exports.searchStudent = async (req, reply) => {
  const allowedRoles = ["ADMIN", "SUPERADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  let { searchValue } = req.query;

  searchValue = searchValue.trim();

  try {
    const students = await Bookshelf.knex("student")
      .join("user", "student.user_id", "user.id")
      .join("programme", "student.programme_id", "programme.id")
      .where(function () {
        this.where("student.reg_no", searchValue)
          .orWhere("user.username", searchValue)
          .orWhere("user.email", searchValue);
      })
      .andWhere("user.institution_id", validatedUser.institution_id)
      .select(
        "student.*",
        "user.first_name",
        "user.last_name",
        "user.other_name",
        "user.email",
        "user.phone",
        "programme.name"
      )
      .then((data) => {
        return data.map((res) => {
          const value = {
            user: {
              first_name: res.first_name,
              last_name: res.last_name,
              other_name: res.other_name,
              email: res.email,
              phone: res.phone,
            },
            programme: {
              name: res.name,
            },
            ...res,
          };
          delete value.first_name;
          delete value.last_name;
          delete value.other_name;
          delete value.email;
          delete value.phone;
          delete value.name;

          return value;
        });
      });

    // console.log(students);
    return students;
  } catch (err) {
    throw boom.boomify(err);
  }
};

const MatriculateStudent = async (student, newAdmission = false) => {
  if (newAdmission === true) {
    //Assign Matric Number on admission

    let updateData = {};

    if (!student.attributes.reg_no) {
      updateData.reg_no = await generateStudentRegNo2(student);
    }
    student.set(updateData);

    await student.save();
    let msg, html, special_params;

    if (student.attributes.entry_level_id == 1) {
      //Send Pre-MBA admission letter
      special_params = "(Pre-MBA)";

      html = preMbaAdmissionEmail.admit(
        `${
          student.relations.user.attributes.first_name +
          " " +
          student.relations.user.attributes.last_name
        }`,
        student.relations.user.attributes.code
      );

      msg = {
        to: student.relations.user.attributes.email,
        from: process.env.ADMISSION_EMAIL,
        subject:
          "OFFER OF PROVISIONAL ADMISSION INTO THE DISTANCE LEARNING MBA PROGRAMME",
        text: `1.	With reference to your application for admission to the Distance Learning postgraduate programme of the university, I am pleased to inform you that you have been offered provisional admission to pursue a Distance Learning programme with effect from the 2019/2020 Academic Session.
  
          You have been awarded admission into the Pre-MBA Program. This is to plug the envisaged knowledge gap as MBA students are required to have a
          background knowledge in the Business discipline.

          The Pre-MBA is an additional semester that introduces students to the basic
          principles of business concepts.

            2.	To indicate your acceptance of the offer, you should pay an acceptance fee of thirty-five thousand Naira (N35,000.00) within two weeks of the receipt of this offer. To pay your acceptance fee, click here.
  
            3.	Please note that this offer of admission is strictly provisional and may be withdrawn if:
            (a) you fail to formally accept this offer by paying the application and acceptance fees of thirty-five thousand Naira (N35,000.00) within two weeks of the receipt of this offer,
  
            (b) you are unable to satisfy the necessary entry requirements for admission and
            registration,
  
            (c) you cannot produce when required, the original copies of your certificates,
            transcripts, NYSC discharge/exemption Certificate and other academic
            credentials.
  
            (d) at any point in time it is discovered that you do not possess the requisite entry qualification(s) as claimed in your application.
  
            3.	Congratulations on your admission and best wishes for a successful programme.
  
            Yours sincerely,
            `,
        html,
      };
    } else {
      //Send MBA admission letter

      special_params = "";
      html = admissionEmail.admit(
        `${
          student.relations.user.attributes.first_name +
          " " +
          student.relations.user.attributes.last_name
        }`,
        student.relations.user.attributes.code
      );

      msg = {
        to: student.relations.user.attributes.email,
        from: process.env.ADMISSION_EMAIL,
        subject:
          "OFFER OF PROVISIONAL ADMISSION INTO THE DISTANCE LEARNING MBA PROGRAMME",
        text: `1.	With reference to your application for admission to the Distance Learning postgraduate programme of the university, I am pleased to inform you that you have been offered provisional admission to pursue a Distance Learning programme leading to the award of Masters in Business Administration (MBA) of the University of Nigeria with effect from the 2019/2020 Academic Session.

          2.	To indicate your acceptance of the offer, you should pay an acceptance fee of thirty-five thousand Naira (N35,000.00) within two weeks of the receipt of this offer. To pay your acceptance fee, click here.

          3.	Please note that this offer of admission is strictly provisional and may be withdrawn if:
          (a) you fail to formally accept this offer by paying the application and acceptance fees of thirty-five thousand Naira (N35,000.00) within two weeks of the receipt of this offer,

          (b) you are unable to satisfy the necessary entry requirements for admission and
          registration,

          (c) you cannot produce when required, the original copies of your certificates,
          transcripts, NYSC discharge/exemption Certificate and other academic
          credentials.

          (d) at any point in time it is discovered that you do not possess the requisite entry qualification(s) as claimed in your application.

          3.	Congratulations on your admission and best wishes for a successful programme.

          Yours sincerely,
          `,
        html,
      };
    }

    sgMail
      .send(msg)
      .then((response) => console.log("Mail successfully sent "))

      .catch(async (error) => {
        console.log(JSON.stringify(error));
      });

    //Send Particulars of Admission
    let option =
      student.relations.programme.attributes.name + " " + special_params;

    let poa_html = particularsAdmissionEmail.admit(
      `${
        student.relations.user.attributes.first_name +
        " " +
        student.relations.user.attributes.last_name
      }`,
      option,

      "Masters in Business Administration (MBA)",
      student.relations.session.attributes.name
    );
    // console.log(student.relations.session.attributes.name);
    let poa_msg = {
      to: student.relations.user.attributes.email,
      from: process.env.ADMISSION_EMAIL,
      subject: "PARTICULARS OF ADMISSION",
      text: `
        NAME OF STUDENT: ${
          student.relations.user.attributes.first_name +
          " " +
          student.relations.user.attributes.last_name
        }

        FACULTY: Business Administration

        PROGRAMME: Masters in Business Administration (MBA)

        ACADEMIC SESSION: ${student.relations.session.attributes.name}

        FIELD OF STUDY: ${student.relations.programme.attributes.name}

        DEGREE IN VIEW: Masters in Business Administration

        MODE OF STUDY:By coursework, industrial/on-the-job experience ad research workto be embodied in project report, where coursework predominates. The mode of delivery shall be the Distance Learning (DL) mode, employing the ICT-Enabled Supported Blended Learning (IESSBL) model.
        
        PERIOD OF STUDY:Minimum of 18 calendar months (4 semesters).

        SUPERVISORS: Kalu, Ebere Ume PhD, ACIB, ACIA, MNIA.
        
        OTHER CONDITIONS: Every student must pay all fees (tuition and other applicable fees), before the date communicated for each semester in accordance with University’s procedures and deadlines.
        
        Students can choose to pay their tuition fees monthly, per semester, per session or all at once.
        
        For those with HND, third class, or non-business related courses, you are to complete a PGD-equivalent bridge/remedial programme offered by the Centre specially designed as a pre-requisite for the full MBA programme.

          `,
      html: poa_html,
    };

    sgMail
      .send(poa_msg)
      .then((response) =>
        console.log("Particulars of Admission Mail successfully sent ")
      )

      .catch(async (error) => {
        console.log(JSON.stringify(error));
      });
  }
};

// Calculate student current level - centralized endpoint
exports.calculateStudentLevel = async (req, reply) => {
  const allowedRoles = [
    "STUDENT",
    "ADMIN",
    "SUPERADMIN",
    "HOD",
    "STAFF",
    "LECTURER",
  ];
  const { validatedUser } = checkAccess(req, reply, allowedRoles);

  try {
    const { student_id, semester_admitted_id, entry_level_id } = req.query;

    if (!student_id || !semester_admitted_id || !entry_level_id) {
      throw new Error(
        "Missing required parameters: student_id, semester_admitted_id, entry_level_id"
      );
    }

    const levelInfo =
      await LevelCalculationService.calculateStudentCurrentLevel(
        parseInt(student_id),
        parseInt(semester_admitted_id),
        parseInt(entry_level_id),
        validatedUser.institution_id
      );

    return levelInfo;
  } catch (err) {
    throw boom.boomify(err);
  }
};
