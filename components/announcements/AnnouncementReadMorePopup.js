import React from "react";
import Popup from "reactjs-popup";

const ViewAnnouncements = props => (
  <div className="modals">
    <a className="close" onClick={() => props.close()}>
      &times;
    </a>
    <div className="modal-header bold"> {props.announcement.title} </div>
    <div className="modals-content">
      <div>
        {/* START card */}
        <div className="card card-default">
          <div className="card-body">
            <form role="form">
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: props.announcement.body
                      }}
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
        className="btn btn-danger btn-cons m-t-10"
        onClick={() => {
          props.close();
        }}
      >
        Close
      </button>
    </div>
  </div>
);

class AnnouncementReadMorePopup extends React.Component {
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
          className="text-big text-primary mb-2 pb-3 cursor border-bottom"
          onClick={() => {
            // this.props.handleThreadClick(this.props.thread.id);
            this.openModal();
          }}
        >
          {this.props.i} - {this.props.announcement.title}
        </a>
        <Popup
          open={this.state.open}
          closeOnDocumentClick
          onClose={this.closeModal}
        >
          <ViewAnnouncements
            close={this.closeModal}
            announcement={this.props.announcement}
          />
        </Popup>
      </>
    );
  }
}
export { AnnouncementReadMorePopup as default };
