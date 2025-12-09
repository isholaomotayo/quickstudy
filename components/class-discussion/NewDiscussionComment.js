import React from "react";
import Popup from "reactjs-popup";

const NewCourseThread = props => (
  <div className="modals">
    <a className="close" onClick={props.close}>
      &times;
    </a>
    <div className="modal-header text-dark bold"> New Comment </div>
    <div className="modals-content">
      <div>
        {/* START card */}
        <div className="card card-default">
          <div className="card-body">
            <form role="form">
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <label className="text-dark float-left">Your Comment</label>
                    <textarea
                      rows="4"
                      name="body"
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
const NewDiscussionComment = props => {
  return (
    <>
      <Popup
        trigger={
          <a href="#!" className="btn btn-success">
            {" "}
            <i className="pg pg-plus" />
            New Comment
          </a>
        }
        modal
      >
        {close => (
          <NewCourseThread
            close={close}
            handleChange={props.handleChange}
            handleCreation={props.handleCreation}
          />
        )}
      </Popup>
    </>
  );
};

export default NewDiscussionComment;
