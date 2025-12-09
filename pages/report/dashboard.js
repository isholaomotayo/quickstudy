import { useEffect } from "react";
import Layout from "../../components/Layout";
import { protectPage } from "../../helpers/utils";
import { Card, Button, Alert } from "react-bootstrap";
import Link from "next/link";

const Dashboard = ({ userData }) => {
  useEffect(() => {
    // Auto-redirect to the new analytics dashboard after 5 seconds
    const timer = setTimeout(() => {
      window.location.href = "/report";
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout userData={userData}>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <Card className="text-center">
              <Card.Header className="bg-warning text-white">
                <h4>
                  <i className="fa fa-exclamation-triangle mr-2"></i>
                  Dashboard Unavailable
                </h4>
              </Card.Header>
              <Card.Body>
                <Alert variant="info">
                  <h5>Metabase Dashboard is Currently Down</h5>
                  <p>
                    The external Metabase dashboard hosted on Heroku is
                    currently unavailable. We have created a new, improved
                    analytics dashboard with the following features:
                  </p>
                  <ul className="list-unstyled text-left">
                    <li>
                      <i className="fa fa-check text-success mr-2"></i>Real-time
                      application tracking
                    </li>
                    <li>
                      <i className="fa fa-check text-success mr-2"></i>
                      Interactive charts and visualizations
                    </li>
                    <li>
                      <i className="fa fa-check text-success mr-2"></i>Custom
                      date range analysis
                    </li>
                    <li>
                      <i className="fa fa-check text-success mr-2"></i>Key
                      performance indicators
                    </li>
                    <li>
                      <i className="fa fa-check text-success mr-2"></i>Programme
                      distribution analytics
                    </li>
                    <li>
                      <i className="fa fa-check text-success mr-2"></i>Admission
                      conversion rates
                    </li>
                  </ul>
                </Alert>

                <div className="mt-4">
                  <Link href="/report" legacyBehavior>
                    <a className="btn btn-primary btn-lg mr-3">
                      <i className="fa fa-chart-bar mr-2"></i>
                      Go to New Analytics Dashboard
                    </a>
                  </Link>
                  <Button
                    variant="outline-secondary"
                    onClick={() => window.history.back()}
                  >
                    <i className="fa fa-arrow-left mr-2"></i>
                    Go Back
                  </Button>
                </div>

                <div className="mt-3">
                  <small className="text-muted">
                    You will be automatically redirected to the new dashboard in
                    5 seconds...
                  </small>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="row mt-4">
          <div className="col-md-4">
            <Card>
              <Card.Body className="text-center">
                <i className="fa fa-chart-line fa-3x text-primary mb-3"></i>
                <h5>Advanced Analytics</h5>
                <p>
                  Get deeper insights with interactive charts and real-time data
                  visualization.
                </p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4">
            <Card>
              <Card.Body className="text-center">
                <i className="fa fa-clock fa-3x text-success mb-3"></i>
                <h5>Real-time Updates</h5>
                <p>
                  Data refreshes automatically to give you the most current
                  institutional metrics.
                </p>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4">
            <Card>
              <Card.Body className="text-center">
                <i className="fa fa-filter fa-3x text-info mb-3"></i>
                <h5>Custom Filtering</h5>
                <p>
                  Filter data by date ranges and specific criteria to get
                  targeted insights.
                </p>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

Dashboard.getInitialProps = async (ctx) => {
  const { res, req, query } = ctx;
  const allowedRoles = ["ADMIN", "SUPERADMIN"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  return {
    userData,
  };
};
export default Dashboard;
