import React from "react";
import { Form, Col, Container, Nav } from "react-bootstrap";
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
import toast from "react-hot-toast";
import Router from "next/router";
// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFilePoster,
  FilePondPluginFileValidateType
);

class Index extends React.Component {
  state = {
    disabled: true,
    myInstitution: {},
    type: "front",
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      myInstitution: {
        ...this.state.myInstitution,
        [name]: value,
      },
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    this.state.myInstitution.token = this.props.token;

    const result = await fetch(
      `${process.env.API_URL}/api/selfInstitution/update`,
      {
        method: "put",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(this.state.myInstitution),
      }
    );

    if (result.status === 200) {
      toast.success("Institution successfully activated");

      Router.replace(`/self-institution/step-two?token=${this.props.token}`);
      return;
    } else {
      toast.error("Failed. Please confirm you filled all fields.");
    }
  };

  handleIdCardUpload = (type = "front", url) => {
    this.setState({
      myInstitution: {
        ...this.state.myInstitution,
        id_card: {
          ...this.state.myInstitution.id_card,
          [type]: url,
        },
      },
    });
  };

  handleInit = () => {
    console.log("FilePond instance has initialised", this.pond);
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

  render() {
    const idCards =
      this.state.myInstitution?.id_card &&
      Object.keys(this.state.myInstitution.id_card).length > 0
        ? Object.keys(this.state.myInstitution.id_card).length === 1
          ? [
              {
                // the server file reference
                source:
                  this.state.myInstitution.id_card?.front ??
                  this.state.myInstitution.id_card?.back,
                // set type to local to indicate an already uploaded file
                options: {
                  type: "limbo",
                  metadata: {
                    poster:
                      this.state.myInstitution.id_card?.front ??
                      this.state.myInstitution.id_card?.back,
                  },
                },
              },
            ]
          : [
              {
                // the server file reference
                source: this.state.myInstitution.id_card.back,
                // set type to local to indicate an already uploaded file
                options: {
                  type: "limbo",
                  metadata: {
                    poster: this.state.myInstitution.id_card.back,
                  },
                },
              },
              {
                // the server file reference
                source: this.state.myInstitution.id_card.front,
                // set type to local to indicate an already uploaded file
                options: {
                  type: "limbo",
                  metadata: {
                    poster: this.state.myInstitution.id_card.front,
                  },
                },
              },
            ]
        : null;
    return (
      <>
        <Head>
          <meta httpEquiv="content-type" content="text/html;charset=UTF-8" />
          <meta charSet="utf-8" />
          <title>Activate Your Institution</title>
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
        </Head>
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
          <h2>Setup Your Institution</h2>
          <Form onSubmit={async (e) => await this.handleSubmit(e)}>
            <fieldset>
              <Form.Group>
                <Form.Label>Institution Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={this.state?.myInstitution?.name ?? ""}
                  onChange={this.handleChange}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Institution Code</Form.Label>
                <Form.Control
                  type="text"
                  name="code"
                  onChange={this.handleChange}
                  value={this.state?.myInstitution?.code ?? ""}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Institution Address</Form.Label>
                <Form.Control
                  as="textarea"
                  name="address"
                  value={this.state?.myInstitution?.address ?? ""}
                  onChange={this.handleChange}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Institution Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  onChange={this.handleChange}
                  value={this.state?.myInstitution?.email ?? ""}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Institution Phone</Form.Label>
                <Form.Control
                  type="number"
                  name="phone"
                  onChange={this.handleChange}
                  value={this.state?.myInstitution?.phone ?? ""}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Institution Motto</Form.Label>
                <Form.Control
                  type="text"
                  name="motto"
                  onChange={this.handleChange}
                  value={this.state?.myInstitution?.motto ?? ""}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Institution Website</Form.Label>
                <Form.Control
                  type="url"
                  name="website"
                  onChange={this.handleChange}
                  value={this.state?.myInstitution?.website ?? ""}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Institution Twitter</Form.Label>
                <Form.Control
                  type="url"
                  name="twitter"
                  onChange={this.handleChange}
                  value={this.state?.myInstitution?.twitter ?? ""}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Institution Facebook</Form.Label>
                <Form.Control
                  type="url"
                  name="facebook"
                  onChange={this.handleChange}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Institution Youtube</Form.Label>
                <Form.Control
                  type="url"
                  name="youtube"
                  onChange={this.handleChange}
                  vvalue={this.state?.myInstitution?.youtube ?? ""}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Institution Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  onChange={this.handleChange}
                  value={this.state?.myInstitution?.description ?? ""}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Institution Support Email</Form.Label>
                <Form.Control
                  type="email"
                  name="support_mail"
                  onChange={this.handleChange}
                  value={this.state?.myInstitution?.support_mail ?? ""}
                  required
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Institution Admission Email</Form.Label>
                <Form.Control
                  type="email"
                  name="admission_mail"
                  onChange={this.handleChange}
                  value={this.state?.myInstitution?.admission_mailb ?? ""}
                />
              </Form.Group>
              <Form.Row className="no-gutters">
                <Col>
                  <Form.Group>
                    <Form.Label>Institution Logo</Form.Label>
                    <div>
                      <div className="row">
                        <div className="col-md-4">
                          <FilePond
                            ref={(ref) => (this.pond = ref)}
                            allowMultiple={false}
                            files={
                              this.state.myInstitution?.logo && [
                                {
                                  // the server file reference
                                  source: this.state.myInstitution.logo,
                                  // set type to local to indicate an already uploaded file
                                  options: {
                                    type: "limbo",
                                    metadata: {
                                      poster: this.state.myInstitution.logo,
                                    },
                                  },
                                },
                              ]
                            }
                            maxFiles={1}
                            name="logo"
                            acceptedFileTypes={["image/*"]}
                            server={createCloudinary(
                              "emergingplatforms",
                              "ilearn",
                              "Institution Logo", // tag for upload
                              async (secure_url) => {
                                //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend

                                this.setState({
                                  myInstitution: {
                                    ...this.state.myInstitution,
                                    logo: secure_url,
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
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>Institution Calendar</Form.Label>
                    <div>
                      <div className="row">
                        <div className="col-md-4">
                          <FilePond
                            files={
                              this.state.myInstitution?.school_calendar && [
                                {
                                  // the server file reference
                                  source:
                                    this.state.myInstitution.school_calendar,
                                  // set type to local to indicate an already uploaded file
                                  options: {
                                    type: "limbo",
                                    metadata: {
                                      poster:
                                        this.state.myInstitution
                                          .school_calendar,
                                    },
                                  },
                                },
                              ]
                            }
                            ref={(ref) => (this.pond = ref)}
                            allowMultiple={false}
                            maxFiles={1}
                            name="school_calendar"
                            acceptedFileTypes={["application/pdf"]}
                            server={createCloudinary(
                              "emergingplatforms",
                              "ilearn",
                              "Institution Calendar", // tag for upload
                              async (secure_url) => {
                                //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend

                                this.setState({
                                  myInstitution: {
                                    ...this.state.myInstitution,
                                    school_calendar: secure_url,
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
                </Col>
              </Form.Row>
              <Form.Row>
                <Col>
                  <Form.Group>
                    <Form.Label>Director's Signature</Form.Label>
                    <div>
                      <div className="row">
                        <div className="col-md-4">
                          <FilePond
                            ref={(ref) => (this.pond = ref)}
                            files={
                              this.state.myInstitution?.director_signature && [
                                {
                                  // the server file reference
                                  source:
                                    this.state.myInstitution.director_signature,
                                  // set type to local to indicate an already uploaded file
                                  options: {
                                    type: "limbo",
                                    metadata: {
                                      poster:
                                        this.state.myInstitution
                                          .director_signature,
                                    },
                                  },
                                },
                              ]
                            }
                            allowMultiple={false}
                            maxFiles={1}
                            name="director_signature"
                            server={createCloudinary(
                              "emergingplatforms",
                              "ilearn",
                              "Institution Calendar", // tag for upload
                              async (secure_url) => {
                                //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend

                                this.setState({
                                  myInstitution: {
                                    ...this.state.myInstitution,
                                    director_signature: secure_url,
                                  },
                                });
                              }
                            )}
                            acceptedFileTypes={["image/*"]}
                            oninit={() => this.handleInit()}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group>
                    <Form.Label>ID Card</Form.Label>
                    <Col>
                      <Form.Check
                        type="radio"
                        inline
                        label="Front"
                        id="front"
                        name="id_card"
                        value="front"
                        onChange={(e) =>
                          this.setState({
                            type: e.target.value,
                          })
                        }
                      />
                      <Form.Check
                        type="radio"
                        inline
                        label="Back"
                        id="back"
                        name="id_card"
                        value="back"
                        onChange={(e) =>
                          this.setState({
                            type: e.target.value,
                          })
                        }
                      />
                    </Col>
                    <div>
                      <div className="row">
                        <div className="col-md-4">
                          <FilePond
                            files={idCards}
                            ref={(ref) => (this.pond = ref)}
                            allowMultiple={false}
                            maxFiles={2}
                            name="id_card"
                            required
                            acceptedFileTypes={["image/*"]}
                            server={createCloudinary(
                              "emergingplatforms",
                              "ilearn",
                              "Institution ID Card", // tag for upload
                              async (secure_url) => {
                                //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend

                                this.handleIdCardUpload(
                                  this.state.type,
                                  secure_url
                                );
                              }
                            )}
                            oninit={() => this.handleInit()}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </Form.Group>
                </Col>
              </Form.Row>

              <Form.Group>
                <button type="submit" className="btn btn-success px-5">
                  Activate Institution
                </button>
              </Form.Group>
            </fieldset>
          </Form>
        </Container>
      </>
    );
  }
}

const ToastWrapper = (props) => {
  return <Index {...props} />;
};
ToastWrapper.getInitialProps = Index.getInitialProps;

export default ToastWrapper;
