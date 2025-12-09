import React from "react";
import Popup from "reactjs-popup";
import fetch from "isomorphic-unfetch";

export const updateDepartment = async props => {
  return await fetch(
    `${process.env.API_URL}/api/department/${props.department.id}`,
    {
      method: "put",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        name: props.department.name,
        code: props.department.code,
        phone: props.department.phone,
        email: props.department.email,
        description: props.department.description
      })
    }
  )
    .then(response => response.json())
    .then(json => {
      return { updatedDepartment: json };
    })
    .catch(e => {
      console.log(e);
      return e;
    });
};
const EditDeptModal = props => {
  return (
    <Popup
      trigger={
        <button id="show-modal" className="btn btn-complete btn-cons">
          <i className="fa fa-pencil" /> Edit Department Profile
        </button>
      }
      modal
    >
      {close => (
        <div className="modals">
          <a className="close" onClick={close}>
            &times;
          </a>
          <div className="modal-header"> Update Profile </div>
          <div className="modals-content">
            <div>
              {/* START card */}
              <div className="card card-default">
                <div className="card-body">
                  <form role="form">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group form-group-default">
                          <label>Department Name</label>
                          <input
                            type="text"
                            name="name"
                            defaultValue={props.department.name}
                            className="form-control"
                            required
                            onChange={props.handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group form-group-default">
                          <label>Code</label>
                          <input
                            type="text"
                            name="code"
                            className="form-control"
                            defaultValue={props.department.code}
                            required
                            onChange={props.handleChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group form-group-default">
                          <label>Email</label>
                          <input
                            type="text"
                            name="email"
                            defaultValue={props.department.email}
                            className="form-control"
                            required
                            onChange={props.handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group form-group-default">
                          <label>Phone</label>
                          <input
                            type="text"
                            name="phone"
                            className="form-control"
                            defaultValue={props.department.phone}
                            onChange={props.handleChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="form-group form-group-default">
                          <label>Description</label>
                          <textarea
                            name="description"
                            defaultValue={props.department.description}
                            className="form-control"
                            onChange={props.handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              {/* END card */}
            </div>
          </div>
          <div className="actions">
            <button
              className="btn btn-primary btn-cons m-t-10"
              form="form1"
              value="Submit"
              onClick={() => {
                props.handleSubmit();
                close();
              }}
            >
              Update
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

export default EditDeptModal;
