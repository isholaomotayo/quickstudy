import React from "react";
import Layout from "../../components/Layout";
import { protectPage } from "../../helpers/utils";
import {
  getLevels,
  getSemesters,
  getStudentGpasBySearchParams,
} from "../../helpers/FetchWrapper";

class ViewGPAStatus extends React.Component {
  state = {
    levels: this.props.levels,
    semesters: this.props.semesters,
    selectedLevel: "",
    selectedSemester: "",
    students: [],
    gpaRecords: [],
    loading: false,
    message: "",
  };

  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["STAFF", "ADMIN"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    // Get levels and semesters
    const getLevelsRes = await getLevels(req);
    const levels = await getLevelsRes.json();

    const getSemestersRes = await getSemesters(req);
    const semesters = await getSemestersRes.json();

    return { levels, semesters, userData };
  };

  handleLevelSemesterSelect = async () => {
    if (!this.state.selectedLevel || !this.state.selectedSemester) return;

    this.setState({ loading: true });

    try {
      // Get GPA records for this level and semester
      const searchParams = `level_id=${this.state.selectedLevel}&semester_id=${this.state.selectedSemester}`;
      const getGpaRecords = await getStudentGpasBySearchParams(searchParams);
      const gpaRecords = await getGpaRecords.json();

      this.setState({
        gpaRecords,
        loading: false,
        message: `Found ${gpaRecords.length} GPA records for the selected level and semester.`,
      });
    } catch (error) {
      this.setState({
        loading: false,
        message: "Error loading GPA records: " + error.message,
      });
    }
  };

  getClassOfDegree = (cgpa) => {
    if (cgpa >= 4.5) return "First Class";
    if (cgpa >= 3.5) return "Second Class Upper";
    if (cgpa >= 2.5) return "Second Class Lower";
    if (cgpa >= 1.5) return "Third Class";
    return "Pass";
  };

  render() {
    const { levels, semesters, gpaRecords, loading, message } = this.state;

    return (
      <Layout pageTitle="View GPA Status" userData={this.props.userData}>
        <div className="row">
          <div className="col-md-12">
            <h3 className="all-caps semi-bold">View Student GPA Status</h3>

            <div className="alert alert-info">
              <strong>Note:</strong> GPA calculations are performed
              automatically when results are uploaded. Use this page to view
              current GPA status for students.
            </div>

            <div className="panel panel-default">
              <div className="panel-heading">
                <h4>Select Level and Semester</h4>
              </div>
              <div className="panel-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Level:</label>
                      <select
                        className="form-control"
                        value={this.state.selectedLevel}
                        onChange={(e) =>
                          this.setState({ selectedLevel: e.target.value })
                        }
                      >
                        <option value="">-- Select Level --</option>
                        {levels.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>Semester:</label>
                      <select
                        className="form-control"
                        value={this.state.selectedSemester}
                        onChange={(e) =>
                          this.setState({ selectedSemester: e.target.value })
                        }
                      >
                        <option value="">-- Select Semester --</option>
                        {semesters.map((semester) => (
                          <option key={semester.id} value={semester.id}>
                            {semester.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label>&nbsp;</label>
                      <br />
                      <button
                        className="btn btn-primary"
                        onClick={this.handleLevelSemesterSelect}
                        disabled={
                          !this.state.selectedLevel ||
                          !this.state.selectedSemester ||
                          loading
                        }
                      >
                        {loading ? "Loading..." : "View GPA Records"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {gpaRecords.length > 0 && (
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h4>GPA Records - {gpaRecords.length} Students</h4>
                </div>
                <div className="panel-body">
                  <table className="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th>S/N</th>
                        <th>Student Name</th>
                        <th>Reg. No</th>
                        <th>Current GPA</th>
                        <th>Cumulative GPA</th>
                        <th>Class of Degree</th>
                        <th>Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gpaRecords.map((record, index) => (
                        <tr key={record.id}>
                          <td>{index + 1}</td>
                          <td>
                            {record.student.surname}, {record.student.firstname}{" "}
                            {record.student.othername}
                          </td>
                          <td>{record.student.reg_no}</td>
                          <td>
                            <span className="badge badge-primary">
                              {record.current_gpa
                                ? record.current_gpa.toFixed(2)
                                : "N/A"}
                            </span>
                          </td>
                          <td>
                            <span className="badge badge-success">
                              {record.cumulative_gpa
                                ? record.cumulative_gpa.toFixed(2)
                                : "N/A"}
                            </span>
                          </td>
                          <td>
                            <span className="text-info">
                              {record.cumulative_gpa
                                ? this.getClassOfDegree(record.cumulative_gpa)
                                : "N/A"}
                            </span>
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(record.updated_at).toLocaleDateString()}
                            </small>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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

export default ViewGPAStatus;
