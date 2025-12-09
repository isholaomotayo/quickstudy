import React from "react";
import Link from "next/link";
// import EditForum from "./EditForum";
// import DeleteForum from './DeleteForum'

const ForumTopic = props => {
  return <>
    <div className="card-body py-3">
      <div className="row no-gutters align-items-center">
        <div className="col">
          <Link href="#" legacyBehavior>
            <a
              href="forum-thread.html"
              className="text-big font-weight-semibold"
              style={{ color: "#6772e5 !important" }}
            >
              {props.title || "University Resumption "}
            </a>
          </Link>
        </div>
        <div className=" d-md-block col-8">
          <div className="row no-gutters align-items-center">
            <div className="col-3">{props.threads || "874"}</div>
            <div className="col-3">{props.replies || "558"}</div>
            <div className="media col-6 align-items-center">
              <div className="media-body  ml-2">
                {/* <EditForum default={true} />
                <DeleteForum default={true} /> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <hr className="m-0" />
    <style jsx>
      {`
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
  </>;
};

export default ForumTopic;
