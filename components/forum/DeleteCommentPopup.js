import React from "react";
import Popup from "reactjs-popup";

const DeleteComment = props => (
  <div className="modals">
    <a className="close" onClick={props.close}>
      &times;
    </a>
    <div className="modal-header"> Delete Comment </div>
    <div className="modals-content">
      <div>
        {/* START card */}
        <div className="card card-default">
          
          <div className="card-body">
            <form role="form">
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    Are you sure you want to delete your comment?
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
        className="btn btn-default text-success btn-cons m-t-10"
        form="form1"
        value="Submit"
        onClick={() => {
          props.handleCommentDelete();
          props.close();
        }}
      >
        Yes
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

class DeleteCommentPopup extends React.Component {
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
    return (
      <>
        <span
          className=" ml-4 cursors edite"
          onClick={() => {
            this.props.handleCommentEdit(this.props.id);
            this.openModal();
          }}
        >
          <i className="fa fa-trash text-large text-danger align-middle" />
          &nbsp;
          <a className="align-middle alert-link text-danger cursor">Delete</a>
        </span>

        <Popup
          open={this.state.open}
          closeOnDocumentClick
          onClose={this.closeModal}
        >
          <DeleteComment
            close={this.closeModal}
            handleCommentDelete={this.props.handleCommentDelete}
          />
        </Popup>

        <style jsx>
          {`
            .edite:hover {
              color: #red !important;
            }
          `}
        </style>
      </>
    );
  }
}

export default DeleteCommentPopup;
