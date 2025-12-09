import React from "react";

const EditThread = props => {
  return (
    <div className="modals">
      <a className="close" onClick={props.close}>
        &times;
      </a>
      <div className="modal-header bold"> Update Thread </div>
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
                      <label className="text-dark float-left">Title</label>
                      <input
                        onChange={e => props.handleThreadChange(e)}
                        // onChange={e => setTitle({ title: e.target.value })}
                        type="text"
                        name="title"
                        defaultValue={`${props.thread.title}`}
                        className="form-control bold text-dark"
                        id="inputEmail6"
                        placeholder="Title"
                      />
                    </div>
                    <div className="form-group">
                      <label>Body</label>
                      <textarea
                        rows="4"
                        name="body"
                        defaultValue={`${props.thread.body}`}
                        className="form-control"
                        onChange={e => props.handleThreadChange(e)}
                        // onChange={e => setBody({ body: e.target.value })}
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
            props.handleThreadUpdate();
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
};

export { EditThread };
