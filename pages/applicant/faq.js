import Layout from "../../components/Layout";
import ContactModal from "../../components/ContactModal";
import Link from "next/link";
import { getInstituionByParams } from "../../helpers/FetchWrapper";

import { protectPage } from "../../helpers/utils";
const Faq = props => (
  <Layout pageTitle="Help & Support">
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
      <div className="row mt-5">
        <div className="col">
          <div className="tabs">
            <div className="tab border-bottom hover ">
              <input type="checkbox" id="chck1" />
              <label className="tab-label" htmlFor="chck1">
                What MBA options are available:
              </label>
              <div className="tab-content">
                <ul>
                  <li> Accounting.</li>
                  <li>Banking and Finance.</li>
                  <li> Management.</li>
                  <li> Marketing.</li>
                </ul>
              </div>
            </div>
            <div className="tab border-bottom hover">
              <input type="checkbox" id="chck2" />
              <label className="tab-label" htmlFor="chck2">
                Can fees be paid in installments?
              </label>
              <div className="tab-content">
                <ul>
                  <li>
                    Yes, students can subscribe to either monthly, per semester,
                    per session or full payment plan.
                  </li>
                </ul>
              </div>
            </div>
            <div className="tab border-bottom hover">
              <input type="checkbox" id="chck4" />
              <label className="tab-label" htmlFor="chck4">
                Is there any difference between the offline MBA plan and the
                distance MBA?
              </label>
              <div className="tab-content">
                <ul>
                  <li>
                    The certificate given at the end of the program is the same
                    as your offline MBA certificate on campus. Certificates will
                    not carry any form of “Distance Learning" or "Online” on
                    them.
                  </li>
                </ul>
              </div>
            </div>
            <div className="tab border-bottom hover ">
              <input type="checkbox" id="chck3" />
              <label className="tab-label" htmlFor="chck3">
                How are examinations conducted?
              </label>
              <div className="tab-content">
                <ul>
                  <li>
                    Examinations will be written during the last 2 weeks of
                    every semester, and students will need to visit UNN
                    examination centers close to them to write their
                    examinations. Please visit the
                    <Link href="http://cdel.unn.edu.ng/locations.html" legacyBehavior>
                      <a> locations page </a>
                    </Link>
                    to see the liaison offices closest to you.
                  </li>
                  <li>
                    Examinations may be computer based or paper based. The
                    examination modality would always be announced.
                  </li>
                  <li>
                    On the examination day, students are advised to be at the
                    venue of the examination at least thirty (30) minutes to the
                    start of the examination. Any admission into the examination
                    later than 30 minutes would be at the discretion of the
                    invigilator.
                  </li>
                  <li>
                    Students must display their ID cards during examinations.
                  </li>
                  <li>
                    Students are required to bring their own writing materials
                    such as calculators and other writing materials allowed into
                    the examination’s hall.
                  </li>
                  <li>
                    Involvement in examination malpractice attracts invitation
                    to the Examination Malpractice Panel and may subsequently
                    expulsion from the University depending on the gravity of
                    offence.
                  </li>
                </ul>
              </div>
            </div>
            <div className="tab border-bottom hover ">
              <input type="checkbox" id="chck5" />
              <label className="tab-label" htmlFor="chck5">
                Is there provision for withdrawal from the program
              </label>
              <div className="tab-content">
                <ul>
                  <li>
                    Any student who is absent from the program for two
                    consecutive Academic semesters without official permission
                    will be deemed to have withdrawn from the program.
                  </li>
                  <li>
                    Also, any student whose CGPA falls below 1.00 for two
                    consecutive semesters will be required to withdraw from the
                    University.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <style jsx>
      {`
        body {
          color: #daeffd;
          background: #ecf0f1;
          padding: 0 1em 1em;
        }
        h1 {
          margin: 0;
          line-height: 2;
          text-align: center;
        }
        h2 {
          margin: 0 0 0.5em;
          font-weight: normal;
        }
        input {
          position: absolute;
          opacity: 0;
          z-index: -1;
        }
        .row {
          display: flex;
        }
        .row .col {
          flex: 1;
        }
        .row .col:last-child {
          margin-left: 1em;
        }
        /* Accordion styles */
        .tabs {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 4px -2px rgba(0, 0, 0, 0.5);
        }
        .tab {
          width: 100%;
          color: black;
          overflow: hidden;
        }
        .tab-label {
          display: flex;
          justify-content: space-between;
          padding: 0.6em;
          // background: #daeffd;
          font-weight: normal;
          cursor: pointer;
          /* Icon */
        }
        // .tab-label:hover {
        //   background: #1a252f;
        // }
        .tab-label::after {
          content: 276F
          width: 1em;
          height: 1em;
          text-align: center;
          transition: all 0.35s;
        }
        .tab-content {
          max-height: 0;
          padding: 0 1em;
          // color: #daeffd;
          background: white;
          transition: all 0.35s;
        }
        .tab-close {
          display: flex;
          justify-content: flex-end;
          padding: 1em;
          font-size: 12px;
          background: #daeffd;
          cursor: pointer;
        }
        // .tab-close:hover {
        //   background: #1a252f;
        // }
        // input:checked + .tab-label {
        //   background: #1a252f;
        // }
        input:checked + .tab-label::after {
          transform: rotate(90deg);
        }
        input:checked ~ .tab-content {
          max-height: 100vh;
          padding: 1em;
        }
      `}
    </style>
  </Layout>
);

Faq.getInitialProps = async ({ req, res, query, ...ctx }) => {
  const allowedRoles = ["APPLICANT"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);
  let institution;

  institution = await getInstituionByParams(
    { id: userData.institution_id },
    ctx
  );

  return { userData, institution };
};
export default Faq;
