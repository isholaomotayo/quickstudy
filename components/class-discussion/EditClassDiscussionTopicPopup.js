import React from "react";
import Popup from "reactjs-popup";
import { formatDate } from "../../helpers/discussion-helpers/discussion-utils";

const EditCourseDiscussionTopic = (props) => {
  const start_date = formatDate(props.singleTopic.start_date);
  const end_date = formatDate(props.singleTopic.end_date);
  // date[20]
  // console.log(end_date);
  // console.log(start_date);
  return (
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
                      <label className="text-dark float-left">Title</label>
                      <input
                        name="title"
                        value={props.singleTopic.title}
                        type="text"
                        className="form-control"
                        onChange={(e) => props.handleChange(e)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="text-dark float-left">Body</label>
                      <textarea
                        rows="4"
                        value={props.singleTopic.body}
                        name="body"
                        className="form-control"
                        onChange={(e) => props.handleChange(e)}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="form-group">
                      <label className="text-dark float-left">Start Date</label>
                      <input
                        name="start_date"
                        value={start_date}
                        type="datetime-local"
                        className="form-control"
                        onChange={(e) => props.handleChange(e)}
                      />
                    </div>
                    <div className="col-md-12"></div>
                    <div className="form-group">
                      <label className="text-dark float-left">End Date</label>
                      <input
                        name="end_date"
                        value={end_date}
                        type="datetime-local"
                        className="form-control"
                        onChange={(e) => props.handleChange(e)}
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
          Cancel
        </button>
        <button
          className="btn btn-warning text-white btn-cons m-t-10"
          form="form1"
          value="Submit"
          onClick={() => {
            props.handleThreadUpdate();
            props.close();
          }}
        >
          Update
        </button>
      </div>
    </div>
  );
};

class EditCourseDiscussionTopicPopup extends React.Component {
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
        {Number(this.props.authUser) === Number(this.props.topic.user.id) ? (
          <a
            className="btn btn-warning mr-3 px-4"
            onClick={() => {
              this.props.handleThreadClick(this.props.topic.id);
              this.openModal();
            }}
          >
            Edit
          </a>
        ) : null}

        <Popup
          open={this.state.open}
          closeOnDocumentClick
          onClose={this.closeModal}
        >
          <EditCourseDiscussionTopic
            close={this.closeModal}
            singleTopic={this.props.singleTopic}
            handleThreadUpdate={this.props.handleThreadUpdate}
            handleChange={this.props.handleChange}
            // handleThreadUpdate={this.props.handleThreadUpdate}
            // thread={this.props.thread}
            // singleThread={this.props.singleThread}
            // handleChange={this.props.handleChange}
          />
        </Popup>
      </>
    );
  }
}
export { EditCourseDiscussionTopicPopup as default };
