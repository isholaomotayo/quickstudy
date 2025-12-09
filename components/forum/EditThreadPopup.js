import React from "react";
import Popup from "reactjs-popup";

const EditThread = props => (
  <div className="modals">
    <a className="close" onClick={() => props.close()}>
      &times;
    </a>
    <div className="modal-header bold"> Update Topic </div>
    <div className="modals-content">
      <div>
        {/* START card */}
        <div className="card card-default">
          <div className="card-body">
            <form role="form">
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <div className="form-group">
                      <label className="text-dark float-left">Title</label>
                      <input
                        name="title"
                        type="text"
                        value={props.singleThread.title}
                        className="form-control"
                        onChange={e => props.handleChange(e)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="text-dark float-left">Body</label>
                      <textarea
                        rows="4"
                        name="body"
                        value={props.singleThread.body}
                        className="form-control"
                        onChange={e => props.handleChange(e)}
                      />
                    </div>
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
        className="btn btn-warning text-white btn-cons m-t-10"
        form="form1"
        value="Submit"
        onClick={() => {
          // props.handleCategoryEdit(props.category.id);
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

class EditThreadPopup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }
  openModal() {
    this.setState({ open: true });
  }
  closeModal() {
    this.setState({ open: false });
  }

  render() {
    // console.log(this.props.thread);
    return (
      <>
        <a
          className="btn  btn-warning mr-3 px-4"
          onClick={() => {
            this.props.handleThreadClick(this.props.thread.id);
            this.openModal();
          }}
        >
          Edit
        </a>
        <Popup
          open={this.state.open}
          closeOnDocumentClick
          onClose={this.closeModal}
        >
          <EditThread
            close={this.closeModal}
            handleThreadUpdate={this.props.handleThreadUpdate}
            thread={this.props.thread}
            singleThread={this.props.singleThread}
            handleChange={this.props.handleChange}
          />
        </Popup>
      </>
    );
  }
}
export { EditThreadPopup as default };
