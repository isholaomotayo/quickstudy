import Layout from "../../components/Layout";
import CourseModuleClient from "../../components/lms/CourseModuleClient";
import { protectPage, getTableData, getTableSchema } from "../../helpers/utils";

const CourseModuleV2 = (props) => {
  const cmid =
    props.courseModuleData?.id || props.query?.course_module_id || "";
  return (
    <Layout
      pageTitle={`Module: ${props.courseModuleData?.name || "Module"}`}
      userData={props.userData}
      parentNavs={[
        { route: "/lms/courses", title: "Learning Courses" },
        {
          route: `/lms/course?course_id=${
            props.courseModuleData?.course_id || ""
          }`,
          title: "Course",
        },
      ]}
    >
      <div className="alert alert-info" style={{ marginBottom: 10 }}>
        Need the legacy page?{" "}
        <a href={`/lms/course-module?course_module_id=${cmid}&legacy=1`}>
          Open legacy
        </a>
      </div>
      <CourseModuleClient
        courseModuleData={props.courseModuleData}
        courseLessons={props.courseLessons}
        userData={props.userData}
        error={props.error}
        lessonFormSchema={props.lessonFormSchema}
      />
    </Layout>
  );
};

CourseModuleV2.getInitialProps = async ({ req, res, query }) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { userData } = protectPage(req, res, allowedRoles);

  const lineage = ["course_lesson", "course_test"];
  const [courseLessons, courseModuleData, error] = await getTableData(
    "course_lesson",
    "course_module_id",
    query,
    lineage,
    true,
    req
  );
  const lessonFormSchema = await getTableSchema("course_lesson");

  return {
    courseModuleData,
    courseLessons,
    userData,
    error,
    query,
    lessonFormSchema,
  };
};

export default CourseModuleV2;
