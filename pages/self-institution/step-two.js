import React from "react";
import { Form, Container, Nav } from "react-bootstrap";
import Head from "next/head";
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
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import Router from "next/router";
// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFilePoster,
  FilePondPluginFileValidateType
);

import { DatePicker } from "@fluentui/react";
import { initializeIcons } from "@fluentui/react";
import toast from "react-hot-toast";
initializeIcons();

class StepTwo extends React.Component {
  state = {
    myInstitutionUser: {},
  };
  static getInitialProps = async ({ req, res, query, ...ctx }) => {
    if (!query?.token) {
      res.writeHead(302, {
        Location: "/signin?logout=1",
      });
      return res.end();
    }
    return { token: query.token };
  };

  handleChange = (e) => {
    const { name, value } = e.target;

    this.setState({
      myInstitutionUser: {
        ...this.state.myInstitutionUser,
        [name]: value,
      },
    });
  };

  handleInit = () => {
    console.log("FilePond instance has initialised", this.pond);
  };

  _onSelectDate = (date) => {
    this.setState({ value: date });
  };

  _onFormatDate = (date) => {
    return (
      (date.getFullYear() % 100) +
      "-" +
      (date.getMonth() + 1) +
      "-" +
      date.getDate()
    );
  };

  handleDoB = (value) =>
    this.setState({
      myInstitutionUser: { ...this.state.myInstitutionUser, dob: value },
    });

  _onParseDateFromString = (value) => {
    const date = this.state.value || new Date();
    const values = (value || "").trim().split("/");
    const day =
      values.length > 0
        ? Math.max(1, Math.min(31, parseInt(values[0], 10)))
        : date.getDate();
    const month =
      values.length > 1
        ? Math.max(1, Math.min(12, parseInt(values[1], 10))) - 1
        : date.getMonth();
    let year = values.length > 2 ? parseInt(values[2], 10) : date.getFullYear();
    if (year < 100) {
      year += date.getFullYear() - (date.getFullYear() % 100);
    }
    return new Date(year, month, day);
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    this.state.myInstitutionUser.token = this.props.token;

    const result = await fetch(
      `${process.env.API_URL}/api/selfInstitution/newUser`,
      {
        method: "post",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(this.state.myInstitutionUser),
      }
    );

    if (result.status === 200) {
      toast.success(
        "User Added Successfully successfully activated. Please login to your account",
        { icon: "✅" }
      );

      Router.replace("/signin?logout=1");
      return;
    } else {
      toast.error("Failed. Please confirm you filled all fields.");
    }
  };

