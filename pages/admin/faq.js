import Layout from "../../components/Layout";
import ContactModal from "../../components/ContactModal";
import { protectPage } from "../../helpers/utils";
import Link from "next/link";
import { getInstituionByParams } from "../../helpers/FetchWrapper";

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel
} from "react-accessible-accordion";

// Demo styles, see 'Styles' section below for some notes on use.
import "react-accessible-accordion/dist/fancy-example.css";

const Faq = props => (
  <Layout pageTitle="Help & Support" userData={props.userData}>
    <div>
      <div className="card-header ">
        <div className="card-title">
          <h4>Frequently Asked Questions</h4>
        </div>
        <div className="pull-right">
          <div className="col-xs-12 mb-1">
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
              Is it possible to view applications and issue provisional
              Admissions?
            </AccordionItemButton>
          </AccordionItemHeading>
          <AccordionItemPanel>
            <p>
              Yes, only an administrator has the privileges required to issue
              provisional admissions from the portal.
            </p>
          </AccordionItemPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionItemHeading>
            <AccordionItemButton>
              Can an administrator create other users such as facilitators on
              the portal?
            </AccordionItemButton>
          </AccordionItemHeading>
          <AccordionItemPanel>
            <p>Yes, an administrator can create other users</p>
          </AccordionItemPanel>
        </AccordionItem>

        <AccordionItem>
          <AccordionItemHeading>
            <AccordionItemButton>
              Can an administrator setup faculties and courses?
            </AccordionItemButton>
          </AccordionItemHeading>
          <AccordionItemPanel>
            <p>Yes, an administrator can do this.</p>
          </AccordionItemPanel>
        </AccordionItem>
      </Accordion>
    </div>
  </Layout>
);
Faq.getInitialProps = async ctx => {
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
