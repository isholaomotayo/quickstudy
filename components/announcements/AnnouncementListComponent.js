import React from "react";
import AnnouncementComponent from "./AnnouncementComponent";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

const AnnouncementListComponent = props => {
  return (
    <>
      <Container className="pull-ups">
        <Card
          bg="light"
          style={{ borderRadius: "0.25rem", maxWidth: "68rem" }}
          className="mb-5"
        >
          <Card.Body>
            <Row className="mb-3 border-bottom pb-3">
              <Col>Announcements</Col>
              {props.role === "ADMIN" && (
                <Col className="float-right" lg="3" md="3" sm="6" xs="6">
                  Action
                </Col>
              )}
            </Row>
            {props.announcements
              .sort((a, b) => b.id - a.id)
              .map(announcement => {
                return (
                  <AnnouncementComponent
                    key={announcement.id}
                    announcement={announcement}
                    handleChange={props.handleChange}
                    handleUpdate={props.handleUpdate}
                    handleClick={props.handleClick}
                    singleAnnouncement={props.singleAnnouncement}
                    handleDelete={props.handleDelete}
                    authUser={props.authUser}
                    handleEditorChange={props.handleEditorChange}
                    role={props.role}
                  />
                );
              })}
          </Card.Body>
        </Card>
      </Container>
      <style jsx global>
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
    </>
  );
};

export default AnnouncementListComponent;
