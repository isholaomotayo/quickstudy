import React from "react";
import Layout from "../../components/Layout";
import {
  getStudentByUserId,
  getStudentResultsByParams,
  getStudentCoursesByParams,
  getStudentGpasByStudentId,
} from "../../helpers/FetchWrapper";
import { protectPage } from "../../helpers/utils";

class CourseResult extends React.Component {
  state = {
    studentResults: this.props.studentResults,
    studentGpas: this.props.studentGpas,
    showGpaCalculation: false,
  };

  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    const { student } = await getStudentByUserId(userId, req);
    const studentId = student ? student.id : 0;

    console.log("Student ID:", studentId); // Debug log

    let search_params = "student_id=".concat(studentId);

    const getStudentCourses = await getStudentCoursesByParams(
      search_params,
      req
    );
    const allStudentCourses = await getStudentCourses.json();

    console.log("Student Courses found:", allStudentCourses.length); // Debug log

    let studentResults = [];
    let filter_params;

    if (allStudentCourses.length) {
      // Try without publish filter first to see if results exist
      filter_params = "";

      // fetch student course registrations ids
      for (let i = 0; i < allStudentCourses.length; i++) {
        if (i === 0) {
          filter_params = "student_course_id=".concat(allStudentCourses[i].id);
        } else {
          filter_params = filter_params
            .concat("&student_course_id=")
            .concat(allStudentCourses[i].id);
        }
      }

      const getStudentResults = await getStudentResultsByParams(
        filter_params,
        req
      );
      studentResults = await getStudentResults.json();

      console.log("Results found (all):", studentResults.length); // Debug log

      // If no results found without publish filter, there are no results at all
      if (studentResults.length === 0) {
        console.log("No results found at all for this student");
      } else {
        // Filter published results on frontend if needed
        const publishedResults = studentResults.filter(
          (result) => result.publish === true
        );
        console.log("Published results:", publishedResults.length); // Debug log
        studentResults = publishedResults;
      }
    } else {
      console.log("No course registrations found for student");
    }

    // Get student GPAs
    const getStudentGpas = await getStudentGpasByStudentId(studentId, req);
    const studentGpas = await getStudentGpas.json();

    console.log("GPAs found:", studentGpas.length); // Debug log

