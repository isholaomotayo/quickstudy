import React from "react";
import Router from "next/router";
import { Form, Row, Col, Button } from "react-bootstrap";
import DefaultLayout from "../components/DefaultLayout";
import toast from "react-hot-toast";
import { postUser, postAffiliate, deleteUser } from "../helpers/FetchWrapper";
import { userNameValid } from "../helpers/utils";

class Register extends React.Component {
  state = {
    url: "",
    username: "",
    password: "",
    confirmPassword: "",
    lastName: "",
    firstName: "",
    otherName: "",
    phone: "",
    email: "",
    toDashboard: false,
    role: "AFFILIATE",
    bank: "",
    account_no: "",
  };

  // static async getInitialProps() {
  //   const result = await getAllApplications();
  //   const programmesList = await result;

  //   return programmesList;
  // }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  handleSubmit = async (e) => {
    e.preventDefault();
    if (this.state.password !== this.state.confirmPassword) {
      return toast.error(
        "Your password and confirm password fields must match"
      );
    }

    //check username format
    if (!userNameValid(this.state.username)) {
      return toast.error(
        "Only lowercase alphabets and numbers can be in your referral code."
      );
    }

    const result = await postUser(this.state);
    const newUser = result.newUser;

    let userId = newUser.id;
    if (userId) {
      let affiliateData = {
        user_id: userId,
        bank: this.state.bank,
        account_no: this.state.account_no,
      };
      const response = await postAffiliate(affiliateData);
      const newAffiliate = response.newAffiliate;

      if (newAffiliate.id) {
        //affiliate profile successfully created
        toast.success(
          "Thank you for registering as an affiliate in our programs. You can now give your referral code to interested applicants and get paid when they enroll and pay fees."
        );
        Router.push(`/login`);
      } else {
        const deleteUSer = await deleteUser(userId);

        //user profile successfully deleted
        toast.error(
          "An error occurred while creating your profile. Please check your details and try again"
        );
      }
    } else {
      let msg =
        "An error occurred while creating your profile. Please check your details and try again";
      //TODO: Add specific user error messages based on user_phone_unique, user_email_unique, user_username_unique or passwords not matching

      if (result.newUser.message.includes("user_username_unique"))
        msg =
          "Another user has already created an account with this username. please chose a different username and try again";
      else if (result.newUser.message.includes("user_phone_unique"))
        msg =
          "Another user has already created an account with this phone number. please chose a different phone number and try again";
      else if (result.newUser.message.includes("user_email_unique"))
        msg =
          "Another user has already created an account with this email address. please chose a different email addresss and try again";

      toast.error(msg);
    }
  };

  render() {
    // if (this.state.toDashboard === true) {
    //   Router.push(`/${this.state.url} `);
    // }
    return (
      <DefaultLayout pageTitle="Register">
        <div className="register-container full-height p-t-30 m-t-30">
          <div className="d-flex justify-content-center flex-column full-height ">
            <div className="d-flex align-self-center  col-md-4 ">
              <img
                className="image-responsive-height image-responsive-width"
                src="/custom/img/InstitutionLogo.png"
                alt="Institution Logo"
              ></img>
            </div>

            <h3>Welcome to the UNN Affiliate Program</h3>
            <p>
              Please <strong>carefully</strong> fill the form below to register
              as an affiliate.
            </p>
            <Form
              id="form-register"
              className="mt-3"
              onSubmit={this.handleSubmit}
            >
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="firstName"
                      value={this.state.firstName}
                      required
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Last Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="lastName"
                      value={this.state.lastName}
                      required
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Other Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="otherName"
                      value={this.state.otherName}
                      required
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Username (Referrer code)</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={this.state.username}
                      isInvalid={
                        this.state.username &&
                        !userNameValid(this.state.username)
                      }
                      required
                      onChange={this.handleChange}
                    />
                    <Form.Control.Feedback type="invalid">
                      lowercase alphabets and numbers only
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={this.state.password}
                      required
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={this.state.confirmPassword}
                      required
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={this.state.email}
                      placeholder="We will send your login details to you"
                      required
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      name="phone"
                      type="tel"
                      pattern="[0-9]*"
                      value={this.state.phone}
                      required
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Bank</Form.Label>
                    <Form.Control
                      type="text"
                      name="bank"
                      value={this.state.bank}
                      required
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Account number</Form.Label>
                    <Form.Control
                      type="text"
                      name="account_no"
                      value={this.state.account_no}
                      required
                      onChange={this.handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Button variant="primary" type="submit">
                Register
              </Button>
            </Form>
          </div>
        </div>
      </DefaultLayout>
    );
  }
}

export default Register;
