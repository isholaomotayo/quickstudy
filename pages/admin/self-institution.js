import React, { useState } from "react";
import Layout from "../../components/Layout";
import { protectPage } from "../../helpers/utils";
import { Container, Row, Col, Modal, Form } from "react-bootstrap";

const SendEmail = (props) => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const handleShow = () => setShow(true);

  const handleClose = () => setShow(false);

  return (
    <>
      <a className="text-white btn btn-primary" onClick={handleShow}>
        Send Email
      </a>

      <Modal show={show} onHide={handleClose}>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            await props.handleEmail(email, handleClose);
          }}
        >
          <Modal.Header closeButton className="mb-3">
            <Modal.Title>Send Welcome Mail to Institution</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Newly added Institution's mail</Form.Label>
              <Form.Control
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <button type="submit" className="btn btn-complete">
              Send
            </button>
            <button
              className="btn btn-danger"
              type="button"
              onClick={handleClose}
            >
              Cancel
            </button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

class SelfInstitution extends React.Component {
  state = {};
  static getInitialProps = async ({ req, res, query, ...ctx }) => {
    const allowedRoles = ["ADMIN", "SUPERADMIN"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    return { userData };
  };

  handleEmail = async (email, cb) => {
    let emailResponse = await fetch(
      `${process.env.API_URL}/api/selfInstitution/resendEmail`,
      {
        method: "post",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ email }),
      }
    );

    if (emailResponse.status === 200) {
      toast.success("Institution has been notified of new activation link", {
        icon: "✅",
      });
    } else {
      toast.success(
        "Failed. Please check the email provided and confirm this institution already exist",
        { icon: "✅" }
      );
    }

    this.setState({
      name: "",
      email: "",
      code: "",
      address: "",
      phone: "",
    });
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };
  render() {
    return (
      <Layout pageTitle="New Institution" userData={this.props.userData}>
        <Container>
          <Row>
            <Col>
              <h2>Self Institution Admin Management</h2>
              <p>
                This is a page where you can add a new institution and send a
                welcome email to the institution. Only use this functionality to
                send an already created institution an email. This comes in
                handy if the newly added institution didn't get a mail in time
                or they didn't register after being added.
              </p>
              <SendEmail handleEmail={this.handleEmail} />
            </Col>
          </Row>
          <Row className="mt-5">
            <Col>
              <h3>
                Create a new institution and send them a mail for onboarding.
              </h3>
              <Form
                onSubmit={async (e) => {
                  e.preventDefault();

                  await this.handleInstitutionAdd();
                }}
              >
                <Form.Group>
                  <Form.Label>Institution Name</Form.Label>
                  <Form.Control
                    type="text"
                    onChange={this.handleChange}
                    name="name"
                    required
                    value={this.state?.name ?? ""}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Institution Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    onChange={this.handleChange}
                    value={this.state?.email ?? ""}
                    required
                  />
                </Form.Group>

                <Form.Group>
                  <Form.Label> Phone Number</Form.Label>
                  <Form.Control
                    type="number"
                    name="phone"
                    min="0"
                    onChange={this.handleChange}
                    value={this.state?.phone ?? ""}
                    required
                  />
                </Form.Group>
                <Form.Text className="text-primary bold">
                  Example: 08012345678
                </Form.Text>

                <Form.Group>
                  <Form.Label>Institution Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="code"
                    value={this.state?.code ?? ""}
                    onChange={this.handleChange}
                    required
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Institution Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="address"
                    value={this.state?.address ?? ""}
                    onChange={this.handleChange}
                    required
                  />
                </Form.Group>
                <button type="submit" className="btn btn-success">
                  Create Institution
                </button>
              </Form>
            </Col>
          </Row>
        </Container>
      </Layout>
    );
  }
}

const ToastWrapper = (props) => {
  return <SelfInstitution {...props} />;
};
ToastWrapper.getInitialProps = SelfInstitution.getInitialProps;

export default ToastWrapper;
