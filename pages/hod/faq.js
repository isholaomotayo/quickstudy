import HodLayout from "../../components/HodLayout";
import ContactModal from "../../components/ContactModal";
import { getInstituionByParams } from "../../helpers/FetchWrapper";

const Faq = props => (
  <HodLayout pageTitle="Help & Support">
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
              How do I access courses assigned to me?
            </td>
          </tr>
          <tr>
            <td className="font-montserrat all-caps fs-12 w-50">
              How do I see the students taking my courses?
            </td>
          </tr>
          <tr>
            <td className="font-montserrat all-caps fs-12 w-50">
              How do I add a new programme in the department?
            </td>
          </tr>
          <tr>
            <td className="font-montserrat all-caps fs-12 w-50">
              Can I assign a course to more than one lecturer?
            </td>
          </tr>
          <tr>
            <td className="font-montserrat all-caps fs-12 w-50">
              How can I assign a course to a lecturer?
            </td>
          </tr>
          <tr>
            <td className="font-montserrat all-caps fs-12 w-50">
              How do I upload results?
            </td>
          </tr>
          <tr>
            <td className="font-montserrat all-caps fs-12 w-50">
              How do I manage the staff in my department?
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </HodLayout>
);

Faq.getInitialProps = async ctx => {
  const { req, res, query } = ctx;
  const allowedRoles = ["HOD"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  let institution;

  institution = await getInstituionByParams(
    { id: userData.institution_id },
    ctx
  );

  return { userData, institution };
};

export default Faq;
