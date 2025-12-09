import React from "react";
import Layout from "../../components/Layout";
import { protectPage } from "../../helpers/utils";
import {
  getCoursesByParams,
  getStudentCoursesByParams,
  getGrades,
  addStudentResult,
  getStaffByUserId,
  downloadResultTemplate,
  getSemesters,
  getSessions,
} from "../../helpers/FetchWrapper";

class UploadResults extends React.Component {
  state = {
    courses: this.props.courses || [],
    grades: this.props.grades || [],
    semesters: this.props.semesters || [],
    sessions: this.props.sessions || [],
    selectedCourse: "",
    selectedSemester: "",
    selectedSession: "",
    students: [],
    results: {},
    loading: false,
    message: "",
    batchInfo: {
      courseTitle: "",
      courseCode: "",
      courseUnit: "",
      department: "",
      faculty: "",
      semesters: [],
      levels: [],
      session: "",
      totalStudents: 0,
    },
    // CSV Upload states
    uploadMode: "form", // 'form' or 'csv'
    csvFile: null,
    csvData: [],
    csvHeaders: [],
    csvStudents: [],
    csvResults: {},
    mappingComplete: false,
    uploadProgress: 0,
    uploadStatus: [],
  };

  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["STAFF", "ADMIN", "SUPERADMIN"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    try {
      // Get staff info
      const { staff } = await getStaffByUserId(userId, req);
      const staffId = staff ? staff.id : 0;

      // Get courses assigned to this staff member
      const searchParams = `staff_id=${staffId}&pgsize=1000`;
      const getCourses = await getCoursesByParams(searchParams, req);
      const coursesResponse = await getCourses.json();
      const courses = Array.isArray(coursesResponse) ? coursesResponse : [];

      // Get all grades
      const getGradesRes = await getGrades(req);
      const gradesResponse = await getGradesRes.json();
      const grades = Array.isArray(gradesResponse) ? gradesResponse : [];

      // Get all semesters
      const getSemestersRes = await getSemesters(req);
      const semestersResponse = await getSemestersRes.json();
      const semesters = Array.isArray(semestersResponse)
        ? semestersResponse
        : [];

      // Get all sessions
      const getSessionsRes = await getSessions(req);
      const sessionsResponse = await getSessionsRes.json();
      const sessions = Array.isArray(sessionsResponse) ? sessionsResponse : [];

      return { courses, grades, semesters, sessions, userData, staff };
    } catch (error) {
      console.error("Error in getInitialProps:", error);
      return {
        courses: [],
        grades: [],
        semesters: [],
        sessions: [],
        userData,
        staff: null,
        error: error.message,
      };
    }
  };

  handleCourseSelect = async (courseId) => {
    if (!courseId) return;

    this.setState({ selectedCourse: courseId, students: [], results: {} });

    // Find selected course info
    const selectedCourse = this.state.courses.find(
      (course) => course.id == courseId
    );

    this.setState({
      batchInfo: {
        courseTitle: selectedCourse?.name || "",
        courseCode: selectedCourse?.code || "",
        courseUnit: selectedCourse?.units || "",
        department: selectedCourse?.department?.name || "",
        faculty: selectedCourse?.department?.faculty?.name || "",
        semesters: [],
        levels: [],
        session: "",
        totalStudents: 0,
      },
    });
  };

