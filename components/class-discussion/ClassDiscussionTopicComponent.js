import React from "react";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import DeleteCourseDiscussionTopicPopups from "./DeleteClassDiscussionTopicPopup";
import EditCourseDiscussionTopicPopup from "./EditClassDiscussionTopicPopup";
import EditDiscussionTopicModal from "./EditDiscussionTopicModal";
dayjs().format();
dayjs.extend(relativeTime);

const CourseDiscussionTopicComponent = props => {
  const time = dayjs(props.topic.created_at).from(dayjs());
  return <>
    {/*single-thread*/}
    <div className="row p-t-10 p-b-10  align-items-center border-bottom">
      <div className="col">
        <Link href={`/discussion-comment?id=${props.topic.id}`} legacyBehavior>
          <a className="text-big">{props.topic.title}</a>
        </Link>
        <div className="text-muted small mt-1">
          {`Started ${time}`} &nbsp;·&nbsp;{" "}
          <p className="text-muted">
            {`${props.topic.user.first_name} ${props.topic.user.last_name}`}
          </p>
        </div>
      </div>
      <div className=" d-md-block col-4">
        <div className="row no-gutters align-items-center">
          <div className="media col-8 align-items-center">
            <div className="media-body  ml-2">
              {Number(props.topic.user_id) === Number(props.authUser) ? (
                <>
                  <EditDiscussionTopicModal
                    handleThreadClick={props.handleThreadClick}
                    singleTopic={props.singleTopic}
                    handleStartDate={props.handleStartDate}
                    handleEndDate={props.handleEndDate}
                    topic={props.topic}
                    handleThreadUpdate={props.handleThreadUpdate}
                    authUser={props.authUser}
                    handleChange={props.handleChange}
                    dateValidator={props.dateValidator}
                  />
                  <DeleteCourseDiscussionTopicPopups
                    handleThreadDelete={props.handleThreadDelete}
                    topic={props.topic}
                    authUser={props.authUser}
                    handleThreadClick={props.handleThreadClick}
                  />
                </>
              ) : null}
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
        .rounded-circle {
          border-radius: 50% !important;
        }
      `}
    </style>
  </>;
};

export default CourseDiscussionTopicComponent;
