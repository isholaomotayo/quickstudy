import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import EditCourseThreadPopup from "./EditCourseThreadPopup";
import DeleteCourseThreadPopups from "./DeleteCourseThreadPopup";
import toast from "react-hot-toast";

dayjs().format();
dayjs.extend(relativeTime);

const CommentComponent = (props) => {
  return (
    <>
      <div className="container pull-ups">
        <div className="row">
          <div className="col-md-12 m-b-30">
            <div className="card carde mb-4">
              {props.threads
                .sort((a, b) => b.id - a.id)
                .map((thread, i) => {
                  return (
                    <div className="card" key={i}>
                      <div className="card-header">
                        <div className="media flex-wrap align-items-center">
                          <div className="avatar avatar">
                            <img
                              src={
                                thread.user.avatar ||
                                `https://static01.nyt.com/newsgraphics/2019/11/14/02beauty/92c09c85e458893bb9e20add15d021729eb38239/coverimg.jpg`
                              }
                              alt="..."
                              className="avatar-img rounded-circle"
                            />
                          </div>
                          <div className="media-body ml-3 bold">
                            <a href="#!">{`${thread.user.first_name} ${thread.user.last_name} `}</a>
                            <div className="text-muted small">
                              {dayjs(thread.created_at).from(dayjs())}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="card-body">
                        <p className="mt-3">{thread.body}</p>
                      </div>
                      <div className="card-footer d-flex flex-wrap justify-content-between align-items-center px-0 pt-0 pb-3">
                        <div className="px-4 pt-3">
                          <EditCourseThreadPopup
                            handleThreadClick={props.handleThreadClick}
                            handleThreadUpdate={props.handleThreadUpdate}
                            singleThread={props.singleThread}
                            id={thread.id}
                            handleChange={props.handleChange}
                            authUser={props.authUser}
                            userId={thread.user.id}
                          />
                          <DeleteCourseThreadPopups
                            handleThreadClick={props.handleThreadClick}
                            thread={thread}
                            authUser={props.authUser}
                            handleThreadDelete={props.handleThreadDelete}
                          />

                          <span className="text-muted ml-4 cursor report">
                            <i className="fa fa-warning   align-middle" />
                            &nbsp;
                            <a
                              className="align-middle alert-link "
                              onClick={() => {
                                toast(
                                  "You have successfully reported this comment",
                                  { icon: "ℹ️" }
                                );
                              }}
                            >
                              Report
                            </a>
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
