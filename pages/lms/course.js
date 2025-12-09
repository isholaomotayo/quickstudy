import { useEffect } from "react";
import Layout from "../../components/Layout";
import Table from "../../components/Table";
import { protectPage, getTableData } from "../../helpers/utils";
import Announcement from "../../components/lms-component/announcement";
import Link from "next/link";
import fetch from "isomorphic-unfetch";
import cryptoJS from "crypto-js";
import toast from "react-hot-toast";

const modulesTableCols = ["order", "name"];
const moduleFormFields = [];

const startLiveWebinar = async (userData, courseData) => {
  const joinPassword =
    userData.role == "STUDENT" ? courseData.code : `MOD${courseData.code}`;

  let createParams =
    `name=${courseData.name}&meetingID=${courseData.code}&attendeePW=${courseData.code}&moderatorPW=MOD${courseData.code}`
      .split(" ")
      .join("+");

  let joinParams =
    `fullName=${userData.first_name} ${userData.last_name}&meetingID=${courseData.code}&password=${joinPassword}`
      .split(" ")
      .join("+");
  let createChecksum = cryptoJS
    .SHA1(`create${createParams}${process.env.BBB_SHARED_SECRET}`)
    .toString();
  let joinChecksum = cryptoJS
    .SHA1(`join${joinParams}${process.env.BBB_SHARED_SECRET}`)
    .toString();

  let parser, xmlDoc;

  const response = await fetch(
    `${process.env.BBB_API}/create?${createParams}&checksum=${createChecksum}`
  );

  const responseText = await response.text();

  if (window.DOMParser) {
    parser = new DOMParser();
    xmlDoc = parser.parseFromString(responseText, "text/xml");
  } else {
    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = false;
    xmlDoc.loadXML(responseText);
  }
  let createdStatus =
    xmlDoc.getElementsByTagName("returncode")[0].childNodes[0].nodeValue ===
    "SUCCESS";
  if (createdStatus) {
    // console.log("Webinar successfully created ");

    let joinAsModerator = await fetch(
      `${process.env.BBB_API}/join?${joinParams}&checksum=${joinChecksum}`,
      { redirect: "manual" }
    );

    window.open(joinAsModerator.url);
  }
};

const Course = (props) => {
  const pageParentNavs = [{ route: "/lms/courses", title: "Learning Courses" }];
  const writerRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const iCanWrite = writerRoles.indexOf(props.userData.role) > -1;

  if (iCanWrite) modulesTableCols.push("published");

  useEffect(() => {
    if (props.error && props.error.message) {
      toast.error(props.error.message, { icon: "❌" });
    }
  }, []);

  return (
    <Layout
      pageTitle={`Course: ${props.courseData.code}`}
      userData={props.userData}
      parentNavs={pageParentNavs}
    >
      <div className="text-center">
        <div className="inline-block">
          <h3>
            {props.courseData.code}: {props.courseData.name}
          </h3>
          <section className="container">
            <section className="row">
              <section className="col-md-10">
                <p>{props.courseData.description}</p>
              </section>
            </section>
          </section>
        </div>
      </div>
      <section className="container">
        <section className="row">
          <section className="col-md-8 ">
            <div className="btn-group" role="group">
              <Link
                href={`/lms/webinar-v2?roomName=${encodeURIComponent(
                  props.courseData.code + " " + props.courseData.name
                )}&userInfo=${encodeURIComponent(
                  props.userData.first_name + " " + props.userData.last_name
                )}&courseCode=${encodeURIComponent(
                  props.courseData.code
                )}&courseName=${encodeURIComponent(
                  props.courseData.name
                )}&courseId=${encodeURIComponent(
                  props.courseData.id
                )}&&provider=googlemeet`}
                className="btn btn-success icon-btn  d-flex align-items-center gap-2"
                target="_blank"
              >
                Live Classroom
              </Link>
              {/* <Link
                href={`/lms/webinar?roomName=${encodeURIComponent(
                  props.courseData.code + " " + props.courseData.name
                )}&userInfo=${encodeURIComponent(
                  props.userData.first_name + " " + props.userData.last_name
                )}`}
                className="btn btn-info"
                target="_blank"
              >
                📹 Jitsi Classroom (Fallback)
              </Link> */}
            </div>
            {/* //START BBB Integration */}
            {/* {props.userData.role == "ADMIN" ? (
              <button
                type="button"
                className="btn-sm modal-btn mt-1  btn btn-danger"
                onClick={() =>
                  startLiveWebinar(props.userData, props.courseData)
                }
              >
                + Start Live Webinar
              </button>
            ) : (
              <button
                type="button"
                className="btn-sm modal-btn mt-1  btn btn-success"
                onClick={() =>
                  startLiveWebinar(props.userData, props.courseData)
                }
              >
                + Join Live Webinar
              </button>
            )} */}
            {/* //End BBB Integration */}
            <Table
              rows={props.courseModules}
              tableName="course_module"
              tableCols={modulesTableCols}
              formFields={moduleFormFields}
              itemName="Course Module"
              subPage="lms/course-module"
              subLinkTitle="Launch"
              openBtnSize="sm"
              createBtnTitle="+ Add Module"
              writeAccess={writerRoles}
              deleteAccess={["SUPERADMIN", "ADMIN"]}
              userData={props.userData}
            />
          </section>
          <section className="col-md-4 ">
            <div className=" mb-5 text-right">
              <Link
                href={`/discussion-topic?course_id=${props.courseData.id}`}
                className="btn btn-dark text-complete "
              >
                Go to Discussions
              </Link>
              <Link
                href={`/course-forum?course_id=${props.courseData.id}`}
                className="btn mx-2 btn-complete "
              >
                Go to Forum
              </Link>
            </div>

            <Announcement id={props.courseData.id} />
          </section>
        </section>
      </section>
    </Layout>
  );
};

Course.getInitialProps = async ({ req, res, query }) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  let [courseModules, courseData, error] = await getTableData(
    "course_module",
    "course_id",
    query,
    [],
    true,
    req
  );
  if (courseData.error) courseData = {};

  return { courseModules, courseData, userData, error };
};

export default Course;
