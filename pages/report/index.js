import { Component } from "react";
import Layout from "../../components/Layout";
import { protectPage } from "../../helpers/utils";
import fetch from "isomorphic-unfetch";
import DataComponent from "../../components/report/DataComponent";
import ReportDashboard from "../../components/report/ReportDashboard";
import {
  Container,
  Table,
  Row,
  Col,
  Form,
  Button,
  Badge,
} from "react-bootstrap";
import { DatePicker, initializeIcons } from "@fluentui/react";
import { getDataPoints } from "../../helpers/utils";
import Link from "next/link";
import toast from "react-hot-toast";

initializeIcons();

const apllicantTitle = ["Name", "Email", "Phone", "Role"];
const admittedTitle = ["Name", "Email", "Programme", "Department"];
const completedApplicationTitle = [
  "Name",
  "Email",
  "Programme Applied",
  "Department Applied",
];
const acceptanceTitle = [
  "Name",
  "Email",
  "Fees Name",
  "Total Amount",
  "Paid Fees",
  "Payment Plan",
];

class Dashboard extends Component {
  state = {
    applicants: this.props.applicants,
    admitted: this.props.admitted,
    completedApplication: this.props.completedApplication,
    acceptanceFeePaid: this.props.acceptanceFeePaid,
    weeklyReport: this.props.weeklyReport,
    startDate: "",
    endDate: "",
    loading: false,
    showLegacyView: false, // Toggle between new dashboard and legacy view
  };