  handleSemesterSessionSelect = async () => {
    if (
      !this.state.selectedCourse ||
      !this.state.selectedSemester ||
      !this.state.selectedSession
    ) {
      return;
    }

    this.setState({ loading: true });

    try {
      // Get student registrations for this course, semester, and session
      const searchParams = `course_id=${this.state.selectedCourse}&semester_id=${this.state.selectedSemester}`;
      const getStudentCourses = await getStudentCoursesByParams(searchParams);
      const students = await getStudentCourses.json();

      // Filter students by selected session (if session is stored in semester relationship)
      // For now, we'll show all students and handle session context in the UI

      // Get unique levels for this course/semester combination
      const uniqueLevels = [
        ...new Set(students.map((s) => s.level?.name).filter(Boolean)),
      ];

      this.setState({
        students,
        batchInfo: {
          ...this.state.batchInfo,
          semesters: [
            this.state.semesters.find(
              (s) => s.id == this.state.selectedSemester
            )?.name,
          ],
          levels: uniqueLevels,
          session:
            this.state.sessions.find((s) => s.id == this.state.selectedSession)
              ?.name || "",
          totalStudents: students.length,
        },
        loading: false,
      });
    } catch (error) {
      this.setState({
        loading: false,
        message: "Error loading students: " + error.message,
      });
    }
  };
  handleScoreChange = (studentCourseId, score) => {
    // Calculate grade based on score
    let gradeId = null;
    const numericScore = parseFloat(score);

    if (numericScore >= 70) gradeId = this.getGradeId("A");
    else if (numericScore >= 60) gradeId = this.getGradeId("B");
    else if (numericScore >= 50) gradeId = this.getGradeId("C");
    else if (numericScore >= 45) gradeId = this.getGradeId("D");
    else if (numericScore >= 40) gradeId = this.getGradeId("E");
    else gradeId = this.getGradeId("F");

    this.setState((prevState) => ({
      results: {
        ...prevState.results,
        [studentCourseId]: {
          score: score,
          grade_id: gradeId,
          student_course_id: studentCourseId,
        },
      },
    }));
  };

  getGradeId = (gradeName) => {
    const grade = this.state.grades.find((g) => g.name === gradeName);
    return grade ? grade.id : null;
  };

  getGradeName = (score) => {
    const numericScore = parseFloat(score);
    if (numericScore >= 70) return "A";
    if (numericScore >= 60) return "B";
    if (numericScore >= 50) return "C";
    if (numericScore >= 45) return "D";
    if (numericScore >= 40) return "E";
    return "F";
  };

  handleSubmit = async () => {
    this.setState({ loading: true, message: "" });

    try {
      const resultEntries = Object.values(this.state.results);

      if (resultEntries.length === 0) {
        throw new Error("Please enter at least one result");
      }

      // Upload all results (GPA will be calculated automatically)
      const uploadPromises = resultEntries.map((result) =>
        addStudentResult(result)
      );

      const uploadResults = await Promise.all(uploadPromises);

      this.setState({
        loading: false,
        message: `${uploadResults.length} results uploaded successfully! GPAs have been automatically calculated and updated for affected students.`,
        results: {},
      });
    } catch (error) {
      this.setState({
        loading: false,
        message: "Error uploading results: " + error.message,
      });
    }
  };

