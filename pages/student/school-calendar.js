import Layout from "../../components/Layout";
import { protectPage } from "../../helpers/utils";
import ResponsiveEmbed from "react-bootstrap/ResponsiveEmbed";
import { getInstituionByParams } from "../../helpers/FetchWrapper";

const SchoolCalendar = props => (
  <Layout pageTitle="School Calendar" userData={props.userData}>
    <div className="card card-transparent">
      <div className="card-header ">
        <div className="card-title">
          <h4>School Calendar</h4>
        </div>
      </div>
      <div
        className="card-body"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <div style={{ width: 660, height: "auto" }}>
          <ResponsiveEmbed aspectRatio="1by1">
            <embed
              type="application/pdf"
              src={props.institution.school_calendar}
            />
          </ResponsiveEmbed>
        </div>
      </div>
    </div>
  </Layout>
);

SchoolCalendar.getInitialProps = async ctx => {
  const { req, res, query } = ctx;

  const allowedRoles = ["STUDENT"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);
  let institution;

  institution = await getInstituionByParams({ id:userData.institution_id}, ctx);
  return { userData, institution };
};

export default SchoolCalendar;