  static getInitialProps = async ({ res, req, query }) => {
    const allowedRoles = ["ADMIN", "SUPERADMIN"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let applicants = [],
      department = [],
      acceptanceFeePaid = [],
      completedApplication = [],
      admitted = [],
      report = {},
      weeklyReport = [],
      analyticsData = {};

    weeklyReport = await getDataPoints({}, req);

    try {
      // Fetch department data
      department = await fetch(`${process.env.API_URL}/api/department`, {
        method: "get",
        credentials: "include",
        headers: req
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
      });

      // Fetch processed analytics data instead of raw data
      const analyticsResponse = await fetch(
        `${process.env.API_URL}/api/report/analytics/${Number(
          userData.institution_id
        )}`,
        {
          method: "get",
          credentials: "include",
          headers: req
            ? { cookie: req.headers.cookie }
            : {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
        }
      );

      department = department.status === 200 ? await department.json() : [];
      analyticsData =
        analyticsResponse.status === 200 ? await analyticsResponse.json() : {};

      // Debug: Log analytics data received on server side
      console.log("Server-side - Analytics data received:", analyticsData);
      console.log(
        "Server-side - Analytics response status:",
        analyticsResponse.status
      );

      // For legacy components, we'll provide minimal data arrays with just counts
      if (analyticsData.summary) {
        applicants = new Array(analyticsData.summary.ongoingApplications).fill(
          {}
        );
        admitted = new Array(analyticsData.summary.admittedStudents).fill({});
        completedApplication = new Array(
          analyticsData.summary.completedApplications
        ).fill({});
        acceptanceFeePaid = new Array(
          analyticsData.summary.acceptanceFeePaid
        ).fill({});
      }
    } catch (e) {
      console.log("Error fetching analytics:", e);
      // Fallback to old endpoint if analytics fails
      try {
        report = await fetch(
          `${process.env.API_URL}/api/report/${Number(
            userData.institution_id
          )}`,
          {
            method: "get",
            credentials: "include",
            headers: req
              ? { cookie: req.headers.cookie }
              : {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                },
          }
        );

        report = report.status === 200 ? await report.json() : {};
        applicants = report.applicant || [];
        admitted = report.admitted || [];
        completedApplication = report.completedApplication || [];
        acceptanceFeePaid = report.acceptanceFeePaid || [];
      } catch (fallbackError) {
        console.log("Fallback error:", fallbackError);
      }
    }

    return {
      applicants,
      userData,
      userId,
      acceptanceFeePaid,
      completedApplication,
      admitted,
      department,
      report,
      weeklyReport,
      analyticsData, // New processed analytics data
    };
  };

  handleDateChange = (date, name) => {
    this.setState({
      [name]: date === null ? "" : date,
    });
  };

  _onParseDateFromString = (value) => {
    const date = this.state.value || new Date();
    const values = (value || "").trim().split("/");
    const day =
      values.length > 0
        ? Math.max(1, Math.min(31, parseInt(values[0], 10)))
        : date.getDate();
    const month =
      values.length > 1
        ? Math.max(1, Math.min(12, parseInt(values[1], 10))) - 1
        : date.getMonth();
    let year = values.length > 2 ? parseInt(values[2], 10) : date.getFullYear();
    if (year < 100) {
      year += date.getFullYear() - (date.getFullYear() % 100);
    }
    return new Date(year, month, day);
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    this.setState({
      loading: true,
    });
    const { startDate, endDate } = this.state;

    // Fetch both weekly report and analytics data
    const dataReport = await getDataPoints({ startDate, endDate });

    // Fetch updated analytics with date range
    try {
      const analyticsResponse = await fetch(
        `/api/report/analytics/${this.props.userData.institution_id}?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "get",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newAnalyticsData =
        analyticsResponse.status === 200 ? await analyticsResponse.json() : {};

      // Debug: Log client-side analytics data in handleSubmit
      console.log(
        "Client-side handleSubmit - Analytics data received:",
        newAnalyticsData
      );
      console.log(
        "Client-side handleSubmit - Analytics response status:",
        analyticsResponse.status
      );

      this.setState({
        loading: false,
        weeklyReport: dataReport,
        analyticsData: newAnalyticsData,
      });

      if (
        dataReport.length === 0 &&
        Object.keys(newAnalyticsData).length === 0
      ) {
        toast.error("Could not load required data. Please try again.");
        return;
      }

      toast.success(
        `Successfully loaded data between ${startDate} and ${endDate}.`,
        { icon: "✅" }
      );
    } catch (error) {
      console.error("Error fetching analytics:", error);
      this.setState({
        loading: false,
        weeklyReport: dataReport,
      });

      toast.success(
        `Successfully loaded weekly data between ${startDate} and ${endDate}.`,
        { icon: "✅" }
      );
    }
  };

  // Method for ReportDashboard to handle date range changes
  handleAnalyticsDateRange = async ({ startDate, endDate }) => {
    try {
      let url = `/api/report/analytics/${this.props.userData.institution_id}`;
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const analyticsResponse = await fetch(url, {
        method: "get",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const newAnalyticsData =
        analyticsResponse.status === 200 ? await analyticsResponse.json() : {};

      // Debug: Log client-side analytics data in handleAnalyticsDateRange
      console.log(
        "Client-side handleAnalyticsDateRange - Analytics data received:",
        newAnalyticsData
      );
      console.log(
        "Client-side handleAnalyticsDateRange - Analytics response status:",
        analyticsResponse.status
      );

      this.setState({
        analyticsData: newAnalyticsData,
      });

      return newAnalyticsData;
    } catch (error) {
      console.error("Error fetching analytics:", error);
      throw error;
    }
  };

  handleDateRangeChange = async ({ startDate, endDate }) => {
    this.setState({ loading: true });

    try {
      // Fetch updated weekly report data
      const weeklyReportData = await getDataPoints({ startDate, endDate });

      // Fetch updated report data for the date range
      const reportResponse = await fetch(
        `${process.env.API_URL}/api/report/${Number(
          this.props.userData.institution_id
        )}`,
        {
          method: "get",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (reportResponse.status === 200) {
        const reportData = await reportResponse.json();

        this.setState({
          applicants: reportData.applicant || [],
          admitted: reportData.admitted || [],
          completedApplication: reportData.completedApplication || [],
          acceptanceFeePaid: reportData.acceptanceFeePaid || [],
          weeklyReport: weeklyReportData || [],
          loading: false,
        });
      } else {
        throw new Error("Failed to fetch report data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      this.setState({ loading: false });
      throw error;
    }
  };

  render() {
    const { showLegacyView } = this.state;

    return (
      <Layout userData={this.props.userData}>
        {/* Header with toggle and navigation */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="d-flex align-items-center">
              <Button
                variant={showLegacyView ? "outline-primary" : "primary"}
                size="sm"
                onClick={() =>
                  this.setState({ showLegacyView: !showLegacyView })
                }
                className="mr-3"
              >
                <i
                  className={`fa fa-${
                    showLegacyView ? "chart-bar" : "table"
                  } mr-2`}
                ></i>
                {showLegacyView ? "Dashboard View" : "Legacy View"}
              </Button>
              <Badge variant="info">
                {showLegacyView
                  ? "Legacy Report Format"
                  : "Analytics Dashboard"}
              </Badge>
            </div>
          </div>
          <div className="col-md-6 text-right">
            <Link href="/report/dashboard" legacyBehavior>
              <a className="btn btn-outline-secondary mr-2">
                <i className="fa fa-external-link mr-2"></i>
                Metabase Dashboard
              </a>
            </Link>
          </div>
        </div>

        {/* Conditional Rendering */}
        {!showLegacyView ? (
          // New Analytics Dashboard
          <ReportDashboard
            applicants={this.state.applicants}
            admitted={this.state.admitted}
            completedApplication={this.state.completedApplication}
            acceptanceFeePaid={this.state.acceptanceFeePaid}
            weeklyReport={this.state.weeklyReport}
            analyticsData={this.state.analyticsData || this.props.analyticsData}
            onDateRangeChange={this.handleAnalyticsDateRange}
          />
        ) : (
          // Legacy View
          <>
            <h3 className="border-bottom pb-3 bold text-center">
              CURRENT STATS
            </h3>
            <div className="row mt-5">
              <div className="col-lg-12">
                <div className="row">
                  <div className="col-sm-12 col-md-6 col-lg-3 m-b-10">
                    <div className="ar-1-1">
                      <div className="card no-border bg-complete widget-loader-circle-lg no-margin">
                        <div className="card-header">
                          <div className="card-controls">
                            <ul>
                              <li>
                                <a
                                  data-toggle="refresh"
                                  className="card-refresh"
                                  href="#"
                                ></a>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="pull-bottom bottom-left bottom-right padding-25 sm-screen">
                            <h1 className="text-white semi-bold">
                              {this.state.applicants.length}
                            </h1>
                            <div className="mt-50">
                              <span className="label font-montserrat fs-11">
                                Ongoing Applications
                              </span>
                            </div>
                            <p className="text-white m-t-20">
                              All ongoing applications that have not yet been
                              completed
                            </p>

                            <DataComponent
                              title={apllicantTitle}
                              type="applicant"
                              data={this.state.applicants}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6 col-lg-3 m-b-10">
                    <div className="ar-1-1">
                      <div className="card no-border bg-master widget widget-6 widget-loader-circle-lg no-margin">
                        <div className="card-header">
                          <div className="card-controls">
                            <ul>
                              <li>
                                <a
                                  data-toggle="refresh"
                                  className="card-refresh"
                                  href="#"
                                ></a>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="pull-bottom bottom-left bottom-right padding-25">
                            <h1 className="text-white semi-bold">
                              {this.state.completedApplication.length}
                            </h1>
                            <span className="label text-white font-montserrat fs-11">
                              Completed Applications
                            </span>
                            <p className="text-white m-t-20">
                              Students that have completed the admission process
                              but have not been granted admission
                            </p>

                            <DataComponent
                              title={completedApplicationTitle}
                              type="completed"
                              data={this.state.completedApplication}
                              department={this.props.department}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6 col-lg-3 m-b-10">
                    <div className="ar-1-1">
                      <div className="card no-border bg-info widget-loader-circle-lg no-margin">
                        <div className="card-header">
                          <div className="card-controls">
                            <ul>
                              <li>
                                <a
                                  data-toggle="refresh"
                                  className="card-refresh"
                                  href="#"
                                ></a>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="pull-bottom bottom-left bottom-right padding-25">
                            <h1 className="text-white semi-bold">
                              {this.state.admitted.length}
                            </h1>
                            <span className="label font-montserrat fs-11">
                              Admission Granted
                            </span>
                            <p className="text-white m-t-20">
                              View all students that have completed the
                              admission process and have been granted admission
                            </p>

                            <DataComponent
                              title={admittedTitle}
                              type="admitted"
                              department={this.props.department}
                              data={this.state.admitted}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6 col-lg-3 m-b-10">
                    <div className="ar-1-1">
                      <div className="card no-border bg-success widget widget-6 widget-loader-circle-lg no-margin">
                        <div className="card-header">
                          <div className="card-controls">
                            <ul>
                              <li>
                                <a
                                  data-toggle="refresh"
                                  className="card-refresh"
                                  href="#"
                                ></a>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="card-body">
                          <div className="pull-bottom bottom-left bottom-right padding-25">
                            <h1 className="text-white semi-bold">
                              {this.state.acceptanceFeePaid.length}
                            </h1>
                            <span className="label text-white font-montserrat fs-11">
                              Acceptance Fee Paid
                            </span>
                            <p className="text-white m-t-20">
                              Applicants who completed the application process,
                              been granted admission and have paid the
                              acceptance fee
                            </p>

                            <DataComponent
                              title={acceptanceTitle}
                              type="accepted"
                              data={this.state.acceptanceFeePaid}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Container className="my-4">
              <h3 className="py-4 bold">Weekly Report</h3>
              <p>
                You can select the start date and end date to view more records.
              </p>
              <p>Default data shown is from July 3rd till Present</p>

              <Form onSubmit={async (e) => await this.handleSubmit(e)}>
                <Form.Row>
                  <Form.Group controlId="formBasicEmail" className="mr-3">
                    <Form.Label>From</Form.Label>
                    {process.browser && (
                      <DatePicker
                        value={
                          this.state.startDate.length === 0
                            ? this.state.startDate
                            : new Date(this.state.startDate)
                        }
                        isRequired={true}
                        placeholder="Select Start Date"
                        ariaLabel="Select a date"
                        maxDate={new Date()}
                        allowTextInput={true}
                        onSelectDate={(value) =>
                          this.handleDateChange(value, "startDate")
                        }
                        parseDateFromString={this._onParseDateFromString}
                      />
                    )}
                  </Form.Group>
                  <Form.Group controlId="formBasicEmail" className="mr-3">
                    <Form.Label>To</Form.Label>
                    {process.browser && (
                      <DatePicker
                        value={
                          this.state.endDate.length === 0
                            ? this.state.endDate
                            : new Date(this.state.endDate)
                        }
                        isRequired={true}
                        placeholder="Select End Date"
                        ariaLabel="Select a date"
                        maxDate={new Date()}
                        allowTextInput={true}
                        onSelectDate={(value) =>
                          this.handleDateChange(value, "endDate")
                        }
                        parseDateFromString={this._onParseDateFromString}
                      />
                    )}
                  </Form.Group>

                  <Button
                    style={{ alignSelf: "center", marginTop: 20 }}
                    className="btn btn-complete"
                    type="submit"
                    disabled={this.state.loading}
                  >
                    {this.state.loading ? "Loading..." : "Search"}
                  </Button>
                </Form.Row>
                <Form.Text className="text-muted mb-5">
                  Please ensure you select a date for both fields.
                </Form.Text>
              </Form>

              {this.state.loading === false ? (
                <Table responsive="md" striped bordered hover>
                  <thead>
                    <tr>
                      <th className="bold">#</th>
                      <th className="bold">Title</th>
                      <th className="bold">Description</th>
                      <th className="bold">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.weeklyReport.map((report, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td className="bold">{report.title}</td>
                        <td className="bold">{report.description}</td>
                        <td className="bold">{report.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <Row className="my-5 py-5">
                  <Col>
                    <h1>Loading...</h1>
                  </Col>
                </Row>
              )}
            </Container>
          </>
        )}

        <style jsx>
          {`
            @media (max-width: 767.98px) {
              .h1,
              h1 {
                font-size: 2.5rem;
                font-size: 7rem !important;
                margin-bottom: 41px !important;
              }
              .mt-50 {
                margin-top: 50px !important;
              }
            }
          `}
        </style>
      </Layout>
    );
  }
}

const ToastWrapper = (props) => {
  return <Dashboard {...props} />;
};
ToastWrapper.getInitialProps = Dashboard.getInitialProps;

export default ToastWrapper;
