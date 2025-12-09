import React from "react";
import Popup from "reactjs-popup";
// import '../../node_modules/react-calendar/dist/Calendar.css';
class CourseDiscussionTopic extends React.Component {
  state = {
    date: new Date()
  };
  onChange = date => this.setState({ date });
  render() {
    return (
      <>
        <div className="modals">
          <a className="close" onClick={this.props.close}>
            &times;
          </a>
          <div className="modal-header text-dark bold">
            {" "}
            New Class DiscussionTopic{" "}
          </div>
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
                            type="text"
                            className="form-control"
                            onChange={e => this.props.handleChange(e)}
                          />
                        </div>

                        <div className="form-group">
                          <label className="text-dark float-left">Body</label>
                          <textarea
                            rows="4"
                            name="body"
                            className="form-control"
                            onChange={e => this.props.handleChange(e)}
                          />
                        </div>
                      </div>

                      <div className="col-md-12">
                        <div className="form-group">
                          <label className="text-dark float-left">
                            Start Date
                          </label>
                          <input
                            name="start_date"
                            type="datetime-local"
                            className="form-control"
                            onChange={e => this.props.handleChange(e)}
                          />
                        </div>
                        <div className="col-md-12"></div>
                        <div className="form-group">
                          <label className="text-dark float-left">
                            End Date
                          </label>
                          <input
                            name="end_date"
                            type="datetime-local"
                            className="form-control"
                            onChange={e => this.props.handleChange(e)}
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
              className="btn btn-default text-danger btn-cons m-t-10"
              onClick={() => {
                this.props.close();
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-success btn-cons m-t-10"
              form="form1"
              value="Submit"
              onClick={e => {
                this.props.handleCreation(e);
                this.props.close();
              }}
            >
              Create
            </button>
          </div>
          <style jsx>{``}</style>
        </div>
      </>
    );
  }
}

const NewCourseDiscussionTopicPopup = props => {
  return (
    <>
      <Popup
        trigger={
          <a href="#!" className="btn btn-success">
            {" "}
            <i className="pg pg-plus" />
            New Discussion
          </a>
        }
        modal
      >
        {close => (
          <CourseDiscussionTopic
            close={close}
            handleChange={props.handleChange}
            handleCreation={props.handleCreation}
          />
        )}
      </Popup>
    </>
  );
};

export default NewCourseDiscussionTopicPopup;
