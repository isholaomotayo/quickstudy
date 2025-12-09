import React from "react";
import Layout from "../../components/Layout";
import Checkbox from "../../components/Checkbox.js";
import { protectPage } from "../../helpers/utils";
import {
  getStudentByUserId,
  getCurrentSemester,
  getStudentLevelId,
} from "../../helpers/FetchWrapper";
import Router from "next/router";
import { toast } from "react-hot-toast";

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import { Row, Container, Col } from "react-bootstrap";

// Demo styles, see 'Styles' section below for some notes on use.
import "react-accessible-accordion/dist/fancy-example.css";

class CourseRegistration extends React.Component {
  state = {
    courseList: this.props.courseList,

    student: this.props.student,
    studentId: this.props.studentId,
    currentSemesterId: this.props.currentSemesterId,
    semesterPosition: this.props.semesterPosition,
    currentLevelId: this.props.currentLevelId,
    checkedItems: new Map(),
    coursesByLevel: this.props.coursesByLevel,
  };
  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    const { student } = await getStudentByUserId(userId, req);
    const studentId = student ? student.id : 0;
    const programmeId = student ? student.programme_id : 0;
    const semesterAdmittedId = student ? student.semester_admitted_id : 1;

    const semesterResponse = await getCurrentSemester(req);
    console.log("Full semester response:", semesterResponse);
    const semester = semesterResponse?.semester;
    console.log("Extracted semester:", semester);
    const currentSemesterId = semester ? semester.id : 1;

    const currentSessionId = semester ? semester.session_id : 1;

    const semesterPosition = semester ? semester.position : 1;
    const entryLevelId =
      student && student.entry_level_id ? student.entry_level_id : 1;

    const currentLevelId = await getStudentLevelId(
      semesterAdmittedId,
      currentSemesterId,
      entryLevelId,
      req
    );

