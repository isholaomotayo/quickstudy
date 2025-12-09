import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import EditCommentPopup from "./EditCommentPopup";
import DeleteCommentPopup from "./DeleteCommentPopup";

dayjs().format();
dayjs.extend(relativeTime);
// import EditForum from './EditForum'
// import DeleteForum from './DeleteForum'

const CommentComponent = props => {
  // console.log(props.comments);
  // const { thread } = props.comments;
  // console.log(thread);
  return (
    <>
      <div className="container pull-ups">
        <div className="row">
          <div className="col-md-12 m-b-30">
            <div className="card carde mb-4">
              {props.comments
                .sort((a, b) => b.id - a.id)
                .map(comment => {
                  return (
                    <div
                      className="card"
                      // style={{ marginBottom: "0 !important" }}
                      key={comment.id}
                    >
                      <div className="card-header">
                        <div className="media flex-wrap align-items-center">
                          <div className="avatar avatar">
                            <img
                              src={
                                comment.user.avatar ||
                                `/assets/img/profiles/default-user.png`
                              }
                              alt="..."
                              className="avatar-img rounded-circle"
                            />
                          </div>
                          <div className="media-body ml-3 bold">
                            <a href="#!">{`${comment.user.first_name} ${comment.user.last_name} `}</a>
                            <div className="text-muted small">
                              {dayjs(comment.created_at).from(dayjs())}
                            </div>
                          </div>
                          {/* <div className="text-muted small ml-3">
  <div>Member since <strong>01/03/2019</strong></div>
  <div><strong>1,234</strong> posts</div>
</div> */}
                        </div>
                      </div>
                      <div className="card-body">
                        <p>{comment.body}</p>
                      </div>
                      <div className="card-footer d-flex flex-wrap justify-content-between align-items-center px-0 pt-0 pb-3">
                        <div className="px-4 pt-3">
                          <EditCommentPopup
                            handleCommentEdit={props.handleCommentEdit}
                            handleCommentUpdate={props.handleCommentUpdate}
                            singleComment={props.singleComment}
                            id={comment.id}
                            handleChange={props.handleChange}
                          />
                          <DeleteCommentPopup
                            id={comment.id}
                            handleCommentEdit={props.handleCommentEdit}
                            handleCommentDelete={props.handleCommentDelete}
                          />
                          <span className="text-muted ml-4 cursor report">
                            <i className="fa fa-warning   align-middle" />
                            &nbsp;
                            <a className="align-middle alert-link ">Report</a>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
            margin-top: -100px;
          }
          .p-t-60,
          p-b-60 {
            padding-top: 60px;
            padding-bottom: 60px;
          }
          .opacity-75 {
            opacity: 0.75;
          }

          @media (max-width: 767px) {
            .cf {
              padding-left: 30px !important;
              padding-right: 30px !important;
              position: relative !important;
            }
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
          .avatar-img {
            width: 100%;
            height: 100%;
            -o-object-fit: cover;
            object-fit: cover;
          }
          .rounded-circle {
            border-radius: 50% !important;
          }

          .report:hover {
            color: #0ccfbd !important;
          }
        `}
      </style>
    </>
  );
};

export default CommentComponent;
