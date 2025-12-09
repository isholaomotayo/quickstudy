import { useState, useEffect, useMemo, useCallback } from "react";
import { protectPage } from "../../helpers/utils";
import toast from "react-hot-toast";
import Layout from "../../components/Layout";
import {
  Modal,
  Button,
  Form,
  Table,
  Card,
  Row,
  Col,
  Badge,
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
import { Line, Pie } from "react-chartjs-2";

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

const PaymentDetailsModal = ({ payment, show, onHide }) => {
  if (!payment) return null;

  const cart = payment.cart || {};

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Payment Details - {payment.reference}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <h6>Student Information</h6>
            <p>
              <strong>Name:</strong> {payment.student?.user?.firstName}{" "}
              {payment.student?.user?.lastName}
            </p>
            <p>
              <strong>Email:</strong> {payment.student?.user?.email}
            </p>
            <p>
              <strong>Reg No:</strong>{" "}
              {payment.student?.reg_no || "Not assigned"}
            </p>
          </Col>
          <Col md={6}>
            <h6>Payment Information</h6>
            <p>
              <strong>Amount:</strong> ₦{payment.amount?.toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong>
              <Badge
                variant={payment.status === 1 ? "success" : "warning"}
                className="ml-2"
              >
                {payment.status === 1 ? "Completed" : "Pending"}
              </Badge>
            </p>
            <p>
              <strong>Processor:</strong> {payment.processor}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(payment.created_at).toLocaleDateString()}
            </p>
            {payment.paid_at && (
              <p>
                <strong>Paid At:</strong>{" "}
                {new Date(payment.paid_at).toLocaleDateString()}
              </p>
            )}
          </Col>
        </Row>

        {Object.keys(cart).length > 0 && (
          <>
            <hr />
            <h6>Fee Breakdown</h6>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Fee Name</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                  <th>Plan</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(cart).map(([feeId, item]) => (
                  <tr key={feeId}>
                    <td>{item.name || "Unknown Fee"}</td>
                    <td>{item.quantity || 1}</td>
                    <td>₦{item.unit_price?.toLocaleString() || "0"}</td>
                    <td>
                      ₦
                      {(
                        (item.quantity || 1) * (item.unit_price || 0)
                      ).toLocaleString()}
                    </td>
                    <td>{item.fee_plan || "One-time"}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

function AdminPayments(props) {
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reconciling, setReconciling] = useState(false);
  const [currentPayments, setCurrentPayments] = useState(props.payments || []);
  const [currentPagination, setCurrentPagination] = useState(
    props.pagination || {}
  );
  const [filters, setFilters] = useState({
    email: props.query.email || "",
    status: props.query.status || "all",
    processor: props.query.processor || "all",
    dateFrom: props.query.dateFrom || "",
    dateTo: props.query.dateTo || "",
    minAmount: props.query.minAmount || "",
    maxAmount: props.query.maxAmount || "",
    pg: parseInt(props.query.pg) || 1,
    pgsize: parseInt(props.query.pgsize) || 10,
  });

  // Use analytics data from backend or fallback to current page data
  const { analytics = null, payments = [], pagination = {} } = props;
  // Debounced email filter to auto-trigger search as user types
  useEffect(() => {
    if (filters.email.length === 0) return;

    // Only auto-filter on email if it's the only thing changing and meets criteria
    const hasOtherFilters =
      filters.status !== "all" ||
      filters.processor !== "all" ||
      filters.dateFrom ||
      filters.dateTo ||
      filters.minAmount ||
      filters.maxAmount;

    if (!hasOtherFilters) {
      const timeoutId = setTimeout(() => {
        if (filters.email.length >= 3) {
          updateFilters(filters);
        }
      }, 800); // 800ms delay to avoid too many requests

      return () => clearTimeout(timeoutId);
    }
  }, [filters.email]);

  // Update state when props change (for initial load)
  useEffect(() => {
    setCurrentPayments(props.payments || []);
    setCurrentPagination(props.pagination || {});
  }, [props.payments, props.pagination]);

  // Fetch initial data if no payments provided (client-side only)
  useEffect(() => {
    const fetchInitialData = async () => {
      // Only fetch if we don't have any props data at all (meaning SSR failed completely)
      // Don't fetch if we have props but payments array is empty (valid empty result)
      if (
        !props.payments && // No payments prop at all
        !props.pagination && // No pagination prop at all
        !props.hasOwnProperty("payments") && // payments prop doesn't exist
        typeof window !== "undefined"
      ) {
        setLoading(true);
        try {
          const response = await fetch("/api/payment2?pg=1&pgsize=10", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (response.status === 200) {
            const data = await response.json();

            // Handle both old format (array) and new format (object with analytics)
            if (Array.isArray(data)) {
              setCurrentPayments(data || []);
              setCurrentPagination({});
            } else {
              setCurrentPayments(data.payments || []);
              setCurrentPagination(data.pagination || {});
            }
          }
        } catch (error) {
          console.error("Error fetching initial payments:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchInitialData();
  }, []); // Empty dependency array means this runs once on mount

  // Memoized filter update function to prevent recreation on every render
  const updateFilters = useCallback(
    async (newFilters) => {
      const updatedFilters = { ...filters, ...newFilters, pg: 1 }; // Reset to page 1 when filtering
      setFilters(updatedFilters);
      setLoading(true);

      try {
        // Build query string
        const queryParams = new URLSearchParams();
        Object.entries(updatedFilters).forEach(([key, value]) => {
          if (value && value !== "all" && value !== "") {
            queryParams.set(key, value);
          }
        });

        // Fetch filtered data without page refresh
        const response = await fetch(
          `/api/payment2?${queryParams.toString()}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          const data = await response.json();

          // Handle both old format (array) and new format (object with analytics)
          if (Array.isArray(data)) {
            setCurrentPayments(data || []);
            setCurrentPagination({});
          } else {
            setCurrentPayments(data.payments || []);
            setCurrentPagination(data.pagination || {});
          }

          // Update URL without refresh
          const newUrl = `/admin/payments${
            queryParams.toString() ? `?${queryParams.toString()}` : ""
          }`;
          window.history.pushState(null, "", newUrl);

          // Show success message for filters
          const hasActiveFilters = Object.entries(updatedFilters).some(
            ([key, value]) => {
              if (key === "pg" || key === "pgsize") return false;
              return value && value !== "all" && value !== "";
            }
          );

          if (hasActiveFilters) {
            toast.success(
              `Found ${
                data.payments?.length || data.length || 0
              } matching payments`
            );
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.message || "Failed to apply filters");
        }
      } catch (error) {
        console.error("Error filtering payments:", error);
        toast.error("Failed to apply filters");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Memoized page change function
  const changePage = useCallback(
    async (newPage) => {
      const updatedFilters = { ...filters, pg: newPage };
      setFilters(updatedFilters);
      setLoading(true);

      try {
        const queryParams = new URLSearchParams();
        Object.entries(updatedFilters).forEach(([key, value]) => {
          if (value && value !== "all" && value !== "") {
            queryParams.set(key, value);
          }
        });

        const response = await fetch(
          `/api/payment2?${queryParams.toString()}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          const data = await response.json();

          // Handle both old format (array) and new format (object with analytics)
          if (Array.isArray(data)) {
            setCurrentPayments(data || []);
            setCurrentPagination({});
          } else {
            setCurrentPayments(data.payments || []);
            setCurrentPagination(data.pagination || {});
          }

          // Update URL without refresh
          const newUrl = `/admin/payments?${queryParams.toString()}`;
          window.history.pushState(null, "", newUrl);
        }
      } catch (error) {
        console.error("Error changing page:", error);
        toast.error("Failed to change page");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const runReconciliation = async () => {
    setReconciling(true);

    try {
      const response = await fetch(`/api/payment2/reconcile-all`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}), // Send empty JSON object as required by schema
      });

      if (response.status === 200) {
        const result = await response.json();

        if (result.success) {
          toast.success(
            result.message || "Reconciliation completed successfully"
          );
          // Refresh the data without reloading the page
          updateFilters(filters);
        } else {
          toast.error(result.message || "Reconciliation failed");
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || "Reconciliation failed");
      }
    } catch (error) {
      console.error("Reconciliation error:", error);
      toast.error("Reconciliation failed - Network error");
    } finally {
      setReconciling(false);
    }
  };

  const showPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const hideModal = () => {
    setSelectedPayment(null);
    setShowModal(false);
  };

  // Generate chart data from backend analytics or current page data - memoized for performance
  const chartData = useMemo(() => {
    // Use backend analytics if available, otherwise fallback to current page data
    if (analytics && analytics.monthlyRevenue && analytics.statusBreakdown) {
      return {
        monthlyData: analytics.monthlyRevenue,
        statusData: analytics.statusBreakdown,
        totalRevenue: analytics.totalRevenue || 0,
        totalPayments: analytics.totalPayments || 0,
      };
    }

    // Fallback to current page data
    const monthlyData = {};
    const statusData = { completed: 0, pending: 0 };

    currentPayments.forEach((payment) => {
      // Monthly revenue
      const month = new Date(payment.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      if (!monthlyData[month]) {
        monthlyData[month] = { count: 0, amount: 0 };
      }
      monthlyData[month].count += 1;
      if (payment.status === 1) {
        monthlyData[month].amount += parseFloat(payment.amount) || 0;
      }

      // Status breakdown
      if (payment.status === 1) {
        statusData.completed += 1;
      } else {
        statusData.pending += 1;
      }
    });

    return {
      monthlyData,
      statusData,
      totalRevenue: currentPayments.reduce(
        (sum, p) => sum + (p.status === 1 ? parseFloat(p.amount) || 0 : 0),
        0
      ),
      totalPayments: currentPayments.length,
    };
  }, [analytics, currentPayments]);

  // Define payment columns for the table - memoized to prevent recreation
  const paymentColumns = useMemo(
    () => [
      {
        title: "Student Email",
        dataIndex: "student_email",
        key: "student_email",
        render: (text, payment) => payment.student?.user?.email || "N/A",
      },
      {
        title: "Amount",
        dataIndex: "amount",
        key: "amount",
        render: (text, payment) => `₦${(payment.amount || 0).toLocaleString()}`,
      },
      {
        title: "Processor",
        dataIndex: "processor",
        key: "processor",
        render: (text, payment) => (
          <Badge
            variant={payment.processor === "paystack" ? "primary" : "secondary"}
          >
            {payment.processor || "Unknown"}
          </Badge>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (text, payment) => (
          <Badge variant={payment.status === 1 ? "success" : "warning"}>
            {payment.status === 1 ? "Completed" : "Pending"}
          </Badge>
        ),
      },
      {
        title: "Reference",
        dataIndex: "reference",
        key: "reference",
        render: (text, payment) => payment.reference || "N/A",
      },
      {
        title: "Date",
        dataIndex: "created_at",
        key: "created_at",
        render: (text, payment) =>
          new Date(payment.created_at).toLocaleDateString(),
      },
      {
        title: "Actions",
        key: "actions",
        render: (text, payment) => (
          <Button
            variant="info"
            size="sm"
            onClick={() => showPaymentDetails(payment)}
          >
            View Details
          </Button>
        ),
      },
    ],
    []
  );

  // Chart configurations - memoized for performance
  const chartConfigurations = useMemo(() => {
    const monthlyRevenueData = {
      labels: Object.keys(chartData.monthlyData),
      datasets: [
        {
          label: "Monthly Revenue (₦)",
          data: Object.values(chartData.monthlyData).map(
            (d) => parseFloat(d.amount) || 0
          ),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
        },
      ],
    };

    const statusPieData = {
      labels: ["Completed", "Pending"],
      datasets: [
        {
          data: [
            parseInt(chartData.statusData.completed) || 0,
            parseInt(chartData.statusData.pending) || 0,
          ],
          backgroundColor: ["#28a745", "#ffc107"],
          borderWidth: 2,
          borderColor: "#fff",
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
          ticks: {
            callback: function (value) {
              return "₦" + value.toLocaleString();
            },
          },
        },
      },
    };

    return { monthlyRevenueData, statusPieData, chartOptions };
  }, [chartData]);

  // Memoized filter handlers to prevent recreation
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    updateFilters(filters);
  }, [updateFilters, filters]);

  const handleFilterSubmit = useCallback(
    (e) => {
      e.preventDefault();
      updateFilters(filters);
    },
    [updateFilters, filters]
  );

  return (
    <Layout title="Payment Management" userData={props.userData}>
      <div className="page-header">
        <div className="row">
          <div className="col-md-6">
            <h3 className="page-title">Payment Management</h3>
          </div>
          <div className="col-md-6 text-right">
            {(props.userData?.role === "ADMIN" ||
              props.userData?.role === "SUPERADMIN") && (
              <Button
                variant="primary"
                onClick={runReconciliation}
                disabled={reconciling}
                className="mb-3"
              >
                {reconciling ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm mr-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Reconciling...
                  </>
                ) : (
                  "Reconcile All"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Analytics Dashboard - Dashboard Layout - Only for Admin/SuperAdmin */}
      {(props.userData?.role === "ADMIN" ||
        props.userData?.role === "SUPERADMIN") && (
        <div className="row">
          {/* Left Sidebar - Small Widgets */}
          <div className="col-lg-4 col-xl-3 col-xlg-2">
            <div className="row">
              {/* Total Revenue Widget */}
              <div className="col-md-12 m-b-10">
                <div className="widget-8 card bg-warning no-margin widget-loader-bar">
                  <div className="container-xs-height full-height">
                    <div className="row-xs-height">
                      <div className="col-xs-height col-top">
                        <div className="card-header top-left top-right">
                          <div className="card-title">
                            <span className="font-montserrat fs-11 all-caps">
                              Total Revenue
                            </span>
                          </div>
                          <div className="card-controls">
                            <ul>
                              <li>
                                <a
                                  data-toggle="refresh"
                                  className="card-refresh"
                                  href="#"
                                >
                                  <i className="card-icon card-icon-refresh"></i>
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="row-xs-height">
                      <div className="col-xs-height col-top relative">
                        <div className="row full-height">
                          <div className="col-sm-6">
                            <div className="p-l-20 full-height d-flex flex-column justify-content-between">
                              <h3 className="no-margin p-b-5">
                                ₦
                                {(
                                  parseFloat(chartData.totalRevenue) || 0
                                ).toLocaleString()}
                              </h3>
                              <p className="small m-t-5 m-b-20">
                                <span className="label label-white hint-text font-montserrat m-r-5">
                                  {(
                                    (chartData.statusData.completed /
                                      (chartData.statusData.completed +
                                        chartData.statusData.pending)) *
                                    100
                                  ).toFixed(0)}
                                  %
                                </span>
                                <span className="fs-12">Completed</span>
                              </p>
                            </div>
                          </div>
                          <div className="col-sm-6"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Payments Widget */}
              <div className="col-lg-12 m-b-10">
                <div className="widget-9 card bg-success no-margin widget-loader-bar">
                  <div className="full-height d-flex flex-column">
                    <div className="card-header">
                      <div className="card-title">
                        <span className="font-montserrat fs-11 all-caps">
                          Total Payments
                        </span>
                      </div>
                      <div className="card-controls">
                        <ul>
                          <li>
                            <a
                              href="#"
                              className="card-refresh"
                              data-toggle="refresh"
                            >
                              <i className="card-icon card-icon-refresh"></i>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="p-l-20">
                      <h3 className="no-margin p-b-5">
                        {chartData.totalPayments.toLocaleString()}
                      </h3>
                      <span className="d-flex align-items-center">
                        <i className="fa fa-arrow-up m-r-5"></i>
                        <span className="small hint-text">
                          Transactions processed
                        </span>
                      </span>
                    </div>
                    <div className="mt-auto">
                      <div className="progress progress-small m-b-20">
                        <div
                          className="progress-bar progress-bar-white"
                          style={{
                            width: `${(
                              (chartData.statusData.completed /
                                chartData.totalPayments) *
                              100
                            ).toFixed(0)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Status Summary Widget */}
              <div className="col-lg-12 md-m-b-10 sm-p-b-10">
                <div className="widget-10 card bg-white no-margin widget-loader-bar">
                  <div className="card-header top-left top-right">
                    <div className="card-title text-black hint-text">
                      <span className="font-montserrat fs-11 all-caps">
                        Payment Status
                      </span>
                    </div>
                    <div className="card-controls">
                      <ul>
                        <li>
                          <a
                            data-toggle="refresh"
                            className="card-refresh text-black"
                            href="#"
                          >
                            <i className="card-icon card-icon-refresh"></i>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="card-body p-t-40">
                    <div className="row">
                      <div className="col-sm-12">
                        <h4 className="no-margin p-b-5 text-success semi-bold">
                          {chartData.statusData.completed} Completed
                        </h4>
                        <div className="d-flex align-items-center pull-left small">
                          <span>Completed</span>
                          <span className="text-success">
                            <i className="fa fa-arrow-up m-l-10"></i>
                          </span>
                          <span className="text-success font-montserrat">
                            {(
                              (chartData.statusData.completed /
                                chartData.totalPayments) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="d-flex align-items-center pull-left m-l-20 small">
                          <span>Pending</span>
                          <span className="text-warning">
                            <i className="fa fa-arrow-down m-l-10"></i>
                          </span>
                          <span className="text-warning font-montserrat">
                            {(
                              (chartData.statusData.pending /
                                chartData.totalPayments) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="clearfix"></div>
                      </div>
                    </div>
                    <div className="p-t-5 full-width">
                      <p className="small text-muted m-t-10">
                        {chartData.statusData.pending} payments pending
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chart Area */}
          <div className="col-lg-8 col-xl-9 col-xlg-6 m-b-10">
            <div className="row">
              <div className="col-md-12">
                <div className="widget-12 card widget-loader-circle no-margin">
                  <div className="row">
                    <div className="col-lg-8">
                      <div className="card-header pull-up top-right">
                        <div className="card-controls">
                          <ul>
                            <li className="hidden-xlg">
                              <div className="dropdown">
                                <a
                                  data-target="#"
                                  href="#"
                                  data-toggle="dropdown"
                                  aria-haspopup="true"
                                  role="button"
                                  aria-expanded="false"
                                >
                                  <i className="card-icon card-icon-settings"></i>
                                </a>
                                <ul
                                  className="dropdown-menu pull-right"
                                  role="menu"
                                >
                                  <li>
                                    <a href="#">Daily</a>
                                  </li>
                                  <li>
                                    <a href="#">Weekly</a>
                                  </li>
                                  <li>
                                    <a href="#">Monthly</a>
                                  </li>
                                </ul>
                              </div>
                            </li>
                            <li>
                              <a
                                data-toggle="refresh"
                                className="card-refresh text-black"
                                href="#"
                              >
                                <i className="card-icon"></i>
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-sm-8">
                        <div className="p-l-5">
                          <h2 className="pull-left m-t-5 m-b-5">
                            Payment Analytics
                          </h2>
                          <h2 className="pull-right m-r-25 m-t-5 m-b-5 text-success">
                            <i className="fa fa-arrow-up m-r-5"></i>
                            <span>
                              ₦
                              {(
                                parseFloat(chartData.totalRevenue) || 0
                              ).toLocaleString()}
                            </span>
                            <span className="text-success fs-12">
                              Total Revenue
                            </span>
                          </h2>
                          <div className="clearfix"></div>
                          <div className="full-width">
                            <ul className="list-inline m-t-10 p-b-10 m-b-0 b-b b-dashed b-grey">
                              <li>
                                <a
                                  href="#"
                                  className="font-montserrat fs-12 text-color"
                                >
                                  1D
                                </a>
                              </li>
                              <li className="active">
                                <a
                                  href="#"
                                  className="font-montserrat fs-12 bg-contrast-low text-color"
                                >
                                  1M
                                </a>
                              </li>
                              <li>
                                <a
                                  href="#"
                                  className="font-montserrat fs-12 text-color"
                                >
                                  3M
                                </a>
                              </li>
                              <li>
                                <a
                                  href="#"
                                  className="font-montserrat fs-12 text-color"
                                >
                                  1Y
                                </a>
                              </li>
                            </ul>
                          </div>
                          <div
                            className="nvd3-line line-chart text-center"
                            style={{ height: "300px" }}
                          >
                            <Line
                              data={chartConfigurations.monthlyRevenueData}
                              options={chartConfigurations.chartOptions}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-4 p-l-15">
                        <div className="widget-12-search">
                          <p className="pull-left">Recent Payments</p>
                          <button
                            aria-label=""
                            className="btn btn-default btn-rounded btn-icon pull-right"
                          >
                            <i className="fa fa-plus"></i>
                          </button>
                          <input
                            type="text"
                            placeholder="Search payments"
                            className="form-control m-t-5"
                          />
                        </div>
                        <div className="company-stat-boxes">
                          {currentPayments.slice(0, 5).map((payment, index) => (
                            <div
                              key={payment.id || index}
                              className="company-stat-box m-t-15 active p-l-5 p-r-5 p-t-10 p-b-10 b-b b-grey"
                            >
                              <div className="pull-left">
                                <p className="company-name pull-left text-uppercase bold no-margin">
                                  <span className="text-success fs-11"></span>
                                  {payment.student?.user?.email?.substring(
                                    0,
                                    8
                                  ) || "N/A"}
                                  ...
                                </p>
                                <small className="hint-text m-l-10">
                                  {payment.processor || "Unknown"}
                                </small>
                              </div>
                              <div className="pull-right">
                                <p className="small hint-text no-margin inline">
                                  ₦{(payment.amount || 0).toLocaleString()}
                                </p>
                                <span
                                  className={`label ${
                                    payment.status === 1
                                      ? "label-success"
                                      : "label-warning"
                                  } m-l-5 inline`}
                                >
                                  {payment.status === 1 ? "Paid" : "Pending"}
                                </span>
                              </div>
                              <div className="clearfix"></div>
                            </div>
                          ))}
                        </div>
                        <span className="pull-bottom hint-text small widget-12-footer">
                          Payment Management System - Real-time Analytics
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Status Chart */}
          <div className="col-lg-6 hidden-lg visible-xlg col-xlg-4 m-b-10">
            <div className="widget-15 card no-margin widget-loader-circle">
              <div className="card-header top-right">
                <div className="card-controls">
                  <ul>
                    <li>
                      <a
                        href="#"
                        className="card-refresh"
                        data-bs-toggle="refresh"
                      >
                        <i className="card-icon card-icon-refresh"></i>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="card-body no-padding">
                <ul
                  className="nav nav-tabs nav-tabs-simple p-t-5"
                  role="tablist"
                >
                  <li className="nav-item" role="presentation">
                    <a
                      href="#"
                      data-bs-toggle="tab"
                      className="active"
                      aria-selected="true"
                      role="tab"
                    >
                      Status
                      <br />
                      {chartData.statusData.completed}
                      <br />
                      <span className="text-success">
                        +
                        {(
                          (chartData.statusData.completed /
                            chartData.totalPayments) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </a>
                  </li>
                  <li className="nav-item" role="presentation">
                    <a
                      href="#"
                      data-bs-toggle="tab"
                      className=""
                      aria-selected="false"
                      tabIndex="-1"
                      role="tab"
                    >
                      Pending
                      <br />
                      {chartData.statusData.pending}
                      <br />
                      <span className="text-warning">
                        {(
                          (chartData.statusData.pending /
                            chartData.totalPayments) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </a>
                  </li>
                </ul>
                <div className="tab-content p-l-10 p-r-10">
                  <div className="tab-pane no-padding active">
                    <div className="full-width" style={{ height: "250px" }}>
                      <Pie
                        data={chartConfigurations.statusPieData}
                        options={chartConfigurations.chartOptions}
                      />
                    </div>
                  </div>
                </div>
                <div className="p-t-20 p-l-20 p-r-20 p-b-20">
                  <div className="row">
                    <div className="col-md-9">
                      <p className="fs-16">
                        Payment Analytics
                        <br />
                        Real-time payment tracking and status monitoring.
                      </p>
                      <p className="small hint-text">
                        Payment System Analytics
                        <br />
                        Automated reconciliation and reporting
                      </p>
                    </div>
                    <div className="col-md-3 text-right">
                      <p className="font-montserrat bold text-success m-r-20 fs-16 m-t-0">
                        +{chartData.statusData.completed}
                      </p>
                      <p className="font-montserrat bold text-warning m-r-20 fs-16">
                        -{chartData.statusData.pending}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Filter Payments</h6>
            {/* Active filters indicator */}
            {(() => {
              const activeFilters = Object.entries(filters).filter(
                ([key, value]) => {
                  if (key === "pg" || key === "pgsize") return false;
                  return value && value !== "all" && value !== "";
                }
              );

              return (
                activeFilters.length > 0 && (
                  <Badge variant="info">
                    {activeFilters.length} filter
                    {activeFilters.length > 1 ? "s" : ""} active
                  </Badge>
                )
              );
            })()}
          </div>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleFilterSubmit}>
            <Row>
              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label>Student Email</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by email"
                    value={filters.email}
                    onChange={(e) =>
                      handleFilterChange("email", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={2}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Control
                    as="select"
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                  >
                    <option value="all">All Status</option>
                    <option value="1">Completed</option>
                    <option value="0">Pending</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={6} lg={2}>
                <Form.Group>
                  <Form.Label>Processor</Form.Label>
                  <Form.Control
                    as="select"
                    value={filters.processor}
                    onChange={(e) =>
                      handleFilterChange("processor", e.target.value)
                    }
                  >
                    <option value="all">All Processors</option>
                    <option value="paystack">Paystack</option>
                    <option value="flutterwave">Flutterwave</option>
                    <option value="monnify">Monnify</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={6} lg={2}>
                <Form.Group>
                  <Form.Label>Date From</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      handleFilterChange("dateFrom", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={2}>
                <Form.Group>
                  <Form.Label>Date To</Form.Label>
                  <Form.Control
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      handleFilterChange("dateTo", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={12} lg={1}>
                <Form.Group>
                  <Form.Label>&nbsp;</Form.Label>
                  <Button
                    type="submit"
                    variant="success"
                    block
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm mr-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Loading...
                      </>
                    ) : (
                      "Apply"
                    )}
                  </Button>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label>Min Amount (₦)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Minimum amount"
                    value={filters.minAmount}
                    onChange={(e) =>
                      handleFilterChange("minAmount", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6} lg={3}>
                <Form.Group>
                  <Form.Label>Max Amount (₦)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Maximum amount"
                    value={filters.maxAmount}
                    onChange={(e) =>
                      handleFilterChange("maxAmount", e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={12} lg={6}>
                <Form.Group>
                  <Form.Label>&nbsp;</Form.Label>
                  <div className="d-flex gap-2">
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => {
                        setFilters({
                          email: "",
                          status: "all",
                          processor: "all",
                          dateFrom: "",
                          dateTo: "",
                          minAmount: "",
                          maxAmount: "",
                          pg: 1,
                          pgsize: 10,
                        });
                        // Clear filters and reload
                        updateFilters({
                          email: "",
                          status: "all",
                          processor: "all",
                          dateFrom: "",
                          dateTo: "",
                          minAmount: "",
                          maxAmount: "",
                          pg: 1,
                          pgsize: 10,
                        });
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Payments Table */}
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Payment Records ({currentPayments.length} records)</h5>
            {currentPagination.total && (
              <div>
                Showing{" "}
                {(currentPagination.currentPage - 1) *
                  currentPagination.pageSize +
                  1}
                -
                {Math.min(
                  currentPagination.currentPage * currentPagination.pageSize,
                  currentPagination.total
                )}{" "}
                of {currentPagination.total}
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-4">
              <span
                className="spinner-border"
                role="status"
                aria-hidden="true"
              ></span>
              <p>Loading payments...</p>
            </div>
          ) : currentPayments.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      {paymentColumns.map((column) => (
                        <th key={column.key}>{column.title}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentPayments.map((payment, index) => (
                      <tr key={payment.id || index}>
                        {paymentColumns.map((column) => (
                          <td key={column.key}>
                            {column.render
                              ? column.render(
                                  payment[column.dataIndex],
                                  payment
                                )
                              : payment[column.dataIndex]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {currentPagination.totalPages > 1 && (
                <nav>
                  <ul className="pagination justify-content-center">
                    <li
                      className={`page-item ${
                        filters.pg === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => changePage(filters.pg - 1)}
                        disabled={filters.pg === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from(
                      { length: Math.min(currentPagination.totalPages, 10) },
                      (_, i) => {
                        const page = i + 1;
                        return (
                          <li
                            key={page}
                            className={`page-item ${
                              filters.pg === page ? "active" : ""
                            }`}
                          >
                            <button
                              className="page-link"
                              onClick={() => changePage(page)}
                            >
                              {page}
                            </button>
                          </li>
                        );
                      }
                    )}
                    <li
                      className={`page-item ${
                        filters.pg === currentPagination.totalPages
                          ? "disabled"
                          : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => changePage(filters.pg + 1)}
                        disabled={filters.pg === currentPagination.totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p>No payments found matching your criteria.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        show={showModal}
        payment={selectedPayment}
        onHide={hideModal}
      />
    </Layout>
  );
}

// Add getServerSideProps for better server-side filtering
export async function getServerSideProps({ req, res, query }) {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  try {
    const queryParams = new URLSearchParams();

    // Add pagination - default to 10 for initial load, 10 for filtered results
    const hasFilters =
      query.email ||
      query.status ||
      query.processor ||
      query.dateFrom ||
      query.dateTo ||
      query.minAmount ||
      query.maxAmount;
    queryParams.set("pg", query.pg || "1");
    queryParams.set("pgsize", query.pgsize || (hasFilters ? "10" : "10"));

    // Add filters if present
    if (query.email) queryParams.set("email", query.email);
    if (query.status && query.status !== "all")
      queryParams.set("status", query.status);
    if (query.processor && query.processor !== "all")
      queryParams.set("processor", query.processor);
    if (query.dateFrom) queryParams.set("dateFrom", query.dateFrom);
    if (query.dateTo) queryParams.set("dateTo", query.dateTo);
    if (query.minAmount) queryParams.set("minAmount", query.minAmount);
    if (query.maxAmount) queryParams.set("maxAmount", query.maxAmount);

    const response = await fetch(
      `${process.env.API_URL}/api/payment2?${queryParams.toString()}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          Cookie: req.headers.cookie || "",
        },
      }
    );

    if (response.status === 200) {
      const data = await response.json();

      // Handle both old format (array) and new format (object with analytics)
      if (Array.isArray(data)) {
        return {
          props: {
            payments: data || [],
            pagination: {},
            analytics: null,
            userData,
            query,
          },
        };
      } else {
        return {
          props: {
            payments: data.payments || [],
            pagination: data.pagination || {},
            analytics: data.analytics || null,
            userData,
            query,
          },
        };
      }
    }

    return {
      props: {
        payments: [],
        pagination: {},
        analytics: null,
        userData,
        query,
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return {
      props: {
        payments: [],
        pagination: {},
        analytics: null,
        userData,
        query: query || {},
      },
    };
  }
}

export default AdminPayments;
