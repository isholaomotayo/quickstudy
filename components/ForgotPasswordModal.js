import React from 'react';
import Popup from 'reactjs-popup';

const ForgotPasswordModal = props => {
  return (
    <Popup
      defaultOpen={props.defaultOpen}
      trigger={
        <span className="text-info small" style={{ cursor: 'pointer' }}>
          Forgot Password?
        </span>
      }
      modal
    >
      {close => (
        <div className="modals">
          <a className="close" onClick={close}>
            &times;
          </a>
          <div className="modal-header"> Forgot Password? </div>
          <div className="modals-content">
            <div>
              {/* START card */}
              <div className="card card-default">
                <div className="card-body">
                  <p>
                    Enter the email associated with your account, only emails
                    used previously on the portal should be entered. If it
                    exists, an email will be sent to you with a link to reset
                    your password.
                  </p>
                  <form role="form">
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="text"
                        name="email"
                        placeholder="Email"
                        value={props.email}
                        className="form-control"
                        required
                        onChange={props.handleChange}
                      />
                    </div>
                  </form>
                </div>
              </div>
              {/* END card */}
            </div>
          </div>
          <div className="col-md-9 float-right">
            <button
              className="btn btn-warning btn-cons m-t-10"
              onClick={() => {
                close();
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-success btn-cons m-t-10"
              form="form1"
              value="Submit"
              onClick={() => {
                props.handleSubmit();
                close();
              }}
            >
              Reset Password
            </button>
          </div>
        </div>
      )}
    </Popup>
  );
};

export default ForgotPasswordModal;