    return { studentResults, studentGpas, userData, student };
  };

  calculateOverallCGPA = () => {
    if (!this.state.studentGpas || !this.state.studentGpas.length) return 0;
    const latestGpa = this.state.studentGpas[this.state.studentGpas.length - 1];
    return parseFloat(latestGpa.cumulative_gpa) || 0;
  };

  groupResultsBySemester = () => {
    const grouped = {};
    this.state.studentResults.forEach((result) => {
      const levelName = result.studentcourse?.level?.name || "Unknown Level";
      const semesterName =
        result.studentcourse?.semester?.name || "Unknown Semester";
      const semesterKey = `${levelName}-${semesterName}`;
      if (!grouped[semesterKey]) {
        grouped[semesterKey] = {
          level: levelName,
          semester: semesterName,
          results: [],
        };
      }
      grouped[semesterKey].results.push(result);
    });
    return grouped;
  };

  render() {
    const groupedResults = this.groupResultsBySemester();
    const overallCGPA = this.calculateOverallCGPA();
    const displayCGPA =
      typeof overallCGPA === "number" && !isNaN(overallCGPA) ? overallCGPA : 0;

    // Debug information
    console.log("Rendering with:", {
      resultsCount: this.state.studentResults.length,
      gpasCount: this.state.studentGpas.length,
      groupedSemesters: Object.keys(groupedResults).length,
    });

    return (
      <Layout pageTitle="Course Results" userData={this.props.userData}>
        <div className="row">
          <div className="col-md-12">
            <h3 className="all-caps semi-bold">My Academic Results</h3>

            {/* Summary Cards */}
            <div className="row">
              <div className="col-md-3">
                <div className="panel panel-primary">
                  <div className="panel-body text-center">
                    <h4>Total Courses</h4>
                    <h2>{this.state.studentResults.length}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="panel panel-success">
                  <div className="panel-body text-center">
                    <h4>Current CGPA</h4>
                    <h2>{displayCGPA.toFixed(2)}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="panel panel-info">
                  <div className="panel-body text-center">
                    <h4>Semesters</h4>
                    <h2>{Object.keys(groupedResults).length}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="panel panel-warning">
                  <div className="panel-body text-center">
                    <h4>Class of Degree</h4>
                    <h2>{this.getClassOfDegree(displayCGPA)}</h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="pull-right">
              <div className="col-xs-12">
                <a
                  href="student-gpa"
                  className="btn btn-complete btn-cons text-white"
                >
                  <i className="fa fa-search-plus" /> View Detailed GPA Records
                </a>
              </div>
            </div>
            <div className="clearfix" />

            {/* Results by Semester */}
            {Object.keys(groupedResults).map((semesterKey) => {
              const semesterData = groupedResults[semesterKey];
              const semesterGpa = this.getSemesterGPA(
                semesterData.level,
                semesterData.semester
              );

              return (
                <div key={semesterKey} className="panel panel-default">
                  <div className="panel-heading">
                    <h4>
                      {semesterData.level} - {semesterData.semester}
                      {semesterGpa && (
                        <span className="pull-right">
                          Semester GPA:{" "}
                          <strong>
                            {semesterGpa && semesterGpa.current_gpa
                              ? semesterGpa.current_gpa
                              : "N/A"}
                          </strong>
                        </span>
                      )}
                    </h4>
                  </div>
                  <div className="panel-body">
                    <table className="table table-condensed table-responsive table-hover">
                      <thead>
                        <tr>
                          <th>Course Code</th>
                          <th>Course Title</th>
                          <th>Units</th>
                          <th>Score</th>
                          <th>Grade</th>
                          <th>Points</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semesterData.results.map((studentresult) => (
                          <tr key={studentresult.id}>
                            <td className="font-montserrat all-caps fs-12 w-10">
                              {studentresult.studentcourse.course.code}
                            </td>
                            <td className="font-montserrat all-caps fs-12 w-40">
                              {studentresult.studentcourse.course.name}
                            </td>
                            <td className="text-center w-10">
                              <span className="hint-text">
                                {studentresult.studentcourse.course.units}
                              </span>
                            </td>
                            <td className="text-center w-10">
                              <span className="font-montserrat fs-16">
                                {studentresult.score}
                              </span>
                            </td>
                            <td className="text-center w-10">
                              <span
                                className={`badge ${this.getGradeBadgeClass(
                                  studentresult.grade.name
                                )}`}
                              >
                                {studentresult.grade.name}
                              </span>
                            </td>
                            <td className="text-center w-10">
                              <span className="font-montserrat fs-14">
                                {(
                                  studentresult.studentcourse.course.units *
                                  (studentresult.grade.point || 0)
                                ).toFixed(1)}
                              </span>
                            </td>
                            <td className="text-center w-10">
                              <span
                                className={`badge ${
                                  studentresult.score >= 40
                                    ? "badge-success"
                                    : "badge-danger"
                                }`}
                              >
                                {studentresult.score >= 40 ? "PASS" : "FAIL"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            {/* Grading Scale Reference */}
            <div className="panel panel-info">
              <div className="panel-heading">
                <h4>Grading Scale</h4>
              </div>
              <div className="panel-body">
                <div className="row">
                  <div className="col-md-2">70-100: A (Excellent)</div>
                  <div className="col-md-2">60-69: B (Very Good)</div>
                  <div className="col-md-2">50-59: C (Good)</div>
                  <div className="col-md-2">45-49: D (Fair)</div>
                  <div className="col-md-2">40-44: E (Pass)</div>
                  <div className="col-md-2">0-39: F (Fail)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  getSemesterGPA = (level, semester) => {
    return this.state.studentGpas.find(
      (gpa) => gpa.level?.name === level && gpa.semester?.name === semester
    );
  };

  getGradeBadgeClass = (grade) => {
    switch (grade) {
      case "A":
        return "badge-success";
      case "B":
        return "badge-primary";
      case "C":
        return "badge-info";
      case "D":
        return "badge-warning";
      case "E":
        return "badge-default";
      case "F":
        return "badge-danger";
      default:
        return "badge-default";
    }
  };
  getClassOfDegree = (cgpa) => {
    if (cgpa >= 4.5) return "First Class";
    if (cgpa >= 3.5) return "Second Class Upper";
    if (cgpa >= 2.5) return "Second Class Lower";
    if (cgpa >= 1.5) return "Third Class";
    return "Pass";
  };
}
export default CourseResult;
