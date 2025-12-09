import React from "react";
import Popup from "reactjs-popup";

const EditComment = props => {
  return (
    <div className="modals">
      <a className="close" onClick={() => props.close()}>
        &times;
      </a>
      <div className="modal-header bold"> Update Comments </div>
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
                      <label>Your comment</label>
                      <textarea
                        rows="4"
                        name="body"
                        // defaultValue={`${props.category.name}`}
                        className="form-control"
                        onChange={e => props.handleChange(e)}
                        value={props.comment.body}
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
          className="btn btn-warning text-white btn-cons m-t-10"
          form="form1"
          value="Submit"
          onClick={() => {
            // props.handleCategoryEdit(props.category.id);
            props.handleDiscussionUpdate();

            props.close();
          }}
        >
          Update
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
};

class EditDiscussionCommentPopup extends React.Component {
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
        {Number(this.props.authUser) === this.props.userId ? (
          <span
            className=" ml-4 cursors edite"
            onClick={() => {
              this.props.handleDiscussionClick(this.props.id);
              this.openModal();
            }}
          >
            <i className="fa fa-edit text-large text-warning align-middle" />
            &nbsp;
            <a className="align-middle alert-link text-warning cursor">Edit</a>
          </span>
        ) : (
          ""
        )}

        <Popup
          open={this.state.open}
          closeOnDocumentClick
          onClose={this.closeModal}
        >
          <EditComment
            close={this.closeModal}
            comment={this.props.comment}
            handleChange={this.props.handleChange}
            handleDiscussionUpdate={this.props.handleDiscussionUpdate}
          />
        </Popup>

        <style jsx>
          {`
            .edite:hover {
              color: #f8cf53 !important;
            }
          `}
        </style>
      </>
    );
  }
}
export { EditDiscussionCommentPopup as default };
