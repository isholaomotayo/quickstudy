// External Dependancies
const boom = require("boom");

// Get Data Models
const StudentGpa = require("../models/StudentGpa");
const StudentResult = require("../models/StudentResult");
const StudentCourse = require("../models/StudentCourse");
const ClassDegree = require("../models/ClassDegree");
const checkAccess = require("../helpers/utils").checkAccess;

// Get all studentGpas
exports.getStudentGpas = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    const studentGpa = await StudentGpa.fetchAll({
      withRelated: ["student", "level", "semester", "classdegree"],
    });
    return studentGpa.models;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get studentGpas by  ID
exports.getStudentGpaById = async (req, reply) => {
  try {
    const id = req.params.id;

    const studentGpa = await new StudentGpa({ id: id }).fetch({
      withRelated: ["student", "level", "semester", "classdegree"],
    });

    return studentGpa;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get studentGpas by Student ID
exports.getStudentGpaByStudentId = async (req, reply) => {
  try {
    const studentId = req.params.student_id;

    const studentGpas = await StudentGpa.where({
      student_id: studentId,
    }).fetchAll({
      withRelated: ["student", "level", "semester", "classdegree"],
    });

    return studentGpas;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Get studentGpas by Search Params
exports.getStudentGpasBySearchParams = async (req, reply) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { validatedUser, filterKey, filterValue } = checkAccess(
    req,
    reply,
    allowedRoles
  );

  try {
    var filter_params = {};

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

    const semesterId = req.query.semester_id;
    if (semesterId) {
      filter_params = {
        ...filter_params,
        semester_id: semesterId,
      };
    }

    const studentGpas = await StudentGpa.where(filter_params).fetchAll({
      withRelated: ["student", "level", "semester", "classdegree"],
    });

    return studentGpas;
  } catch (err) {
    throw boom.boomify(err);
  }
};

//Add a new studentGpa
exports.addStudentGpa = async (req, reply) => {
  try {
    const params = req.body;
    const studentGpa = await StudentGpa.forge(params).save();
    return studentGpa.fetch({
      withRelated: ["student", "level", "semester", "classdegree"],
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Update an existing studentGpa
exports.updateStudentGpa = async (req, reply) => {
  try {
    const id = req.params.id;
    const studentGpa = req.body;
    const { ...updateData } = studentGpa;
    const update = await StudentGpa.forge({ id: id }).save(updateData, {
      patch: true,
    });
    return update.fetch({
      withRelated: ["student", "level", "semester", "classdegree"],
    });
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Delete a studentGpa by id
exports.deleteStudentGpa = async (req, reply) => {
  try {
    const id = req.params.id;
    const studentGpa = await new StudentGpa({ id: id }).destroy();
    return studentGpa;
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Calculate and store GPA for a student in a specific semester
exports.calculateStudentGpa = async (req, reply) => {
  console.log(">>> calculateStudentGpa called with:", req.body);
  try {
    const { student_id, semester_id, level_id } = req.body;
    console.log(
      `Params - student_id: ${student_id}, semester_id: ${semester_id}, level_id: ${level_id}`
    );

    // Fetch results using Bookshelf with relationships
    const studentCourses = await StudentCourse.where({
      student_id,
      semester_id,
      level_id,
    }).fetchAll({
      withRelated: ["course", "student_result", "student_result.grade"],
    });
    console.log(
      `Fetched ${studentCourses.models.length} studentCourse records`
    );

    // Filter courses that have results
    const coursesWithResults = studentCourses.models.filter(
      (course) => course.related("student_result").models.length > 0
    );
    console.log(`Courses with results: ${coursesWithResults.length}`);

    // Compute semester totals
    let totalUnits = 0,
      totalCreditPoints = 0;

    coursesWithResults.forEach((courseReg) => {
      const result = courseReg.related("student_result").models[0]; // Get first result
      const units = parseFloat(courseReg.related("course").get("units")) || 0;
      const gradePoint = parseFloat(result.related("grade").get("point")) || 0;
      totalUnits += units;
      totalCreditPoints += units * gradePoint;
    });
    console.log(
      `TotalUnits: ${totalUnits}, TotalCreditPoints: ${totalCreditPoints}`
    );

    if (totalUnits === 0) {
      return {
        message: "Total units is zero; cannot compute GPA.",
      };
    }

    let currentGpa = parseFloat((totalCreditPoints / totalUnits).toFixed(2));
    let cumulativeGpa = parseFloat(
      /* prevTcp + */ (totalCreditPoints / /* prevTnu + */ totalUnits).toFixed(
        2
      )
    );

    // Get last prior GPA record using Bookshelf
    const previousGpa = await StudentGpa.query((qb) => {
      qb.where({ student_id, level_id })
        .andWhere("semester_id", "<", semester_id)
        .orderBy("semester_id", "desc")
        .limit(1);
    }).fetch({ require: false });

    const prevTnu = previousGpa ? previousGpa.get("cumulative_tnu") || 0 : 0;
    const prevTcp = previousGpa ? previousGpa.get("cumulative_tcp") || 0 : 0;
    const prevGpa = previousGpa ? previousGpa.get("cumulative_gpa") || 0 : 0;

    const cumulativeTnu = prevTnu + totalUnits;
    const cumulativeTcp = prevTcp + totalCreditPoints;
    cumulativeGpa = cumulativeTcp / cumulativeTnu;
    cumulativeGpa = parseFloat(cumulativeGpa.toFixed(2));

    // Determine class degree based on cumulative GPA using Bookshelf
    let classdegree_id = null;
    const classDegrees = await ClassDegree.fetchAll();

    for (const degree of classDegrees.models) {
      const minGpa = parseFloat(degree.get("min_point")) || 0;
      const maxGpa = parseFloat(degree.get("max_point")) || 5;
      if (cumulativeGpa >= minGpa && cumulativeGpa <= maxGpa) {
        classdegree_id = degree.get("id");
        break;
      }
    }

    // Prepare upsert data
    const gpaData = {
      student_id,
      semester_id,
      level_id,
      classdegree_id,
      prev_tnu: prevTnu,
      prev_tcp: prevTcp,
      prev_gpa: prevGpa,
      current_tnu: totalUnits,
      current_tcp: totalCreditPoints,
      current_gpa: currentGpa,
      cumulative_tnu: cumulativeTnu,
      cumulative_tcp: cumulativeTcp,
      cumulative_gpa: cumulativeGpa,
    };
    console.log("Upserting GPA record with data:", gpaData);

    // Upsert the GPA record
    const existing = await StudentGpa.where({
      student_id,
      semester_id,
      level_id,
    }).fetch({ require: false });

    const studentGpa = existing
      ? await existing.save(gpaData, { patch: true })
      : await StudentGpa.forge(gpaData).save();

    return await studentGpa.fetch({
      withRelated: ["student", "level", "semester", "classdegree"],
    });
  } catch (err) {
    console.error("Error in calculateStudentGpa:", err);
    throw boom.boomify(err);
  }
};

// Calculate GPA for multiple students (batch processing)
exports.calculateBatchGpa = async (req, reply) => {
  console.log(">>> calculateBatchGpa called with:", req.body);
  try {
    const { student_ids, semester_id, level_id } = req.body;
    console.log(
      `Batch params - student_ids: [${student_ids}], semester_id: ${semester_id}, level_id: ${level_id}`
    );
    const results = [];

    for (const student_id of student_ids) {
      try {
        console.log(`-- processing student ${student_id}`);
        const gpaResult = await exports.calculateStudentGpa({
          body: { student_id, semester_id, level_id },
        });
        console.log(`-- result for ${student_id}:`, gpaResult);
        results.push({ student_id, success: true, data: gpaResult });
      } catch (error) {
        console.error(`-- error for ${student_id}:`, error);
        results.push({ student_id, success: false, error: error.message });
      }
    }

    console.log("Batch results summary:", {
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
    });
    return {
      message: `Processed ${results.length} students`,
      results,
      summary: {
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    };
  } catch (err) {
    console.error("Error in calculateBatchGpa:", err);
    throw boom.boomify(err);
  }
};

// New endpoint to recalculate all GPAs for a student
exports.recalculateStudentGpa = async (req, reply) => {
  try {
    const { student_id } = req.params;

    // Get all semesters with results for this student using Bookshelf
    const studentCourses = await StudentCourse.where(
      "student_id",
      student_id
    ).fetchAll({
      withRelated: ["student_result"],
    });

    // Extract unique semester/level combinations
    const semesterLevelMap = new Map();
    studentCourses.models.forEach((course) => {
      if (course.related("student_result").models.length > 0) {
        const key = `${course.get("level_id")}-${course.get("semester_id")}`;
        semesterLevelMap.set(key, {
          semester_id: course.get("semester_id"),
          level_id: course.get("level_id"),
        });
      }
    });

    const semesters = Array.from(semesterLevelMap.values()).sort((a, b) => {
      if (a.level_id !== b.level_id) return a.level_id - b.level_id;
      return a.semester_id - b.semester_id;
    });

    const results = [];
    for (const sem of semesters) {
      try {
        const gpaResult = await exports.calculateStudentGpa({
          body: {
            student_id: parseInt(student_id),
            semester_id: sem.semester_id,
            level_id: sem.level_id,
          },
        });
        results.push({
          semester_id: sem.semester_id,
          level_id: sem.level_id,
          success: true,
          data: gpaResult,
        });
      } catch (error) {
        results.push({
          semester_id: sem.semester_id,
          level_id: sem.level_id,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      message: `Recalculated GPA for student ${student_id}`,
      results,
      summary: {
        total_semesters: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    };
  } catch (err) {
    throw boom.boomify(err);
  }
};

// Calculate and update GPA/CGPA for a student
exports.calculateAndUpdateGPA = async (studentId) => {
  try {
    console.log(`Starting GPA calculation for student ID: ${studentId}`);

    // Get all approved and published results for the student
    const studentResults = await StudentResult.query((qb) => {
      qb.innerJoin(
        "student_course",
        "student_result.student_course_id",
        "student_course.id"
      );
      qb.where("student_course.student_id", studentId);
      qb.where("student_result.approved", true);
      qb.where("student_result.publish", true);
    }).fetchAll({
      withRelated: [
        "grade",
        "studentcourse.course",
        "studentcourse.semester",
        "studentcourse.level",
      ],
    });

    console.log(
      `Found ${studentResults.length} approved/published results for student ${studentId}`
    );

    if (!studentResults || studentResults.length === 0) {
      console.log(
        `No approved/published results found for student ${studentId}`
      );
      return {
        studentId,
        message: "No approved results found",
        cgpa: 0,
        totalCourses: 0,
        success: false,
      };
    }

    // First, let's examine the grade structure to understand the data
    if (studentResults.length > 0) {
      const firstGrade = studentResults.models[0].related("grade");
      console.log(`First grade attributes:`, firstGrade.attributes);
    }

    // Group results by semester and level for GPA calculation
    const resultsBySemester = {};
    const resultsByLevel = {};
    let totalPoints = 0;
    let totalUnits = 0;

    for (const result of studentResults.models) {
      const course = result.related("studentcourse").related("course");
      const semester = result.related("studentcourse").related("semester");
      const level = result.related("studentcourse").related("level");
      const grade = result.related("grade");

      const courseUnits = parseFloat(course.get("units")) || 0;

      // Use the actual grade point from the grade table
      const gradePoint =
        parseFloat(grade.get("point")) || parseFloat(grade.get("weight")) || 0;

      const semesterId = semester.get("id");
      const levelId = level.get("id");

      console.log(
        `Processing course: ${course.get(
          "name"
        )}, Units: ${courseUnits}, Grade: ${grade.get(
          "name"
        )}, Points: ${gradePoint}`
      );

      // If grade point is still 0, log warning but continue
      if (gradePoint === 0) {
        console.warn(
          `Grade point is 0 for grade ${grade.get("name")} (ID: ${grade.get(
            "id"
          )}). Please check grade configuration.`
        );
      }

      // Calculate points for this course
      const coursePoints = courseUnits * gradePoint;

      // Semester GPA calculation
      if (!resultsBySemester[semesterId]) {
        resultsBySemester[semesterId] = {
          semesterName: semester.get("name"),
          totalPoints: 0,
          totalUnits: 0,
          results: [],
        };
      }
      resultsBySemester[semesterId].totalPoints += coursePoints;
      resultsBySemester[semesterId].totalUnits += courseUnits;
      resultsBySemester[semesterId].results.push(result);

      // Level GPA calculation
      if (!resultsByLevel[levelId]) {
        resultsByLevel[levelId] = {
          levelName: level.get("name"),
          totalPoints: 0,
          totalUnits: 0,
          results: [],
        };
      }
      resultsByLevel[levelId].totalPoints += coursePoints;
      resultsByLevel[levelId].totalUnits += courseUnits;
      resultsByLevel[levelId].results.push(result);

      // Overall CGPA calculation
      totalPoints += coursePoints;
      totalUnits += courseUnits;
    }

    console.log(
      `Total calculation: ${totalPoints} points / ${totalUnits} units`
    );

    // Calculate semester GPAs
    const semesterGPAs = {};
    for (const [semesterId, data] of Object.entries(resultsBySemester)) {
      const gpa =
        data.totalUnits > 0
          ? (data.totalPoints / data.totalUnits).toFixed(2)
          : "0.00";
      semesterGPAs[semesterId] = {
        semesterName: data.semesterName,
        gpa: parseFloat(gpa),
        totalPoints: data.totalPoints,
        totalUnits: data.totalUnits,
        coursesCount: data.results.length,
      };
    }

    // Calculate level GPAs
    const levelGPAs = {};
    for (const [levelId, data] of Object.entries(resultsByLevel)) {
      const gpa =
        data.totalUnits > 0
          ? (data.totalPoints / data.totalUnits).toFixed(2)
          : "0.00";
      levelGPAs[levelId] = {
        levelName: data.levelName,
        gpa: parseFloat(gpa),
        totalPoints: data.totalPoints,
        totalUnits: data.totalUnits,
        coursesCount: data.results.length,
      };
    }

    // Calculate overall CGPA
    const cgpa =
      totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : "0.00";

    console.log(`Calculated CGPA: ${cgpa} for student ${studentId}`);

    // Get class degrees from database to determine the correct class_degree_id
    const classDegrees = await ClassDegree.fetchAll();
    let classDegreeId = null;
    let classDegreeInfo = null;

    for (const degree of classDegrees.models) {
      const minPoint = parseFloat(degree.get("min_point"));
      const maxPoint = parseFloat(degree.get("max_point"));
      const cgpaValue = parseFloat(cgpa);

      if (cgpaValue >= minPoint && cgpaValue <= maxPoint) {
        classDegreeId = degree.get("id");
        classDegreeInfo = {
          id: degree.get("id"),
          name: degree.get("name"),
          code: degree.get("code"),
          minPoint: minPoint,
          maxPoint: maxPoint,
        };
        console.log(
          `CGPA ${cgpaValue} falls in range ${minPoint}-${maxPoint}: ${degree.get(
            "name"
          )} (ID: ${classDegreeId})`
        );
        break;
      }
    }

    if (!classDegreeId) {
      console.warn(
        `No class degree found for CGPA ${cgpa}. Using default (Fail)`
      );
      // Default to Fail if no match found (ID 12 based on your data)
      classDegreeId = 12;
    }

    // Use semester and level from the first result's student course
    const firstResult = studentResults.models[0];
    const semesterId = firstResult.related("studentcourse").get("semester_id");
    const levelId = firstResult.related("studentcourse").get("level_id");

    console.log(
      `Using semester_id: ${semesterId}, level_id: ${levelId} from student course relationship`
    );

    // Store GPA data in student_gpa table
    try {
      // Look for existing GPA record for this student, semester, and level
      const existingGPA = await StudentGpa.where({
        student_id: studentId,
        level_id: levelId,
        semester_id: semesterId,
      }).fetch({ require: false });

      let gpaData;
      if (existingGPA) {
        const prevTnu = existingGPA.get("current_tnu") || 0;
        const prevTcp = existingGPA.get("current_tcp") || 0;
        const prevGpa = existingGPA.get("current_gpa") || 0;
        gpaData = {
          student_id: studentId,
          level_id: levelId,
          semester_id: semesterId,
          prev_tnu: prevTnu,
          prev_tcp: prevTcp,
          prev_gpa: prevGpa,
          current_tnu: totalUnits,
          current_tcp: totalPoints,
          current_gpa: parseFloat(cgpa),
          cumulative_tnu: totalUnits,
          cumulative_tcp: totalPoints,
          cumulative_gpa: parseFloat(cgpa),
          class_degree_id: classDegreeId,
        };
      } else {
        gpaData = {
          student_id: studentId,
          level_id: levelId,
          semester_id: semesterId,
          prev_tnu: 0,
          prev_tcp: 0,
          prev_gpa: 0,
          current_tnu: totalUnits,
          current_tcp: totalPoints,
          current_gpa: parseFloat(cgpa),
          cumulative_tnu: totalUnits,
          cumulative_tcp: totalPoints,
          cumulative_gpa: parseFloat(cgpa),
          class_degree_id: classDegreeId,
        };
      }

      let studentGPARecord;
      if (existingGPA) {
        // Update existing record
        studentGPARecord = await existingGPA.save(gpaData, { patch: true });
        console.log(
          `Updated existing GPA record for student ${studentId} with class degree ${classDegreeId} (${classDegreeInfo?.name})`
        );
      } else {
        // Create new record
        studentGPARecord = await StudentGpa.forge(gpaData).save();
        console.log(
          `Created new GPA record for student ${studentId} with class degree ${classDegreeId} (${classDegreeInfo?.name})`
        );
      }

      const gpaResult = {
        studentId,
        cgpa: parseFloat(cgpa),
        totalPoints,
        totalUnits,
        totalCourses: studentResults.length,
        semesterGPAs,
        levelGPAs,
        classDegreeId,
        classDegreeInfo,
        calculatedAt: new Date(),
        success: true,
        databaseUpdated: true,
        gpaRecordId: studentGPARecord.get("id"),
      };

      console.log(`GPA calculation completed for student ${studentId}:`, {
        cgpa: gpaResult.cgpa,
        totalCourses: gpaResult.totalCourses,
        totalUnits: gpaResult.totalUnits,
        classDegreeId: gpaResult.classDegreeId,
        classDegree: gpaResult.classDegreeInfo?.name,
        semestersCount: Object.keys(semesterGPAs).length,
        levelsCount: Object.keys(levelGPAs).length,
        databaseUpdated: gpaResult.databaseUpdated,
      });

      return gpaResult;
    } catch (gpaError) {
      console.error(
        `Error saving GPA data for student ${studentId}:`,
        gpaError
      );

      // Return calculation results even if database save fails
      return {
        studentId,
        cgpa: parseFloat(cgpa),
        totalPoints,
        totalUnits,
        totalCourses: studentResults.length,
        semesterGPAs,
        levelGPAs,
        classDegreeId,
        classDegreeInfo,
        calculatedAt: new Date(),
        success: true,
        databaseUpdated: false,
        error: gpaError.message,
      };
    }
  } catch (error) {
    console.error(`Error calculating GPA for student ${studentId}:`, error);
    throw error;
  }
};

// Get GPA details for a student from student_gpa table
exports.getStudentGPA = async (req, reply) => {
  try {
    const studentId = req.params.student_id;

    // First try to get from database
    const existingGPA = await StudentGpa.where({ student_id: studentId }).fetch(
      {
        require: false,
        withRelated: ["student", "classdegree"],
      }
    );

    if (existingGPA) {
      // Return stored GPA data using correct column names
      const gpaData = {
        studentId: existingGPA.get("student_id"),
        cgpa: existingGPA.get("cumulative_gpa"),
        currentGpa: existingGPA.get("current_gpa"),
        totalPoints: existingGPA.get("cumulative_tcp"),
        totalUnits: existingGPA.get("cumulative_tnu"),
        currentPoints: existingGPA.get("current_tcp"),
        currentUnits: existingGPA.get("current_tnu"),
        prevGpa: existingGPA.get("prev_gpa"),
        prevPoints: existingGPA.get("prev_tcp"),
        prevUnits: existingGPA.get("prev_tnu"),
        classDegreeId: existingGPA.get("class_degree_id"),
        classDegree: existingGPA.related("classdegree")?.get("name") || null,
        calculatedAt: existingGPA.get("updated_at"),
        success: true,
        source: "database",
      };

      console.log(
        `Retrieved GPA from database for student ${studentId}: CGPA = ${gpaData.cgpa}, Class = ${gpaData.classDegree}`
      );
      return gpaData;
    } else {
      // Calculate fresh if not in database
      console.log(
        `No GPA record found in database for student ${studentId}, calculating fresh...`
      );
      const gpaResult = await exports.calculateAndUpdateGPA(studentId);
      return { ...gpaResult, source: "calculated" };
    }
  } catch (err) {
    throw boom.boomify(err);
  }
};
