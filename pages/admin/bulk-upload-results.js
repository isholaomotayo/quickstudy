import React from "react";
import Layout from "../../components/Layout";
import AsyncCourseSelect from "../../components/AsyncCourseSelect";
import { protectPage } from "../../helpers/utils";
import Papa from "papaparse";
import {
  getStudentCoursesByParams,
  getCourseSemesters,
  downloadResultTemplate,
  addStudentResultsBatch,
  getGrades,
  calculateGradeFromScore,
  calculateBatchGpa,
} from "../../helpers/FetchWrapper";
import { filterStudentsForSemester } from "../../helpers/studentFilterUtils";

class BulkUploadResults extends React.Component {
  state = {
    selectedCourse: null,
    selectedSemester: "",
    availableSemesters: [],
    allStudents: [],
    filteredStudents: [],
    selectedFile: null,
    parsedData: [],
    validationErrors: [],
    uploading: false,
    loading: false,
    uploadResults: [],
    message: "",
    grades: [], // Add grades mapping
    batchInfo: {
      courseTitle: "",
      courseCode: "",
      courseUnit: "",
      department: "",
      faculty: "",
      selectedSemester: "",
      session: "N/A",
      totalStudents: 0,
    },
  };

  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["ADMIN", "SUPERADMIN", "STAFF"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    return { userData };
  };

  handleCourseSelect = async (selectedOption) => {
    if (!selectedOption) {
      this.setState({
        selectedCourse: null,
        selectedSemester: "",
        availableSemesters: [],
        allStudents: [],
        filteredStudents: [],
      });
      return;
    }

    const courseId = selectedOption.value;
    const selectedCourse = selectedOption.course;

    this.setState({
      selectedCourse: selectedOption,
      selectedSemester: "",
      filteredStudents: [],
      allStudents: [],
      loading: true,
    });

    try {
      // Get available semesters for this course (efficient approach)
      console.log(`Getting available semesters for course ${courseId}`);
      const semestersResponse = await getCourseSemesters(courseId);

      if (!semestersResponse.ok) {
        throw new Error(`Failed to get semesters: ${semestersResponse.status}`);
      }

      const availableSemesters = await semestersResponse.json();
      console.log("Available semesters found:", availableSemesters);

      this.setState({
        loading: false,
        availableSemesters: availableSemesters,
        batchInfo: {
          courseTitle: selectedCourse?.name || "",
          courseCode: selectedCourse?.code || "",
          courseUnit: selectedCourse?.units || "",
          department: selectedCourse?.department?.name || "",
          faculty: selectedCourse?.department?.faculty?.name || "",
          selectedSemester: "",
          totalStudents: 0,
        },
      });
    } catch (error) {
      console.error("Error loading semesters:", error);
      this.setState({
        loading: false,
        message: "Error loading semesters: " + error.message,
      });
    }
  };

  handleSemesterSelect = async (semesterId) => {
    if (!semesterId) {
      this.setState({
        selectedSemester: "",
        filteredStudents: [],
        allStudents: [],
      });
      return;
    }

    console.log(`Loading students for semester ${semesterId}`);

    this.setState({ loading: true });

    try {
      // Now load students for the selected course and filter by semester
      const courseId = this.state.selectedCourse.value;
      const searchParams = `course_id=${courseId}&all=true`;
      const getStudentCourses = await getStudentCoursesByParams(searchParams);

      if (!getStudentCourses.ok) {
        throw new Error(`Failed to get students: ${getStudentCourses.status}`);
      }

      const students = await getStudentCourses.json();
      console.log(
        `Loaded ${students.length} total student registrations for course ${courseId}`
      );

      // Use shared filtering utility
      const filterResult = filterStudentsForSemester(
        students,
        semesterId,
        false
      );

      console.log(`Frontend filtering using shared utility:`);
      console.log(filterResult.summary);

      const selectedSemesterObj = this.state.availableSemesters.find(
        (s) => s.id == semesterId
      );

      this.setState({
        loading: false,
        selectedSemester: semesterId,
        allStudents: students,
        filteredStudents: filterResult.students,
        batchInfo: {
          ...this.state.batchInfo,
          selectedSemester: selectedSemesterObj?.name || "",
          session: selectedSemesterObj?.session?.name || "N/A",
          totalStudents: filterResult.students.length,
        },
      });
    } catch (error) {
      console.error("Error loading students for semester:", error);
      this.setState({
        loading: false,
        message: "Error loading students for semester: " + error.message,
      });
    }
  };

  handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      this.setState({ selectedFile: file });
      this.parseCSV(file);
    } else {
      alert("Please select a valid CSV file");
    }
  };

  parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/);

      // Find all lines that contain the separator (handle CSV formatting with commas)
      const separatorLines = [];
      lines.forEach((line, index) => {
        // Check if line starts with ---DATA--- (ignoring trailing commas from CSV)
        if (line.trim().startsWith("---DATA---")) {
          separatorLines.push(index);
          console.log(`Found separator at line ${index}: "${line}"`);
        }
      });

      console.log("Separator lines found:", separatorLines);

      if (separatorLines.length < 2) {
        this.setState({
          message: `CSV format error: Expected 2 separators, found ${separatorLines.length}. Please ensure the CSV file has the correct format with ---DATA--- markers.`,
        });
        return;
      }

      const startIdx = separatorLines[0];
      const endIdx = separatorLines[1];

      // Only parse lines between the two separators
      const dataLines = lines
        .slice(startIdx + 1, endIdx)
        .filter((line) => line.trim().length > 0); // remove blank lines

      if (dataLines.length === 0) {
        this.setState({
          message: "CSV format error: No data found between separators.",
        });
        return;
      }

      Papa.parse(dataLines.join("\n"), {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          this.setState({ parsedData: results.data, message: "" });
          this.validateData(results.data);
        },
        error: (error) => {
          this.setState({ message: "Error parsing CSV: " + error.message });
        },
      });
    };
    reader.readAsText(file);
  };

  validateData = (data) => {
    const errors = [];

    data.forEach((row, index) => {
      const rowNumber = index + 1;

      // Check required fields
      if (!row["Reg. No"]) {
        errors.push(`Row ${rowNumber}: Registration number is required`);
      }

      if (!row["Total"] || isNaN(parseFloat(row["Total"]))) {
        errors.push(`Row ${rowNumber}: Valid total score is required`);
      } else {
        const total = parseFloat(row["Total"]);
        if (total < 0 || total > 100) {
          errors.push(
            `Row ${rowNumber}: Total score must be between 0 and 100`
          );
        }
      }

      // Validate CA Mark if provided
      if (
        row["CA Mark"] &&
        (isNaN(parseFloat(row["CA Mark"])) ||
          parseFloat(row["CA Mark"]) < 0 ||
          parseFloat(row["CA Mark"]) > 30)
      ) {
        errors.push(`Row ${rowNumber}: CA Mark must be between 0 and 30`);
      }

      // Validate Exam Score if provided
      if (
        row["Exam Score"] &&
        (isNaN(parseFloat(row["Exam Score"])) ||
          parseFloat(row["Exam Score"]) < 0 ||
          parseFloat(row["Exam Score"]) > 70)
      ) {
        errors.push(`Row ${rowNumber}: Exam Score must be between 0 and 70`);
      }
    });

    this.setState({ validationErrors: errors });
  };

  async componentDidMount() {
    // Load grades mapping when component mounts
    try {
      const gradesResponse = await getGrades();

      if (!gradesResponse.ok) {
        throw new Error(
          `Failed to fetch grades: ${gradesResponse.status} ${gradesResponse.statusText}`
        );
      }

      const grades = await gradesResponse.json();

      if (!grades || grades.length === 0) {
        throw new Error(
          "No grades found in database. Please ensure grades are properly configured."
        );
      }

      this.setState({ grades });
    } catch (error) {
      console.error("Error loading grades:", error);
      this.setState({
        grades: [],
        message: `Error loading grades: ${error.message}. Please check that grades are properly configured in the database.`,
      });
    }
  }

  calculateGrade = (score) => {
    const { grades } = this.state;

    if (!grades || grades.length === 0) {
      // Return null to indicate grades are not available
      return null;
    }

    const gradeResult = calculateGradeFromScore(score, grades);
    return gradeResult.letter;
  };

  handleUpload = async () => {
    if (this.state.validationErrors.length > 0) {
      alert("Please fix validation errors before uploading");
      return;
    }

    if (this.state.filteredStudents.length === 0) {
      alert("No students found for the selected semester");
      return;
    }

    if (this.state.grades.length === 0) {
      alert(
        "Grades are not loaded. Cannot proceed with upload. Please refresh the page and ensure grades are configured in the database."
      );
      return;
    }

    // Additional validation to ensure all scores can be graded
    const ungradableRows = [];
    this.state.parsedData.forEach((row, index) => {
      const score = parseFloat(row["Total"]);
      if (!isNaN(score)) {
        const gradeResult = calculateGradeFromScore(score, this.state.grades);
        if (!gradeResult.id) {
          ungradableRows.push({
            row: index + 1,
            score: score,
            regNo: row["Reg. No"],
          });
        }
      }
    });

    if (ungradableRows.length > 0) {
      const errorMessage = ungradableRows
        .map(
          (item) =>
            `Row ${item.row} (${item.regNo}): Score ${item.score} cannot be graded`
        )
        .join("\n");

      alert(
        `Cannot proceed with upload. The following scores cannot be graded:\n\n${errorMessage}\n\nPlease check the grade configuration in the database.`
      );
      return;
    }

    this.setState({
      uploading: true,
      uploadResults: [],
      message: "Preparing batch upload...",
    });

    try {
      const { filteredStudents, grades } = this.state;
      const batchResults = [];
      const validationErrors = [];

      console.log("Filtered students for semester:", filteredStudents.length);
      console.log("Available grades:", grades);

      // Create a map of registration numbers to student course IDs
      const regNoToStudentCourseMap = new Map();
      filteredStudents.forEach((studentCourse) => {
        const regNo = studentCourse.student?.reg_no;
        if (regNo) {
          const studentData = {
            student_course_id: studentCourse.id,
            student_name: `${studentCourse.student.user?.last_name || ""}, ${
              studentCourse.student.user?.first_name || ""
            } ${studentCourse.student.user?.other_name || ""}`.trim(),
          };
          regNoToStudentCourseMap.set(regNo, studentData);
          regNoToStudentCourseMap.set(regNo.toLowerCase(), studentData);
          regNoToStudentCourseMap.set(regNo.toUpperCase(), studentData);
        }
      });

      console.log("Registration mapping size:", regNoToStudentCourseMap.size);

      // Process and prepare all results for batch upload
      this.state.parsedData.forEach((row, index) => {
        const regNo = row["Reg. No"];
        const totalScore = parseFloat(row["Total"]);
        const caScore = row["CA Mark"] ? parseFloat(row["CA Mark"]) : null;
        const examScore = row["Exam Score"]
          ? parseFloat(row["Exam Score"])
          : null;

        if (!regNo || isNaN(totalScore)) {
          validationErrors.push({
            row: index + 1,
            regNo: regNo || "N/A",
            name: row["Name of Student (Surname First)"] || "N/A",
            error: "Missing registration number or total score",
          });
          return;
        }

        // Try to find the student course mapping
        let studentCourseData =
          regNoToStudentCourseMap.get(regNo) ||
          regNoToStudentCourseMap.get(regNo.toLowerCase()) ||
          regNoToStudentCourseMap.get(regNo.toUpperCase());

        if (!studentCourseData) {
          validationErrors.push({
            row: index + 1,
            regNo,
            name: row["Name of Student (Surname First)"] || "N/A",
            error: `Student with registration number ${regNo} not found in selected semester`,
          });
          return;
        }

        // Calculate grade using backend grades configuration
        const gradeResult = calculateGradeFromScore(totalScore, grades);
        const gradeId = gradeResult.id;

        if (!gradeId) {
          validationErrors.push({
            row: index + 1,
            regNo,
            name: studentCourseData.student_name,
            error: `Grade ID not found for score ${totalScore}. Grade configuration error.`,
          });
          return;
        }

        // Add to batch results
        batchResults.push({
          student_course_id: studentCourseData.student_course_id,
          score: totalScore.toString(), // Convert to string as per DB schema
          grade_id: gradeId,
          ca_mark: caScore,
          exam_score: examScore,
          publish: false,
          // Add metadata for response tracking
          _metadata: {
            regNo,
            studentName: studentCourseData.student_name,
            gradeLetter: gradeResult.letter,
          },
        });
      });

      if (validationErrors.length > 0) {
        this.setState({
          uploading: false,
          message: `Validation failed: ${validationErrors.length} errors found.`,
          uploadResults: validationErrors.map((err) => ({
            regNo: err.regNo,
            name: err.name,
            score: 0,
            grade: "N/A",
            status: "Failed",
            error: err.error,
          })),
        });
        return;
      }

      console.log(`Uploading batch of ${batchResults.length} results...`);
      this.setState({
        message: `Uploading batch of ${batchResults.length} results...`,
      });

      // Make single batch API call with correct structure
      console.log("Batch payload structure before sending:", {
        hasResults: !!batchResults,
        isArray: Array.isArray(batchResults),
        length: batchResults ? batchResults.length : 0,
        firstItem:
          batchResults && batchResults.length > 0 ? batchResults[0] : null,
      });

      // Send the results array directly as the 'results' property
      const batchResponse = await addStudentResultsBatch({
        results: batchResults,
      });

      if (batchResponse.ok) {
        const batchResult = await batchResponse.json();
        console.log("Batch upload successful:", batchResult);

        // Transform response to display format
        const displayResults = batchResult.results.map((result) => ({
          regNo:
            batchResults.find(
              (b) => b.student_course_id === result.student_course_id
            )?._metadata?.regNo || "N/A",
          name:
            batchResults.find(
              (b) => b.student_course_id === result.student_course_id
            )?._metadata?.studentName || "N/A",
          score: parseFloat(result.score),
          grade: result.grade,
          status: result.status,
          resultId: result.id,
        }));

        // Add any errors
        if (batchResult.errors && batchResult.errors.length > 0) {
          batchResult.errors.forEach((error) => {
            displayResults.push({
              regNo: error.regNo || "N/A",
              name: "N/A",
              score: 0,
              grade: "N/A",
              status: "Failed",
              error: error.error,
            });
          });
        }

        this.setState({
          uploading: false,
          uploadResults: displayResults,
          message: `Batch upload completed: ${batchResult.uploaded} successful, ${batchResult.errors} failed.`,
        });
      } else {
        const errorText = await batchResponse.text();
        console.error("Batch upload failed:", errorText);

        this.setState({
          uploading: false,
          message: `Batch upload failed: ${batchResponse.status} - ${errorText}`,
          uploadResults: batchResults.map((result) => ({
            regNo: result._metadata.regNo,
            name: result._metadata.studentName,
            score: parseFloat(result.score),
            grade: result._metadata.gradeLetter,
            status: "Failed",
            error: "Batch upload failed on server",
          })),
        });
      }
    } catch (error) {
      console.error("Batch upload error:", error);
      this.setState({
        uploading: false,
        message: "Error during batch upload: " + error.message,
      });
    }
  };

  downloadSampleTemplate = async () => {
    if (!this.state.selectedCourse) {
      alert("Please select a course first");
      return;
    }
    if (!this.state.selectedSemester) {
      alert("Please select a semester first");
      return;
    }

    try {
      const courseId = this.state.selectedCourse.value;
      const semesterId = this.state.selectedSemester;

      // Pass semester ID as query parameter to filter template by semester
      const blob = await downloadResultTemplate(
        `${courseId}?semester_id=${semesterId}`
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const selectedCourse = this.state.selectedCourse.course;
      const selectedSemester = this.state.availableSemesters.find(
        (semester) => semester.id == this.state.selectedSemester
      );

      link.download = `${selectedCourse?.code || "course"}_${
        selectedSemester?.name || "semester"
      }_result_template.csv`;

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

  handleRecalc = async () => {
    const { filteredStudents, selectedSemester } = this.state;
    if (!filteredStudents.length || !selectedSemester) return;

    // collect student IDs from filtered list
    const student_ids = filteredStudents.map(
      (sc) => sc.student?.id || sc.related("student").get("id")
    );
    const level_id =
      filteredStudents[0].semester?.id ||
      filteredStudents[0].related("level").get("id");

    this.setState({ message: "Recalculating GPA...", uploading: true });
    try {
      const res = await calculateBatchGpa({
        student_ids,
        semester_id: selectedSemester,
        level_id,
      });
      if (res.ok) {
        this.setState({
          message: "GPA recalculation completed",
          uploading: false,
        });
      } else {
        const text = await res.text();
        this.setState({
          message: `Recalc failed: ${res.status} ${text}`,
          uploading: false,
        });
      }
    } catch (e) {
      this.setState({ message: "Error: " + e.message, uploading: false });
    }
  };

  render() {
    const {
      parsedData,
      validationErrors,
      uploading,
      uploadResults,
      message,
      batchInfo,
    } = this.state;

    return (
      <Layout pageTitle="Bulk Upload Results" userData={this.props.userData}>
        <div className="row">
          <div className="col-md-12">
            <h3 className="all-caps semi-bold">Bulk Upload Results from CSV</h3>

            {/* Course Selection */}
            <div className="form-group">
              <label>Select Course:</label>
              <div className="row">
                <div className="col-md-10">
                  <AsyncCourseSelect
                    value={this.state.selectedCourse}
                    onChange={this.handleCourseSelect}
                    placeholder="Search for a course by name or code..."
                  />
                </div>
                <div className="col-md-2">
                  <button
                    className="btn btn-info btn-block"
                    onClick={this.downloadSampleTemplate}
                    disabled={
                      !this.state.selectedCourse || !this.state.selectedSemester
                    }
                    title="Download CSV template for this course and semester"
                  >
                    <i className="fa fa-download"></i> Template
                  </button>
                </div>
              </div>
            </div>

            {/* Semester Selection */}
            {this.state.selectedCourse && (
              <div className="form-group">
                <label>Select Semester:</label>
                {this.state.loading ? (
                  <div
                    className="form-control"
                    style={{ height: "auto", padding: "10px" }}
                  >
                    <i className="fa fa-spinner fa-spin"></i> Loading available
                    semesters...
                  </div>
                ) : this.state.availableSemesters.length > 0 ? (
                  <>
                    <select
                      className="form-control"
                      onChange={(e) =>
                        this.handleSemesterSelect(e.target.value)
                      }
                      value={this.state.selectedSemester}
                      disabled={this.state.loading}
                    >
                      <option value="">-- Select Semester --</option>
                      {this.state.availableSemesters.map((semester) => (
                        <option key={semester.id} value={semester.id}>
                          {semester.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-muted" style={{ marginTop: "5px" }}>
                      <small>
                        Found {this.state.availableSemesters.length} semester(s)
                        with student registrations for this course.
                      </small>
                    </p>
                  </>
                ) : (
                  <div className="alert alert-warning">
                    <i className="fa fa-exclamation-triangle"></i>{" "}
                    <strong>No student registrations found</strong> for this
                    course in any semester.
                  </div>
                )}
              </div>
            )}

            {/* Course Information Display */}
            {this.state.selectedCourse && this.state.selectedSemester && (
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4>Course & Semester Information</h4>
                </div>
                <div className="panel-body">
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <strong>Course Title:</strong> {batchInfo.courseTitle}
                      </p>
                      <p>
                        <strong>Course Code:</strong> {batchInfo.courseCode}
                      </p>
                      <p>
                        <strong>Units:</strong> {batchInfo.courseUnit}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <strong>Selected Semester:</strong>{" "}
                        {batchInfo.selectedSemester}
                      </p>
                      <p>
                        <strong>Session:</strong>{" "}
                        {batchInfo.selectedSemester.substring(
                          batchInfo.selectedSemester.length - 9
                        )}
                      </p>
                      <p>
                        <strong>Students in this Semester:</strong>{" "}
                        {batchInfo.totalStudents}
                      </p>
                    </div>
                  </div>
                  <div className="alert alert-success">
                    <i className="fa fa-check-circle"></i>{" "}
                    <strong>{batchInfo.totalStudents}</strong> student
                    registrations found for{" "}
                    <strong>{batchInfo.courseCode}</strong> in{" "}
                    <strong>{batchInfo.selectedSemester}</strong>.
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="panel panel-info">
              <div className="panel-heading">
                <h4>Instructions</h4>
              </div>
              <div className="panel-body">
                <ol>
                  <li>Select a course from the dropdown above</li>
                  <li>
                    Download the CSV template with all students pre-filled
                  </li>
                  <li>
                    Fill in the required fields: <strong>CA Mark</strong>,{" "}
                    <strong>Exam Score</strong>, and <strong>Total</strong>
                  </li>
                  <li>Upload the completed CSV file below</li>
                  <li>Review the parsed data and fix any validation errors</li>
                  <li>Click "Upload Results" to process the data</li>
                </ol>
              </div>
            </div>

            {/* File Upload - Only show when course and semester are selected */}
            {this.state.selectedCourse && this.state.selectedSemester && (
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4>Upload CSV File</h4>
                </div>
                <div className="panel-body">
                  <div className="form-group">
                    <label>Select CSV File:</label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={this.handleFileSelect}
                      className="form-control"
                    />
                  </div>

                  {/* Important Fields Reminder */}
                  <div className="alert alert-warning">
                    <h5>
                      <i className="fa fa-exclamation-triangle"></i> Important
                      CSV Fields
                    </h5>
                    <div className="row">
                      <div className="col-md-6">
                        <strong>Required Fields:</strong>
                        <ul>
                          <li>
                            <span className="label label-danger">Required</span>{" "}
                            <strong>Reg. No</strong> - Student registration
                            number
                          </li>
                          <li>
                            <span className="label label-danger">Required</span>{" "}
                            <strong>Total</strong> - Total score (0-100)
                          </li>
                        </ul>
                      </div>
                      <div className="col-md-6">
                        <strong>Optional Fields:</strong>
                        <ul>
                          <li>
                            <span className="label label-info">Optional</span>{" "}
                            <strong>CA Mark</strong> - Continuous Assessment
                            (0-30)
                          </li>
                          <li>
                            <span className="label label-info">Optional</span>{" "}
                            <strong>Exam Score</strong> - Examination score
                            (0-70)
                          </li>
                          <li>
                            <span className="label label-info">Auto-calc</span>{" "}
                            <strong>Letter Grade</strong> - Auto-calculated from
                            Total
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="panel panel-danger">
                <div className="panel-heading">
                  <h4>Validation Errors ({validationErrors.length})</h4>
                </div>
                <div className="panel-body">
                  <ul>
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-danger">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Parsed Data Preview */}
            {parsedData.length > 0 && (
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4>
                    Parsed Data Preview ({parsedData.length} records)
                    <button
                      className="btn btn-success pull-right"
                      onClick={this.handleUpload}
                      disabled={validationErrors.length > 0 || uploading}
                    >
                      {uploading ? "Uploading..." : "Upload Results"}
                    </button>
                  </h4>
                </div>
                <div className="panel-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>S/N</th>
                          <th>Name</th>
                          <th>Reg. No</th>
                          <th>CA Mark</th>
                          <th>Exam Score</th>
                          <th>Total</th>
                          <th>Calculated Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.slice(0, 10).map((row, index) => (
                          <tr key={index}>
                            <td>{row["S/N"] || index + 1}</td>
                            <td>{row["Name of Student (Surname First)"]}</td>
                            <td>{row["Reg. No"]}</td>
                            <td>{row["CA Mark"] || "-"}</td>
                            <td>{row["Exam Score"] || "-"}</td>
                            <td>{row["Total"]}</td>
                            <td>
                              {row["Total"] && (
                                <span
                                  className={`badge ${
                                    this.calculateGrade(row["Total"]) === "F"
                                      ? "badge-danger"
                                      : this.calculateGrade(row["Total"]) ===
                                        null
                                      ? "badge-warning"
                                      : "badge-success"
                                  }`}
                                >
                                  {this.calculateGrade(row["Total"]) || "N/A"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedData.length > 10 && (
                      <p className="text-muted">
                        Showing first 10 records of {parsedData.length} total
                        records.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Upload Results */}
            {uploadResults.length > 0 && (
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4>Upload Results</h4>
                </div>
                <div className="panel-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Reg. No</th>
                          <th>Name</th>
                          <th>Score</th>
                          <th>Grade</th>
                          <th>Status</th>
                          <th>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadResults.map((result, index) => (
                          <tr
                            key={index}
                            className={
                              result.status === "Failed" ? "danger" : ""
                            }
                          >
                            <td>{result.regNo}</td>
                            <td>{result.name}</td>
                            <td>{result.score}</td>
                            <td>
                              {result.grade !== "N/A" && (
                                <span
                                  className={`badge ${
                                    result.grade === "F"
                                      ? "badge-danger"
                                      : "badge-success"
                                  }`}
                                >
                                  {result.grade}
                                </span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  result.status === "Success"
                                    ? "badge-success"
                                    : "badge-danger"
                                }`}
                              >
                                {result.status}
                              </span>
                            </td>
                            <td>
                              {result.error && (
                                <small className="text-danger">
                                  {result.error}
                                </small>
                              )}
                              {result.resultId && (
                                <small className="text-muted">
                                  ID: {result.resultId}
                                </small>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Message Display */}
            {message && (
              <div
                className={`alert ${
                  message.includes("Error") ? "alert-danger" : "alert-success"
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }
}

export default BulkUploadResults;
