import React from "react";
import Popup from "reactjs-popup";

export const updatePassword = async props => {
  // call endpoint to check that current password entered matches user password
  //then save new password.

  return await fetch(`${process.env.API_URL}/api/user/${props.user_id}`, {
    //mode: "no-cors",
    method: "put",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      password: props.new_password
    })
  })
    .then(response => response.json())
    .then(json => {
      return { updatedUser: json };
    })
    .catch(e => {
      console.log(e);
      return e;
    });
};

const ChangePasswordModal = props => {
  return (
    <Popup
      trigger={
        <button
          id="show-modal"
          className="btn btn-primary mx-2 text-center btn-cons"
        >
          <i className="fa fa-lock" /> Change Password
        </button>
      }
      modal
    >
      {close => (
        <div className="modals">
          <a className="close" onClick={close}>
            &times;
          </a>
          <div className="modal-header"> Change Password </div>
          <div className="modals-content">
            <div>
              {/* START card */}
              <div className="card card-default">
                <div className="card-body">
                  <form role="form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <span className="help"> </span>
                      <input
                        type="password"
                        className="form-control"
                        required
                        name="current_password"
                      />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        required
                        name="new_password"
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        required
                        name="confirm_password"
                      />
                    </div>
                  </form>
                </div>
              </div>
              {/* END card */}
            </div>
          </div>
          <div className="col-md-9">
            <button
              className="btn btn-primary btn-cons m-t-10"
              form="form1"
              value="Submit"
              onClick={() => {
                props.handleSubmit();
                close();
              }}
            >
              Save
            </button>
            <button
              className="btn btn-danger btn-cons m-t-10"
              onClick={() => {
                close();
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Popup>
  );
};

export default ChangePasswordModal;
