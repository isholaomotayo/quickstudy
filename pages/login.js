import React from "react";

import { removeCookies } from "cookies-next";
import Router from "next/router";
import Layout from "../components/Layout";

import Link from "next/link";
import { confirmAlert } from "react-confirm-alert"; // Import
import "react-confirm-alert/src/react-confirm-alert.css"; // Import css
import toast from "react-hot-toast";
import ForgotPasswordModal from "../components/ForgotPasswordModal";
import ResetPasswordModal from "../components/ResetPasswordModal";
import {
  getAuthData,
  getInstituionByParams,
  resetPassword,
  sendForgotPasswordLink,
  userLogin,
} from "../helpers/FetchWrapper";
import { setAuthCookies } from "../helpers/utils";

const cookieExpiry = 1000 * 60 * 60 * 24 * 365;

class Login extends React.Component {
  state = {
    resetCode: this.props.resetCode,
    open: this.props.open ? this.props.open : false,
    toDashboard: false,
    url: "/login",
    email: "",
    password: "",
    forgotPasswordModalOpen: this.props.forgotPasswordModalOpen || false,
    newPassword: "",
    confirmPassword: "",

    verification: this.props.verification ? this.props.verification : false,
  };

  static getInitialProps = async (props) => {
    const { req, res, query } = props;

    let url;
    let resetCode;
    let open;
    let result = "test";
    let verification;
    let forgotPasswordModalOpen;
    let { userRole } = await getAuthData(req);

    let institution;

    institution = await getInstituionByParams({ id: "1" }, props);

    // check role and set appropriate redirect url
    if (userRole == "APPLICANT") {
      url = "/applicant";
    } else if (userRole == "STUDENT") {
      url = "/students";
    } else if (userRole == "STAFF" || userRole == "LECTURER") {
      url = "/staff";
    } else if (userRole && userRole.slice(-5) == "ADMIN") {
      url = "/admin";
    }

    const redirectTo = (toURL) => {
      if (res) {
        res.writeHead(302, {
          Location: toURL,
        });
        res.end();
      } else {
        Router.push(toURL);
      }
    };
    // console.log(getCookies(req));
    // Logout shortcut
    if (query.logout) {
      removeCookies({ res }, "token", { path: "/" });
      removeCookies({ res }, "role", { path: "/" });
      removeCookies({ res }, "userId", { path: "/" });
      removeCookies({ res }, "userData", { path: "/" });
      removeCookies({ res }, "institutionId", { path: "/" });

      url = "/login";
    }

    // Check for reset code

    if (query.resetPassword) {
      resetCode = query.resetPassword;
      open = true;
    }

    // Check for reset code
    if (query.verification) {
      verification = query.verification;
    }

    if (query.forgotPassword) {
      forgotPasswordModalOpen = true;
    }

    if (url) redirectTo(url);

    return {
      result,
      resetCode,
      open,
      verification,
      query,
      forgotPasswordModalOpen,
      institution,
    };
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  checkRedirect = () => {
    if (this.props.query.redirect) {
      const url = `/${this.props.query.redirect}`;
      this.setState({
        url,
      });
    } else {
      return;
    }
  };

  handleSubmit = async (e) => {
    e.preventDefault();

    let login = await userLogin(this.state);

    if (login.status === 200) {
      login = await login.json();

      setAuthCookies(login);

      let userRole = login.role;

      this.setState({
        username: "",
        email: "",
        password: "",
      });

      // check role and set appropriate redirect url
      if (userRole == "APPLICANT") {
        this.setState(
          {
            url: "/applicant",
            toDashboard: true,
          },
          () => this.checkRedirect()
        );
      } else if (userRole == "AFFILIATE") {
        this.setState(
          {
            url: "/affiliate",
            toDashboard: true,
          },
          () => this.checkRedirect()
        );
      } else if (userRole == "STUDENT") {
        this.setState(
          {
            url: "/students",
            toDashboard: true,
          },
          () => this.checkRedirect()
        );
      } else if (userRole == "STAFF" || userRole == "LECTURER") {
        this.setState(
          {
            url: "/staff",
            toDashboard: true,
          },
          () => this.checkRedirect()
        );
      } else if (userRole && userRole.slice(-5) == "ADMIN") {
        this.setState(
          {
            url: "/admin",
            toDashboard: true,
          },
          () => this.checkRedirect()
        );
      }
    } else {
      if (login.status === 401) {
        toast.error("Email or Password Incorrect. Try again");
      } else {
        const error = await login.json();
        if (error.message.includes("Your account has been deactivated")) {
          toast.error(error.message);
        } else {
          toast.error("Login Error! Please try again");
        }
      }
    }
  };

  handleForgotPassword = async (e) => {
    const userData = {
      email: this.state.email,
    };
    const result = await sendForgotPasswordLink(userData);

    if (result.status === 200) {
      confirmAlert({
        title: "Email sent",
        message: "Please check your email to retrieve your new password",
        buttons: [
          {
            label: "OK",
            onClick: () => {},
          },
        ],
      });
    } else {
      toast.error(
        "Email sending failed. Please ensure that you use the email you registered with for this operation to be successful"
      );
    }
  };

  openModal = () => {
    this.setState({ open: true });
  };
  closeModal = () => {
    this.setState({ open: false });
  };

  handleResetPassword = async (e) => {
    if (this.state.newPassword !== this.state.confirmPassword)
      return toast("Your password and confirm password fields must match", {
        icon: "⚠️",
      });
    const postData = {
      newPassword: this.state.newPassword,
      resetCode: this.state.resetCode,
    };
    const result = await resetPassword(postData);

    if (result.status === 200) {
      this.setState({ open: false });
      toast.success("New Password successfully saved. You may now login.");
      Router.push("/login");
    } else {
      toast.error("Could not save new password.");
    }
  };
  render() {
    if (this.state.toDashboard) {
      Router.push(this.state.url);
    }

    if (
      this.props.verification === "success" ||
      this.props.verification === "fail"
    ) {
      process.browser &&
        confirmAlert({
          title: "Account Verification",
          message:
            "Your account  " +
            (this.state.verification === "success"
              ? "has been successfully verified"
              : "verification failed"),
          buttons: [
            {
              label:
                this.state.verification === "success"
                  ? "Continue to Login"
                  : "Try again ",
              onClick: () => {
                Router.push("/");
              },
            },
          ],
        });
    }
    return (
      <Layout noWrappers={true}>
        {this.state.resetCode ? (
          <ResetPasswordModal
            open={this.state.open}
            openModal={this.openModal}
            closeModal={this.closeModal}
            handleChange={this.handleChange}
            handleSubmit={this.handleResetPassword}
            password={this.state.password}
          />
        ) : null}

        <div className="login-wrapper ">
          {/* START Login Background Pic Wrapper */}
          <div className="bg-pic">
            {/* START Background Pic */}
            <img
              src="custom/img/login-bg2.svg"
              data-src="custom/img/login-bg2.svg"
              data-src-retina="custom/img/login-bg2.svg"
              className="lazy"
            />
            {/* END Background Pic */}
            {/* START Background Caption */}
            <div className="bg-caption pull-bottom sm-pull-bottom text-white p-l-20 m-b-50">
              <h2 className="semi-bold text-white">
                Welcome to {this.props?.institution?.name}
                {/* Welcome to iLearn Demo by Hyperdrive */}
              </h2>
            </div>
            {/* END Background Caption */}
          </div>
          {/* END Login Background Pic Wrapper */}
          {/* START Login Right Container */}
          <div className="login-container bg-white">
            <div className="p-l-50 m-l-20 p-r-50 m-r-20 p-t-50 m-t-30 sm-p-l-15 sm-p-r-15 sm-p-t-40">
              <div className="d-flex align-self-center col-md-8 ">
                <img
                  className="image-responsive-height image-responsive-width"
                  src={this.props.institution?.logo}
                  // src="custom/img/logo-dark.svg"
                  alt="Institution Logo"
                ></img>
              </div>

              <p className="p-t-35">Enter your login credentials</p>
              {/* START Login Form */}
              <form
                id="form-login"
                className="p-t-15"
                role="form"
                onSubmit={this.handleSubmit}
              >
                {/* START Form Control */}
                <div className="form-group form-group-default">
                  <label>Login</label>
                  <div className="controls">
                    <input
                      type="text"
                      name="email"
                      placeholder="Email"
                      value={this.state.email}
                      className="form-control"
                      required
                      onChange={this.handleChange}
                    />
                  </div>
                </div>
                {/* END Form Control */}
                {/* START Form Control */}
                <div className="form-group form-group-default">
                  <label>Password</label>
                  <div className="controls">
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={this.state.password}
                      placeholder="Password"
                      required
                      onChange={this.handleChange}
                    />
                  </div>
                </div>
                {/* START Form Control */}
                <div className="row">
                  <div className="col-md-6 no-padding sm-p-l-10">
                    <div className="checkbox ">
                      <input type="checkbox" defaultValue={1} id="checkbox1" />
                      <label htmlFor="checkbox1">Keep Me Signed in</label>
                    </div>
                  </div>
                  <div className="col-md-6 d-flex align-items-center justify-content-end">
                    {/* <a href="support" className="text-info small">
                      Help? Contact Support
                    </a> */}
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6 no-padding sm-p-l-10">
                    <ForgotPasswordModal
                      defaultOpen={this.state.forgotPasswordModalOpen}
                      email={this.state.email}
                      handleChange={this.handleChange}
                      handleSubmit={this.handleForgotPassword}
                    />
                  </div>
                </div>
                {/* END Form Control */}

                <div className="row">
                  <button
                    className="btn btn-info btn-cons btn-rounded m-t-10"
                    type="submit"
                  >
                    Sign in
                  </button>
                </div>
                <br />
                <div className="d-flex justify-content-center flex-column full-height ">
                  <p>
                    If you don't have an account you can create one by clicking
                    on the apply button to get started with any of the
                    University programmes
                  </p>
                </div>
                <div className="row">
                  <div className=" ">
                    <div className="col-xs-12">
                      <Link
                        href={`register`}
                        className="btn btn-success btn-rounded btn-cons text-white m-t-10"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                </div>

                <br />
                <div className="d-flex justify-content-center flex-column full-height ">
                  <p>
                    For any questions or concerns, send an email to
                    <strong> {this.props?.institution?.support_mail}</strong>
                  </p>
                  {/* <div>Would you like to earn extra cash?</div>

                  <Link href={`affiliate-signup`}>
                    <a className="btn btn-complete btn-rounded btn-cons text-white m-t-10">
                      Register as an Affiliate
                    </a>
                  </Link> */}
                </div>
              </form>
              {/*END Login Form */}
            </div>
          </div>
          {/* END Login Right Container */}
        </div>
      </Layout>
    );
  }
}

export default Login;
