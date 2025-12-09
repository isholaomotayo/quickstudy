import Layout from '../../components/Layout';
import { protectPage } from '../../helpers/utils';

const SchoolCalendar = props => (
  <Layout pageTitle="School Calendar" userData={props.userData}>
    <div className="card card-transparent">
      <div className="card-header ">
        <div className="card-title">
          <h4>School Calendar</h4>
        </div>
      </div>
      <div className="card-body"></div>
    </div>
  </Layout>
);

SchoolCalendar.getInitialProps = async ({ req, res, query }) => {
  const allowedRoles = ['STAFF', 'LECTURER'];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  return { userData };
};

export default SchoolCalendar;
