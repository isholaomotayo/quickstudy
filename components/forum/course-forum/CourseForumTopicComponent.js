import React from "react";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import EditCourseTopicPopup from "./EditCourseTopicPopup";
import DeleteCourseTopicPopups from "./DeleteCourseTopicPopup";
dayjs().format();
dayjs.extend(relativeTime);
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const CourseForumTopicComponent = props => {
  const time = dayjs(props.topic.created_at).from(dayjs());
  return <>
    <Row className="mb-3 border-bottom pb-3">
      <Col xs="12" lg="8" md="7" className="">
        <Col>
          <Link href={`/course-comments?id=${props.topic.id}`} legacyBehavior>
            <a className="text-big">{props.topic.title}</a>
          </Link>
        </Col>
        <Col className="py-2">
          {`Started ${time}`} &nbsp;·&nbsp; By{" "}
          {`${props.topic.user.first_name} ${props.topic.user.last_name}`}
        </Col>
      </Col>
      <Col>
        <Row>
          <Col
            lg="1"
            xl="6"
            sm="6"
            xs="6"
            md="2"
            className=" d-md-block d-none"
          >
            {props.topic.thread.length || 0}
          </Col>
        </Row>
      </Col>
      <Col lg="3" md="3">
        <Row>
          <Col xl="6" sm="6" xs="6" md="12">
            <EditCourseTopicPopup
              handleThreadClick={props.handleThreadClick}
              singleTopic={props.singleTopic}
              topic={props.topic}
              handleThreadUpdate={props.handleThreadUpdate}
              authUser={props.authUser}
              handleChange={props.handleChange}
            />
          </Col>
          <Col lg="12" xl="6" sm="6" xs="6" md="12">
            <DeleteCourseTopicPopups
              handleThreadDelete={props.handleThreadDelete}
              topic={props.topic}
              authUser={props.authUser}
              handleThreadClick={props.handleThreadClick}
            />
          </Col>
        </Row>
      </Col>
    </Row>
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

export default CourseForumTopicComponent;
