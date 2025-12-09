import React from "react";
import Layout from "../../components/Layout";
import Checkbox from "../../components/Checkbox.js";
import { OverlayTrigger, Overlay, Popover } from "react-bootstrap";
import {
  getFeeById,
  getStudentByUserId,
  getCurrentSemester,
  getReference,
  getStudentLevelId,
  getNewTransactionAmount
} from "../../helpers/FetchWrapper";
import { protectPage, codeLogin } from "../../helpers/utils";
import Router from "next/router";
import toast from "react-hot-toast";

import PaystackButton from "react-paystack";
import { Modal, Button } from "react-bootstrap";
import Head from "next/head";
import Error from "next/error";

const popover = (
  <Popover id="popover-basic">
    <Popover.Title as="h3">This feature will be available soon</Popover.Title>
    <Popover.Content>
      We are working on hard to ensure that you have a{" "}
      <strong>seamless experience</strong> We will let you know when this
      feature is available
    </Popover.Content>
  </Popover>
);

class Payment extends React.Component {
  state = {
    fees: this.props.filter_fees,
    student: this.props.student,
    studentId: this.props.studentId,
    currentSemesterId: this.props.currentSemesterId,

    checkedItems: new Map(),
    paymentPlan: "PAY IN FULL",

    open: false,
    showPlan: false,
    transaction_id: "",
    fullAmount: 0,
    amount: 0,
    feeStudentPaymentFrequencyId: "",
    feeStudentPaymentId: "",
    feeStudentId: "",
    totalAmount: 0,
    no_payments: 0,
    email: this.props.student.user.email || "a@b.com",

    paymentLogs: this.props.paymentLog,
    show: false,
    paymentLogTransactionId: "",
    paymentLogAmount: 0,
    feeName: "",
    phone: this.props.student.user.phone || "0700",
    name:
      this.props.student.user.first_name +
        " " +
        this.props.student.user.last_name || "NA",
    userId: this.props.student.user.id || "0"
  };
  callback = this.props.callback
    ? response => this.props.callback(response)
    : response => {
        this.setState({ show: false, paymentPlan: "PAY IN FULL", feeName: "" });
        // Router.push(`/student/payments`);
      };
  close =
    this.props.close ||
    (() => {
      this.setState({ show: false, paymentPlan: "PAY IN FULL", feeName: "" });
      console.log("Payment closed");
      //Router.push(`/student/payments`);
    });
  static getInitialProps = async ({ req, res, query, pathname }) => {
    await codeLogin(req, res, query, pathname);

    const allowedRoles = ["STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let paymentDetails;

    const { student } = await getStudentByUserId(userId, req);
    const errorCode = student ? false : true; //if student is not found, throw an error
    const studentId = student ? student.id : 0;
    const entryLevelId =
      student && student.entry_level_id ? student.entry_level_id : 1;

    const admittedSemesterId =
      student && student.semester_admitted_id
        ? student.semester_admitted_id
        : 1;

    const { semester } = await getCurrentSemester(req);
    const currentSemesterId = semester ? semester.id : 1;

    const levelId = await getStudentLevelId(
      admittedSemesterId,
      currentSemesterId,
      entryLevelId,
      req
    );

    const institutionId = (student && student.user.institution_id) || 0;

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

    // console.log(paymentLog);

    let paidAndInitiatedFees = await (
      await fetch(
        `${process.env.API_URL}/api/feestudent?paid_fees=1&paid_fees=2`,
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

    let fees = await (
      await fetch(
        `${process.env.API_URL}/api/fee/params?level_id=${levelId}&institution_id=${institutionId}`,
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

    let filter_fees;

    filter_fees = fees;
    if (paidAndInitiatedFees.length && fees.length) {
      //some paid fees logs exist, fetch associated amounts of paid and unpaid
      for (let i = 0; i < paidAndInitiatedFees.length; i++) {
        filter_fees = filter_fees.filter(
          item => item.id != paidAndInitiatedFees[i].fee_id
        );
      }
    }

    return {
      errorCode,
      fees,
      filter_fees,
      studentId,
      student,
      currentSemesterId,
      paymentLog,
      userData,
      paymentDetails
    };
  };

  handleChange = e => {
    const item = e.target.name;
    const isChecked = e.target.checked;
    this.setState(prevState => ({
      checkedItems: prevState.checkedItems.set(item, isChecked)
    }));
  };
  handlePlanChange = async (
    e,
    totalAmount,
    feeStudentPaymentFrequencyId,
    feeStudentPaymentId,
    feeStudentId
  ) => {
    let prevPaymentPlan = this.state.paymentPlan;
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });

    let paymentPlan = value;
    let paymentAmount = 0;
    let no_payments;
    if (paymentPlan == "PAY IN FULL") {
      paymentAmount = totalAmount;
      no_payments = 1;
    } else if (paymentPlan == "PER SESSION") {
      paymentAmount = totalAmount / 2;
      no_payments = 2;
    } else if (paymentPlan == "PER SEMESTER") {
      paymentAmount = totalAmount / 4;
      no_payments = 4;
    } else if (paymentPlan == "MONTHLY") {
      paymentAmount = totalAmount / 18;
      no_payments = 12;
    }

    let transAmount = await getNewTransactionAmount(paymentAmount);

    this.setState({
      amount: transAmount,
      totalAmount: totalAmount,
      feeStudentPaymentFrequencyId: feeStudentPaymentFrequencyId,
      feeStudentPaymentId: feeStudentPaymentId,
      feeStudentId: feeStudentId,
      no_payments: no_payments
    });
  };

  openModal = async (id, feeAmount) => {
    let feeId = id;

    let feesJsonData = {};
    let result = await getFeeById(feeId);
    let fee = result.fee;
    feesJsonData[0] = fee;

    let totalAmount = parseFloat(feeAmount);
    let paymentPlan = this.state.paymentPlan;
    let paymentAmount = 0;
    let no_payments;
    if (paymentPlan == "PAY IN FULL") {
      paymentAmount = totalAmount;
      no_payments = 1;
    } else if (paymentPlan == "PER SESSION") {
      paymentAmount = totalAmount / 2;
      no_payments = 2;
    } else if (paymentPlan == "PER SEMESTER") {
      paymentAmount = totalAmount / 4;
      no_payments = 4;
    } else if (paymentPlan == "MONTHLY") {
      paymentAmount = totalAmount / 18;
      no_payments = 18;
    }

    let transAmount = await getNewTransactionAmount(paymentAmount);

    this.setState({
      amount: transAmount,
      feeName: fee.name
    });

    fetch(`${process.env.API_URL}/api/feestudent`, {
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        name: fee.name,
        total_amount: totalAmount,
        fees: feesJsonData,
        semester_id: this.state.currentSemesterId,
        student_id: this.state.studentId,
        payment_plan: this.state.paymentPlan,
        fee_id: feeId,
        paid_fees: 2
      })
    })
      .then(response => response.json())
      .then(json => {
        let feeStudentId = json.id;

        fetch(`${process.env.API_URL}/api/feestudentpaymentfrequency`, {
          //mode: "no-cors",
          method: "post",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify({
            fee_student_id: feeStudentId,
            total_amount: totalAmount,
            payment_amount: paymentAmount,
            student_id: this.state.studentId,
            payment_plan: this.state.paymentPlan
          })
        })
          .then(response => response.json())
          .then(json => {
            let feeStudentPaymentFrequencyId = json.id;
            fetch(`${process.env.API_URL}/api/feestudentpayment`, {
              //mode: "no-cors",
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
                // Router.push(`/student/make-payment?id=${json.id}`);

                let transId = json.transaction_id;
                let allowPlanPayment = false;
                if (fee.optional) {
                  allowPlanPayment = true;
                }

                this.setState({
                  transaction_id: transId,
                  open: true,
                  showPlan: allowPlanPayment,
                  amount: transAmount,
                  fullAmount: totalAmount,
                  feeStudentPaymentFrequencyId: feeStudentPaymentFrequencyId,
                  feeStudentPaymentId: json.id,
                  feeStudentId: feeStudentId
                });
              })
              .catch(e => {
                console.log(e);
                return e;
              });
          })
          .catch(e => {
            console.log(e);
            return e;
          });
      })
      .catch(e => {
        console.log(e);
        return e;
      });
  };
  closeModal = () => {
    this.setState({
      open: false,
      showPlan: false,
      transaction_id: "",
      amount: 0,
      fullAmount: 0,
      paymentPlan: "PAY IN FULL",
      feeName: ""
    });

    //Router.push(`/student/payments`);
  };
  makePayment = async () => {
    let paymentPlan = this.state.paymentPlan;
    let no_payments = this.state.no_payments;
    let totalAmount = this.state.totalAmount;
    let paymentAmount = totalAmount / no_payments;
    let feeStudentId = this.state.feeStudentId;
    let feeStudentPaymentId = this.state.feeStudentPaymentId;
    let feeStudentPaymentFrequencyId = this.state.feeStudentPaymentFrequencyId;

    if (paymentPlan != "PAY IN FULL") {
      //update feestudent plan
      await fetch(`${process.env.API_URL}/api/feestudent/${feeStudentId}`, {
        method: "post",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          payment_plan: paymentPlan
        })
      });
      if (no_payments > 1) {
        //delete fee_student_payment record data
        await fetch(
          `${process.env.API_URL}/api/feestudentpayment/${feeStudentPaymentId}`,
          {
            method: "delete",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );
        //delete freq and payment record
        await fetch(
          `${process.env.API_URL}/api/feestudentpaymentfrequency/${feeStudentPaymentFrequencyId}`,
          {
            method: "delete",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          }
        );

        //create new ones: Backend already creates duplicate records based on the payment plan
        await fetch(`${process.env.API_URL}/api/feestudentpaymentfrequency`, {
          method: "post",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify({
            fee_student_id: feeStudentId,
            total_amount: totalAmount,
            payment_amount: paymentAmount,
            student_id: this.state.studentId,
            payment_plan: paymentPlan
          })
        })
          .then(response => response.json())
          .then(json => {
            let lastFeeStudentPaymentFrequencyId = json.id;
            //create feestudentpayment for last feestudentpaymentfrequency
            fetch(`${process.env.API_URL}/api/feestudentpayment`, {
              //mode: "no-cors",
              method: "post",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              },
              body: JSON.stringify({
                fee_student_payment_frequency_id: lastFeeStudentPaymentFrequencyId,
                amount: paymentAmount,
                transaction_id: getReference(),
                reference: getReference()
              })
            })
              .then(response => response.json())
              .then(json => {
                let transId = json.transaction_id;

                this.setState({
                  transaction_id: transId,
                  fullAmount: totalAmount,
                  feeStudentPaymentFrequencyId: feeStudentPaymentFrequencyId,
                  feeStudentPaymentId: json.id
                });
              })
              .catch(e => {
                console.log(e);
                return e;
              });
          })
          .catch(e => {
            console.log(e);
            return e;
          });
      }
    }

