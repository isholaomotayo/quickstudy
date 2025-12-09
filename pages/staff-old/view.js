import React from "react";
import Layout from '../../components/Layout';
import EditModal, { updateStaff } from '../../components/staff/EditModal';
import ChangePasswordModal, {
  updatePassword
} from '../../components/ChangePasswordModal';
import { getStaffByUserId } from '../../helpers/FetchWrapper';
import { protectPage } from '../../helpers/utils';

class StaffView extends React.Component {
  state = {
    staff: this.props.staff
  };

  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ['STAFF'];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    const { staff } = await getStaffByUserId(userId, req);

    return { staff, userData };
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({
      staff: {
        ...this.state.staff,
        [name]: value
      }
    });
  };

  handleSubmit = async e => {
    const result = await updateStaff(this.state);

    this.setState({
      staff: result.updatedStaff
    });
  };

  handleSubmitPassword = async e => {
    const userData = {
      user_id: this.state.staff.user_id,
      current_password: this.state.staff.current_password,
      new_password: this.state.staff.password,
      confirm_password: this.state.staff.confirm_password
    };
    const result = await updatePassword(userData);
  };

  render() {
    return (
      <Layout pageTitle="Staff Profile" userData={this.props.userData}>
        <div>
          {/* START card */}
          <div className="card card-default m-t-20">
            <div></div>
            <div className="card-header ">
              <div className="card-title text-center">
                <img
                  className="image-responsive-height image-responsive-width"
                  src="/custom/img/default-user.png"
                  alt="User"
                />
              </div>

              <div>
                <EditModal
                  handleChange={this.handleChange}
                  handleSubmit={this.handleSubmit}
                  staff={this.state.staff}
                />

                <ChangePasswordModal
                  handleChange={this.handleChange}
                  handleSubmit={this.handleSubmitPassword}
                />
              </div>
            </div>
            <div className="card-body">
              <table className="table table-borderless table-condensed">
                <tbody>
                  <tr className="row">
                    <td>
                      <legend>Academic Details</legend>
                    </td>
                  </tr>
                  <tr>
                    <th className="v-align-middle">Staff No</th>
                    <td className="v-align-middle">
                      <p>{this.state.staff.staff_no}</p>
                    </td>
                  </tr>
                  <tr>
                    <th className="v-align-middle">Department</th>
                    <td className="v-align-middle">
                      <p>{this.state.staff.department.name}</p>
                    </td>
                  </tr>
                  <tr>
                    <th className="v-align-middle">Level</th>
                    <td className="v-align-middle">{this.state.staff.level}</td>
                  </tr>
                  <tr>
                    <th className="v-align-middle">Designation</th>
                    <td className="v-align-middle">
                      {this.state.staff.designation}
                    </td>
                  </tr>
                  <tr className="row">
                    <td>
                      <legend>Personal Details</legend>
                    </td>
                  </tr>
                  <tr>
                    <th className="v-align-middle">Name</th>
                    <td className="v-align-middle">
                      <p>
                        {this.state.staff.user.first_name}{' '}
                        {this.state.staff.user.last_name}
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <th className="v-align-middle">Email</th>
                    <td className="v-align-middle">
                      {this.state.staff.user.email}
                    </td>
                  </tr>
                  <tr>
                    <th className="v-align-middle">Phone</th>
                    <td className="v-align-middle">
                      {this.state.staff.user.phone}
                    </td>
                  </tr>
                  <tr>
                    <th className="v-align-middle">Address</th>
                    <td className="v-align-middle">
                      {this.state.staff.address}
                    </td>
                  </tr>
                  <tr>
                    <th className="v-align-middle">Gender</th>
                    <td className="v-align-middle">
                      {this.state.staff.gender}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* END card */}
        </div>
        {/* Popup for Edit staff Profile  */}
      </Layout>
    );
  }
}
export default StaffView;
