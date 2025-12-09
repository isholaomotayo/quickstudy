import React from "react";
import Layout from "../../components/Layout";
import { protectPage } from "../../helpers/utils";
import {
  getStaffByUserId,
  getInstitutionById,
  updateInstitution,
  getInstituionByParams
} from "../../helpers/FetchWrapper";

import { Form, Col, Container } from "react-bootstrap";

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

// Register the plugins
registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFilePoster,
  FilePondPluginFileValidateType
);

class InstitutionView extends React.Component {
  state = {
    department: this.props.institution,
    disabled: true,
    myInstitution: this.props.myInstitution,
    type: "front"
  };

  static getInitialProps = async ({ req, res, query, ...ctx }) => {
    const allowedRoles = ["ADMIN", "SUPERADMIN"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let myInstitution;
    const { staff } = await getStaffByUserId(userId, req);

    const institutionId = staff ? staff.user.institution_id : 0;

    const { institution } = await getInstitutionById(institutionId, req);

    myInstitution = await getInstituionByParams(
      { id: userData.institution_id },
      ctx
    );

    return { staff, userData, institution, myInstitution };
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({
      myInstitution: {
        ...this.state.myInstitution,
        [name]: value
      }
    });
  };

  handleSubmit = async e => {
    e.preventDefault();
    const result = await updateInstitution(this.state.myInstitution, false);

    this.setState({
      myInstitution: result.updatedInstitution,
      disabled: true
    });
  };

  handleIdCardUpload = (type = "front", url) => {
    this.setState({
      myInstitution: {
        ...this.state.myInstitution,
        id_card: {
          ...this.state.myInstitution.id_card,
          [type]: url
        }
      }
    });
  };

  handleInit = () => {
    console.log("FilePond instance has initialised", this.pond);
  };
  render() {
    const idCards =
      this.state.myInstitution.id_card &&
      Object.keys(this.state.myInstitution.id_card).length > 0
        ? Object.keys(this.state.myInstitution.id_card).length === 1
          ? [
              {
                // the server file reference
                source: this.state.myInstitution.id_card.front,
                // set type to local to indicate an already uploaded file
                options: {
                  type: "limbo",
                  metadata: {
                    poster: this.state.myInstitution.id_card.front
                  }
                }
              }
            ]
          : [
              {
                // the server file reference
                source: this.state.myInstitution.id_card.back,
                // set type to local to indicate an already uploaded file
                options: {
                  type: "limbo",
                  metadata: {
                    poster: this.state.myInstitution.id_card.back
                  }
                }
              },
              {
                // the server file reference
                source: this.state.myInstitution.id_card.front,
                // set type to local to indicate an already uploaded file
                options: {
                  type: "limbo",
                  metadata: {
                    poster: this.state.myInstitution.id_card.front
                  }
                }
              }
            ]
        : null;
    return (
      <Layout pageTitle="Institution Details" userData={this.props.userData}>
        <div>
          {/* START card */}
          <div className="card card-default m-t-20">
            <div className="card-header "></div>
            {this.state.disabled && (
              <div className="row  mx-3">
                <div className="col ">
                  <button
                    className="btn btn-primary float-right px-5"
                    onClick={() => this.setState({ disabled: false })}
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
            <div className="card-body">
              <Container>
                <Form onSubmit={async e => this.handleSubmit(e)}>
                  <fieldset disabled={this.state.disabled}>
                    {!this.state.disabled && (
                      <Form.Group>
                        <button type="submit" className="btn btn-success px-5">
                          Submit
                        </button>
                        <button
                          className="btn btn-primary float-right px-5"
                          onClick={() =>
                            this.setState({ disabled: !this.state.disabled })
                          }
                        >
                          Cancel
                        </button>
                      </Form.Group>
                    )}
                    <Form.Group>
                      <Form.Label>Institution Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        defaultValue={this.state.myInstitution.name}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Institution Code</Form.Label>
                      <Form.Control
                        type="text"
                        name="code"
                        defaultValue={this.state.myInstitution.code}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Institution Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="address"
                        defaultValue={this.state.myInstitution.address}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Institution Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        defaultValue={this.state.myInstitution.email}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Institution Phone</Form.Label>
                      <Form.Control
                        type="number"
                        name="phone"
                        defaultValue={this.state.myInstitution.phone}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Institution Motto</Form.Label>
                      <Form.Control
                        type="text"
                        name="motto"
                        defaultValue={this.state.myInstitution.motto}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Institution Website</Form.Label>
                      <Form.Control
                        type="url"
                        name="website"
                        defaultValue={this.state.myInstitution.website}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Institution Twitter</Form.Label>
                      <Form.Control
                        type="url"
                        name="twitter"
                        defaultValue={this.state.myInstitution.twitter}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Institution Facebook</Form.Label>
                      <Form.Control
                        type="url"
                        name="facebook"
                        defaultValue={this.state.myInstitution.facebook}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Institution Youtube</Form.Label>
                      <Form.Control
                        type="url"
                        name="youtube"
                        defaultValue={this.state.myInstitution.youtube}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Institution Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        defaultValue={this.state.myInstitution.description}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Institution Support Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="support_mail"
                        defaultValue={this.state.myInstitution.support_mail}
                        onChange={this.handleChange}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Institution Admission Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="admission_mail"
                        defaultValue={this.state.myInstitution.admission_mail}
                        onChange={this.handleChange}
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
                                  ref={ref => (this.pond = ref)}
                                  allowMultiple={false}
                                  files={
                                    this.state.myInstitution.logo
                                      ? [
                                          {
                                            // the server file reference
                                            source: this.state.myInstitution
                                              .logo,
                                            // set type to local to indicate an already uploaded file
                                            options: {
                                              type: "limbo",
                                              metadata: {
                                                poster: this.state.myInstitution
                                                  .logo
                                              }
                                            }
                                          }
                                        ]
                                      : null
                                  }
                                  maxFiles={1}
                                  name="logo"
                                  acceptedFileTypes={["image/*"]}
                                  server={createCloudinary(
                                    "emergingplatforms",
                                    "ilearn",
                                    "Institution Logo", // tag for upload
                                    async secure_url => {
                                      //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend

                                      this.setState({
                                        myInstitution: {
                                          ...this.state.myInstitution,
                                          logo: secure_url
                                        }
                                      });
                                    }
                                  )}
                                  oninit={() => this.handleInit()}
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
                                    this.state.myInstitution.school_calendar
                                      ? [
                                          {
                                            // the server file reference
                                            source: this.state.myInstitution
                                              .school_calendar,
                                            // set type to local to indicate an already uploaded file
                                            options: {
                                              type: "limbo",
                                              metadata: {
                                                poster: this.state.myInstitution
                                                  .school_calendar
                                              }
                                            }
                                          }
                                        ]
                                      : null
                                  }
                                  ref={ref => (this.pond = ref)}
                                  allowMultiple={false}
                                  maxFiles={1}
                                  name="school_calendar"
                                  acceptedFileTypes={["application/pdf"]}
                                  server={createCloudinary(
                                    "emergingplatforms",
                                    "ilearn",
                                    "Institution Calendar", // tag for upload
                                    async secure_url => {
                                      //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend

                                      this.setState({
                                        myInstitution: {
                                          ...this.state.myInstitution,
                                          school_calendar: secure_url
                                        }
                                      });
                                    }
                                  )}
                                  oninit={() => this.handleInit()}
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
                                  ref={ref => (this.pond = ref)}
                                  files={
                                    this.state.myInstitution.director_signature
                                      ? [
                                          {
                                            // the server file reference
                                            source: this.state.myInstitution
                                              .director_signature,
                                            // set type to local to indicate an already uploaded file
                                            options: {
                                              type: "limbo",
                                              metadata: {
                                                poster: this.state.myInstitution
                                                  .director_signature
                                              }
                                            }
                                          }
                                        ]
                                      : null
                                  }
                                  allowMultiple={false}
                                  maxFiles={1}
                                  name="director_signature"
                                  server={createCloudinary(
                                    "emergingplatforms",
                                    "ilearn",
                                    "Institution Calendar", // tag for upload
                                    async secure_url => {
                                      //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend

                                      this.setState({
                                        myInstitution: {
                                          ...this.state.myInstitution,
                                          director_signature: secure_url
                                        }
                                      });
                                    }
                                  )}
                                  acceptedFileTypes={["image/*"]}
                                  oninit={() => this.handleInit()}
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
                              onChange={e =>
                                this.setState({
                                  type: e.target.value
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
                              onChange={e =>
                                this.setState({
                                  type: e.target.value
                                })
                              }
                            />
                          </Col>
                          <div>
                            <div className="row">
                              <div className="col-md-4">
                                <FilePond
                                  files={idCards}
                                  ref={ref => (this.pond = ref)}
                                  allowMultiple={false}
                                  maxFiles={2}
                                  name="id_card"
                                  required
                                  acceptedFileTypes={["image/*"]}
                                  server={createCloudinary(
                                    "emergingplatforms",
                                    "ilearn",
                                    "Institution ID Card", // tag for upload
                                    async secure_url => {
                                      //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend

                                      this.handleIdCardUpload(
                                        this.state.type,
                                        secure_url
                                      );
                                    }
                                  )}
                                  oninit={() => this.handleInit()}
                                />
                              </div>
                            </div>
                          </div>
                        </Form.Group>
                      </Col>
                    </Form.Row>

                    {!this.state.disabled && (
                      <Form.Group>
                        <button type="submit" className="btn btn-success px-5">
                          Submit
                        </button>
                        <button
                          className="btn btn-primary float-right px-5"
                          onClick={() =>
                            this.setState({ disabled: !this.state.disabled })
                          }
                        >
                          Cancel
                        </button>
                      </Form.Group>
                    )}
                  </fieldset>

                  {this.state.disabled && (
                    <div className="row my-2 mx-3">
                      <div className="col ">
                        <button
                          className="btn btn-primary  px-5"
                          onClick={() => this.setState({ disabled: false })}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  )}
                </Form>
              </Container>
            </div>
          </div>
          {/* END card */}
        </div>
      </Layout>
    );
  }
}
export default InstitutionView;
