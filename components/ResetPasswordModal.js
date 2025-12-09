import React, { useEffect, useState } from "react";
import Popup from "reactjs-popup";

const ResetPasswordModal = (props) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div>
      {isClient && (
        <Popup
          open={props.open}
          closeOnDocumentClick
          onClose={props.closeModal}
        >
          <div className="modals">
            <a className="close" onClick={props.closeModal}>
              &times;
            </a>
            <div className="modal-header"> Reset Password </div>
            <div className="modals-content">
              <div>
                {/* START card */}
                <div className="card card-default">
                  <div className="card-body">
                    <form role="form">
                      <div className="form-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          className="form-control"
                          required
                          name="newPassword"
                          onChange={props.handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                          type="password"
                          className="form-control"
                          required
                          name="confirmPassword"
                          value={props.confirmPassword}
                          onChange={props.handleChange}
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
                className="btn btn-danger btn-cons m-t-10"
                onClick={props.closeModal}
              >
                Cancel
              </button>

              <button
                className="btn btn-primary btn-cons m-t-10"
                form="form1"
                value="Submit"
                onClick={() => {
                  props.handleSubmit();
                  // close();
                }}
              >
                Save New Password
              </button>
            </div>
          </div>
        </Popup>
      )}
    </div>
  );
};

export default ResetPasswordModal;
