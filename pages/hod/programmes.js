import React from "react";
import HodLayout from '../../components/HodLayout';
import Table from '../../components/Table';
import fetch from 'isomorphic-unfetch';

class Programmes extends React.Component {
  state = {
    programmes: this.props.programmes
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

    let programmes = await (
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

    return { programmes };
  };

  handleChange = e => {};

  handleSubmit = async e => {};

  render() {
    return (
      <HodLayout pageTitle="Programmes">
        <Table rows={this.state.programmes} />
      </HodLayout>
    );
  }
}

export default Programmes;
