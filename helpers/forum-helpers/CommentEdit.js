import React from "react";

const CommentEdit = () => {
  return (
    <>
      const EditComment = props => (
      <div className="modals">
        <a className="close" onClick={props.close}>
          &times;
        </a>
        <div className="modal-header"> Update Comment </div>
        <div className="modals-content">
          <div>
            {/* START card */}
            <div className="card card-default">
              <div className="card-header ">
                <div className="card-title"></div>
              </div>
              <div className="card-body">
                <form role="form">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="form-group">
                        <label>Comment</label>
                        <textarea
                          rows="4"
                          name="comment"
                          defaultValue={`${props.comment || "dogs"}`}
                          className="form-control"
                          onChange={props.handleCommentChange}
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
        <div className="actions mx-4 px-2">
          <button
            className="btn btn-default text-warning btn-cons m-t-10"
            form="form1"
            value="Submit"
            onClick={() => {
              props.handleCommentUpdate();
              props.close();
            }}
          >
            Update
          </button>
          <button
            className="btn btn-danger btn-cons m-t-10"
            onClick={() => {
              props.close();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
      );
    </>
  );
};

export default CommentEdit;
