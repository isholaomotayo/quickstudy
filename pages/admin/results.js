import React from "react";
import Layout from '../../components/Layout';
import fetch from 'isomorphic-unfetch';
import { protectPage } from '../../helpers/utils';
import { getStaffByUserId } from '../../helpers/FetchWrapper';

class Results extends React.Component {
  state = {
    results: this.props.results
  };

  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ['ADMIN', 'SUPERADMIN'];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    const { staff } = await getStaffByUserId(userId, req);
    const staffId = staff ? staff.id : 0;

    //retrieve staff dept id
    let deptId = staff ? staff.dept_id : 0;

    let courses = await (
      await fetch(`${process.env.API_URL}/api/course?department_id=${deptId}`, {
        method: 'get',
        credentials: 'include',
        headers: req
          ? { cookie: req.headers.cookie }
          : {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
      })
    ).json();

    // retrieve course ids as an array
    let courseIds = [];
    courses.filter(function(item) {
      if (item.course_id != null) {
        courseIds.push(item.course_id);
      }
      return courseIds;
    });

    let query_params = '?';

    for (let i = 0; i < courseIds.length; i++) {
      console.log(courseIds[i]);
      query_params = query_params.concat('&course_id=').concat(courseIds[i]);
    }
    let results = await (
      await fetch(`${process.env.API_URL}/api/resultbatch${query_params}`, {
        method: 'get',
        credentials: 'include',
        headers: req
          ? { cookie: req.headers.cookie }
          : {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
      })
    ).json();

    return { results, userData };
  };

  handleChange = e => {};

  handleSubmit = async e => {};

  render() {
    return (
      <Layout pageTitle="Results" userData={this.props.userData}>
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="card-title">
              <h4> Results</h4>
            </div>
            <div className="pull-right">
              <div className="col-xs-12">
                <a
                  href="student-gpa"
                  className="btn btn-complete btn-cons text-white"
                >
                  <i className="fa fa-search-plus" /> Student GPAs
                </a>
                <a
                  href="all-course-results"
                  className="btn btn-primary btn-cons text-white"
                >
                  <i className="fa fa-search-plus" /> All Students Results
                </a>
              </div>
            </div>
            <div className="clearfix" />
          </div>
          <div className="card-body">
            <table className="table table-condensed table-responsive table-hover">
              <thead>
                <tr>
                  <th>Result Name</th>
                  <th>Approved</th>
                  <th>Semester</th>
                  <th>Date Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {this.state.results.length ? (
                  this.state.results.map(result => (
                    <tr key={result.id}>
                      <td className="font-montserrat all-caps fs-12 w-10">
                        {result.course.code} Results{' '}
                      </td>

                      <td className="text-middle  w-15">
                        <span className="hint-text small">Yes</span>
                      </td>
                      <td className="w-25">
                        <span className="font-montserrat fs-18">
                          {result.semester.name}
                        </span>
                      </td>
                      <td className="w-15">
                        <span className="font-montserrat fs-18">
                          {result.created_at}{' '}
                        </span>
                      </td>
                      <td className="w-10">
                        <a href={`course-results?id=${result.id}`}>
                          View Results
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>No records found</tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    );
  }
}
export default Results;