  handleDownloadTemplate = async () => {
    if (!this.state.selectedCourse) {
      alert("Please select a course first");
      return;
    }

    try {
      const blob = await downloadResultTemplate(this.state.selectedCourse);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const selectedCourse = this.state.courses.find(
        (course) => course.id == this.state.selectedCourse
      );
      link.download = `${selectedCourse?.code || "course"}_result_template.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      this.setState({
        message: "Error downloading template: " + error.message,
      });
    }
  };

  // Add CSV upload methods
  handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      this.setState({ message: "Please select a CSV file" });
      return;
    }

    this.setState({ csvFile: file, message: "" });
    this.parseCSV(file);
  };

  parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target.result;
      const lines = csv.split("\n");

      // Find the data section
      const dataStartIndex = lines.findIndex(
        (line) => line.trim() === "---DATA---"
      );
      const dataEndIndex = lines.findIndex(
        (line, index) => index > dataStartIndex && line.trim() === "---DATA---"
      );

      if (dataStartIndex === -1 || dataEndIndex === -1) {
        this.setState({
          message: "Invalid CSV format. Please use the downloaded template.",
        });
        return;
      }

      const dataLines = lines.slice(dataStartIndex + 1, dataEndIndex);
      const headerLine = dataLines[0];
      const dataRows = dataLines.slice(1).filter((line) => line.trim());

      const headers = this.parseCSVLine(headerLine);
      const csvData = dataRows.map((line) => this.parseCSVLine(line));

      this.setState({
        csvHeaders: headers,
        csvData: csvData,
        message: `Parsed ${csvData.length} student records from CSV`,
      });

      this.processParsedCSV(headers, csvData);
    };
    reader.readAsText(file);
  };

  parseCSVLine = (line) => {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  processParsedCSV = async (headers, csvData) => {
    if (!this.state.selectedCourse) {
      this.setState({
        message: "Please select a course first before uploading CSV",
      });
      return;
    }

    this.setState({ loading: true });

    try {
      // Get student registrations for validation
      const searchParams = `course_id=${this.state.selectedCourse}&semester_id=${this.state.selectedSemester}`;
      const getStudentCourses = await getStudentCoursesByParams(searchParams);
      const students = await getStudentCourses.json();

      // Map CSV data to students
      const csvStudents = [];
      const csvResults = {};

      // Find column indices
      const regNoIndex = headers.findIndex((h) =>
        h.toLowerCase().includes("reg")
      );
      const caIndex = headers.findIndex((h) => h.toLowerCase().includes("ca"));
      const examIndex = headers.findIndex((h) =>
        h.toLowerCase().includes("exam")
      );
      const totalIndex = headers.findIndex((h) =>
        h.toLowerCase().includes("total")
      );
      const gradeIndex = headers.findIndex((h) =>
        h.toLowerCase().includes("grade")
      );

      csvData.forEach((row, index) => {
        const regNo = row[regNoIndex]?.trim();
        if (!regNo) return;

        // Find matching student
        const matchingStudent = students.find(
          (s) => s.student?.reg_no?.trim().toLowerCase() === regNo.toLowerCase()
        );

        if (matchingStudent) {
          const caScore = parseFloat(row[caIndex]) || 0;
          const examScore = parseFloat(row[examIndex]) || 0;
          const totalScore = parseFloat(row[totalIndex]) || caScore + examScore;

          // Calculate grade if not provided
          let gradeId = null;
          const providedGrade = row[gradeIndex]?.trim().toUpperCase();

          if (
            providedGrade &&
            ["A", "B", "C", "D", "E", "F"].includes(providedGrade)
          ) {
            gradeId = this.getGradeId(providedGrade);
          } else {
            // Auto-calculate grade based on total score
            if (totalScore >= 70) gradeId = this.getGradeId("A");
            else if (totalScore >= 60) gradeId = this.getGradeId("B");
            else if (totalScore >= 50) gradeId = this.getGradeId("C");
            else if (totalScore >= 45) gradeId = this.getGradeId("D");
            else if (totalScore >= 40) gradeId = this.getGradeId("E");
            else gradeId = this.getGradeId("F");
          }

          csvStudents.push({
            ...matchingStudent,
            csvIndex: index,
            caScore,
            examScore,
            totalScore,
            grade: this.state.grades.find((g) => g.id === gradeId)?.name || "F",
          });

          csvResults[matchingStudent.id] = {
            student_course_id: matchingStudent.id,
            score: totalScore,
            ca_mark: caScore,
            exam_score: examScore,
            grade_id: gradeId,
          };
        }
      });

      this.setState({
        csvStudents,
        csvResults,
        mappingComplete: true,
        loading: false,
        message: `Successfully mapped ${csvStudents.length} students from CSV`,
      });
    } catch (error) {
      this.setState({
        loading: false,
        message: "Error processing CSV: " + error.message,
      });
    }
  };

  handleBulkUpload = async () => {
    if (
      !this.state.mappingComplete ||
      Object.keys(this.state.csvResults).length === 0
    ) {
      this.setState({ message: "No valid results to upload" });
      return;
    }

    this.setState({
      loading: true,
      uploadProgress: 0,
      uploadStatus: [],
      message: "",
    });

    try {
      const results = Object.values(this.state.csvResults);

      // Prepare batch upload data
      const batchData = {
        results: results,
      };

      // Upload using the batch endpoint
      const response = await fetch("/api/studentresult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(batchData),
      });

      const result = await response.json();

      if (result.success) {
        this.setState({
          loading: false,
          uploadProgress: 100,
          message: `✅ Bulk upload completed successfully!
            - ${result.uploaded} results uploaded
            - ${result.errors} errors
            - ${result.gpaCalculations?.length || 0} GPA calculations performed
            
            All results have been automatically approved and published. Student GPAs have been updated.`,
          csvResults: {},
          csvStudents: [],
          mappingComplete: false,
          csvFile: null,
        });

        // Clear file input
        const fileInput = document.getElementById("csvFileInput");
        if (fileInput) fileInput.value = "";
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      this.setState({
        loading: false,
        message: "❌ Error during bulk upload: " + error.message,
      });
    }
  };

  render() {
    const {
      courses,
      students,
      loading,
      message,
      batchInfo,
      semesters,
      sessions,
      uploadMode,
      csvStudents,
      mappingComplete,
    } = this.state;

    // Ensure courses is always an array
    const coursesList = Array.isArray(courses) ? courses : [];

    return (
      <Layout pageTitle="Upload Results" userData={this.props.userData}>
        <div className="row">
          <div className="col-md-12">
            <h3 className="all-caps semi-bold">Upload Course Results</h3>

            {/* Show error if any */}
            {this.props.error && (
              <div className="alert alert-danger">
                <i className="fa fa-exclamation-triangle"></i> Error loading
                data: {this.props.error}
              </div>
            )}

            {/* Show warning if no courses */}
            {coursesList.length === 0 && !this.props.error && (
              <div className="alert alert-warning">
                <i className="fa fa-exclamation-triangle"></i> No courses
                assigned to you. Please contact administrator to assign courses.
              </div>
            )}

            {/* Upload Mode Selection */}
            <div className="panel panel-default">
              <div className="panel-body">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${
                      uploadMode === "form" ? "btn-primary" : "btn-default"
                    }`}
                    onClick={() =>
                      this.setState({ uploadMode: "form", message: "" })
                    }
                  >
                    <i className="fa fa-edit"></i> Form Entry
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      uploadMode === "csv" ? "btn-primary" : "btn-default"
                    }`}
                    onClick={() =>
                      this.setState({ uploadMode: "csv", message: "" })
                    }
                  >
                    <i className="fa fa-upload"></i> CSV Bulk Upload
                  </button>
                </div>
                <p
                  className="text-muted"
                  style={{ marginTop: "10px", marginBottom: 0 }}
                >
                  {uploadMode === "form"
                    ? "Enter results manually using the form below"
                    : "Upload results from a CSV file (use downloaded template)"}
                </p>
              </div>
            </div>

            {/* Course Selection */}
            <div className="form-group">
              <label>Select Course:</label>
              <div className="row">
                <div className="col-md-10">
                  <select
                    className="form-control"
                    onChange={(e) => this.handleCourseSelect(e.target.value)}
                    value={this.state.selectedCourse}
                    disabled={coursesList.length === 0}
                  >
                    <option value="">
                      {coursesList.length === 0
                        ? "-- No Courses Available --"
                        : "-- Select Course --"}
                    </option>
                    {coursesList.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <button
                    className="btn btn-info btn-block"
                    onClick={this.handleDownloadTemplate}
                    disabled={
                      !this.state.selectedCourse ||
                      !this.state.selectedSemester ||
                      !this.state.selectedSession
                    }
                    title="Download CSV template for offline data entry"
                  >
                    <i className="fa fa-download"></i> Template
                  </button>
                </div>
              </div>
            </div>

            {/* Semester and Session Selection */}
            {this.state.selectedCourse && (
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Select Semester:</label>
                    <select
                      className="form-control"
                      onChange={(e) => {
                        this.setState({ selectedSemester: e.target.value });
                        setTimeout(
                          () => this.handleSemesterSessionSelect(),
                          100
                        );
                      }}
                      value={this.state.selectedSemester}
                    >
                      <option value="">-- Select Semester --</option>
                      {this.state.semesters.map((semester) => (
                        <option key={semester.id} value={semester.id}>
                          {semester.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Select Session:</label>
                    <select
                      className="form-control"
                      onChange={(e) => {
                        this.setState({ selectedSession: e.target.value });
                        setTimeout(
                          () => this.handleSemesterSessionSelect(),
                          100
                        );
                      }}
                      value={this.state.selectedSession}
                    >
                      <option value="">-- Select Session --</option>
                      {this.state.sessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          {session.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* CSV Upload Section */}
            {uploadMode === "csv" && this.state.selectedCourse && (
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4>
                    <i className="fa fa-upload"></i> CSV Bulk Upload
                  </h4>
                </div>
                <div className="panel-body">
                  <div className="alert alert-info">
                    <h4>
                      <i className="fa fa-info-circle"></i> CSV Upload
                      Instructions
                    </h4>
                    <ol>
                      <li>
                        Download the CSV template using the "Template" button
                        above
                      </li>
                      <li>
                        Fill in the required fields: <strong>CA Mark</strong>,{" "}
                        <strong>Exam Score</strong>, <strong>Total</strong>
                      </li>
                      <li>Upload the completed CSV file below</li>
                      <li>Review the mapped data and click "Upload Results"</li>
                    </ol>
                  </div>

                  <div className="form-group">
                    <label>Select CSV File:</label>
                    <input
                      type="file"
                      id="csvFileInput"
                      className="form-control"
                      accept=".csv"
                      onChange={this.handleFileUpload}
                    />
                  </div>

                  {csvStudents.length > 0 && (
                    <div className="panel panel-success">
                      <div className="panel-heading">
                        <h4>
                          CSV Data Preview ({csvStudents.length} students)
                        </h4>
                      </div>
                      <div className="panel-body">
                        <div className="table-responsive">
                          <table className="table table-striped table-hover">
                            <thead>
                              <tr>
                                <th>S/N</th>
                                <th>Reg. No</th>
                                <th>Student Name</th>
                                <th>CA Mark</th>
                                <th>Exam Score</th>
                                <th>Total</th>
                                <th>Grade</th>
                              </tr>
                            </thead>
                            <tbody>
                              {csvStudents
                                .slice(0, 10)
                                .map((student, index) => (
                                  <tr key={student.id}>
                                    <td>{index + 1}</td>
                                    <td>{student.student?.reg_no}</td>
                                    <td>
                                      {student.student?.surname},{" "}
                                      {student.student?.firstname}{" "}
                                      {student.student?.othername}
                                    </td>
                                    <td>{student.caScore}</td>
                                    <td>{student.examScore}</td>
                                    <td>
                                      <strong>{student.totalScore}</strong>
                                    </td>
                                    <td>
                                      <span
                                        className={`badge ${
                                          student.grade === "F"
                                            ? "badge-danger"
                                            : "badge-success"
                                        }`}
                                      >
                                        {student.grade}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                        {csvStudents.length > 10 && (
                          <p className="text-muted">
                            Showing first 10 of {csvStudents.length} students.
                            All will be uploaded.
                          </p>
                        )}

                        <div
                          className="text-center"
                          style={{ marginTop: "20px" }}
                        >
                          <button
                            className="btn btn-success btn-lg"
                            onClick={this.handleBulkUpload}
                            disabled={loading || !mappingComplete}
                          >
                            {loading ? (
                              <span>
                                <i className="fa fa-spinner fa-spin"></i>{" "}
                                Uploading Results...
                              </span>
                            ) : (
                              <span>
                                <i className="fa fa-upload"></i> Upload{" "}
                                {csvStudents.length} Results
                              </span>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ...existing form upload section... */}
            {uploadMode === "form" && (
              <>
                {/* Course Information Panel */}
                {this.state.selectedCourse && (
                  <div className="panel panel-default">
                    <div className="panel-heading">
                      <h4>Course Information</h4>
                    </div>
                    <div className="panel-body">
                      <div className="row">
                        <div className="col-md-6">
                          <p>
                            <strong>Course Title:</strong>{" "}
                            {batchInfo.courseTitle}
                          </p>
                          <p>
                            <strong>Course Code:</strong> {batchInfo.courseCode}
                          </p>
                          <p>
                            <strong>Units:</strong> {batchInfo.courseUnit}
                          </p>
                          <p>
                            <strong>Department:</strong> {batchInfo.department}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <p>
                            <strong>Faculty:</strong> {batchInfo.faculty}
                          </p>
                          <p>
                            <strong>Semesters:</strong>{" "}
                            {batchInfo.semesters?.join(", ") || "Not specified"}
                          </p>
                          <p>
                            <strong>Session:</strong> {batchInfo.session}
                          </p>
                          <p>
                            <strong>Levels:</strong>{" "}
                            {batchInfo.levels?.join(", ") || "Not specified"}
                          </p>
                        </div>
                      </div>
                      <div className="alert alert-info">
                        <i className="fa fa-info-circle"></i>{" "}
                        <strong>{batchInfo.totalStudents}</strong> student
                        registrations found for this course.
                        {batchInfo.semesters?.length > 1 && (
                          <div style={{ marginTop: "10px" }}>
                            <strong>Note:</strong> This course has registrations
                            from multiple semesters:{" "}
                            {batchInfo.semesters.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Results Entry */}
                {students.length > 0 && (
                  <div className="panel panel-default">
                    <div className="panel-heading">
                      <h4>Student Results Entry</h4>
                    </div>
                    <div className="panel-body">
                      <table className="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th>S/N</th>
                            <th>Student Name</th>
                            <th>Reg. No</th>
                            <th>Department</th>
                            <th>Semester</th>
                            <th>Level</th>
                            <th>CA Mark</th>
                            <th>Exam Score</th>
                            <th>Total</th>
                            <th>Letter Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student, index) => {
                            const currentResult =
                              this.state.results[student.id];
                            const score = currentResult?.score || "";
                            const letterGrade = score
                              ? this.getGradeName(score)
                              : "";

                            return (
                              <tr key={student.id}>
                                <td>{index + 1}</td>
                                <td>
                                  {student.student.surname},{" "}
                                  {student.student.firstname}{" "}
                                  {student.student.othername}
                                </td>
                                <td>{student.student.reg_no}</td>
                                <td>{student.student.department?.name}</td>
                                <td>
                                  <span className="badge badge-info">
                                    {student.semester?.name || "N/A"}
                                  </span>
                                </td>
                                <td>
                                  <span className="badge badge-primary">
                                    {student.level?.name || "N/A"}
                                  </span>
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control"
                                    placeholder="CA"
                                    style={{ width: "60px" }}
                                    min="0"
                                    max="30"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Exam"
                                    style={{ width: "60px" }}
                                    min="0"
                                    max="70"
                                  />
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control"
                                    value={score}
                                    onChange={(e) =>
                                      this.handleScoreChange(
                                        student.id,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Total"
                                    style={{ width: "60px" }}
                                    min="0"
                                    max="100"
                                  />
                                </td>
                                <td>
                                  <span
                                    className={`badge ${
                                      letterGrade === "F"
                                        ? "badge-danger"
                                        : "badge-success"
                                    }`}
                                  >
                                    {letterGrade}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Approval and Publishing Options */}
                      <div
                        className="panel panel-default"
                        style={{ marginTop: "20px" }}
                      >
                        <div className="panel-heading">
                          <h4>Result Approval & Publishing</h4>
                        </div>
                        <div className="panel-body">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="form-group">
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={this.state.approveResults || false}
                                    onChange={(e) =>
                                      this.setState({
                                        approveResults: e.target.checked,
                                      })
                                    }
                                  />{" "}
                                  <strong>Approve Results</strong>
                                </label>
                                <p className="text-muted">
                                  <small>
                                    Mark results as approved by staff/lecturer
                                  </small>
                                </p>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-group">
                                <label>
                                  <input
                                    type="checkbox"
                                    checked={this.state.publishResults || false}
                                    onChange={(e) =>
                                      this.setState({
                                        publishResults: e.target.checked,
                                      })
                                    }
                                  />{" "}
                                  <strong>Publish Results</strong>
                                </label>
                                <p className="text-muted">
                                  <small>
                                    Make results visible to students immediately
                                  </small>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="alert alert-info">
                            <i className="fa fa-info-circle"></i>{" "}
                            <strong>Note:</strong> Results can be uploaded as
                            drafts (unchecked options) and approved/published
                            later by admin.
                          </div>
                        </div>
                      </div>

                      <div className="form-group text-center">
                        <button
                          className="btn btn-primary btn-lg"
                          onClick={this.handleSubmit}
                          disabled={loading}
                        >
                          {loading ? "Uploading..." : "Upload Results"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Message Display */}
            {message && (
              <div
                className={`alert ${
                  message.includes("Error") || message.includes("❌")
                    ? "alert-danger"
                    : "alert-success"
                }`}
                style={{ whiteSpace: "pre-line" }}
              >
                {message}
              </div>
            )}

            {/* Grading Scale */}
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
}

export default UploadResults;
