import Layout from '../../components/Layout';
import { protectPage } from '../../helpers/utils';

const Announcement = props => (
  <Layout pageTitle="Announcements" userData={props.userData}>
    <div className="card card-transparent">
      <div className="card-header ">
        <div className="card-title">
          <h4>Announcements</h4>
        </div>
      </div>
      <div className="card-body"></div>
    </div>
  </Layout>
);

Announcement.getInitialProps = async ({ req, res, query }) => {
  const allowedRoles = ['STAFF'];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  return { userData };
};

export default Announcement;
