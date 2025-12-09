import React from "react";
import Layout from "../../components/Layout";
import {
  getStudentByUserId,
  getNewTransactionAmount
} from "../../helpers/FetchWrapper";
import { protectPage } from "../../helpers/utils";
import PaystackButton from "react-paystack";
import Router from "next/router";
import { getReference } from "../../helpers/FetchWrapper";

class MakePayment extends React.Component {
  state = {
    feeStudentPayment: this.props.feeStudentPayment,
    transaction_id: this.props.feeStudentPayment.transaction_id || "",

    email: this.props.student.user.email, // customer email
    amount: this.props.feeStudentPayment.amount //equals value in kobo
  };

  static getInitialProps = async ({ req, res, query }) => {
    const { id } = query;
    const allowedRoles = ["STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );
    let paymentDetails;

    const { student } = await getStudentByUserId(userId, req);

    let feeStudentPayment = await (
      await fetch(`${process.env.API_URL}/api/feestudentpayment/${id}`, {
        method: "get",
        credentials: "include",
        headers: req
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
      })
    ).json();

    paymentDetails = await (
      await fetch(`${process.env.API_URL}/api/paymentaccount`, {
        method: "get",
        credentials: "include",
        headers: req
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
      })
    ).json();

    return {
      student,
      feeStudentPayment,
      userData,
      paymentDetails
    };
  };
  callback = this.props.callback
    ? response => this.props.callback(response)
    : response => {
        console.log(" ok payment went through hinding ersponse"); // card charged successfully, get reference here

        Router.push(`/student/payment-log`);
      };
  close =
    this.props.close ||
    (() => {
      console.log("Payment closed");
    });

  render() {
    return (
      <Layout pageTitle="Make Payments" userData={this.props.userData}>
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="card-title">
              <h4>Payments</h4>
            </div>
          </div>
          <div className="card-body">
            <table className="table table-condensed table-responsive">
              {this.state.feeStudentPayment ? (
                <tbody>
                  <tr>
                    <th className="v-align-middle w-25">Name</th>
                    <td className="v-align-middle">
                      <p>Payment</p>
                    </td>
                  </tr>
                  <tr>
                    <th className="v-align-middle w-25">Amount</th>
                    <td className="v-align-middle">{this.state.amount}</td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  <tr>No record found</tr>
                </tbody>
              )}
            </table>
            <br />
            <form>
              <div className="m-l-10">
                <PaystackButton
                  //metadata={{ userId: me.id }}
                  class="btn btn-complete text-white"
                  text="Make Payment"
                  callback={this.callback}
                  close={this.close}
                  disabled={false}
                  embed={false}
                  reference={this.state.transaction_id}
                  email={this.state.email}
                  amount={getNewTransactionAmount(this.state.amount)} //paystack amount is in kobo
                  paystackkey={`${this.props.paymentDetails.test_public_key}`}
                  tag="a"
                />
              </div>
            </form>
          </div>
        </div>
      </Layout>
    );
  }
}
export default MakePayment;
