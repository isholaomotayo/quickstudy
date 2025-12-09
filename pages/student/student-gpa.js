import React from "react";
import Layout from "../../components/Layout";
import { protectPage } from "../../helpers/utils";
import {
  getStudentByUserId,
  getStudentGpasByStudentId,
  getStudentResultsByParams,
  getStudentCoursesByParams,
} from "../../helpers/FetchWrapper";

class StudentGpa extends React.Component {
  state = {
    studentGpas: this.props.studentGpas,
    studentResults: this.props.studentResults,
    student: this.props.student,
    selectedSemester: "current",
  };

  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    try {
      const { student } = await getStudentByUserId(userId, req);
      const studentId = student ? student.id : 0;

      if (!studentId) {
        throw new Error("Student profile not found");
      }

      // Get student GPAs
      const getStudentGpas = await getStudentGpasByStudentId(studentId, req);
      const studentGpas = await getStudentGpas.json();

      // Get student course registrations
      const getStudentCourses = await getStudentCoursesByParams(
        `student_id=${studentId}`,
        req
      );
      const allStudentCourses = await getStudentCourses.json();

      // Get student results
      let studentResults = [];
      if (allStudentCourses && allStudentCourses.length) {
        let filter_params = "publish=true";
        for (let i = 0; i < allStudentCourses.length; i++) {
          if (allStudentCourses[i] && allStudentCourses[i].id) {
            filter_params = filter_params
              .concat("&student_course_id=")
              .concat(allStudentCourses[i].id);
          }
        }

        if (filter_params !== "publish=true") {
          const getStudentResults = await getStudentResultsByParams(
            filter_params,
            req
          );
          studentResults = await getStudentResults.json();
        }
      }

      return { studentGpas, studentResults, student, userData };
    } catch (error) {
      console.error("Error in getInitialProps:", error);
      return {
        studentGpas: [],
        studentResults: [],
        student: null,
        userData,
        error: error.message,
      };
    }
  };

  calculateOverallCGPA = () => {
    if (!this.state.studentGpas || !this.state.studentGpas.length) return 0;
    const latestGpa = this.state.studentGpas[this.state.studentGpas.length - 1];
    return parseFloat(latestGpa.cumulative_gpa) || 0;
  };

  getCurrentSemesterGPA = () => {
    if (!this.state.studentGpas || !this.state.studentGpas.length) return 0;
    const currentGpa =
      this.state.studentGpas[this.state.studentGpas.length - 1];
    return parseFloat(currentGpa.current_gpa) || 0;
  };

  getGPAStatus = (gpa) => {
    if (gpa >= 4.5)
      return {
        status: "First Class",
        color: "success",
        bgColor: "bg-success",
        icon: "fa-trophy",
        description: "Excellent academic performance",
      };
    if (gpa >= 3.5)
      return {
        status: "Second Class Upper",
        color: "primary",
        bgColor: "bg-primary",
        icon: "fa-star",
        description: "Very good academic performance",
      };
    if (gpa >= 2.5)
      return {
        status: "Second Class Lower",
        color: "info",
        bgColor: "bg-info",
        icon: "fa-thumbs-up",
        description: "Good academic performance",
      };
    if (gpa >= 1.5)
      return {
        status: "Third Class",
        color: "warning",
        bgColor: "bg-warning",
        icon: "fa-exclamation-triangle",
        description: "Satisfactory academic performance",
      };
    return {
      status: "Pass",
      color: "danger",
      bgColor: "bg-danger",
      icon: "fa-times-circle",
      description: "Minimum academic performance",
    };
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

  groupResultsBySemester = () => {
    const grouped = {};
    if (
      !this.state.studentResults ||
      !Array.isArray(this.state.studentResults)
    ) {
      return grouped;
    }

    this.state.studentResults.forEach((result) => {
      if (
        result &&
        result.studentcourse &&
        result.studentcourse.level &&
        result.studentcourse.semester
      ) {
        const semesterKey = `${result.studentcourse.level.name}-${result.studentcourse.semester.name}`;
        if (!grouped[semesterKey]) {
          grouped[semesterKey] = {
            level: result.studentcourse.level.name,
            semester: result.studentcourse.semester.name,
            results: [],
          };
        }
        grouped[semesterKey].results.push(result);
      }
    });
    return grouped;
  };

  getTotalCredits = () => {
    let total = 0;
    if (
      !this.state.studentResults ||
      !Array.isArray(this.state.studentResults)
    ) {
      return total;
    }

    this.state.studentResults.forEach((result) => {
      if (result && result.studentcourse && result.studentcourse.course) {
        total += parseInt(result.studentcourse.course.units || 0);
      }
    });
    return total;
  };

  getPassedCredits = () => {
    let passed = 0;
    if (
      !this.state.studentResults ||
      !Array.isArray(this.state.studentResults)
    ) {
      return passed;
    }

    this.state.studentResults.forEach((result) => {
      if (
        result &&
        result.studentcourse &&
        result.studentcourse.course &&
        parseFloat(result.score) >= 40
      ) {
        passed += parseInt(result.studentcourse.course.units || 0);
      }
    });
    return passed;
  };

  calculateGPATrend = () => {
    if (this.state.studentGpas.length < 2) return null;

    const recent = this.state.studentGpas.slice(-2);
    const trend = recent[1].cumulative_gpa - recent[0].cumulative_gpa;

    if (trend > 0.1)
      return { direction: "up", color: "success", icon: "fa-arrow-up" };
    if (trend < -0.1)
      return { direction: "down", color: "danger", icon: "fa-arrow-down" };
    return { direction: "stable", color: "warning", icon: "fa-minus" };
  };

  render() {
    // Handle error state
    if (this.props.error) {
      return (
        <Layout pageTitle="My GPA Dashboard" userData={this.props.userData}>
          <div className="row">
            <div className="col-md-12">
              <div className="alert alert-danger">
                <h4>Error Loading GPA Data</h4>
                <p>{this.props.error}</p>
                <button
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </Layout>
      );
    }

    const overallCGPA = this.calculateOverallCGPA();
    const currentGPA = this.getCurrentSemesterGPA();
    const gpaStatus = this.getGPAStatus(overallCGPA);
    const groupedResults = this.groupResultsBySemester();
    const totalCredits = this.getTotalCredits();
    const passedCredits = this.getPassedCredits();
    const completionPercentage =
      totalCredits > 0 ? (passedCredits / totalCredits) * 100 : 0;
    const gpaTrend = this.calculateGPATrend();

    return (
      <Layout pageTitle="My GPA Dashboard" userData={this.props.userData}>
        <div className="row">
          <div className="col-md-12">
            {/* Header Section */}
            <div
              className="panel panel-primary"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
              }}
            >
              <div className="panel-body" style={{ padding: "30px" }}>
                <div className="row">
                  <div className="col-md-8">
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <div
                        style={{
                          background: "rgba(255,255,255,0.2)",
                          padding: "15px",
                          borderRadius: "50%",
                          marginRight: "20px",
                          width: "54px",
                          height: "54px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {this.props.student?.user?.avatar ? (
                          <img
                            src={this.props.student.user.avatar}
                            alt="User Avatar"
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              background: "#fff",
                            }}
                          />
                        ) : (
                          <i
                            className="fa fa-user"
                            style={{ fontSize: "24px", color: "white" }}
                          ></i>
                        )}
                      </div>
                      <div>
                        <h4 style={{ margin: "0", color: "white" }}>
                          {this.props.student?.user?.last_name || ""},{" "}
                          {this.props.student?.user?.first_name || ""}{" "}
                          {this.props.student?.user?.other_name || ""}
                        </h4>
                        <p style={{ margin: "5px 0", opacity: 0.9 }}>
                          Student ID: {this.props.student?.reg_no || "N/A"}
                        </p>
                        <p style={{ margin: "5px 0", opacity: 0.9 }}>
                          <i className="fa fa-building"></i>{" "}
                          {this.state.student?.programme?.department?.name ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-right">
                    <div
                      style={{
                        background: "rgba(255,255,255,0.2)",
                        padding: "20px",
                        borderRadius: "10px",
                      }}
                    >
                      <p
                        style={{ margin: "0", fontSize: "14px", opacity: 0.9 }}
                      >
                        Cumulative GPA
                      </p>
                      <h1
                        style={{
                          margin: "5px 0",
                          fontSize: "36px",
                          fontWeight: "bold",
                        }}
                      >
                        {overallCGPA.toFixed(2)}
                      </h1>
                      {gpaTrend && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            marginTop: "10px",
                          }}
                        >
                          <i
                            className={`fa ${gpaTrend.icon}`}
                            style={{ color: "white", marginRight: "5px" }}
                          ></i>
                          <span style={{ fontSize: "12px", opacity: 0.9 }}>
                            {gpaTrend.direction === "up"
                              ? "Improving"
                              : gpaTrend.direction === "down"
                              ? "Declining"
                              : "Stable"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* GPA Overview Cards */}
            <div className="row" style={{ marginTop: "20px" }}>
              <div className="col-md-3">
                <div className="panel panel-success">
                  <div className="panel-body text-center">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "14px",
                            color: "#666",
                          }}
                        >
                          Current GPA
                        </p>
                        <h3 style={{ margin: "5px 0", color: "#28a745" }}>
                          {currentGPA}
                        </h3>
                      </div>
                      <div
                        style={{
                          background: "#28a745",
                          padding: "10px",
                          borderRadius: "50%",
                        }}
                      >
                        <i
                          className="fa fa-line-chart"
                          style={{ color: "white" }}
                        ></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="panel panel-info">
                  <div className="panel-body text-center">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "14px",
                            color: "#666",
                          }}
                        >
                          Total Credits
                        </p>
                        <h3 style={{ margin: "5px 0", color: "#17a2b8" }}>
                          {passedCredits}
                        </h3>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "12px",
                            color: "#666",
                          }}
                        >
                          of {totalCredits}
                        </p>
                      </div>
                      <div
                        style={{
                          background: "#17a2b8",
                          padding: "10px",
                          borderRadius: "50%",
                        }}
                      >
                        <i
                          className="fa fa-book"
                          style={{ color: "white" }}
                        ></i>
                      </div>
                    </div>
                    <div
                      className="progress"
                      style={{ marginTop: "10px", height: "8px" }}
                    >
                      <div
                        className="progress-bar bg-info"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="panel panel-warning">
                  <div className="panel-body text-center">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "14px",
                            color: "#666",
                          }}
                        >
                          Academic Standing
                        </p>
                        <h4 style={{ margin: "5px 0", color: "#ffc107" }}>
                          {gpaStatus.status}
                        </h4>
                      </div>
                      <div
                        style={{
                          background: "#ffc107",
                          padding: "10px",
                          borderRadius: "50%",
                        }}
                      >
                        <i
                          className={`fa ${gpaStatus.icon}`}
                          style={{ color: "white" }}
                        ></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="panel panel-default">
                  <div className="panel-body text-center">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            margin: "0",
                            fontSize: "14px",
                            color: "#666",
                          }}
                        >
                          Semesters
                        </p>
                        <h3 style={{ margin: "5px 0", color: "#6c757d" }}>
                          {this.state.studentGpas.length}
                        </h3>
                      </div>
                      <div
                        style={{
                          background: "#6c757d",
                          padding: "10px",
                          borderRadius: "50%",
                        }}
                      >
                        <i
                          className="fa fa-calendar"
                          style={{ color: "white" }}
                        ></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-8">
                {/* Semester GPAs Table */}
                <div className="panel panel-default">
                  <div className="panel-heading">
                    <h4>Semester GPA Records</h4>
                  </div>
                  <div className="panel-body">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Semester</th>
                          <th>Level</th>
                          <th>Current GPA</th>
                          <th>Cumulative GPA</th>
                          <th>Credits</th>
                          <th>Class Degree</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.studentGpas &&
                        this.state.studentGpas.length ? (
                          this.state.studentGpas.map((studentgpa, index) => {
                            const semesterStatus = this.getGPAStatus(
                              studentgpa.current_gpa || 0
                            );
                            return (
                              <tr key={studentgpa.id}>
                                <td>
                                  <strong>
                                    {studentgpa.semester?.name || "N/A"}
                                  </strong>
                                </td>
                                <td>
                                  <span className="badge badge-primary">
                                    {studentgpa.level?.name || "N/A"}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className="text-success"
                                    style={{
                                      fontSize: "16px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {studentgpa.current_gpa
                                      ? parseFloat(
                                          studentgpa.current_gpa
                                        ).toFixed(2)
                                      : "N/A"}
                                  </span>
                                </td>
                                <td>
                                  <span
                                    className="text-primary"
                                    style={{
                                      fontSize: "16px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    {studentgpa.cumulative_gpa
                                      ? parseFloat(
                                          studentgpa.cumulative_gpa
                                        ).toFixed(2)
                                      : "N/A"}
                                  </span>
                                </td>
                                <td>
                                  <span className="text-muted">
                                    {studentgpa.current_tnu || 0}
                                  </span>
                                </td>
                                <td>
                                  {studentgpa.classdegree ? (
                                    <span
                                      className={`badge badge-${semesterStatus.color}`}
                                    >
                                      {studentgpa.classdegree.name}
                                    </span>
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </td>
                                <td>
                                  <span
                                    className={`badge badge-${semesterStatus.color}`}
                                  >
                                    {semesterStatus.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="7" className="text-center">
                              <p className="text-muted">
                                No GPA records found. Results will appear here
                                once your grades are published.
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                {/* GPA Trend */}
                <div className="panel panel-default">
                  <div className="panel-heading">
                    <h4>GPA Trend</h4>
                  </div>
                  <div className="panel-body">
                    <div style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <span style={{ fontSize: "14px", color: "#666" }}>
                          Current Semester
                        </span>
                        <span style={{ fontWeight: "bold", color: "#28a745" }}>
                          {currentGPA.toFixed(2)}
                        </span>
                      </div>
                      <div className="progress" style={{ height: "8px" }}>
                        <div
                          className="progress-bar bg-success"
                          style={{ width: `${currentGPA * 20}%` }}
                        ></div>
                      </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <span style={{ fontSize: "14px", color: "#666" }}>
                          Cumulative GPA
                        </span>
                        <span style={{ fontWeight: "bold", color: "#007bff" }}>
                          {overallCGPA.toFixed(2)}
                        </span>
                      </div>
                      <div className="progress" style={{ height: "8px" }}>
                        <div
                          className="progress-bar bg-primary"
                          style={{ width: `${overallCGPA * 20}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="panel panel-default">
                  <div className="panel-heading">
                    <h4>Quick Actions</h4>
                  </div>
                  <div className="panel-body">
                    <div style={{ marginBottom: "10px" }}>
                      <a
                        href="/student/course-results"
                        className="btn btn-success btn-block"
                      >
                        <i className="fa fa-list-alt"></i> View Course Results
                      </a>
                    </div>
                    <div style={{ marginBottom: "10px" }}>
                      <a
                        href="/student/course-registration"
                        className="btn btn-primary btn-block"
                      >
                        <i className="fa fa-edit"></i> Course Registration
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Academic Performance Summary */}
            <div className="panel panel-default">
              <div className="panel-heading">
                <h4>
                  <i className={`fa ${gpaStatus.icon}`}></i> Academic
                  Performance Summary
                </h4>
              </div>
              <div className="panel-body">
                <div className="row">
                  <div className="col-md-12">
                    <div className={`alert alert-${gpaStatus.color}`}>
                      <h5>
                        <strong>{gpaStatus.status}</strong> -{" "}
                        {gpaStatus.description}
                      </h5>
                      <p>
                        Your academic journey so far:{" "}
                        <strong>{this.state.studentGpas.length}</strong>{" "}
                        semesters completed with a cumulative GPA of{" "}
                        <strong>{overallCGPA}</strong>. You have earned{" "}
                        <strong>{passedCredits}</strong> credits out of{" "}
                        <strong>{totalCredits}</strong> attempted (
                        {completionPercentage.toFixed(1)}% completion rate).
                      </p>
                    </div>

                    {overallCGPA >= 4.5 && (
                      <div className="alert alert-success">
                        <i className="fa fa-trophy"></i>{" "}
                        <strong>Congratulations!</strong> You're performing at
                        First Class level. Keep up the excellent work!
                      </div>
                    )}

                    {overallCGPA >= 3.5 && overallCGPA < 4.5 && (
                      <div className="alert alert-info">
                        <i className="fa fa-star"></i>{" "}
                        <strong>Great job!</strong> You're performing at Second
                        Class Upper level. You're doing very well!
                      </div>
                    )}

                    {overallCGPA < 2.5 && overallCGPA !== 0 && (
                      <div className="alert alert-warning">
                        <i className="fa fa-exclamation-triangle"></i>{" "}
                        <strong>Academic Notice:</strong> Your GPA is below 2.5.
                        Consider meeting with an academic advisor for support.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}
export default StudentGpa;
