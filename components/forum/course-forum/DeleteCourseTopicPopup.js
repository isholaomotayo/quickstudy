import React from "react";
import Popup from "reactjs-popup";

const DeleteCourseTopicPopup = props => (
  <div className="modals">
    <a className="close" onClick={props.close}>
      &times;
    </a>
    <div className="modal-header"> Delete Thread </div>
    <div className="modals-content">
      <div>
        {/* START card */}
        <div className="card card-default">
          
          <div className="card-body">
            <form role="form">
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    Are you sure you want to delete your Thread?
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
        className="btn btn-success text-white btn-cons m-t-10"
        form="form1"
        value="Submit"
        onClick={() => {
          props.handleThreadDelete();
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

class DeleteCourseTopicPopups extends React.Component {
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
        {Number(this.props.authUser) === this.props.topic.user.id ? (
          <a
            className="btn btn-white text-danger px-4"
            onClick={() => {
              this.props.handleThreadClick(this.props.topic.id);
              this.openModal();
            }}
          >
            Delete
          </a>
        ) : null}

        <Popup
          open={this.state.open}
          closeOnDocumentClick
          onClose={this.closeModal}
        >
          <DeleteCourseTopicPopup
            close={this.closeModal}
            // handleThreadDelete={this.props.handleThreadDelete}
            handleThreadDelete={this.props.handleThreadDelete}
          />
        </Popup>
      </>
    );
  }
}
export { DeleteCourseTopicPopups as default };
