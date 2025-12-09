import React from "react";
import Layout from "../../components/Layout";
import fetch from "isomorphic-unfetch";
import Link from "next/link";
import { protectPage } from "../../helpers/utils";
class StudentHome extends React.Component {
  state = {
    toDashboard: this.props.toDashboard,
    url: "login",
    student: this.props.student,
    studentGpa: this.props.studentGpa,
    studentResults: this.props.studentResults,
    noApprovedRegistrations: this.props.noApprovedRegistrations,
    noUnapprovedRegistrations: this.props.noUnapprovedRegistrations,
  };
  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let dashboardData;

    try {
      dashboardData = await fetch(
        `${process.env.API_URL}/api/student/dashboard`,
        {
          method: "get",
          credentials: "include",
          headers: req
            ? { cookie: req.headers.cookie }
            : {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
        }
      );

      dashboardData =
        dashboardData.status === 200 ? await dashboardData.json() : {};
    } catch (e) {
      console.log(e);
    }

    const {
      student,
      studentGpa,
      allStudentResult,
      approvedRegistrationsSize,
      unApprovedRegistrationsSize,
    } = dashboardData;

    return {
      student,
      studentGpa,
      studentResults: allStudentResult,
      noApprovedRegistrations: approvedRegistrationsSize,
      noUnapprovedRegistrations: unApprovedRegistrationsSize,
      userData,
    };
  };

