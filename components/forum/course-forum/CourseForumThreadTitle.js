import React from "react";
import NewCourseForumThread from "./NewCourseForumThread";
// import NewThreadPopup from "./NewThreadPopup";

const CourseForumTopicTitle = props => {
  return (
    <>
      <div className="bg-dark m-b-30">
        <div className="container">
          <div className="row p-b-60 p-t-60">
            <div className="col-md-8 m-auto text-white p-b-30">
              {props.topic.map(x => {
                return (
                  <div key={x.id}>
                    <h1 className="text-white"> {x.title}</h1>
                    <p className="opacity-75">{x.description}</p>
                  </div>
                );
              })}
              <div className="row">
                <div className="col-lg-4">
                  <form action="#" className="form-dark">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search"
                      onChange={e => props.handleSearchChange(e)}
                    />
                  </form>
                </div>
              </div>
            </div>
            <div className="col-md-4 m-auto text-white p-b-30">
              <div className="text-md-right">
                {props.topic.length > 0 && (
                  <NewCourseForumThread
                    handleChange={props.handleChange}
                    handleCreation={props.handleCreation}
                  />
                )}
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

export default CourseForumTopicTitle;
