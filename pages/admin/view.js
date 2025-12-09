import React from "react";
import Layout from "../../components/Layout";
import EditModal, { updateStaff } from "../../components/staff/EditModal";
import ChangePasswordModal, {
  updatePassword
} from "../../components/ChangePasswordModal";
import { getStaffByUserId, updateUserAvatar } from "../../helpers/FetchWrapper";
import { protectPage } from "../../helpers/utils";
import StaffProfile from "../../components/StaffProfile";
import { updateStaffProfile } from "../../helpers/profile";
import createCloudinary from "../../helpers/createCloudinary";
import { FilePond, registerPlugin } from "react-filepond";

import "filepond/dist/filepond.min.css";
import "filepond-plugin-file-poster/dist/filepond-plugin-file-poster.css";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import FilePondPluginFilePoster from "filepond-plugin-file-poster";

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFilePoster
);

class AdminView extends React.Component {
  // state = {
  //   staff: this.props.staff
  // };

  state = {
    staff: this.props.staff,
    user: this.props.user,
    edit: true,
    data: {}
  };

  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["ADMIN", "SUPERADMIN"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    // const { staff } = await getStaffByUserId(userId, req);

    let staff, user;

    try {
      staff = await fetch(
        `${process.env.API_URL}/api/staff?user_id=${userId}`,
        {
          method: "get",
          credentials: "include",
          headers:
            req && req.headers && req.headers.cookie
              ? { cookie: req.headers.cookie }
              : {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*"
                }
        }
      );

      staff = staff.status === 200 ? await staff.json() : {};
      user = await await fetch(`${process.env.API_URL}/api/user/${userId}`, {
        method: "get",
        credentials: "include",
        headers: req
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
      });

      user = user.status === 200 ? await user.json() : {};
    } catch (e) {
      console.log(e);
    }

    return { staff, userData, user };
  };

  onChange = e => {
    e.preventDefault();
    const { name, value } = e.target;
    this.setState({
      data: {
        ...this.state.user,
        [name]: value
      }
    });
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
  editHandler = e => {
    e.preventDefault();
    this.setState({
      edit: !this.state.edit
    });
  };

  handleUpdate = async () => {
    if (Object.keys(this.state.data).length === 0) {
      return null;
    }
    const user = await updateStaffProfile(this.state.data);
    // console.log(user);
    if (user.error || user === null) {
      return null;
    }
    this.setState({
      user,
      edit: !this.state.edit
    });
  };

  // handleSubmit = async e => {
  //   const result = await updateStaff(this.state);

  //   this.setState({
  //     staff: result.updatedStaff
  //   });
  // };

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
      <Layout pageTitle="Admin Profile" userData={this.props.userData}>
        <div>
          <div>
            {/* START card */}
            <section className="">
              <div className="container">
                <div className="row ">
                  <div
                    className="col-lg-8  mt-2 "
                    style={{ marginLeft: "auto", marginRight: "auto" }}
                  >
                    <div className="card py-3 m-b-30">
                      <div
                        className="col-lg-4  mt-2 "
                        style={{
                          marginLeft: "auto",
                          width: "200px",
                          marginRight: "auto"
                        }}
                      >
                        <FilePond
                          files={
                            this.state.staff && this.state.user.avatar
                              ? [
                                  {
                                    // the server file reference
                                    source: this.state.user.avatar,

                                    // set type to local to indicate an already uploaded file
                                    options: {
                                      type: "limbo",
                                      metadata: {
                                        poster: this.state.user.avatar
                                      }
                                    }
                                  }
                                ]
                              : null
                          }
                          required
                          ref={ref => (this.pond = ref)}
                          allowMultiple={false}
                          maxFiles={1}
                          server={createCloudinary(
                            "emergingplatforms",
                            "ilearn",
                            "avatar", // tag for upload
                            async secure_url => {
                              //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend
                              await updateUserAvatar(
                                secure_url,
                                this.state.user.id
                              );
                              this.setState({
                                user: {
                                  ...this.state.user,
                                  avatar: secure_url
                                }
                              });
                            }
                          )}
                          // oninit={() => this.handleInit()}
                        />
                      </div>

                      <StaffProfile
                        staff={this.state.staff}
                        user={this.state.user}
                        editHandler={this.editHandler}
                        edit={this.state.edit}
                        onChange={this.onChange}
                        handleUpdate={this.handleUpdate}
                        handleChange={this.handleChange}
                        handleSubmitPassword={this.handleSubmitPassword}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* END card */}
          </div>
        </div>
        {/* Popup for Edit staff Profile  */}
      </Layout>
    );
  }
}
export default AdminView;