  render() {
    return (
      <Layout
        pageTitle="Student Dashboard"
        showBreadcrumb={false}
        userData={this.props.userData}
      >
        {/* <!-- START ROW --> */}
        <div className="row">
          <div className="col-lg-6 col-xlg-5">
            <div className="row">
              <div className="col-sm-6 m-b-10">
                <div className="ar-2-1">
                  {/* START WIDGET widget_payments*/}
                  <div className="widget-4 card no-border bg-default no-margin widget-loader-bar">
                    <div className="full-height d-flex flex-column">
                      <div className="card-header ">
                        <div className="card-title text-black">
                          <span className="font-montserrat fs-11 all-caps">
                            Welcome <i className="fa fa-chevron-right" />
                          </span>
                        </div>
                        <div className="card-controls">
                          <ul>
                            <li>
                              <a
                                href="#"
                                className="card-refresh text-black"
                                data-toggle="refresh"
                              >
                                <i className="card-icon card-icon-refresh" />
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="p-l-20">
                        <h3 className="no-margin p-b-5 text-black semi-bold">
                          {this.props.userData.first_name}{" "}
                          {this.props.userData.last_name}
                        </h3>

                        <p>
                          <span className="small hint-text text-black pr-5">
                            {this.state.student?.programme_name}
                          </span>
                        </p>

                        <p>
                          <span className="small hint-text text-black pr-5">
                            {this.state.student?.current_semester}
                          </span>
                          {/* UNCOMMENT THIS TO DISPLAY STUDENT CURRENT LEVEL */}
                          {/* <span className="small hint-text text-black">
                            {this.state.student.current_level} Level
                          </span> */}
                        </p>
                        <p>
                          <Link href={`/student/view`}>
                            <i className="fa fs-16 fa-arrow-circle-o-down text-success m-r-10"></i>
                            <span className="small hint-text text-black">
                              View Profile
                            </span>
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* END WIDGET */}
                </div>
              </div>
              <div className="col-sm-6 m-b-10">
                <div className="ar-2-1">
                  {/* START WIDGET widget_payments*/}
                  <div className="widget-4 card no-border bg-primary no-margin widget-loader-bar">
                    <div className="full-height d-flex flex-column">
                      <div className="card-header ">
                        <div className="card-title text-white">
                          <span className="font-montserrat fs-11 all-caps">
                            Payments <i className="fa fa-chevron-right" />
                          </span>
                        </div>
                        <div className="card-controls">
                          <ul>
                            <li>
                              <a
                                href="#"
                                className="card-refresh text-white"
                                data-toggle="refresh"
                              >
                                <i className="card-icon card-icon-refresh" />
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="p-l-20">
                        <h5 className="no-margin p-b-4 text-danger semi-bold">
                          {/* {this.props.unPaidFeesAmount} */}
                          <small className="small hint-text text-white">
                            {/* &nbsp; Unpaid */}
                          </small>
                        </h5>

                        <h5 className="no-margin p-b-4 text-white">
                          {/* {this.props.paidFeesAmount} */}
                          <small className="small hint-text text-white">
                            {/* &nbsp; Paid */}
                          </small>
                        </h5>

                        <p>
                          <Link
                            href={`/payments2`}
                            className="text-white hint-text  d-lg-block d-xl-block  d-lg-block d-xl-block"
                          >
                            View Payments
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* END WIDGET */}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6 m-b-10">
                <div className="ar-2-1">
                  {/* START WIDGET widget_Course registration stats*/}
                  <div className="widget-10 card no-border bg-white no-margin widget-loader-bar">
                    <div className="card-header  top-left top-right ">
                      <div className="card-title text-black hint-text">
                        <span className="font-montserrat fs-11 all-caps">
                          Course Registration Approvals{" "}
                          <i className="fa fa-chevron-right" />
                        </span>
                      </div>
                      <div className="card-controls">
                        {/* <ul>
                          <li>
                            <a
                              data-toggle="refresh"
                              className="card-refresh text-black"
                              href="#"
                            >
                              <i className="card-icon card-icon-refresh" />
                            </a>
                          </li>
                        </ul> */}
                      </div>
                    </div>
                    <div className=" p-l-20 p-t-40 p-b-40">
                      <div className="row">
                        <div className="col-sm-12">
                          <h3 className="no-margin p-b-5 text-black ">
                            Current Semester
                          </h3>
                          <div className="pull-left small">
                            <span>Approved</span>
                            <span className=" text-success font-montserrat">
                              <i className="fa fa-caret-up m-l-10" />{" "}
                              {this.state.noApprovedRegistrations}
                            </span>
                          </div>
                          <div className="pull-left m-l-20 small">
                            <span>Unapproved</span>
                            <span className=" text-danger font-montserrat">
                              <i className="fa fa-caret-up m-l-10" />{" "}
                              {this.state.noUnapprovedRegistrations}
                            </span>
                          </div>
                          <div className="clearfix" />
                        </div>
                      </div>
                      <div className="p-t-10 full-width">
                        <Link
                          href={`/student/student-courses`}
                          className="text-white hint-text  d-lg-block d-xl-block  d-lg-block d-xl-block"
                        >
                          <i className="fa fs-16 fa-arrow-circle-o-down text-success m-r-10"></i>
                          <span className="hint-text small text-black">
                            Show more
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                  {/* END WIDGET */}
                </div>
              </div>
              <div className="col-sm-6 m-b-10">
                <div className="ar-2-1">
                  {/* <!-- START WIDGET widget_CGPA--> */}
                  <div className="widget-5 card no-border bg-success no-margin widget-loader-bar">
                    <div className="full-height d-flex flex-column">
                      <div className="card-header ">
                        <div className="card-title text-black">
                          <span className="font-montserrat fs-11 all-caps">
                            Cumulative GPA <i className="fa fa-chevron-right" />
                          </span>
                        </div>
                        <div className="card-controls">
                          <ul>
                            <li>
                              <a
                                href="#"
                                className="card-refresh text-black"
                                data-toggle="refresh"
                              >
                                <i className="card-icon card-icon-refresh" />
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div className="p-l-20">
                        <h3 className="no-margin p-b-5 text-white">
                          {this.state.studentGpa
                            ? this.state.studentGpa.cumulative_gpa
                            : "N/A"}
                        </h3>

                        <span className=" hint-text text-black">
                          {this.state.studentGpa &&
                          this.state.studentGpa.classdegree
                            ? this.state.studentGpa.classdegree.name
                            : "N/A"}
                        </span>

