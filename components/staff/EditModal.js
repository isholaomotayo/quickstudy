import React from 'react';
import Popup from 'reactjs-popup';

export const updateStaff = async props => {
  return await fetch(`${process.env.API_URL}/api/user/${props.staff.user.id}`, {
    //mode: "no-cors",
    method: 'put',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      last_name: props.staff.user.last_name,
      first_name: props.staff.user.first_name,
      other_name: props.staff.user.other_name,
      phone: props.staff.user.phone,
      email: props.staff.user.email
    })
  })
    .then(response => response.json())
    .then(json => {
      return { updatedStaff: json };
    })
    .catch(e => {
      console.log(e);
      return e;
    });
};
const EditModal = props => {
  return (
    <Popup
      trigger={
        <button id="show-modal" className="btn btn-complete btn-cons">
          <i className="fa fa-pencil" /> Edit Profile
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
                          <label>First Name</label>
                          <input
                            type="text"
                            name="first_name"
                            defaultValue={props.staff.user.first_name}
                            className="form-control"
                            required
                            onChange={props.handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group form-group-default">
                          <label>Last Name</label>
                          <input
                            type="text"
                            name="last_name"
                            className="form-control"
                            defaultValue={props.staff.user.last_name}
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
                            defaultValue={props.staff.user.email}
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
                            defaultValue={props.staff.user.phone}
                            required
                            onChange={props.handleChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="form-group">
                          <label>Address</label>
                          <textarea
                            rows="4"
                            name="address"
                            defaultValue={props.staff.address}
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

export default EditModal;
