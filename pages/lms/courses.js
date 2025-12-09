import { useEffect } from "react";
import Layout from "../../components/Layout";
import Table from "../../components/Table";
import {
  checkAndShowIfError,
  protectPage,
  getTableData,
  sortObjectsByStringProperty,
} from "../../helpers/utils";
import Pagination from "../../components/Pagination";

const tableCols = ["code", "name", "units"];
const formFields = [
  "code",
  "name",
  "description",
  "units",
  "level_id",
  "semester_position",
  "created_at",
  "updated_at",
  "published",
];

const Courses = (props) => {
  const pageParentNavs = [];
  const pagingData = props.pagingData;
  const writerRoles = ["SUPERADMIN", "ADMIN", "HOD"];
  const iCanWrite = writerRoles.indexOf(props.userData.role) > -1;

  if (iCanWrite) tableCols.push("published");

  useEffect(() => {
    checkAndShowIfError(props.error);
  }, []);

  return (
    <Layout
      pageTitle="Learning Courses"
      userData={props.userData}
      parentNavs={pageParentNavs}
    >
      <Table
        rows={props.courses}
        tableName="course"
        tableCols={tableCols}
        formFields={formFields}
        itemName="Course"
        subPage="lms/course"
        subLinkTitle="View Course"
        writeAccess={writerRoles}
        deleteAccess={["SUPERADMIN", "ADMIN"]}
        userData={props.userData}
        passToForm={["programme_id", "department_id"]}
        modalSize="xl"
      />
      {pagingData && pagingData.rowCount > props.courses.length && (
        <Pagination
          total={pagingData.rowCount}
          dataPerPage={pagingData.pageSize}
          href={`${props.pathname}?pgsize=${pagingData.pageSize}&pg=`}
          currentPage={pagingData.page}
        />
      )}
    </Layout>
  );
};

Courses.getInitialProps = async ({ req, res, query, pathname }) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  let [courses, parent, error, pagingData] = await getTableData(
    "course",
    "programme_id",
    query,
    [],
    true,
    req
  );

  if (courses && courses.length)
    courses = sortObjectsByStringProperty(courses, "code");

  return { courses, parent, userData, error, pagingData, pathname };
};

export default Courses;
