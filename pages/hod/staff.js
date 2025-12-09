import React from "react";
import HodLayout from '../../components/HodLayout';
import Table from '../../components/Table';
import fetch from 'isomorphic-unfetch';

class Staff extends React.Component {
  state = {
    allStaff: this.props.allStaff
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

    //retrieve staff dept id
    let deptId = staff.dept_id;

    let allStaff = await (
      await fetch(`${process.env.API_URL}/api/staff?dept_id=${deptId}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    ).json();

    return { allStaff };
  };

  handleChange = e => {};

  handleSubmit = async e => {};

  render() {
    return (
      <HodLayout pageTitle="Staff">
        <Table rows={this.state.allStaff} />
      </HodLayout>
    );
  }
}

export default Staff;
