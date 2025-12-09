import React from "react";
import ForumTopic from "./ForumTopic";

const ForumCard = props => {
  return (
    <>
      <div className="card carde mb-3">
        <div className="card-header border-bottom">
          <div className="row no-gutters align-items-center">
            <div className="col font-weight-bold">
              {props.title || "General"}
            </div>
            <div className=" d-md-block col-8 text-muted">
              <div className="row no-gutters align-items-center">
                <div className="col-3">Threads</div>
                <div className="col-3">Replies</div>
                <div className="col-6">Actions</div>
              </div>
            </div>
          </div>
        </div>
        <ForumTopic />
        <hr className="m-0" />
        <div className="card-body py-3">
          <div className="row no-gutters align-items-center">
            <div className="col">
              <a
                href="forum-thread.html"
                className="text-big font-weight-semibold"
              >
                Announcements{" "}
                <span className="badge badge-soft-success">Development</span>
              </a>
            </div>
            <div className=" d-md-block col-8">
              <div className="row no-gutters align-items-center">
                <div className="col-3">68</div>
                <div className="col-3">978</div>
                <div className="media col-6 align-items-center">
                  <div className="media-body  ml-2">
                    <a className="btn btn-warning mr-3 px-4">Edit</a>
                    <a className="btn btn-white text-danger px-4">Delete</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr className="m-0" />
        <div className="card-body py-3">
          <div className="row no-gutters align-items-center">
            <div className="col">
              <a
                href="forum-thread.html"
                className="text-big font-weight-semibold"
              >
                Guides
              </a>
            </div>
            <div className=" d-md-block col-8">
              <div className="row no-gutters align-items-center">
                <div className="col-3">265</div>
                <div className="col-3">50</div>
                <div className="media col-6 align-items-center">
                  <div className="media-body  ml-2">
                    <a className="btn btn-warning mr-3 px-4">Edit</a>
                    <a className="btn btn-white text-danger px-4">Delete</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>
        {`
          .carde {
            border-radius: 0.25rem;
          }
          .pull-ups {
            margin-top: -90px;
          }
          .avatar .avatar-title {
            font-size: 18px;
          }
          .avatar {
            width: 3rem;
            height: 3rem;
          }
          .avatar-title {
            display: flex;
            width: 100%;
            height: 100%;
            color: #fff;
            background-color: #b1c2d9;
            align-items: center;
            justify-content: center;
          }
          .avatar {
            position: relative;
          }
          .rounded-circle {
            border-radius: 50% !important;
          }
        `}
      </style>
    </>
  );
};

export default ForumCard;
