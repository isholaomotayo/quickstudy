import React from "react";
import NewCommentPopup from "./NewCommentPopup";
import { validateObject } from "../../helpers/forum-helpers/validateObject";

const ForumCommentTitle = props => {
  const threadCheck = validateObject(props.thread);

  // console.log(threadCheck);
  return (
    <>
      <div className="bg-dark m-b-30">
        <div className="container">
          <div className="row p-b-60 p-t-60">
            <div className="col-md-8 m-auto text-white p-b-30">
              {!threadCheck ? (
                <div>
                  <h1 className="text-white">
                    {" "}
                    {props.thread.title || "Getting Started"}
                  </h1>
                  <p className="opacity-75">
                    {props.thread.body ||
                      "You have no topics yet, please go to the thread page and create a Topic for discussion"}
                  </p>
                </div>
              ) : (
                <div>
                  <h1 className="text-white">Getting Started</h1>
                  <p className="opacity-75">
                    You have no topics yet, please go to the thread page and
                    create a Topic for discussions
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
                      onChange={e => props.handleSearchChange(e)}
                    />
                  </form>
                </div>
              </div>
            </div>
            <div className="col-md-4 m-auto text-white p-b-30">
              <div className="text-md-right">
                <NewCommentPopup
                  handleChange={props.handleChange}
                  handleCreation={props.handleCreation}
                />
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

export default ForumCommentTitle;
