import React from "react";
import Popup from "reactjs-popup";

const NewTopic = props => (
  <div className="modals">
    <a className="close" onClick={props.close}>
      &times;
    </a>
    <div className="modal-header text-dark bold"> New Topic </div>
    <div className="modals-content">
      <div>
        {/* START card */}
        <div className="card card-default">
          <div className="card-body">
            <form role="form">
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <label className="text-dark float-left">
                      What would you like discussed?
                    </label>
                    <textarea
                      rows="4"
                      name="name"
                      defaultValue=""
                      className="form-control"
                      onChange={e => props.onChange(e)}
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
        onClick={() => {
          props.handleCreation();
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

const NewCategoryPopup = props => {
  return (
    <>
      <Popup
        trigger={
          <a href="#!" className="btn btn-success">
            {" "}
            <i className="pg pg-plus" />
            {props.btn || " New Category"}
          </a>
        }
        modal
      >
        {close => (
          <NewTopic
            close={close}
            onChange={props.onChange}
            handleCreation={props.handleCreation}
          />
        )}
      </Popup>
    </>
  );
};

export default NewCategoryPopup;
