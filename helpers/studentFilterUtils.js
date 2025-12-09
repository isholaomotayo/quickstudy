/**
 * Shared student filtering logic for both frontend and backend
 * Ensures consistent filtering across the application
 */

/**
 * Filter students by semester, registration number, and remove duplicates
 * @param {Array} allStudents - Array of student course records
 * @param {string|number} targetSemesterId - The semester ID to filter by
 * @param {boolean} isBackend - Whether this is being called from backend (affects data structure)
 * @returns {Object} - Filtered results with breakdown
 */
const filterStudentsForSemester = (
  allStudents,
  targetSemesterId,
  isBackend = false
) => {
  const filteredOut = {
    wrongSemester: [],
    noRegNo: [],
    duplicates: [],
  };

  console.log(
    `Starting filtering with ${allStudents.length} total students for semester ${targetSemesterId}`
  );

  // Step 1: Filter by semester
  const semesterFiltered = allStudents.filter((studentCourse) => {
    let semesterId, studentData, regNo;

    if (isBackend) {
      // Backend: Bookshelf model structure
      const semester = studentCourse.related("semester");
      const student = studentCourse.related("student");
      const user = student.related("user");

      semesterId = semester.get("id");
      regNo = student.get("reg_no");
      studentData = {
        id: studentCourse.get("id"),
        name: `${user.get("last_name") || "N/A"}, ${
          user.get("first_name") || "N/A"
        }`,
        reg_no: regNo || "MISSING",
        semester_id: semesterId,
      };
    } else {
      // Frontend: JSON structure
      semesterId = studentCourse.semester?.id;
      regNo = studentCourse.student?.reg_no;
      studentData = {
        id: studentCourse.id,
        name: `${studentCourse.student?.user?.last_name || "N/A"}, ${
          studentCourse.student?.user?.first_name || "N/A"
        }`,
        reg_no: regNo || "MISSING",
        semester_id: semesterId,
      };
    }

    // Check semester match
    if (!semesterId || semesterId != targetSemesterId) {
      filteredOut.wrongSemester.push(studentData);
      return false;
    }
    return true;
  });

  console.log(
    `After semester filter: ${semesterFiltered.length} (filtered out: ${filteredOut.wrongSemester.length})`
  );

  // Step 2: Filter out students without registration numbers
  const withRegNoFiltered = semesterFiltered.filter((studentCourse) => {
    let regNo, studentData;

    if (isBackend) {
      const student = studentCourse.related("student");
      const user = student.related("user");
      regNo = student.get("reg_no");
      studentData = {
        id: studentCourse.get("id"),
        name: `${user.get("last_name") || "N/A"}, ${
          user.get("first_name") || "N/A"
        }`,
        reg_no: regNo || "MISSING",
      };
    } else {
      regNo = studentCourse.student?.reg_no;
      studentData = {
        id: studentCourse.id,
        name: `${studentCourse.student?.user?.last_name || "N/A"}, ${
          studentCourse.student?.user?.first_name || "N/A"
        }`,
        reg_no: regNo || "MISSING",
      };
    }

    // Check registration number
    if (!regNo || regNo.trim() === "") {
      filteredOut.noRegNo.push(studentData);
      return false;
    }
    return true;
  });

  console.log(
    `After reg_no filter: ${withRegNoFiltered.length} (filtered out: ${filteredOut.noRegNo.length})`
  );

  // Step 3: Remove duplicates based on registration number
  const uniqueStudents = [];
  const seenRegNos = new Set();

  withRegNoFiltered.forEach((studentCourse) => {
    let regNo, studentData;

    if (isBackend) {
      const student = studentCourse.related("student");
      const user = student.related("user");
      regNo = student.get("reg_no");
      studentData = {
        id: studentCourse.get("id"),
        name: `${user.get("last_name") || "N/A"}, ${
          user.get("first_name") || "N/A"
        }`,
        reg_no: regNo,
      };
    } else {
      regNo = studentCourse.student?.reg_no;
      studentData = {
        id: studentCourse.id,
        name: `${studentCourse.student?.user?.last_name || "N/A"}, ${
          studentCourse.student?.user?.first_name || "N/A"
        }`,
        reg_no: regNo,
      };
    }

    if (!seenRegNos.has(regNo)) {
      seenRegNos.add(regNo);
      uniqueStudents.push(studentCourse);
    } else {
      filteredOut.duplicates.push(studentData);
    }
  });

  console.log(
    `After deduplication: ${uniqueStudents.length} (duplicates removed: ${filteredOut.duplicates.length})`
  );

  const summary = {
    original: allStudents.length,
    semesterFiltered: semesterFiltered.length,
    withRegNo: withRegNoFiltered.length,
    final: uniqueStudents.length,
    filteredOut: {
      wrongSemester: filteredOut.wrongSemester.length,
      noRegNo: filteredOut.noRegNo.length,
      duplicates: filteredOut.duplicates.length,
      total: allStudents.length - uniqueStudents.length,
    },
    details: filteredOut,
  };

  console.log(`Filtering summary:
    - Original: ${summary.original}
    - Semester filtered: ${summary.semesterFiltered}
    - With reg_no: ${summary.withRegNo}
    - Final unique: ${summary.final}
    - Total filtered out: ${summary.filteredOut.total}
    - Wrong semester: ${summary.filteredOut.wrongSemester}
    - No reg_no: ${summary.filteredOut.noRegNo}
    - Duplicates: ${summary.filteredOut.duplicates}
  `);

  return {
    students: uniqueStudents,
    summary,
    filteredOut: filteredOut,
  };
};

// For ES6 modules (frontend)
export { filterStudentsForSemester };

// For Node.js (backend)
if (typeof module !== "undefined" && module.exports) {
  module.exports = { filterStudentsForSemester };
}
