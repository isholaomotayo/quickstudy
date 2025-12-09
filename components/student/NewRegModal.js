import React from 'react';
import Popup from 'reactjs-popup';

const NewRegModal = props => {
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
          <div className="modal-header">New Course Registration </div>
          <div className="modals-content">
            <div>
              {/* START card */}
              {console.log(props)}
              <div className="card card-default">
                <div className="card-header ">Multi select your courses</div>
              </div>
              <div className="card-body">
                <form className="m-t-10" role="form">
                  <div className="form-group form-group-default form-group-default-select2">
                    <select
                      multiple
                      id="multi"
                      className="full-width form-control"
                      onChange={props.handleChange}
                    >
                      <option value="">Select...</option>

                      {props.courses.map(course => (
                        <option key={course.course.id} value={course.id}>
                          {course.course.code}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>
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
              Register
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

export default NewRegModal;