    let studentCourses = await fetch(
      `${process.env.API_URL}/api/studentcourse/studentid/${studentId}`,
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
    studentCourses =
      studentCourses.status === 200 ? await studentCourses.json() : [];

    let courseList = await fetch(
      `${process.env.API_URL}/api/programmecourse/search?programme_id=${programmeId}`,
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
    courseList = courseList.status == 200 ? await courseList.json() : [];

    courseList = courseList.filter(
      (data, i) =>
        +data.course.department.faculty.institution_id ===
        +userData.institution_id
    );
    return {
      studentCourses,
      courseList,
      student,
      studentId,
      currentSemesterId,
      semesterPosition,
      currentLevelId,
      userData,
    };
  };

  handleChange = (e) => {
    const item = e.target.name;
    const isChecked = e.target.checked;

    const isRegistered = this.props.studentCourses.find((course) => {
      return +course.course_id === +item;
    });

    if (isRegistered) {
      return toast.error(
        `You cannot select ${isRegistered.course.name} as you've already registered previously for it`,
        { icon: "❌" }
      );
    }

    // Update the checkedItems state
    this.setState((prevState) => ({
      checkedItems: prevState.checkedItems.set(item, isChecked),
    }));
  };

  handleSubmitClick = async (e) => {
    let courses = this.state.checkedItems;
    let registrationCount = 0;

    for (const [key, value] of courses.entries()) {
      if (value === true) {
        registrationCount++;
        // Register the course for the student
        let courseId = key;

        try {
          const response = await fetch(
            `${process.env.API_URL}/api/studentcourse`,
            {
              method: "post",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              body: JSON.stringify({
                student_id: this.state.studentId,
                course_id: courseId,
                semester_id: this.state.currentSemesterId, // This is critical - ensures correct semester assignment
                level_id: this.state.currentLevelId,
                units:
                  this.props.courseList.find((pc) => pc.course.id == courseId)
                    ?.course?.units || 3,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to register course: ${response.status}`);
          }
        } catch (error) {
          console.error("Error registering course:", error);
          toast.error(`Failed to register course. Please try again.`);
          return;
        }
      }
    }

    if (registrationCount > 0) {
      toast.success(
        `Successfully registered for ${registrationCount} course(s)!`
      );
      // Optionally redirect to student courses page
      setTimeout(() => {
        Router.push("/student/student-courses");
      }, 1500);
    } else {
      toast.error("Please select at least one course to register.");
    }
  };

  groupCoursesByLevel() {
    const { courseList } = this.props; // Assuming courseList is an array of course objects
    const groupedCourses = courseList.reduce((acc, course) => {
      // Assuming each course has a 'level_id' property
      const { level_id } = course;
      if (!acc[level_id]) {
        acc[level_id] = [];
      }
      acc[level_id].push(course);
      return acc;
    }, {});

    return groupedCourses;
  }

  renderGroupedCourses() {
    const groupedCourses = this.groupCoursesByLevel();
    return Object.entries(groupedCourses).map(([levelId, courses]) => (
      <div key={levelId}>
        <h3>Level {levelId} Courses</h3>
        {courses.map((course) => (
          <div key={course.course.id}>{course.course.name}</div> // Assuming each course has an 'id' and 'name'
        ))}
      </div>
    ));
  }

  render() {
    const coursesByLevel = this.groupCoursesByLevel();

    return (
      <Layout
        pageTitle="New Course Registrations"
        userData={this.props.userData}
      >
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="card-title">
              <h4>New Course Registrations</h4>
              <span className="font-montserrat fs-18"></span>
            </div>
            <div className="pull-right">
              <div className="col-xs-12">
                <button
                  id="show-modal"
                  className="btn btn-success btn-cons"
                  onClick={this.handleSubmitClick}
                >
                  <i className="fa fa-plus" /> Register
                </button>
              </div>
            </div>
            <div className="clearfix" />
          </div>
          <div className="card-body">
            <Container fluid>
              <Row>
                <Col lg="6">
                  <form>
                    <p>
                      Kindly register only courses relevant to your current
                      semester.{" "}
                    </p>

                    <Accordion allowZeroExpanded={true}>
                      {Object.entries(coursesByLevel).map(
                        ([levelId, courses], index) => (
                          <AccordionItem key={levelId}>
                            <AccordionItemHeading>
                              <AccordionItemButton>
                                Level {index + 1} Courses
                              </AccordionItemButton>
                            </AccordionItemHeading>
                            <AccordionItemPanel>
                              <table className="table table-condensed table-responsive table-hover">
                                <thead>
                                  <tr>
                                    <th>Select</th> <th>Semester</th>
                                    <th>Course Code</th>
                                    <th>Course Title</th>
                                    <th>Course Unit</th>
                                    <th>Programme</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {courses.length ? (
                                    courses
                                      .sort(
                                        (a, b) =>
                                          a.semester_position -
                                          b.semester_position
                                      )

                                      .map((programmeCourse) => (
                                        <tr
                                          key={`${programmeCourse.course.id}`}
                                        >
                                          <td>
                                            <Checkbox
                                              name={programmeCourse.course.id.toString()}
                                              checked={this.state.checkedItems.get(
                                                programmeCourse.course.id.toString()
                                              )}
                                              onChange={this.handleChange}
                                            />
                                          </td>
                                          <td className="text-middle  w-15">
                                            <span className="hint-text small">
                                              {(programmeCourse.course &&
                                                programmeCourse.course
                                                  .semester_position) ||
                                                "All"}
                                            </span>
                                          </td>
                                          <td className="font-montserrat all-caps fs-12 w-50">
                                            {programmeCourse.course.code}
                                          </td>
                                          <td className="font-montserrat all-caps fs-12 w-50">
                                            {programmeCourse.course.name}
                                          </td>
                                          <td className="text-middle  w-15">
                                            <span className="hint-text small">
                                              {programmeCourse.course.units}
                                            </span>
                                          </td>
                                          <td className="text-middle  w-15">
                                            <span className="hint-text small">
                                              {(programmeCourse.programme_id &&
                                                programmeCourse.programme
                                                  .name) ||
                                                "All"}
                                            </span>
                                          </td>
                                        </tr>
                                      ))
                                  ) : (
                                    <tr>No records found</tr>
                                  )}
                                </tbody>
                              </table>
                            </AccordionItemPanel>
                          </AccordionItem>
                        )
                      )}
                    </Accordion>
                  </form>
                </Col>
                <Col lg="6">
                  <p>Your previously registered courses.</p>
                  <Accordion allowZeroExpanded={true}>
                    <AccordionItem>
                      <AccordionItemHeading>
                        <AccordionItemButton>
                          Previously Registered Courses
                        </AccordionItemButton>
                      </AccordionItemHeading>
                      <AccordionItemPanel>
                        <table className="table table-condensed table-responsive table-hover">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Course</th>
                              <th>Semester</th>
                              <th>Approved</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.props.studentCourses.length &&
                              this.props.studentCourses.map((course, i) => (
                                <tr key={i}>
                                  <td className="px-2">{i + 1}</td>
                                  <td className="px-2">
                                    {course.course.name} - {course.course.code}
                                  </td>
                                  <td className="px-2">{course.level.name}</td>
                                  <td className="px-2">
                                    {course.approval_status === true
                                      ? "Yes"
                                      : "No"}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </AccordionItemPanel>
                    </AccordionItem>
                  </Accordion>
                </Col>
              </Row>
            </Container>
            <br />
            <div className="pull-left">
              <div className="col-xs-12">
                <button
                  id="show-modal"
                  className="btn btn-success btn-cons"
                  onClick={this.handleSubmitClick}
                >
                  <i className="fa fa-plus" /> Register
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

const ToastWrapper = (props) => {
  return <CourseRegistration {...props} />;
};

ToastWrapper.getInitialProps = CourseRegistration.getInitialProps;

export default ToastWrapper;
