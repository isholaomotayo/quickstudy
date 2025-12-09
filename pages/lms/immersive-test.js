import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import Layout from "../../components/Layout"
import ImmersiveQuiz from "../../components/ImmersiveQuiz"
import {
  protectPage,
  getTableData,
} from "../../helpers/utils"

const ImmersiveTest = (props) => {
  const pageParentNavs = [
    { route: "/lms/courses", title: "Learning Courses" },
    {
      route: `/lms/course?course_id=${props.courseTest.course_id}`,
      title: "Course",
    },
    {
      route: `/lms/course-module?course_module_id=${props.courseTest.course_module_id}`,
      title: "Course Module",
    },
  ]

  useEffect(() => {
    if (props.error && props.error.message) {
      toast.error(props.error.message, { icon: "❌" })
    }
  }, [])

  // Show toggle to switch back to legacy mode
  const toggleBar = (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      background: "rgba(0, 0, 0, 0.9)",
      zIndex: 1000,
      padding: "8px 16px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      color: "white",
      fontSize: "14px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{
          background: "linear-gradient(45deg, #8b5cf6, #3b82f6)",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "600"
        }}>
          ✨ IMMERSIVE MODE
        </span>
        <span style={{ opacity: 0.8 }}>Enhanced quiz experience</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={() => window.location.href = `/lms/learning-test?course_test_id=${props.courseTest.id}`}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            padding: "4px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          Switch to Legacy
        </button>
        <a
          href={`/lms/course-module?course_module_id=${props.courseTest.course_module_id}`}
          style={{
            color: "rgba(255, 255, 255, 0.8)",
            textDecoration: "none",
            fontSize: "12px"
          }}
        >
          ✕ Exit
        </a>
      </div>
    </div>
  )

  return (
    <>
      {toggleBar}
      <div style={{ paddingTop: "48px" }}>
        <ImmersiveQuiz
          courseTest={props.courseTest}
          courseQuestions={props.courseQuestions}
          pastAttempts={props.pastAttempts}
          userData={props.userData}
          currentURL={props.currentURL}
        />
      </div>
    </>
  )
}

// Use the same getInitialProps as learning-test.js for backend integration
ImmersiveTest.getInitialProps = async ({ req, res, query, asPath }) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"]
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles)
  
  const pastCheckQuery = {
    course_test_id: query.course_test_id,
    user_id: userData.id,
  }
  
  const [pastAttempts] =
    userData.role == "STUDENT"
      ? await getTableData("student_test", "", pastCheckQuery, [], false, req)
      : []

  let [courseQuestions, courseTest, error] = await getTableData(
    "course_question",
    `course_test_id`,
    query,
    [],
    true,
    req
  )

  if (!courseQuestions) {
    // Handle the bookshelf bug as in original learning-test.js
    [courseQuestions] = await getTableData(
      "course_question",
      `course_test_id`,
      query,
      [],
      false,
      req
    )
  }

  return {
    courseQuestions,
    courseTest,
    pastAttempts,
    userData,
    error,
    currentURL: asPath,
  }
}

export default ImmersiveTest