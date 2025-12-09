import React from "react";
import HodLayout from "../../components/HodLayout";
import EditDeptModal, {
  updateDepartment
} from "../../components/staff/EditInstModal";
import fetch from "isomorphic-unfetch";

class DepartmentView extends React.Component {
  state = {
    department: this.props.staff.department
  };

  static getInitialProps = async () => {
    // const { id } = context.query;
    const staffId = 2;

    let staff = await (
      await fetch(`${process.env.API_URL}/api/staff/${staffId}`, {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      })
    ).json();

    return { staff };
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({
      department: {
        ...this.state.department,
        [name]: value
      }
    });
  };

  handleSubmit = async e => {
    const result = await updateDepartment(this.state);

    this.setState({
      department: result.updatedDepartment
    });
  };

  render() {
    return (
      <HodLayout pageTitle="Department Details">
        <div>
          {/* START card */}
          <div className="card card-default m-t-20">
            <div className="card-header ">
              <div>
                <EditDeptModal
                  handleChange={this.handleChange}
                  handleSubmit={this.handleSubmit}
                  department={this.state.department}
                />
              </div>
            </div>

            <div className="card-body">
              {this.state.department ? (
                <table className="table table-borderless table-condensed ">
                  <tbody>
                    <tr>
                      <th className="v-align-middle">Name</th>
                      <td className="v-align-middle">
                        <p>{this.state.department.name}</p>
                      </td>
                    </tr>
                    <tr>
                      <th className="v-align-middle">Code</th>
                      <td className="v-align-middle">
                        {this.state.department.code}
                      </td>
                    </tr>
                    <tr>
                      <th className="v-align-middle">Faculty/School</th>
                      <td className="v-align-middle">
                        {this.state.department.faculty.name}
                      </td>
                    </tr>
                    <tr>
                      <th className="v-align-middle">Email</th>
                      <td className="v-align-middle">
                        {this.state.department.email}
                      </td>
                    </tr>
                    <tr>
                      <th className="v-align-middle">Phone</th>
                      <td className="v-align-middle">
                        {this.state.department.phone}
                      </td>
                    </tr>
                    <tr>
                      <th className="v-align-middle">Description</th>
                      <td className="v-align-middle">
                        {this.state.department.description}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p>No Record found</p>
              )}
            </div>
          </div>
          {/* END card */}
        </div>
      </HodLayout>
    );
  }
}
export default DepartmentView;
