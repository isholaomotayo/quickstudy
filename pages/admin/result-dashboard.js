import React from "react";
import Layout from "../../components/Layout";
import { protectPage } from "../../helpers/utils";

class ResultDashboard extends React.Component {
  state = {
    stats: {
      totalStudents: 0,
      studentsWithResults: 0,
      totalCourses: 0,
      coursesWithResults: 0,
      averageCGPA: 0,
      firstClassCount: 0,
      secondClassUpperCount: 0,
      secondClassLowerCount: 0,
      thirdClassCount: 0,
      passCount: 0,
    },
    loading: true,
  };

  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["ADMIN"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    return { userData };
  };

  async componentDidMount() {
    await this.loadStats();
  }

  loadStats = async () => {
    try {
      // This would typically fetch statistics from the backend
      // For now, we'll show a placeholder
      this.setState({
        stats: {
          totalStudents: 1250,
          studentsWithResults: 1180,
          totalCourses: 45,
          coursesWithResults: 42,
          averageCGPA: 3.24,
          firstClassCount: 89,
          secondClassUpperCount: 298,
          secondClassLowerCount: 412,
          thirdClassCount: 298,
          passCount: 83,
        },
        loading: false,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      this.setState({ loading: false });
    }
  };

  render() {
    const { stats, loading } = this.state;

    return (
      <Layout pageTitle="Result Dashboard" userData={this.props.userData}>
        <div className="row">
          <div className="col-md-12">
            <h3 className="all-caps semi-bold">Academic Results Dashboard</h3>

            {loading ? (
              <div className="text-center">
                <h4>Loading statistics...</h4>
              </div>
            ) : (
              <>
                {/* Quick Stats */}
                <div className="row">
                  <div className="col-md-3">
                    <div className="panel panel-primary">
                      <div className="panel-body text-center">
                        <h3>{stats.totalStudents}</h3>
                        <p>Total Students</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="panel panel-success">
                      <div className="panel-body text-center">
                        <h3>{stats.studentsWithResults}</h3>
                        <p>Students with Results</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="panel panel-info">
                      <div className="panel-body text-center">
                        <h3>{stats.totalCourses}</h3>
                        <p>Total Courses</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="panel panel-warning">
                      <div className="panel-body text-center">
                        <h3>{stats.averageCGPA.toFixed(2)}</h3>
                        <p>Average CGPA</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Class Distribution */}
                <div className="panel panel-default">
                  <div className="panel-heading">
                    <h4>Class of Degree Distribution</h4>
                  </div>
                  <div className="panel-body">
                    <div className="row">
                      <div className="col-md-2">
                        <div className="text-center">
                          <h4 className="text-success">
                            {stats.firstClassCount}
                          </h4>
                          <p>
                            First Class
                            <br />
                            (4.5 - 5.0)
                          </p>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="text-center">
                          <h4 className="text-primary">
                            {stats.secondClassUpperCount}
                          </h4>
                          <p>
                            Second Class Upper
                            <br />
                            (3.5 - 4.49)
                          </p>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="text-center">
                          <h4 className="text-info">
                            {stats.secondClassLowerCount}
                          </h4>
                          <p>
                            Second Class Lower
                            <br />
                            (2.5 - 3.49)
                          </p>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="text-center">
                          <h4 className="text-warning">
                            {stats.thirdClassCount}
                          </h4>
                          <p>
                            Third Class
                            <br />
                            (1.5 - 2.49)
                          </p>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="text-center">
                          <h4 className="text-muted">{stats.passCount}</h4>
                          <p>
                            Pass
                            <br />
                            (1.0 - 1.49)
                          </p>
                        </div>
                      </div>
                      <div className="col-md-2">
                        <div className="text-center">
                          <h4 className="text-danger">
                            {stats.totalStudents -
                              (stats.firstClassCount +
                                stats.secondClassUpperCount +
                                stats.secondClassLowerCount +
                                stats.thirdClassCount +
                                stats.passCount)}
                          </h4>
                          <p>
                            Fail
                            <br />
                            (&lt; 1.0)
                          </p>
                        </div>
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
                    <div className="row">
                      <div className="col-md-3">
                        <a
                          href="/staff/upload-results"
                          className="btn btn-primary btn-block btn-lg"
                        >
                          <i className="fa fa-upload"></i>
                          <br />
                          Upload Results
                          <br />
                          <small>Individual entry + CSV template</small>
                        </a>
                      </div>
                      <div className="col-md-3">
                        <a
                          href="/admin/bulk-upload-results"
                          className="btn btn-warning btn-block btn-lg"
                        >
                          <i className="fa fa-file-excel-o"></i>
                          <br />
                          Bulk CSV Upload
                          <br />
                          <small>Upload from CSV file</small>
                        </a>
                      </div>
                      <div className="col-md-3">
                        <a
                          href="/admin/view-gpa-status"
                          className="btn btn-info btn-block btn-lg"
                        >
                          <i className="fa fa-eye"></i>
                          <br />
                          View GPA Status
                          <br />
                          <small>Check current GPA records</small>
                        </a>
                      </div>
                      <div className="col-md-3">
                        <a
                          href="/admin/result-reports"
                          className="btn btn-success btn-block btn-lg"
                        >
                          <i className="fa fa-file-text"></i>
                          <br />
                          Generate Reports
                          <br />
                          <small>Academic performance reports</small>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="panel panel-default">
                  <div className="panel-heading">
                    <h4>Recent Activity</h4>
                  </div>
                  <div className="panel-body">
                    <div className="timeline">
                      <div className="timeline-item">
                        <div className="timeline-time">2 hours ago</div>
                        <div className="timeline-content">
                          <p>
                            Results uploaded for CSC 301 - Database Management
                            Systems (GPA auto-calculated)
                          </p>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-time">5 hours ago</div>
                        <div className="timeline-content">
                          <p>
                            Results uploaded for MAT 201 - Linear Algebra (45
                            students affected)
                          </p>
                        </div>
                      </div>
                      <div className="timeline-item">
                        <div className="timeline-time">1 day ago</div>
                        <div className="timeline-content">
                          <p>
                            Bulk results uploaded for ECO 301 - Microeconomic
                            Theory
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <style jsx>{`
          .timeline {
            margin: 20px 0;
          }
          .timeline-item {
            border-left: 3px solid #ddd;
            padding-left: 15px;
            margin-bottom: 15px;
            position: relative;
          }
          .timeline-item::before {
            content: "";
            position: absolute;
            left: -6px;
            top: 0;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #007bff;
          }
          .timeline-time {
            color: #666;
            font-size: 12px;
            margin-bottom: 5px;
          }
          .timeline-content p {
            margin: 0;
          }
        `}</style>
      </Layout>
    );
  }
}

export default ResultDashboard;
