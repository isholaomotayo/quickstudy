import React from 'react';
import Popup from 'reactjs-popup';

const AffiliateSignupModal = props => {
  return (
    <Popup
      defaultOpen={props.defaultOpen}
      trigger={
        <span className="text-info" style={{ cursor: 'pointer' }}>
          here
        </span>
      }
      modal
    >
      {close => (
        <div className="modals">
          <a className="close" onClick={close}>
            &times;
          </a>
          <div className="modal-header"> Become an Affiliate </div>
          <div className="modals-content">
            <div>
              {/* START card */}
              <div className="card card-default">
                <div className="card-body">
                  <p>
                    Enter the username associated with your account, only
                    usernames used previously on the portal should be entered.
                    If it exists, your profile will be converted to an affiliate
                    and you can start referring.
                  </p>
                  <form role="form">
                    <div className="form-group">
                      <label>Username</label>
                      <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={props.username}
                        className="form-control"
                        required
                        onChange={props.handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Bank</label>
                      <input
                        type="text"
                        name="bank"
                        placeholder="Bank Name"
                        value={props.email}
                        className="form-control"
                        required
                        onChange={props.handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Account Number</label>
                      <input
                        type="number"
                        name="account_no"
                        placeholder="Account Number"
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
              Signup
            </button>
          </div>
        </div>
      )}
    </Popup>
  );
};

export default AffiliateSignupModal;
