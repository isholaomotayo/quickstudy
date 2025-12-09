import Layout from "../../components/Layout";
import ContactModal from "../../components/ContactModal";
import { protectPage } from "../../helpers/utils";

const Faq = props => (
  <Layout pageTitle="Help & Support" userData={props.userData}>
    <div className="card-header ">
      <div className="card-title">
        <h4>Frequently Asked Questions</h4>
      </div>
      <div className="pull-right">
        <div className="col-xs-12">
          <ContactModal
            user={props.userData}
            institution={props.institution}
          ></ContactModal>
        </div>
      </div>
      <div className="clearfix" />
    </div>
    <div className="">
      <table className="table table-condensed table-detailed table-hover ">
        <tbody>
          <tr>
            <td className="font-montserrat all-caps fs-12 w-50">
              How do I update my profile?
            </td>
          </tr>
          <tr>
            <td className="font-montserrat all-caps fs-12 w-50">
              How do I contact support?
            </td>
          </tr>
          <tr>
            <td className="font-montserrat all-caps fs-12 w-50">
              I can't find the courses I'm taking?
            </td>
          </tr>
          <tr>
            <td className="font-montserrat all-caps fs-12 w-50">
              How do I access the Learning Management System?
            </td>
          </tr>
          <tr>
            <td className="font-montserrat all-caps fs-12 w-50">
              How do I upload results?
            </td>
          </tr>
          <tr>
            <td className="font-montserrat all-caps fs-12 w-50">
              How do I change my login credentials?
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </Layout>
);

Faq.getInitialProps = async ({ req, res, query }) => {
  const allowedRoles = ["STAFF", "LECTURER"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  return { userData };
};

export default Faq;
