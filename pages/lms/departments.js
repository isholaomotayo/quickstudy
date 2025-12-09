import Layout from '../../components/Layout';
import Table from '../../components/Table';
import { protectPage, getTableData } from '../../helpers/utils';

const tableCols = ['code', 'name'];
const formFields = [];

const Departments = props => (
  <Layout pageTitle="Departments" userData={props.userData}>
    <Table
      rows={props.departments}
      tableName="department"
      tableCols={tableCols}
      formFields={formFields}
      itemName="Department"
      subPage="lms/programmes"
      subIsList={true}
      subLinkTitle="Programmes"
      passToForm={["faculty_id"]}
      deleteAccess={["SUPERADMIN", "ADMIN"]}
      userData={props.userData}
      />
  </Layout>
);

Departments.getInitialProps = async ({ req, res, query }) => {
  const allowedRoles = ['SUPERADMIN', 'ADMIN'];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  const [departments, parent] = await getTableData(
    'department',
    'faculty_id',
    query,
    [],
    true,
    req
  );
  //console.log(departments, parent)
  return { departments, parent, userData };
};

export default Departments;