    this.payWithPaystack();
  };
  payWithPaystack = () => {
    var handler = PaystackPop.setup({
      email: this.state.email,
      amount: Number(this.state.amount).toFixed(2), //paystack amount is in kobo
      key: `${this.props.paymentDetails.test_public_key}`,
      currency: "NGN",
      ref: this.state.transaction_id, // generates a pseudo-unique reference. Please replace with a reference you generated. Or remove the line entirely so our API will generate one for you
      metadata: {
        custom_fields: [
          {
            display_name: "Fee",
            variable_name: "fee_name",
            value: this.state.feeName
          },
          {
            display_name: "Name",
            variable_name: "name",
            value: this.state.name
          },
          {
            display_name: "User id",
            variable_name: "user_id",
            value: this.state.userId
          }
        ]
      },
      callback: response => {
        this.setState({
          open: false,
          showPlan: false,
          transaction_id: "",
          amount: 0,
          paymentPlan: "PAY IN FULL"
        });
        // Router.push(`/student/payments`);
      },
      onClose: () => {
        this.setState({ open: false, paymentPlan: "PAY IN FULL", feeName: "" });
        console.log("Payment closed");

        //Router.push(`/student/payments`);
      }
    });
    handler.openIframe();
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
    this.setState({ show: false, paymentLogAmount: 0, feeName: "" });
  };

  render() {
    if (this.props.errorCode) {
      console.log("i am cool", this.props.student);
      return <Error statusCode={this.props.errorCode} />;
    }
    return (
      <Layout pageTitle="Student Payments" userData={this.props.userData}>
        <Head>
          <script src="https://js.paystack.co/v1/inline.js"></script>
        </Head>
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="pull-right">
              <OverlayTrigger
                trigger="hover"
                placement="left"
                overlay={popover}
              >
                <a
                  className="btn btn-info btn-cons text-white"
                  title="Coming Soon"
                >
                  <i className="fa fa-pencil" /> Change Payment Plan
                </a>
              </OverlayTrigger>
            </div>
            <h3>PAYMENT INSTRUCTIONS:</h3>
            <ul>
              <li>Please note that payments are made one after the other.</li>

              <li>
                Installmental payments are only available for School Fees.
              </li>
              <li>
                The "Payments" section contains fees that have not be paid
              </li>
              <li>
                The "Payment Log" section contains fees that full or part
                payments have been made
              </li>
              <li>
                To make payment, click on "Make Payment" against each fee you
                wish to pay for
              </li>
              <li>
                You'll see a popup with information on the total fees to be paid
                (inclusive of transaction charges)
              </li>
              <li>
                Click on the "Pay" button and you'll be directed to the payment
                gateway where you input your card details.
              </li>
              <li>
                For School fees, on clicking on "Make Payment", you'll get a
                popup asking you to choose a payment plan. Kindly choose a
                payment plan before clicking the "Pay" button
              </li>
            </ul>
            <br />
            <br />
            <div className="card-title">
              <h4>Payments</h4>

              <p>List of fees to be paid</p>
            </div>
          </div>
          <div className="card-body">
            <table className="table table-condensed table-hover">
              <thead>
                <tr>
                  <th>Fee</th>
                  <th>Amount</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {this.state.fees.length ? (
                  this.state.fees.map(fee => (
                    <tr key={`${fee.id}`}>
                      <td className="w-15">
                        <span className="font-montserrat fs-18">
                          {fee.name}
                        </span>
                      </td>
                      <td className="w-15">
                        <span className="font-montserrat fs-18">
                          {fee.amount} NGN
                        </span>
                      </td>
                      <td className="w-15">
                        <span className="font-montserrat fs-18">
                          {fee.description}
                        </span>
                      </td>
                      <td>
                        <>
                          <Button
                            variant="primary"
                            onClick={() => {
                              this.openModal(fee.id, fee.amount);
                            }}
                          >
                            Make Payment
                          </Button>
                          <Modal
                            show={this.state.open}
                            onHide={this.closeModal}
                            animation={false}
                          >
                            <Modal.Header closeButton>
                              <Modal.Title>Make Payment</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              {(this.state.showPlan && (
                                <div className="form-group form-group-default">
                                  <label>Choose Payment Plan</label>

                                  <select
                                    className="form-group form-group-default"
                                    name="paymentPlan"
                                    onChange={e =>
                                      this.handlePlanChange(
                                        e,
                                        this.state.fullAmount,
                                        this.state.feeStudentPaymentFrequencyId,
                                        this.state.feeStudentPaymentId,
                                        this.state.feeStudentId
                                      )
                                    }
                                    required={true}
                                  >
                                    <option value="">Select</option>
                                    <option value="PAY IN FULL">
                                      PAY IN FULL
                                    </option>
                                    <option value="PER SESSION">
                                      PER SESSION
                                    </option>
                                    <option value="PER SEMESTER">
                                      PER SEMESTER
                                    </option>
                                    <option value="MONTHLY">MONTHLY</option>
                                  </select>
                                </div>
                              )) ||
                                ""}
                              <p>
                                You're about to make payment of NGN{" "}
                                {Number(this.state.amount / 100)
                                  .toFixed(2)
                                  .replace(/\d(?=(\d{3})+\.)/g, "$&,")}{" "}
                                (transaction charges inclusive). Click Pay below
                                to proceed to the payment gateway
                              </p>
                            </Modal.Body>
                            <Modal.Footer>
                              <button
                                id="show-modal"
                                className="btn btn-primary mx-2 text-center btn-cons"
                                onClick={this.makePayment}
                              >
                                Pay
                              </button>

                              {/* <PaystackButton
                                //metadata={{ userId: me.id }}
                                class="btn btn-complete text-white"
                                text="Pay"
                                callback={this.callback}
                                close={this.close}
                                disabled={false}
                                embed={false}
                                reference={this.state.transaction_id}
                                email={this.state.email}
                                amount={Number(this.state.amount).toFixed(2)} //paystack amount is in kobo
                                paystackkey={`${process.env.PAYSTACK_KEY}`}
                                tag="a"
                              /> */}
                            </Modal.Footer>
                          </Modal>
                        </>
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

        <div className="card card-transparent">
          <div className="card-header ">
            <div className="card-title">
              <h4>Payment Log</h4>

              <p>List of pending and paid fees</p>
            </div>
          </div>
          <div className="card-body">
            <table className="table table-condensed table-hover">
              <thead>
                <tr>
                  <th>Payment </th>
                  <th>Payment Plan</th>
                  <th>Payment Amount</th>
                  <th>Total Amount</th>
                  <th>Paid Fees</th>
                </tr>
              </thead>
              <tbody>
                {this.state.paymentLogs.length ? (
                  this.state.paymentLogs.map(payment => (
                    <tr key={`${payment.id}`}>
                      <td className="font-montserrat all-caps fs-12 w-50">
                        {payment.feestudent.name}
                      </td>
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
                                  {console.log(
                                    typeof parseInt(
                                      this.state.paymentLogAmount
                                    ),
                                    parseInt(this.state.paymentLogAmount)
                                  )}
                                </p>
                              </Modal.Body>
                              <Modal.Footer>
                                <PaystackButton
                                  metadata={{
                                    userId: this.state.userId,
                                    name: this.state.name,
                                    fee_name: this.state.feeName
                                  }}
                                  class="btn btn-complete text-white"
                                  text="Pay"
                                  callback={this.callback}
                                  close={this.close}
                                  disabled={false}
                                  embed={false}
                                  reference={this.state.paymentLogTransactionId}
                                  email={this.state.email}
                                  amount={parseInt(this.state.paymentLogAmount)} //paystack amount is in kobo
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
const ToastWrapper = props => {
  
  return <Payment {...props} />;
};

ToastWrapper.getInitialProps = Payment.getInitialProps;

export default ToastWrapper;
