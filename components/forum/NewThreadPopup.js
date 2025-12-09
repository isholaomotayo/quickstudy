import React from "react";
import Popup from "reactjs-popup";

const NewThread = props => (
  <div className="modals">
    <a className="close" onClick={props.close}>
      &times;
    </a>
    <div className="modal-header text-dark bold"> New Thread </div>
    <div className="modals-content">
      <div>
        {/* START card */}
        <div className="card card-default">
          <div className="card-body">
            <form role="form">
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <label className="text-dark float-left">Title</label>
                    <input
                      name="title"
                      type="text"
                      defaultValue=""
                      className="form-control"
                      onChange={e => props.handleChange(e)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="text-dark float-left">Body</label>
                    <textarea
                      rows="4"
                      name="body"
                      defaultValue=""
                      className="form-control"
                      onChange={e => props.handleChange(e)}
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
    <div className="actions mx-4 px-2 float-right">
      <button
        className="btn btn-success btn-cons m-t-10"
        form="form1"
        value="Submit"
        onClick={e => {
          props.handleCreation(e);
          props.close();
        }}
      >
        Create
      </button>
      <button
        className="btn btn-default text-danger btn-cons m-t-10"
        onClick={() => {
          props.close();
        }}
      >
        Cancel
      </button>
    </div>
  </div>
);

const NewThreadPopup = props => {
  return (
    <>
      <Popup
        trigger={
          <a href="#!" className="btn btn-success">
            {" "}
            <i className="pg pg-plus" />
            New Forum Topic
          </a>
        }
        modal
      >
        {close => (
          <NewThread
            close={close}
            handleChange={props.handleChange}
            handleCreation={props.handleCreation}
          />
        )}
      </Popup>
    </>
  );
};

export default NewThreadPopup;
