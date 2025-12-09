import Layout from "../../components/Layout";
import ContactModal from "../../components/ContactModal";
import { protectPage } from "../../helpers/utils";
import { getInstituionByParams } from "../../helpers/FetchWrapper";

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";

// Demo styles, see 'Styles' section below for some notes on use.
import "react-accessible-accordion/dist/fancy-example.css";

const Faq = (props) => (
  <Layout pageTitle="Help & Support" userData={props.userData}>
    <div>
      <div className="card-header ">
        <div className="card-title">
          <h4>Frequently Asked Questions</h4>
        </div>
        <div className="pull-right">
          <div className="col-xs-12 mb-6">
            <ContactModal
              user={props.userData}
              institution={props.institution}
            ></ContactModal>
          </div>
        </div>
      </div>
      <hr />

      <Accordion allowZeroExpanded={true}>
        <AccordionItem>
          <AccordionItemHeading>
            <AccordionItemButton>
              How do I register my courses for the semester?
            </AccordionItemButton>
          </AccordionItemHeading>
          <AccordionItemPanel>
            <p>
              Courses can be registered by clicking on the register button,
              however, it must be approved by an administrator.
            </p>
          </AccordionItemPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionItemHeading>
            <AccordionItemButton>
              Can I change my payment plan?
            </AccordionItemButton>
          </AccordionItemHeading>
          <AccordionItemPanel>
            <p>Yes, however, you must make a request for it.</p>
          </AccordionItemPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionItemHeading>
            <AccordionItemButton>
              Does the MBA certificate indicate distance learning?
            </AccordionItemButton>
          </AccordionItemHeading>
          <AccordionItemPanel>
            <p>
              The certificate given at the end of the programme is the same as
              your offline MBA certificate on campus. Certificates will not
              carry any form of “Distance Learning" or "Online” on them.
            </p>
          </AccordionItemPanel>
        </AccordionItem>
      </Accordion>
    </div>
  </Layout>
);
Faq.getInitialProps = async (ctx) => {
  const { req, res, query } = ctx;
  const allowedRoles = ["ADMIN", "SUPERADMIN", "STUDENT"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  let institution;

  institution = await getInstituionByParams(
    { id: userData.institution_id },
    ctx
  );

  return { userData, institution };
};
export default Faq;

// export { default } from "../admin/faq";
