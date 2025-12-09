import React from "react";
import HodLayout from '../../components/HodLayout';
import Table from '../../components/Table';
import fetch from 'isomorphic-unfetch';

class Courses extends React.Component {
  state = {
    courses: this.props.courses
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

    let courses = await (
      await fetch(`${process.env.API_URL}/api/course?department_id=${deptId}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    ).json();

    return { courses };
  };

  handleChange = e => {};

  handleSubmit = async e => {};

  render() {
    return (
      <HodLayout pageTitle="Courses">
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="card-title">
              <h4>Courses</h4>
            </div>
          </div>
          <div className="card-body">
            <Table rows={this.state.courses} />
          </div>
        </div>
      </HodLayout>
    );
  }
}

export default Courses;