                        <p className="p-t-10">
                          <Link href={`/student/student-gpa`}>
                            <i className="fa fs-16 fa-bar-chart text-white m-r-10"></i>
                            <span className="small hint-text text-black">
                              View GPA
                            </span>
                          </Link>
                        </p>
                      </div>
                      <div className="mt-auto">
                        <div className="progress progress-small m-b-20">
                          {/* START BOOTSTRAP PROGRESS (http://getbootstrap.com/components/#progress) */}
                          <div
                            className="progress-bar progress-bar-white"
                            style={{ width: "85%" }}
                          />
                          {/* END BOOTSTRAP PROGRESS */}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* <!-- END WIDGET --> */}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-sm-6 m-b-10">
                <div className="ar-1-1">
                  {/* <!-- START WIDGET widget_imageWidgetBasic--> */}
                  <div className="widget-2 card no-border bg-primary widget widget-loader-circle-lg no-margin">
                    {/* <div className="card-header ">
                      <div className="card-controls">
                        <ul>
                          <li>
                            <a
                              href="#"
                              className="card-refresh"
                              data-toggle="refresh"
                            >
                              <i className="card-icon card-icon-refresh-lg-white"></i>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div> */}
                    <div className="card-body darkerBg">
                      <div className="pull-bottom bottom-left bottom-right padding-25">
                        <span className="label font-montserrat fs-11">
                          COURSE REGISTRATIONS
                        </span>
                        <br />
                        <h3 className="text-white">
                          Register your semester courses
                        </h3>
                        <p>
                          <Link
                            href={`/student/student-courses`}
                            className="text-white hint-text  d-lg-block d-xl-block  d-lg-block d-xl-block"
                          >
                            Click here
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* <!-- END WIDGET --> */}
                </div>
              </div>
              <div className="col-sm-6 m-b-10">
                <div className="ar-1-1">
                  {/* <!-- START WIDGET widget_imageWidgetBasic--> */}
                  <div className="widget-11-2 card no-border card-condensed no-margin widget-loader-circle full-height d-flex flex-column">
                    {/* <div className="card-header  top-right">
                      <div className="card-controls">
                        <ul>
                          <li>
                            <a
                              data-toggle="refresh"
                              className="card-refresh text-black"
                              href="#"
                            >
                              <i className="card-icon card-icon-refresh" />
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div> */}
                    <div className="padding-15">
                      <div className="pull-left">
                        <h2 className="text-success no-margin">
                          Course Results
                        </h2>
                      </div>
                      <div className="clearfix" />
                    </div>
                    <div className="auto-overflow widget-11-2-table">
                      <table className="table table-condensed table-hover">
                        <tbody>
                          {this.state.studentResults?.length > 0 ? (
                            this.state.studentResults.map((studentresult) => (
                              <tr key={studentresult.id}>
                                <td className="font-montserrat all-caps fs-12 w-50">
                                  {studentresult.studentcourse.course.code}
                                </td>
                                <td className="text-right hidden-lg">
                                  <span className="hint-text small">
                                    dewdrops
                                  </span>
                                </td>
                                <td className="text-right b-r b-dashed b-grey w-25">
                                  <span className="hint-text small">
                                    {studentresult.studentcourse.course.units}
                                  </span>
                                </td>
                                <td className="w-25">
                                  <span className="font-montserrat fs-18">
                                    {studentresult.score}
                                    {studentresult.grade.name}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td>No Record Found</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <div className="padding-25 mt-auto">
                      <p className="small no-margin">
                        <Link href={`/student/course-results`}>
                          <i className="fa fs-16 fa-arrow-circle-o-down text-success m-r-10"></i>
                          <span className="hint-text small text-black">
                            View more results{" "}
                          </span>
                        </Link>
                      </p>
                    </div>
                  </div>
                  {/* <!-- END WIDGET --> */}
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-xlg-4">
            <div className="row">
              <div className="col-sm-6 m-b-10">
                <div className="ar-1-1">
                  {/* <!-- START WIDGET widget_imageWidgetBasic--> */}
                  <div className="widget-1 card no-border bg-success widget widget-loader-circle-lg no-margin">
                    <div className="card-body darkerBg">
                      <div className="pull-bottom bottom-left bottom-right padding-25">
                        <span className="label font-montserrat fs-11">
                          <Link href={`/lms/courses`}>
                            ONLINE LEARNING AREA
                          </Link>
                        </span>
                        <br />
                        <h3 className="text-white">
                          Learning at your convenience
                        </h3>
                        <p>
                          <Link
                            href={`/lms/courses`}
                            className="text-white hint-text  d-none d-lg-block d-xl-block  d-lg-block d-xl-block"
                          >
                            Get Started...
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* <!-- END WIDGET --> */}
                </div>
              </div>
              <div className="col-sm-6 m-b-10">
                <div className="ar-1-1">
                  {/* <!-- START WIDGET widget_imageWidgetBasic--> */}
                  <div className="widget-21 card no-border bg-info widget widget-loader-circle-lg no-margin">
                    <div className="card-header  top-right">
                      <div className="card-controls">
                        <ul>
                          <li>
                            <a
                              data-toggle="refresh"
                              className="card-refresh text-black"
                              href="#"
                            >
                              <i className="card-icon card-icon-refresh" />
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="padding-15">
                      <div className="pull-left">
                        <span className="label font-montserrat fs-11">
                          HELP & SUPPORT
                        </span>
                      </div>
                      <div className="clearfix" />
                    </div>
                    <div className="auto-overflow widget-11-2-table text-white">
                      <table className="table table-condensed table-detailed table-hover ">
                        <tbody>
                          <tr>
                            <td className="font-montserrat all-caps fs-12 w-50">
                              How do I pay my fees?
                            </td>
                          </tr>
                          <tr>
                            <td className="font-montserrat all-caps fs-12 w-50">
                              How do I register my courses?
                            </td>
                          </tr>
                          <tr>
                            <td className="font-montserrat all-caps fs-12 w-50">
                              When is exams taking place?
                            </td>
                          </tr>
                          <tr>
                            <td className="font-montserrat all-caps fs-12 w-50">
                              I can't find my courses
                            </td>
                          </tr>
                          <tr>
                            <td className="font-montserrat all-caps fs-12 w-50">
                              Where do I find my assignments?
                            </td>
                          </tr>
                          <tr>
                            <td className="font-montserrat all-caps fs-12 w-50">
                              How do I submit my assignments?
                            </td>
                          </tr>
                          <tr>
                            <td className="font-montserrat all-caps fs-12 w-50">
                              How do i check my results
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="padding-20 mt-auto">
                      <p className="small no-margin">
                        <Link
                          href={`/student/faq`}
                          className="text-white hint-text  d-lg-block d-xl-block  d-lg-block d-xl-block"
                        >
                          View more FAQs
                        </Link>
                      </p>
                    </div>
                  </div>
                  {/* <!-- END WIDGET --> */}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-sm-6 m-b-10">
                <div className="ar-1-1">
                  {/* <!-- START WIDGET widget_imageWidgetBasic--> */}
                  <div className="widget-4 card no-border bg-primary widget widget-loader-circle-lg no-margin">
                    <div className="card-body darkerBg">
                      <div className="pull-bottom bottom-left bottom-right padding-25">
                        <span className="label font-montserrat fs-11">
                          ANNOUNCEMENTS
                        </span>
                        <br />
                        <h3 className="text-white">
                          Everything you need to know
                        </h3>
                        <p>
                          <Link
                            href={`announcements`}
                            className="text-white hint-text  d-lg-block d-xl-block  d-lg-block d-xl-block"
                          >
                            Read More..
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* <!-- END WIDGET --> */}
                </div>
              </div>
              <div className="col-sm-6 m-b-10">
                <div className="ar-1-1">
                  {/* <!-- START WIDGET widget_imageWidgetBasic--> */}
                  <div className="widget-3 card no-border bg-complete widget widget-loader-circle-lg no-margin">
                    {/* <div className="card-header ">
                      <div className="card-controls">
                        <ul>
                          <li>
                            <a
                              href="#"
                              className="card-refresh"
                              data-toggle="refresh"
                            >
                              <i className="card-icon card-icon-refresh-lg-white"></i>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div> */}
                    <div className="card-body darkerBg">
                      <div className="pull-bottom bottom-left bottom-right padding-25">
                        <span className="label font-montserrat fs-11">
                          ACADEMIC CALENDAR
                        </span>
                        <br />
                        <h4 className="text-white">
                          School calendar for the current semester
                        </h4>
                        <p className="text-white hint-text  d-lg-block d-xl-block  d-lg-block d-xl-block">
                          <Link
                            href={`/student/school-calendar`}
                            className="text-white hint-text  d-lg-block d-xl-block  d-lg-block d-xl-block"
                          >
                            View Calendar...
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* <!-- END WIDGET --> */}
                </div>
              </div>
            </div>
          </div>
          {/* <!-- Filler --> */}
        </div>
        {/* <!-- END ROW --> */}
      </Layout>
    );
  }
}
export default StudentHome;
