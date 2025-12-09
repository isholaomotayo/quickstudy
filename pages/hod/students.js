import React from "react";
import HodLayout from '../../components/HodLayout';
import StudentRenderProps from '../../components/student/StudentRenderProps';
import StudentTable from '../../components/student/StudentTable';
import Table from '../../components/Table';
import fetch from 'isomorphic-unfetch';

const columns = ['id', 'reg_no', 'last_name', 'first_name', 'email'];
const formFields = ['id', 'reg_no', 'last_name', 'first_name', 'email'];
class Students extends React.Component {
  state = {
    students: this.props.students
  };

  static getInitialProps = async () => {
    // const { id } = context.query;
    const staffId = 2;

    let staff = await (
      await fetch(`${process.env.API_URL}/api/staff/${staffId}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    ).json();

    let deptId = staff.dept_id;
    let deptProgrammes = await (
      await fetch(
        `${process.env.API_URL}/api/programme?department_id=${deptId}`,
        {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    ).json();
    // retrieve programme ids as an array
    let query_params = '?';

    for (let i = 0; i < deptProgrammes.length; i++) {
      query_params = query_params
        .concat('&programme_id=')
        .concat(deptProgrammes[i].id);
    }

    let students = await (
      await fetch(`${process.env.API_URL}/api/student${query_params}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    ).json();

    return { students };
  };

  handleChange = e => {};

  handleSubmit = async e => {};

  render() {
    return (
      <HodLayout pageTitle="Students">
        <Table
          rows={this.state.students}
          tableName="student"
          tableCols={columns}
          formFields={formFields}
          itemName="Student"
          createBtnTitle="+ Add Student"
        />
      </HodLayout>
    );
  }
}
export default Students;
