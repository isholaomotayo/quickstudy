import React from "react";
import Popup from "reactjs-popup";

const EditTopic = props => (
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
                    <label>Topic</label>
                    <textarea
                      rows="4"
                      name="name"
                      // defaultValue={`${props.category.name}`}
                      className="form-control"
                      onChange={e => props.handleEditChange(e)}
                      value={props.singleCategory.name}
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
        className="btn btn-default text-warning btn-cons m-t-10"
        form="form1"
        value="Submit"
        onClick={() => {
          // props.handleCategoryEdit(props.category.id);
          props.handleCategoryUpdate();

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

class EditCategoryPopup extends React.Component {
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
        <a
          className="btn mb-3 btn-warning mr-3 px-4"
          onClick={() => {
            this.props.handleCategoryEdit(this.props.category.id);
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
          <EditTopic
            close={this.closeModal}
            category={this.props.category}
            handleCategoryEdit={this.props.handleCategoryEdit}
            handleEditChange={this.props.handleEditChange}
            singleCategory={this.props.singleCategory}
            handleCategoryUpdate={this.props.handleCategoryUpdate}
          />
        </Popup>
      </>
    );
  }
}
export { EditCategoryPopup as default };
