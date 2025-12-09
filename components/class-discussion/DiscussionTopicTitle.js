import React from "react";
import NewDiscussionTopicModal from "../NewDiscussionTopicModal";

const DiscussionTopicTitle = props => {
  return (
    <>
      <div className="bg-dark m-b-30">
        <div className="container">
          <div className="row p-b-60 p-t-60">
            <div className="col-md-8 m-auto text-white p-b-30">
              {!true ? (
                <div>
                  <h1 className="text-white">
                    {`${props.course.name}-${props.course.code}`}
                  </h1>
                  <p className="opacity-75">{`${props.course.description}`}</p>
                </div>
              ) : (
                <div>
                  <h1 className="text-white">Class Discussions</h1>
                  <p className="opacity-75">
                    Search for previous discussions in this class
                  </p>
                </div>
              )}
              <div className="row">
                <div className="col-lg-4">
                  <form action="#" className="form-dark">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search"
                      onChange={props.handleSearchChange}
                    />
                  </form>
                </div>
              </div>
            </div>
            <div className="col-md-4 m-auto text-white p-b-30">
              <div className="text-md-right">
                {props.role === "ADMIN" || props.role === "STAFF" ? (
                  <NewDiscussionTopicModal
                    handleChange={props.handleChange}
                    handleCreation={props.handleCreation}
                    handleStartDate={props.handleStartDate}
                    handleEndDate={props.handleEndDate}
                    dateInvalid={props.dateInvalid}
                    dateValidator={props.dateValidator}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>
        {`
          .p-t-60,
          p-b-60 {
            padding-top: 60px;
            padding-bottom: 60px;
          }
        `}
      </style>
    </>
  );
};

export default DiscussionTopicTitle;
