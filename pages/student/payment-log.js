import React from "react";
import Layout from "../../components/Layout";
import { getFeeById, getStudentByUserId } from "../../helpers/FetchWrapper";
import { protectPage } from "../../helpers/utils";
import Router from "next/router";
import PaystackButton from "react-paystack";
import { Modal, Button } from "react-bootstrap";

import {
  getReference,
  getNewTransactionAmount
} from "../../helpers/FetchWrapper";

class Payment extends React.Component {
  state = {
    fees: this.props.paymentLog,

    email: this.props.student.user.email, //equals value in kobo

    show: false,
    paymentLogTransactionId: "",
    paymentLogAmount: 0
  };

  callback = this.props.callback
    ? response => this.props.callback(response)
    : response => {
        this.setState({ show: false });
        Router.push(`/student/payment-log`);
      };
  close =
    this.props.close ||
    (() => {
      console.log("Payment closed");
    });
  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );
    let paymentDetails;

    const { student } = await getStudentByUserId(userId, req);
    const studentId = student ? student.id : 0;

    let paymentLog = await (
      await fetch(
        `${process.env.API_URL}/api/feestudentpaymentfrequency?student_id=${studentId}`,
        {
          method: "get",
          credentials: "include",
          headers: req
            ? { cookie: req.headers.cookie }
            : {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
        }
      )
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

    return { paymentLog, student, userData, paymentDetails };
  };

  openPaymentLogModal = async (id, paymentAmount) => {
    let transAmount = await getNewTransactionAmount(paymentAmount);

    this.setState({
      paymentLogAmount: transAmount
    });
    let feeStudentPaymentFrequencyId = id;
    await fetch(`${process.env.API_URL}/api/feestudentpayment`, {
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        fee_student_payment_frequency_id: feeStudentPaymentFrequencyId,
        amount: paymentAmount,
        transaction_id: getReference(),
        reference: getReference()
      })
    })
      .then(response => response.json())
      .then(json => {
        let transId = json.transaction_id;

        this.setState({ paymentLogTransactionId: transId, show: true });
      })
      .catch(e => {
        console.log(e);
        return e;
      });
  };
  closePaymentLogModal = () => {
    this.setState({ show: false, paymentLogAmount: 0 });
  };
  render() {
    return (
      <Layout pageTitle="Student Payments" userData={this.props.userData}>
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="card-title">
              <h4>Payment Log</h4>
            </div>
          </div>
          <div className="card-body">
            <table className="table table-condensed table-hover">
              <thead>
                <tr>
                  <th>Payment Plan</th>
                  <th>Payment Amount</th>
                  <th>Total Amount</th>
                  <th>Paid Fees</th>
                </tr>
              </thead>
              <tbody>
                {this.state.fees.length ? (
                  this.state.fees.map(payment => (
                    <tr key={`${payment.id}`}>
                      <td className="font-montserrat all-caps fs-12 w-50">
                        {payment.payment_plan}
                      </td>
                      <td className="w-15">
                        <span className="font-montserrat fs-18">
                          {payment.payment_amount} NGN
                        </span>
                      </td>
                      <td className="w-15">
                        <span className="font-montserrat fs-18">
                          {payment.total_amount} NGN
                        </span>
                      </td>
                      <td className="w-25">
                        <span className="font-montserrat fs-18">
                          {payment.status ? "Yes" : "No"}
                        </span>
                      </td>
                      <td>
                        {payment.status ? (
                          ""
                        ) : (
                          <>
                            <Button
                              variant="primary"
                              onClick={() => {
                                this.openPaymentLogModal(
                                  payment.id,
                                  payment.payment_amount
                                );
                              }}
                            >
                              View Details
                            </Button>
                            <Modal
                              show={this.state.show}
                              onHide={this.closePaymentLogModal}
                              animation={false}
                            >
                              <Modal.Header closeButton>
                                <Modal.Title>Make Payment</Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                <p>
                                  You're about to make payment of NGN{" "}
                                  {Number(this.state.paymentLogAmount / 100)
                                    .toFixed(2)
                                    .replace(/\d(?=(\d{3})+\.)/g, "$&,")}{" "}
                                  (transaction charges inclusive). Click Pay
                                  below to proceed to the payment gateway
                                </p>
                              </Modal.Body>
                              <Modal.Footer>
                                <PaystackButton
                                  //metadata={{ userId: me.id }}
                                  class="btn btn-complete text-white"
                                  text="Pay"
                                  callback={this.callback}
                                  close={this.close}
                                  disabled={false}
                                  embed={false}
                                  reference={this.state.paymentLogTransactionId}
                                  email={this.state.email}
                                  amount={Number(
                                    this.state.paymentLogAmount
                                  ).toFixed(2)} //paystack amount is in kobo
                                  paystackkey={`${this.props.paymentDetails.test_public_key}`}
                                  tag="a"
                                />
                              </Modal.Footer>
                            </Modal>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td>No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    );
  }
}
export default Payment;
