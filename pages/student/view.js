import React from "react";
import Layout from "../../components/Layout";
import UpdateProfile from "../../components/UpdateProfile";
import StudentView from "./view";
import { protectPage } from "../../helpers/utils";
import {
  getStudentByUserId,
  getStaffByUserId,
  getStudentById,
  updateUserAvatar,
  getInstituionByParams,
} from "../../helpers/FetchWrapper";
import { updateProfile } from "../../helpers/profile";
import createCloudinary from "../../helpers/createCloudinary";
import { FilePond, registerPlugin } from "react-filepond";
// Import FilePond styles

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

class studentView extends React.Component {
  state = {
    student: this.props.student,
    user: this.props.user,
    edit: true,
    data: {},
  };
  static getInitialProps = async ({ req, res, query, ...ctx }) => {
    const allowedRoles = ["STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );
    let student = await getStudentByUserId(userId, req);
    let institution = await getInstituionByParams(
      { id: userData.institution_id },
      ctx
    );

    let user = await (
      await fetch(`${process.env.API_URL}/api/user/${userId}`, {
        method: "get",
        credentials: "include",
        headers: req
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
      })
    ).json();

    return { student, userData, user, institution };
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      student: {
        ...this.state.student,
        [name]: value,
      },
    });
  };

  editHandler = (e) => {
    e.preventDefault();
    this.setState({
      edit: !this.state.edit,
    });
  };

  onChange = (e) => {
    e.preventDefault();
    const { name, value, defaultValue } = e.target;
    this.setState({
      data: {
        ...this.state.user,
        [name]: value,
      },
    });
  };

  handleUpdate = async () => {
    if (Object.keys(this.state.data).length === 0) {
      return null;
    }
    const user = await updateProfile(this.state.data);
    // console.log(user);
    if (user.error || user === null) {
      return null;
    }
    this.setState({
      user,
      edit: !this.state.edit,
    });
  };
  handleSubmitPassword = async (e) => {
    const userData = {
      user_id: this.state.student.user_id,
      current_password: this.state.student.current_password,
      new_password: this.state.student.password,
      confirm_password: this.state.student.confirm_password,
    };
    const result = await updatePassword(userData);
  };

  render() {
    return (
      <Layout pageTitle="Student Details" userData={this.props.userData}>
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
                    {" "}
                    <div
                      className="col-lg-4  mt-2 "
                      style={{ marginLeft: "auto", marginRight: "auto" }}
                    >
                      <FilePond
                        files={
                          this.state.student && this.state.user.avatar
                            ? [
                                {
                                  // the server file reference
                                  source: this.state.user.avatar,

                                  // set type to local to indicate an already uploaded file
                                  options: {
                                    type: "limbo",
                                    metadata: {
                                      poster: this.state.user.avatar,
                                    },
                                  },
                                },
                              ]
                            : null
                        }
                        required
                        ref={(ref) => (this.pond = ref)}
                        allowMultiple={false}
                        maxFiles={1}
                        server={createCloudinary(
                          "emergingplatforms",
                          "ilearn",
                          "avatar", // tag for upload
                          async (secure_url) => {
                            //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend
                            await updateUserAvatar(
                              secure_url,
                              this.state.user.id
                            );
                            this.setState({
                              user: {
                                ...this.state.user,
                                avatar: secure_url,
                              },
                            });

                            console.log(secure_url);
                          }
                        )}
                        // oninit={() => this.handleInit()}
                      />
                    </div>
                    <UpdateProfile
                      student={this.state.student}
                      user={this.state.user}
                      editHandler={this.editHandler}
                      edit={this.state.edit}
                      onChange={this.onChange}
                      handleUpdate={this.handleUpdate}
                      handleChange={this.handleChange}
                      handleSubmitPassword={this.handleSubmitPassword}
                      institution={this.props.institution}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* END card */}
        </div>
      </Layout>
    );
  }
}

export default studentView;
