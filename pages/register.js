import React from "react";
import Router from "next/router";
import { getCookies } from "cookies-next";
import { Form, Row, Col, Button } from "react-bootstrap";
import DefaultLayout from "../components/DefaultLayout";
import toast from "react-hot-toast";
import {
  postUser,
  postStudent,
  deleteUser,
  verifyRefCode,
  postAffiliate,
  getInstituionByParams,
} from "../helpers/FetchWrapper";
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
    referral_code: this.props.referrerCode || "",
    is_affiliate: false,
    bank: "",
    account_no: "",
    institution_id: this.props.institution.id,
  };

  static getInitialProps = async (props) => {
    const { req, res, query } = props;
    const { referrerCode } = getCookies({ req }) || {};

    let host, institution;
    host = req ? req.headers.host : window.location.host;

    institution = await getInstituionByParams({ id: "1" }, props);

    return { referrerCode, institution };
  };

  handleChange = (e) => {
    const value =
      e.target.name === "is_affiliate" ? e.target.checked : e.target.value;
    const name = e.target.name;
    this.setState({
      [name]: value,
    });
  };
  handleCheckboxChange = (e) => {
    const item = e.target.name;
    const isChecked = e.target.checked;
    this.setState((prevState) => ({
      affiliate: prevState.affiliate.set(item, isChecked),
    }));
  };
  handleSubmit = async (e) => {
    e.preventDefault();

    if (this.state.password !== this.state.confirmPassword)
      return toast.error(
        "Your password and confirm password fields must match"
      );

    //check username format
    if (!userNameValid(this.state.username)) {
      return toast(
        "Only lowercase alphabets and numbers can be in your username.",
        { icon: "⚠️" }
      );
    }

    //check that the username is different from the referral code. An applicant can't refer himself
    if (this.state.referral_code == this.state.username) {
      return toast.error(
        "Your username must be different from your Referral code"
      );
    }

    //check that the inputted referral code exists
    if (this.state.referral_code) {
      const verification = await verifyRefCode(
        this.state.referral_code.toLowerCase()
      );

      if (verification.status != 200) {
        return toast.error(
          "This Referral code does not exist. Kindly enter a correct Referral code or leave the field empty"
        );
      }
    }

    const result = await postUser(this.state);
    const newUser = result.newUser;

    let userId = newUser.id;
    if (userId) {
      const response = await postStudent(newUser);
      const newStudent = response.newStudent;

      if (newStudent.id) {
        //student profile successfully created

        if (this.state.is_affiliate) {
          //if a user checked the affiliate box, create an affiliate record.
          let affiliateData = {
            user_id: userId,
            bank: this.state.bank,
            account_no: this.state.account_no,
          };
          const outcome = await postAffiliate(affiliateData);
        }
        toast.success(
          "Thank you for your interest in our programs, to complete the application process, please check your email for a message from us and follow the instructions."
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
      console.log(result.newUser.message);
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
                src={this.props.institution.logo}
                alt="Institution Logo"
              ></img>
            </div>

            <h3>
              Welcome to the {this.props.institution.code} Program Application
              Portal.
            </h3>
            <p>
              Please <strong>carefully</strong> fill the form below to start the
              application process. To complete the application successfully,
              please make sure you already have a{" "}
              <strong>professionally</strong> taken and edited copy of your
              passport photograph. You will also need a scanned copy of either
              your —{" "}
              <strong>
                International Passport, Voter's ID Card, or Driver's License.
              </strong>
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
                    <Form.Label>Username</Form.Label>
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
                <Col xs={12}>
                  <Form.Group>
                    <Form.Label>
                      Referrer's Code (If you were referred)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="referral_code"
                      value={this.state.referral_code}
                      readOnly={(this.props.referrerCode && true) || false}
                      onChange={
                        this.props.referrerCode ? null : this.handleChange
                      }
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

// export default Register;

export default Register;
