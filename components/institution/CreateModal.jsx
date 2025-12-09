import React from 'react';
import Popup from 'reactjs-popup';

const CreateModal = props => {
  return (
    <Popup
      trigger={
        <button id="show-modal" className="btn btn-primary btn-cons">
          <i className="fa fa-plus" /> Add New
        </button>
      }
      modal
    >
      {close => (
        <div className="modals">
          <a className="close" onClick={close}>
            &times;
          </a>
          <div className="modal-header"> Add New Institution </div>
          <div className="modals-content">
            <div>
              {/* START card */}
              <div className="card card-default">
                <div className="card-header ">
                  <div className="card-title">Enter Institution details</div>
                </div>
                <div className="card-body">
                  <form role="form">
                    <div className="form-group form-group-default">
                      <label>Full name</label>
                      <span className="help"> e.g. "University of ABC"</span>
                      <input
                        type="text"
                        className="form-control"
                        required
                        name="institutionName"
                        value={props.institutionName}
                        onChange={props.handleChange}
                      />
                    </div>

                    <div className="form-group form-group-default">
                      <label>Code</label>
                      <span className="help"> e.g. "ABC"</span>
                      <input
                        type="text"
                        className="form-control"
                        required
                        name="institutionCode"
                        value={props.institutionCode}
                        onChange={props.handleChange}
                      />
                    </div>
                    <div className="form-group form-group-default">
                      <label>Email</label>
                      <span className="help"> e.g. "some@example.com"</span>
                      <input
                        type="email"
                        className="form-control"
                        name="institutionEmail"
                        value={props.institutionEmail}
                        onChange={props.handleChange}
                      />
                    </div>
                    <div className="form-group form-group-default">
                      <label>Phone</label>
                      <span className="help"> e.g. "0123456789"</span>
                      <input
                        type="text"
                        className="form-control"
                        name="institutionPhone"
                        value={props.institutionPhone}
                        onChange={props.handleChange}
                      />
                    </div>
                    <div className="form-group form-group-default">
                      <label>Address</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="institutionAddress"
                        value={props.institutionAddress}
                        onChange={props.handleChange}
                      />
                    </div>
                  </form>
                </div>
              </div>
              {/* END card */}
            </div>
          </div>
          <div className="actions">
            <button
              className="btn btn-success"
              form="form1"
              value="Submit"
              onClick={() => {
                props.handleSubmitClick();
                close();
              }}
            >
              Create
            </button>
            <button
              className="button"
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

export default CreateModal;
