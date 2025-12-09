import HodLayout from "../../components/HodLayout";

const SchoolCalendar = () => (
  <HodLayout pageTitle="School Calendar">
    <div className="card card-transparent">
      <div className="card-header ">
        <div className="card-title">
          <h4>School Calendar</h4>
        </div>
      </div>
      <div className="card-body"></div>
    </div>
  </HodLayout>
);

SchoolCalendar.getInitialProps = async ({ req, res, query }) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  return { userData };
};

export default SchoolCalendar;
