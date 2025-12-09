import React from "react";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import ViewAnnouncementPopup from "../announcements/ViewAnnouncementPopup";
import EditAnnouncementPopup from "./EditAnnouncementPopup";
import DeleteAnnouncementPopup from "./DeleteAnnouncementPopup";
dayjs().format();
dayjs.extend(relativeTime);

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

const AnnouncementComponent = props => {
  const time = dayjs(props.announcement.created_at).from(dayjs());
  return (
    <>
      {/*single-thread*/}
      <Row className="mb-3 border-bottom pb-1">
        <Col xs="12" lg="9" className="mb-1">
          <Col>
            <ViewAnnouncementPopup announcement={props.announcement} />
          </Col>
          <Col className="py-2">
            {`Started ${time}`} &nbsp;·&nbsp; By{" "}
            {`${props.announcement.user.first_name} ${props.announcement.user.last_name}`}
          </Col>
        </Col>
        <Col>
          {props.role === "ADMIN" && (
            <Row>
              <Col lg="12" xl="6" sm="6" xs="6" md="6">
                <EditAnnouncementPopup
                  id={props.announcement.id}
                  handleChange={props.handleChange}
                  singleAnnouncement={props.singleAnnouncement}
                  handleUpdate={props.handleUpdate}
                  handleClick={props.handleClick}
                  authUser={props.authUser}
                  userId={props.announcement.user.id}
                  handleEditorChange={props.handleEditorChange}
                />
              </Col>
              <Col lg="12" xl="6" sm="6" xs="6" md="6">
                <DeleteAnnouncementPopup
                  handleClick={props.handleClick}
                  id={props.announcement.id}
                  handleDelete={props.handleDelete}
                  authUser={props.authUser}
                  userId={props.announcement.user.id}
                />
              </Col>
            </Row>
          )}
        </Col>
      </Row>

      <style jsx>
        {`
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
    </>
  );
};

export default AnnouncementComponent;
