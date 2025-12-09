import React from "react";
import Link from "next/link";
import dayjs from "dayjs";
import EditThreadPopup from "./EditThreadPopup";
import DeleteThreadPopup from "./DeleteThreadPopup";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs().format();
dayjs.extend(relativeTime);

const ThreadComponent = props => {
  const time = dayjs(props.threadItem.created_at).from(dayjs());
  return <>
    {/*single-thread*/}
    <div className="row p-t-10 p-b-10  align-items-center border-bottom">
      <div className="col">
        <Link href={`/forum-comments?id=${props.threadItem.id}`} legacyBehavior>
          <a className="text-big">{props.threadItem.title}</a>
        </Link>
        <div className="text-muted small mt-1">
          {`Started ${time}`} &nbsp;·&nbsp;{" "}
          <p className="text-muted">
            {`${props.threadItem.user.first_name} ${props.threadItem.user.last_name}`}
          </p>
        </div>
      </div>
      <div className=" d-md-block col-4">
        <div className="row no-gutters align-items-center">
          <div className="col-4">{props.threadItem.thread.length || 0}</div>
          <div className="media col-8 align-items-center">
            <div className="media-body  ml-2">
              {Number(props.authUser) === Number(props.threadItem.user.id) ? (
                <>
                  <EditThreadPopup
                    handleThreadUpdate={props.handleThreadUpdate}
                    handleThreadClick={props.handleThreadClick}
                    thread={props.threadItem}
                    handleChange={props.handleChange}
                    singleThread={props.singleThread}
                  />
                  <DeleteThreadPopup
                    handleThreadClick={props.handleThreadClick}
                    handleThreadDelete={props.handleThreadDelete}
                    id={props.threadItem.id}
                  />
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
    {/*end single-thread*/}
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

export default ThreadComponent;