  render() {
    return (
      <>
        <Head>
          <meta httpEquiv="content-type" content="text/html;charset=UTF-8" />
          <meta charSet="utf-8" />
          <title>Activate Your First User</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no"
          />
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-touch-fullscreen" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />
          <meta content="" name="description" />
          <meta content="" name="author" />

          <link
            href="/assets/plugins/bootstrap/css/bootstrap.min.css"
            rel="stylesheet"
            type="text/css"
          />
          <link
            href="/assets/plugins/font-awesome/css/font-awesome.css"
            rel="stylesheet"
            type="text/css"
          />
          <link
            href="/pages/css/pages-icons.css"
            rel="stylesheet"
            type="text/css"
          />
          <link
            className="main-stylesheet"
            href="/pages/css/pages.css"
            rel="stylesheet"
            type="text/css"
          />
          <link
            className="main-stylesheet"
            href="/custom/css/style.css"
            rel="stylesheet"
            type="text/css"
          />
        </Head>{" "}
        <Container>
          <Nav className="my-5">
            <div className="brand inline">
              <a
                style={{
                  display: "inline-block",
                  font: "20px Helvetica,Arial,Verdana,Sans-Serif",
                  fontWeight: "bold",
                  margin: "20",
                  padding: "20",
                  color: "#333",
                }}
              >
                iLearn
              </a>
            </div>
          </Nav>

          <Form
            onSubmit={async (e) => {
              await this.handleSubmit(e);
            }}
            className="form-row"
          >
            <Form.Group className=" col-md-4">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                placeholder="John"
                className="form-control"
                value={this.state?.myInstitutionUser?.first_name ?? ""}
                required
                onChange={this.handleChange}
              />
            </Form.Group>
            <Form.Group className=" col-md-4">
              <Form.Label>Other Name</Form.Label>
              <Form.Control
                type="text"
                name="other_name"
                className="form-control"
                placeholder="Middle Name"
                value={this.state?.myInstitutionUser?.other_name ?? ""}
                required
                onChange={this.handleChange}
              />
            </Form.Group>
            <Form.Group className=" col-md-4">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                placeholder="Smith"
                value={this.state?.myInstitutionUser?.last_name ?? ""}
                className="form-control"
                required
                onChange={this.handleChange}
              />
            </Form.Group>
            <Form.Group className=" col-md-4">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                className="form-control"
                value={this.state?.myInstitutionUser?.username ?? ""}
                placeholder="Username"
                onChange={this.handleChange}
                required
              />
            </Form.Group>
            <Form.Group className=" col-md-4">
              <Form.Group htmlFor={`deparment`}>Password</Form.Group>
              <Form.Control
                type="password"
                value={this.state?.myInstitutionUser?.password ?? ""}
                className="form-control bold"
                name="password"
                onChange={this.handleChange}
                required
              />
            </Form.Group>
            <Form.Group className=" col-md-4">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={this.state?.myInstitutionUser?.email ?? ""}
                className="form-control bold"
                name="email"
                onChange={this.handleChange}
                required
              />
            </Form.Group>
            <Form.Group className=" col-md-4">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="number"
                className="form-control bold"
                value={this.state?.myInstitutionUser?.phone ?? ""}
                name="phone"
                onChange={this.handleChange}
                required
              />
            </Form.Group>
            <Form.Group className=" col-md-4">
              <Form.Label>Gender</Form.Label>
              <Form.Control
                as="select"
                name="gender"
                value={this.state?.myInstitutionUser?.gender ?? ""}
                className="form-control"
                onChange={this.handleChange}
                required
              >
                <option>Please select an option</option>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="col-md-4">
              <div>
                <Form.Label>Date of Birth</Form.Label>
                {process.browser && (
                  <DatePicker
                    value={
                      this.state?.myInstitutionUser?.dob
                        ? new Date(this.state.myInstitutionUser.dob)
                        : ""
                    }
                    isRequired={true}
                    placeholder="Select a date..."
                    ariaLabel="Select a date"
                    maxDate={new Date()}
                    allowTextInput={true}
                    onSelectDate={this.handleDoB}
                    // formatDate={this._onFormatDate}
                    parseDateFromString={this._onParseDateFromString}
                  />
                )}
              </div>
            </Form.Group>

            <Form.Group className=" col-md-6">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows="4"
                name="address"
                value={this.state?.myInstitutionUser?.address ?? ""}
                className="form-control"
                onChange={this.handleChange}
                required
              />
            </Form.Group>

            <Form.Group className=" col-md-6">
              <Form.Label htmlFor={`avatar`}>Profile Picture </Form.Label>
              <div>
                <div className="row">
                  <div className="col-md-4">
                    <FilePond
                      ref={(ref) => (this.pond = ref)}
                      allowMultiple={false}
                      files={
                        this.state.myInstitutionUser.avatar
                          ? [
                              {
                                // the server file reference
                                source: this.state.myInstitutionUser.avatar,
                                // set type to local to indicate an already uploaded file
                                options: {
                                  type: "limbo",
                                  metadata: {
                                    poster: this.state.myInstitutionUser.avatar,
                                  },
                                },
                              },
                            ]
                          : null
                      }
                      maxFiles={1}
                      name="avatar"
                      acceptedFileTypes={["image/*"]}
                      server={createCloudinary(
                        "emergingplatforms",
                        "ilearn",
                        "avatar", // tag for upload
                        async (secure_url) => {
                          //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend

                          this.setState({
                            myInstitutionUser: {
                              ...this.state.myInstitutionUser,
                              avatar: secure_url,
                            },
                          });
                        }
                      )}
                      oninit={() => this.handleInit()}
                      required
                    />
                  </div>
                </div>
              </div>
            </Form.Group>
            <Form.Group>
              <button type="submit" className="btn btn-success px-5">
                Activate User
              </button>
            </Form.Group>
          </Form>

          <style jsx>
            {`
              .avatar-input {
                position: relative;
                overflow: hidden;
              }
              .avatar {
                position: relative;
                display: inline-block;
              }
              .avatar-xl {
                width: 5.125rem;
                height: 5.125rem;
              }
              .avatar {
                width: 3rem;
                height: 3rem;
              }
              .avatar-img {
                width: 100%;
                height: 100%;
                -o-object-fit: cover;
                object-fit: cover;
              }

              .avatar-input .avatar-input-icon {
                position: absolute;
                top: 0;
                display: flex;
                width: 100%;
                height: 100%;
                transition: all ease 0.2s;
                opacity: 0;
                color: #fff;
                background: rgba(0, 0, 0, 0.37);
                justify-content: center;
                align-items: center;
              }

              .avatar-input .avatar-file-picker {
                position: absolute;
                z-index: 2;
                width: 1px;
                height: 1px;
                margin: 0;
                opacity: 0;
              }
            `}
          </style>
        </Container>
      </>
    );
  }
}

const ToastWrapper = (props) => {
  return <StepTwo {...props} />;
};
ToastWrapper.getInitialProps = StepTwo.getInitialProps;

export default ToastWrapper;
