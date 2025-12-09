import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { updateUserAvatar } from "../helpers/FetchWrapper";
import createCloudinary from "../helpers/createCloudinary";
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

import { updateBulk } from "../helpers/manage-users/manageUser";

registerPlugin(
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview,
  FilePondPluginFilePoster
);

const EditAffiliateModal = props => {
  const { user = {} } = props;
  const [show, setShow] = useState(false);

  const [first_name, setFirstName] = useState(user.first_name);
  const [last_name, setLastName] = useState(user.last_name);
  const [other_name, setOtherName] = useState(user.other_name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [avatar, setAvatar] = useState(user.avatar);
  const [personal_info, setPersonalInfo] = useState(user.personal_info);
  const [account_active, setAccountActive] = useState(user.account_active);

  const [bank, setBank] = useState(user.affiliate.bank);
  const [account_no, setAccountNo] = useState(user.affiliate.account_no);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleCreation = async e => {
    e.preventDefault();

    const userData = {
      id: user.id,
      last_name,
      first_name,
      other_name,
      email,
      phone,
      avatar,
      personal_info,
      account_active
    };

    const updateData = {
      id: user.affiliate.id,
      bank,
      account_no
    };

    const data = await updateBulk(updateData, userData, "affiliate");

    delete data.affiliate.user;
    const person = data.user;
    person.affiliate = data.affiliate;
    props.handleUserUpdate(person);
    handleClose();
  };
  return (
    <>
      <Button
        className="btn btn-warning text-white btn-sm my-2"
        onClick={handleShow}
      >
        Edit
      </Button>
      <Modal
        show={show}
        onHide={handleClose}
        dialogClassName="modal-90w modal-w"
      >
        <form
          role="form"
          method="post"
          onSubmit={async e => {
            await handleCreation(e);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title className="mb-3">Edit A User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="form-row">
              <div className="form-group col-md-4">
                <div
                  className="col-lg-6  mt-2 "
                  style={{ marginLeft: "auto", marginRight: "auto" }}
                >
                  <FilePond
                    files={
                      props.user && props.user.avatar
                        ? [
                            {
                              // the server file reference
                              source:
                                props.user.avatar.length > 1
                                  ? props.user.avatar
                                  : "/custom/img/default-user.png",

                              // set type to local to indicate an already uploaded file
                              options: {
                                type: "limbo",
                                metadata: {
                                  poster: props.user.avatar
                                }
                              }
                            }
                          ]
                        : null
                    }
                    // ref={ref => (this.pond = ref)}
                    allowMultiple={false}
                    maxFiles={1}
                    server={createCloudinary(
                      "emergingplatforms",
                      "ilearn",
                      "avatar", // tag for upload
                      async secure_url => {
                        //put a function that doeas an API update there this will return the file destinationas url and you can save it in the backend
                        await updateUserAvatar(secure_url, props.user.id);
                        setAvatar(secure_url);
                      }
                    )}
                    // oninit={() => this.handleInit()}
                  />
                </div>
              </div>
            </div>
            <div className="container">
              <div className="row">
                <div className="col-sm-12 col-md-12">
                  <h3>Personal Information</h3>
                  <div className="form-row">
                    <div className="form-group col-md-4">
                      <label htmlFor="first_name">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="first_name"
                        name="first_name"
                        placeholder="First Name"
                        defaultValue={
                          user.hasOwnProperty("first_name") ? first_name : ""
                        }
                        onChange={e => {
                          setFirstName(e.target.value);
                        }}
                      />
                    </div>
                    <div className="form-group col-md-4">
                      <label htmlFor="last_name">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="last_name"
                        name="last_name"
                        placeholder="Last Name"
                        defaultValue={
                          user.hasOwnProperty("last_name") ? last_name : ""
                        }
                        onChange={e => {
                          setLastName(e.target.value);
                        }}
                      />
                    </div>
                    <div className="form-group col-md-4">
                      <label htmlFor="other_name">Other Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="other_name"
                        name="other_name"
                        placeholder="Other Name"
                        defaultValue={
                          user.hasOwnProperty("other_name") ? other_name : ""
                        }
                        onChange={e => {
                          setOtherName(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group col-md-4">
                      <label htmlFor="email">Email</label>
                      <input
                        type="text"
                        className="form-control"
                        id="email"
                        name="email"
                        defaultValue={user.hasOwnProperty("email") ? email : ""}
                        placeholder="Email"
                        onChange={e => {
                          setEmail(e.target.value);
                        }}
                      />
                    </div>
                    <div className="form-group col-md-4">
                      <label htmlFor="phone">Phone </label>
                      <input
                        type="number"
                        className="form-control"
                        id="phone"
                        name="phone"
                        placeholder="Phone no"
                        defaultValue={user.hasOwnProperty("phone") ? phone : ""}
                        onChange={e => {
                          setPhone(e.target.value);
                        }}
                      />
                    </div>
                    <div className="form-group col-md-4">
                      <label htmlFor="personal_info">
                        Personal Information
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={
                          user.hasOwnProperty("personal_info")
                            ? personal_info
                            : ""
                        }
                        id="personal_info"
                        name="personal_info"
                        placeholder=""
                        onChange={e => {
                          setPersonalInfo(e.target.value);
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-md-4">
                      <label htmlFor="Bank">Bank</label>
                      <input
                        type="text"
                        className="form-control"
                        id="Bank"
                        name="Bank"
                        defaultValue={
                          user.hasOwnProperty("affiliate")
                            ? user.affiliate.bank
                            : ""
                        }
                        placeholder="Bank"
                        onChange={e => {
                          setBank(e.target.value);
                        }}
                      />
                    </div>
                    <div className="form-group col-md-4">
                      <label htmlFor="account_no">Account No </label>
                      <input
                        type="number"
                        className="form-control"
                        id="account_no"
                        name="account_no"
                        placeholder="account No"
                        defaultValue={
                          user.hasOwnProperty("affiliate")
                            ? user.affiliate.account_no
                            : ""
                        }
                        onChange={e => {
                          setAccountNo(e.target.value);
                        }}
                      />
                    </div>
                    <div className="form-group col-md-4">
                      <label htmlFor="account_active">
                        Deactivate Account{" "}
                      </label>
                      <select
                        className="form-control"
                        name="account_active"
                        onChange={e => setAccountActive(e.target.value)}
                        defaultValue={
                          user.hasOwnProperty("account_active")
                            ? user.account_active
                            : ""
                        }
                      >
                        <option value={false}>Yes</option>
                        <option value={true}>No</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary btn-info" onClick={handleClose}>
              Close
            </Button>
            <Button type="submit" className="btn btn-success">
              Save Changes
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
      <style jsx global>
        {`
          .modal-w {
            width: 90vw !important;
            margin: 20px auto !important;
            margin-left: 30px;
          }

          .react-toast-notifications__container {
            z-index: 1000000 !important;
          }

          .dater {
            padding-right: 180px !important;
          }
        `}
      </style>
    </>
  );
};
export default EditAffiliateModal;
