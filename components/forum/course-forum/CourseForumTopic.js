import React from "react";
import CourseForumTopicComponent from "./CourseForumTopicComponent";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";

const CourseForumTopic = props => {
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
              <Col xs="6" lg="8" md="7" xs="6">
                Top Topics
              </Col>
              <Col
                className="float-left d-md-block d-none"
                lg="1"
                md="2"
                xs="3"
              >
                Replies
              </Col>
              {
                <Col
                  className="float-right  d-md-block d-none"
                  lg="3"
                  md="3"
                  xs="3"
                  xs="6"
                >
                  Actions
                </Col>
              }
            </Row>

            {props.topics
              .sort((a, b) => b.id - a.id)
              .map(topic => {
                return (
                  <div key={topic.id}>
                    <CourseForumTopicComponent
                      topic={topic}
                      handleThreadClick={props.handleThreadClick}
                      singleTopic={props.singleTopic}
                      handleThreadUpdate={props.handleThreadUpdate}
                      handleThreadDelete={props.handleThreadDelete}
                      handleChange={props.handleChange}
                      authUser={props.authUser}
                    />
                  </div>
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
            margin-top: -100px !important;
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

export default CourseForumTopic;
