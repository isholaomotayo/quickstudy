import { useState, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Form,
  Badge,
  Container,
} from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import toast from "react-hot-toast";

// Local StatCard component for analytics dashboard
const StatCard = ({
  title,
  value,
  description,
  icon,
  color = "primary",
  trend = null,
  className = "",
}) => {
  const colorClasses = {
    primary: "border-primary",
    success: "border-success",
    warning: "border-warning",
    info: "border-info",
    danger: "border-danger",
    secondary: "border-secondary",
  };

  const textColorClasses = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    info: "text-info",
    danger: "text-danger",
    secondary: "text-secondary",
  };

  return (
    <div className={`col-lg-3 col-md-6 mb-4 ${className}`}>
      <Card
        className={`${colorClasses[color]} shadow h-100`}
        style={{ borderLeft: `4px solid var(--bs-${color})` }}
      >
        <Card.Body>
          <div className="row no-gutters align-items-center">
            <div className="col mr-2">
              <div
                className={`text-xs font-weight-bold ${textColorClasses[color]} text-uppercase mb-1`}
              >
                {title}
              </div>
              <div className="h5 mb-0 font-weight-bold text-gray-800">
                {value}
              </div>
              {description && (
                <div className="text-muted small mt-1">{description}</div>
              )}
              {trend && (
                <div className="mt-2">
                  <Badge
                    variant={trend.direction === "up" ? "success" : "danger"}
                    className="mr-1"
                  >
                    <i className={`fa fa-arrow-${trend.direction}`}></i>
                    {trend.value}%
                  </Badge>
                  <small className="text-muted">vs last period</small>
                </div>
              )}
            </div>
            <div className="col-auto">
              <i className={`fa fa-${icon} fa-2x text-gray-300`}></i>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ReportDashboard = ({
  applicants = [],
  admitted = [],
  completedApplication = [],
  acceptanceFeePaid = [],
  weeklyReport = [],
  analyticsData = {},
  onDateRangeChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Calculate comprehensive analytics data
  const calculatedAnalytics = useMemo(() => {
    // Debug: Log what analytics data we're receiving
    console.log(
      "Frontend ReportDashboard - Received analyticsData:",
      analyticsData
    );
    console.log("Frontend - Analytics data keys:", Object.keys(analyticsData));
    if (analyticsData.demographics) {
      console.log("Frontend - Demographics data:", analyticsData.demographics);
      console.log(
        "Frontend - Employment data:",
        analyticsData.demographics.employment
      );
      console.log(
        "Frontend - Marital status data:",
        analyticsData.demographics.maritalStatus
      );
      console.log(
        "Frontend - Previous education data:",
        analyticsData.demographics.previousEducation
      );
    }

    // Use backend analytics if provided - prioritize server-side calculations
    if (analyticsData && Object.keys(analyticsData).length > 0) {
      // Transform backend data structure to match frontend expectations
      const backendData = {
        totalApplications: analyticsData.summary?.totalApplications || 0,
        conversionRate: analyticsData.summary?.conversionRate || 0,
        completionRate: analyticsData.summary?.completionRate || 0,
        acceptanceRate: analyticsData.summary?.acceptanceRate || 0,

        // Monthly data from backend
        monthlyData:
          analyticsData.monthlyTrends?.reduce((acc, trend) => {
            const monthKey = new Date(trend.month).toISOString().substr(0, 7);
            acc[monthKey] = {
              ongoing: trend.ongoing || 0,
              completed: trend.completed || 0,
              admitted: trend.admitted || 0,
            };
            return acc;
          }, {}) || {},

        // Distribution data from backend
        programmeData: analyticsData.distributions?.programmes || {},
        departmentData: analyticsData.distributions?.departments || {},
        facultyData: analyticsData.distributions?.faculties || {},
        statusData: analyticsData.distributions?.status || {
          ongoing: 0,
          completed: 0,
          admitted: 0,
          acceptancePaid: 0,
        },

        // Demographics from backend
        demographics: {
          genderData: analyticsData.demographics?.gender || {
            male: 0,
            female: 0,
            other: 0,
          },
          ageGroups: analyticsData.demographics?.ageGroups || {
            "18-25": 0,
            "26-35": 0,
            "36-45": 0,
            "46+": 0,
          },
          employmentStatus: analyticsData.demographics?.employment || {
            employed: 0,
            unemployed: 0,
            other: 0,
          },
          maritalStatus: analyticsData.demographics?.maritalStatus || {
            single: 0,
            married: 0,
            divorced: 0,
            other: 0,
          },
          educationBackground:
            analyticsData.demographics?.previousEducation || {},
        },

        // Financial data from backend
        financial: {
          totalPotentialRevenue: analyticsData.financial?.totalRevenue || 0,
          paymentPlanDistribution: {}, // Not implemented in backend yet
        },
      };

      // Debug: Log the final backend data structure
      console.log("Frontend - Final backendData object:", backendData);
      console.log(
        "Frontend - Demographics in final data:",
        backendData.demographics
      );

      return backendData;
    }

    // Fallback to client-side calculations if no backend data
    const totalApplications =
      applicants.length + completedApplication.length + admitted.length;
    const conversionRate =
      totalApplications > 0
        ? ((admitted.length / totalApplications) * 100).toFixed(1)
        : 0;
    const completionRate =
      totalApplications > 0
        ? ((completedApplication.length / totalApplications) * 100).toFixed(1)
        : 0;
    const acceptanceRate =
      admitted.length > 0
        ? ((acceptanceFeePaid.length / admitted.length) * 100).toFixed(1)
        : 0;

    // Monthly application trends
    const monthlyData = {};

    // Process each category separately to avoid overlap issues
    applicants.forEach((app) => {
      if (app.created_at || app.user?.created_at) {
        const date = new Date(app.created_at || app.user.created_at);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { ongoing: 0, completed: 0, admitted: 0 };
        }
        monthlyData[monthKey].ongoing++;
      }
    });

    completedApplication.forEach((app) => {
      if (app.created_at || app.user?.created_at) {
        const date = new Date(app.created_at || app.user.created_at);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { ongoing: 0, completed: 0, admitted: 0 };
        }
        monthlyData[monthKey].completed++;
      }
    });

    admitted.forEach((app) => {
      if (app.created_at || app.user?.created_at) {
        const date = new Date(app.created_at || app.user.created_at);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { ongoing: 0, completed: 0, admitted: 0 };
        }
        monthlyData[monthKey].admitted++;
      }
    });

    // Programme distribution
    const programmeData = {};
    const departmentData = {};
    const facultyData = {};
    const genderData = { male: 0, female: 0, other: 0 };
    const ageGroups = { "18-25": 0, "26-35": 0, "36-45": 0, "46+": 0 };
    const employmentStatus = { employed: 0, unemployed: 0 };
    const maritalStatus = { single: 0, married: 0, divorced: 0 };
    const educationBackground = {};

    [...completedApplication, ...admitted, ...acceptanceFeePaid].forEach(
      (app, index) => {
        // Programme distribution
        if (app.programme?.name) {
          programmeData[app.programme.name] =
            (programmeData[app.programme.name] || 0) + 1;
        }

        // Department distribution - try multiple possible data structures
        let deptName = null;
        if (app.programme?.department?.name) {
          deptName = app.programme.department.name;
        } else if (app.department?.name) {
          deptName = app.department.name;
        } else if (app.programme?.department) {
          deptName = app.programme.department;
        } else if (app.department) {
          deptName = app.department;
        }

        if (deptName) {
          departmentData[deptName] = (departmentData[deptName] || 0) + 1;
        }

        // Faculty distribution - try multiple possible data structures
        let facultyName = null;
        if (app.programme?.department?.faculty?.name) {
          facultyName = app.programme.department.faculty.name;
        } else if (app.faculty?.name) {
          facultyName = app.faculty.name;
        } else if (app.programme?.faculty?.name) {
          facultyName = app.programme.faculty.name;
        } else if (app.programme?.department?.faculty) {
          facultyName = app.programme.department.faculty;
        } else if (app.faculty) {
          facultyName = app.faculty;
        }

        if (facultyName) {
          facultyData[facultyName] = (facultyData[facultyName] || 0) + 1;
        }

        // Demographics for students
        if (app.gender) {
          const gender = app.gender.toLowerCase();
          if (genderData.hasOwnProperty(gender)) {
            genderData[gender]++;
          } else {
            genderData.other++;
          }
        }

        // Age groups
        if (app.dob) {
          const age =
            new Date().getFullYear() - new Date(app.dob).getFullYear();
          if (age >= 18 && age <= 25) ageGroups["18-25"]++;
          else if (age >= 26 && age <= 35) ageGroups["26-35"]++;
          else if (age >= 36 && age <= 45) ageGroups["36-45"]++;
          else if (age > 45) ageGroups["46+"]++;
        }

        // Employment status
        if (app.employment_status) {
          const status = app.employment_status.toLowerCase();
          if (employmentStatus.hasOwnProperty(status)) {
            employmentStatus[status]++;
          }
        }

        // Marital status
        if (app.marital_status) {
          const status = app.marital_status.toLowerCase();
          if (maritalStatus.hasOwnProperty(status)) {
            maritalStatus[status]++;
          }
        }

        // Education background
        if (app.type_degree) {
          educationBackground[app.type_degree] =
            (educationBackground[app.type_degree] || 0) + 1;
        }
      }
    );

    // Status distribution for pie chart
    const statusData = {
      ongoing: applicants.length,
      completed: completedApplication.length,
      admitted: admitted.length,
      acceptancePaid: acceptanceFeePaid.length,
    };

    // Financial insights
    const totalPotentialRevenue = acceptanceFeePaid.reduce((sum, app) => {
      // Calculate based on fee structure if available
      return sum + (app.total_amount || 0);
    }, 0);

    const paymentPlanDistribution = {};
    acceptanceFeePaid.forEach((app) => {
      if (app.payment_plan) {
        paymentPlanDistribution[app.payment_plan] =
          (paymentPlanDistribution[app.payment_plan] || 0) + 1;
      }
    });

    return {
      totalApplications,
      conversionRate,
      completionRate,
      acceptanceRate,
      monthlyData,
      programmeData,
      departmentData,
      facultyData,
      statusData,
      demographics: {
        genderData,
        ageGroups,
        employmentStatus,
        maritalStatus,
        educationBackground,
      },
      financial: {
        totalPotentialRevenue,
        paymentPlanDistribution,
      },
    };
  }, [
    applicants,
    completedApplication,
    admitted,
    acceptanceFeePaid,
    analyticsData,
  ]);

  // Chart configurations
  const chartConfigurations = useMemo(() => {
    const months = Object.keys(calculatedAnalytics.monthlyData).sort();

    const applicationTrendData = {
      labels: months.map((month) => {
        const [year, monthNum] = month.split("-");
        return new Date(year, monthNum - 1).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });
      }),
      datasets: [
        {
          label: "Ongoing Applications",
          data: months.map(
            (month) => calculatedAnalytics.monthlyData[month]?.ongoing || 0
          ),
          borderColor: "rgb(255, 193, 7)",
          backgroundColor: "rgba(255, 193, 7, 0.1)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "Completed Applications",
          data: months.map(
            (month) => calculatedAnalytics.monthlyData[month]?.completed || 0
          ),
          borderColor: "rgb(108, 117, 125)",
          backgroundColor: "rgba(108, 117, 125, 0.1)",
          tension: 0.4,
          fill: false,
        },
        {
          label: "Admitted Students",
          data: months.map(
            (month) => calculatedAnalytics.monthlyData[month]?.admitted || 0
          ),
          borderColor: "rgb(40, 167, 69)",
          backgroundColor: "rgba(40, 167, 69, 0.1)",
          tension: 0.4,
          fill: false,
        },
      ],
    };

    const statusPieData = {
      labels: ["Ongoing", "Completed", "Admitted", "Acceptance Paid"],
      datasets: [
        {
          data: [
            calculatedAnalytics.statusData.ongoing,
            calculatedAnalytics.statusData.completed,
            calculatedAnalytics.statusData.admitted,
            calculatedAnalytics.statusData.acceptancePaid,
          ],
          backgroundColor: ["#ffc107", "#6c757d", "#28a745", "#007bff"],
          borderWidth: 2,
          borderColor: "#fff",
        },
      ],
    };

    const programmeBarData = {
      labels: Object.keys(calculatedAnalytics.programmeData).slice(0, 10), // Top 10 programmes
      datasets: [
        {
          label: "Applications",
          data: Object.values(calculatedAnalytics.programmeData).slice(0, 10),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgb(54, 162, 235)",
          borderWidth: 1,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    };

    return {
      applicationTrendData,
      statusPieData,
      programmeBarData,
      chartOptions,
    };
  }, [calculatedAnalytics]);

  const handleDateSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    setLoading(true);
    try {
      await onDateRangeChange({ startDate, endDate });
      toast.success(`Data loaded for ${startDate} to ${endDate}`);
    } catch (error) {
      toast.error("Failed to load data for selected date range");
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    try {
      await onDateRangeChange({});
      toast.success("Data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Container fluid>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-md-8">
          <h3 className="border-bottom pb-3 bold">
            INSTITUTIONAL ANALYTICS DASHBOARD
          </h3>
        </div>
        <div className="col-md-4 text-right">
          <Button
            variant="outline-primary"
            onClick={refreshData}
            disabled={refreshing}
            className="mr-2"
          >
            {refreshing ? (
              <>
                <span className="spinner-border spinner-border-sm mr-2"></span>
                Refreshing...
              </>
            ) : (
              <>
                <i className="fa fa-refresh mr-2"></i>
                Refresh Data
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Key Statistics Cards */}
      <div className="row">
        <StatCard
          title="Total Applications"
          value={calculatedAnalytics.totalApplications.toLocaleString()}
          description="All applications initiated in the system"
          icon="users"
          color="primary"
          trend={{ direction: "up", value: "12.5" }}
        />
        <StatCard
          title="Ongoing Applications"
          value={applicants.length.toLocaleString()}
          description="Applications currently in progress"
          icon="clock-o"
          color="warning"
        />
        <StatCard
          title="Completed Applications"
          value={completedApplication.length.toLocaleString()}
          description="Applications completed but pending admission"
          icon="check-circle"
          color="info"
        />
        <StatCard
          title="Admitted Students"
          value={admitted.length.toLocaleString()}
          description="Students granted admission"
          icon="graduation-cap"
          color="success"
          trend={{ direction: "up", value: calculatedAnalytics.conversionRate }}
        />
      </div>

      {/* Charts Section */}
      <div className="row mt-4">
        {/* Application Trend Chart */}
        <div className="col-lg-8 mb-4">
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Application Trends</h5>
                <Badge variant="info">Monthly Overview</Badge>
              </div>
            </Card.Header>
            <Card.Body style={{ height: "400px" }}>
              <Line
                data={chartConfigurations.applicationTrendData}
                options={chartConfigurations.chartOptions}
              />
            </Card.Body>
          </Card>
        </div>

        {/* Status Distribution */}
        <div className="col-lg-4 mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Application Status Distribution</h5>
            </Card.Header>
            <Card.Body style={{ height: "400px" }}>
              <Doughnut
                data={chartConfigurations.statusPieData}
                options={{
                  ...chartConfigurations.chartOptions,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Programme Distribution and Weekly Report */}
      <div className="row">
        {/* Programme Distribution */}
        <div className="col-lg-6 mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Top Programmes by Applications</h5>
            </Card.Header>
            <Card.Body style={{ height: "350px" }}>
              <Bar
                data={chartConfigurations.programmeBarData}
                options={chartConfigurations.chartOptions}
              />
            </Card.Body>
          </Card>
        </div>

        {/* Key Metrics Summary */}
        <div className="col-lg-6 mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Key Performance Indicators</h5>
            </Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-6 text-center border-right">
                  <h3 className="text-success">
                    {calculatedAnalytics.conversionRate}%
                  </h3>
                  <p className="text-muted mb-0">Admission Rate</p>
                  <small>Applications to Admissions</small>
                </div>
                <div className="col-6 text-center">
                  <h3 className="text-info">
                    {calculatedAnalytics.completionRate}%
                  </h3>
                  <p className="text-muted mb-0">Completion Rate</p>
                  <small>Ongoing to Completed</small>
                </div>
              </div>
              <hr />
              <div className="row">
                <div className="col-6 text-center border-right">
                  <h4 className="text-primary">{acceptanceFeePaid.length}</h4>
                  <p className="text-muted mb-0">Acceptance Fees Paid</p>
                </div>
                <div className="col-6 text-center">
                  <h4 className="text-warning">
                    {admitted.length - acceptanceFeePaid.length}
                  </h4>
                  <p className="text-muted mb-0">Pending Payments</p>
                </div>
              </div>
              <div className="mt-3">
                <div className="progress">
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${
                        admitted.length > 0
                          ? (acceptanceFeePaid.length / admitted.length) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <small className="text-muted">
                  Payment completion rate:{" "}
                  {admitted.length > 0
                    ? (
                        (acceptanceFeePaid.length / admitted.length) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </small>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Demographics and Academic Analytics */}
      <div className="row">
        {/* Demographics - Gender Distribution */}
        <div className="col-lg-4 mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Gender Distribution</h5>
            </Card.Header>
            <Card.Body style={{ height: "300px" }}>
              <Doughnut
                data={{
                  labels: ["Male", "Female", "Other"],
                  datasets: [
                    {
                      data: [
                        calculatedAnalytics.demographics.genderData.male,
                        calculatedAnalytics.demographics.genderData.female,
                        calculatedAnalytics.demographics.genderData.other,
                      ],
                      backgroundColor: ["#007bff", "#e83e8c", "#6c757d"],
                      borderWidth: 2,
                      borderColor: "#fff",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </Card.Body>
          </Card>
        </div>

        {/* Age Distribution */}
        <div className="col-lg-4 mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Age Group Distribution</h5>
            </Card.Header>
            <Card.Body style={{ height: "300px" }}>
              <Bar
                data={{
                  labels: Object.keys(
                    calculatedAnalytics.demographics.ageGroups
                  ),
                  datasets: [
                    {
                      label: "Students",
                      data: Object.values(
                        calculatedAnalytics.demographics.ageGroups
                      ),
                      backgroundColor: "rgba(40, 167, 69, 0.8)",
                      borderColor: "#28a745",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </Card.Body>
          </Card>
        </div>

        {/* Department Distribution */}
        <div className="col-lg-4 mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Applications by Department</h5>
            </Card.Header>
            <Card.Body style={{ height: "300px" }}>
              {Object.keys(calculatedAnalytics.departmentData).length > 0 ? (
                <Pie
                  data={{
                    labels: Object.keys(
                      calculatedAnalytics.departmentData
                    ).slice(0, 8),
                    datasets: [
                      {
                        data: Object.values(
                          calculatedAnalytics.departmentData
                        ).slice(0, 8),
                        backgroundColor: [
                          "#FF6384",
                          "#36A2EB",
                          "#FFCE56",
                          "#4BC0C0",
                          "#9966FF",
                          "#FF9F40",
                          "#FF6384",
                          "#C9CBCF",
                        ],
                        borderWidth: 2,
                        borderColor: "#fff",
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: { font: { size: 10 } },
                      },
                    },
                  }}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <div className="text-center text-muted">
                    <i className="fa fa-building-o fa-3x mb-3"></i>
                    <p>No department data available</p>
                    <small>
                      Department information will appear when applications
                      include department details
                    </small>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Faculty and Employment Analytics */}
      <div className="row">
        {/* Faculty Distribution */}
        <div className="col-lg-6 mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Faculty Distribution</h5>
            </Card.Header>
            <Card.Body style={{ height: "350px" }}>
              {Object.keys(calculatedAnalytics.facultyData).length > 0 ? (
                <Bar
                  data={{
                    labels: Object.keys(calculatedAnalytics.facultyData),
                    datasets: [
                      {
                        label: "Applications",
                        data: Object.values(calculatedAnalytics.facultyData),
                        backgroundColor: "rgba(255, 193, 7, 0.8)",
                        borderColor: "#ffc107",
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: "y",
                    plugins: { legend: { display: false } },
                    scales: { x: { beginAtZero: true } },
                  }}
                />
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <div className="text-center text-muted">
                    <i className="fa fa-university fa-3x mb-3"></i>
                    <p>No faculty data available</p>
                    <small>
                      Faculty information will appear when applications include
                      faculty details
                    </small>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Employment & Education Status */}
        <div className="col-lg-6 mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Student Background Analysis</h5>
            </Card.Header>
            <Card.Body>
              {/* Employment Status */}
              <div className="mb-4">
                <h6 className="text-muted">Employment Status</h6>
                <div className="row">
                  <div className="col-6 text-center">
                    <h4 className="text-success">
                      {
                        calculatedAnalytics.demographics.employmentStatus
                          .employed
                      }
                    </h4>
                    <p className="mb-0">Employed</p>
                  </div>
                  <div className="col-6 text-center">
                    <h4 className="text-warning">
                      {
                        calculatedAnalytics.demographics.employmentStatus
                          .unemployed
                      }
                    </h4>
                    <p className="mb-0">Unemployed</p>
                  </div>
                </div>
                <div className="progress mt-2">
                  <div
                    className="progress-bar bg-success"
                    style={{
                      width: `${
                        (calculatedAnalytics.demographics.employmentStatus
                          .employed /
                          (calculatedAnalytics.demographics.employmentStatus
                            .employed +
                            calculatedAnalytics.demographics.employmentStatus
                              .unemployed)) *
                          100 || 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Marital Status */}
              <div className="mb-4">
                <h6 className="text-muted">Marital Status</h6>
                <div className="row">
                  {Object.entries(
                    calculatedAnalytics.demographics.maritalStatus
                  ).map(([status, count]) => (
                    <div key={status} className="col-4 text-center">
                      <h5 className="text-info">{count}</h5>
                      <p className="mb-0 text-capitalize">{status}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education Background */}
              <div>
                <h6 className="text-muted">Previous Education</h6>
                {Object.entries(
                  calculatedAnalytics.demographics.educationBackground
                )
                  .slice(0, 4)
                  .map(([degree, count]) => (
                    <div
                      key={degree}
                      className="d-flex justify-content-between mb-2"
                    >
                      <span>{degree}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Financial Analytics */}
      {calculatedAnalytics.financial.totalPotentialRevenue > 0 && (
        <div className="row">
          <div className="col-lg-8 mb-4">
            <Card>
              <Card.Header>
                <h5 className="mb-0">Financial Analytics</h5>
              </Card.Header>
              <Card.Body>
                <div className="row">
                  <div className="col-md-4 text-center border-right">
                    <h3 className="text-success">
                      ₦
                      {calculatedAnalytics.financial.totalPotentialRevenue.toLocaleString()}
                    </h3>
                    <p className="text-muted mb-0">Total Potential Revenue</p>
                    <small>From acceptance fees paid</small>
                  </div>
                  <div className="col-md-4 text-center border-right">
                    <h3 className="text-primary">{acceptanceFeePaid.length}</h3>
                    <p className="text-muted mb-0">Payments Received</p>
                    <small>Students who paid acceptance fees</small>
                  </div>
                  <div className="col-md-4 text-center">
                    <h3 className="text-warning">
                      ₦
                      {(
                        (admitted.length - acceptanceFeePaid.length) *
                        (calculatedAnalytics.financial.totalPotentialRevenue /
                          acceptanceFeePaid.length || 0)
                      ).toLocaleString()}
                    </h3>
                    <p className="text-muted mb-0">Pending Revenue</p>
                    <small>Expected from pending payments</small>
                  </div>
                </div>

                {Object.keys(
                  calculatedAnalytics.financial.paymentPlanDistribution
                ).length > 0 && (
                  <div className="mt-4">
                    <h6 className="text-muted">Payment Plan Distribution</h6>
                    {Object.entries(
                      calculatedAnalytics.financial.paymentPlanDistribution
                    ).map(([plan, count]) => (
                      <div
                        key={plan}
                        className="d-flex justify-content-between mb-2"
                      >
                        <span className="text-capitalize">{plan}</span>
                        <Badge variant="info">{count} students</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>

          <div className="col-lg-4 mb-4">
            <Card>
              <Card.Header>
                <h5 className="mb-0">Financial Summary</h5>
              </Card.Header>
              <Card.Body>
                <div className="text-center">
                  <div className="mb-3">
                    <h2 className="text-success">
                      {calculatedAnalytics.acceptanceRate}%
                    </h2>
                    <p className="text-muted">Payment Completion Rate</p>
                  </div>

                  <div className="progress mb-3" style={{ height: "20px" }}>
                    <div
                      className="progress-bar bg-success"
                      style={{
                        width: `${calculatedAnalytics.acceptanceRate}%`,
                      }}
                    >
                      {calculatedAnalytics.acceptanceRate}%
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-6">
                      <h6 className="text-success">
                        {acceptanceFeePaid.length}
                      </h6>
                      <small>Paid</small>
                    </div>
                    <div className="col-6">
                      <h6 className="text-warning">
                        {admitted.length - acceptanceFeePaid.length}
                      </h6>
                      <small>Pending</small>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      )}

      {/* Date Range Filter */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Custom Date Range Analysis</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleDateSubmit}>
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    min={startDate}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex align-items-end">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm mr-2"></span>
                      Loading...
                    </>
                  ) : (
                    "Analyze Date Range"
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
          <small className="text-muted">
            Select a custom date range to analyze application trends and
            patterns.
          </small>
        </Card.Body>
      </Card>

      {/* Weekly Report Table */}
      {weeklyReport.length > 0 && (
        <Card>
          <Card.Header>
            <h5 className="mb-0">Detailed Weekly Report</h5>
          </Card.Header>
          <Card.Body>
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="thead-light">
                  <tr>
                    <th>#</th>
                    <th>Metric</th>
                    <th>Description</th>
                    <th className="text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyReport.map((report, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td className="font-weight-bold">{report.title}</td>
                      <td className="text-muted">{report.description}</td>
                      <td className="text-right font-weight-bold text-primary">
                        {report.value?.toLocaleString() || "0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ReportDashboard;
