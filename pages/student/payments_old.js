import React from "react";
import Layout from "../../components/Layout";
import { Popover } from "react-bootstrap";
import {
  getFeeById,
  getStudentByUserId,
  getCurrentSemester,
  getReference,
  getStudentLevelId,
  getNewTransactionAmount,
} from "../../helpers/FetchWrapper";
import { protectPage, codeLogin } from "../../helpers/utils";
import toast from "react-hot-toast";
import { Modal, Button } from "react-bootstrap";
import Head from "next/head";
import ChangePlanModal from "../../components/ChangePlanModal";

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

const formatAmount = (x) => {
  const amount = (x + "").replace(
    /(\..*)$|(\d)(?=(\d{3})+(?!\d))/g,
    (digit, fract) => fract || digit + ","
  );

  return amount;
};
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
    paymentId: "",
    fullAmount: 0,
    amount: 0,
    feeStudentPaymentFrequencyId: "",
    feeStudentPaymentId: "",
    feeStudentId: "",
    totalAmount: 0,
    no_payments: 0,
    email:
      (this.props.student &&
        this.props.student.user &&
        this.props.student.user.email) ||
      "a@b.com",

    paymentLogs: this.props.paymentLog,
    show: false,
    paymentLogTransactionId: "",
    paymentLogId: "",
    paymentLogAmount: 0,
    feeName: "",
    phone:
      (this.props.student &&
        this.props.student.user &&
        this.props.student.user.phone) ||
      "0700",
    name:
      (this.props.student &&
        this.props.student.user &&
        this.props.student.user.first_name +
          " " +
          this.props.student.user.last_name) ||
      "NA",
    userId:
      (this.props.student &&
        this.props.student.user &&
        this.props.student.user.id) ||
      "NA",
  };
  callback = this.props.callback
    ? (response) => this.props.callback(response)
    : (response) => {
        this.setState({ show: false, paymentPlan: "PAY IN FULL", feeName: "" });
        //Router.push(`/student/payments`);
      };
  close =
    this.props.close ||
    (() => {
      this.setState({ show: false, paymentPlan: "PAY IN FULL", feeName: "" });
      // console.log("Payment closed");
      //Router.push(`/student/payments`);
    });
  static getInitialProps = async ({ req, res, query, pathname }) => {
    await codeLogin(req, res, query, pathname);
    let levelId,
      institutionId,
      entryLevelId,
      paidAndInitiatedFees,
      admittedSemesterId,
      fees,
      filter_fees,
      studentId,
      student,
      currentSemesterId,
      paymentLog;
    const allowedRoles = ["STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let paymentDetails;
    if (userId === 0) return null;

    if (userId !== 0) {
      student = await getStudentByUserId(userId, req);

      student = student.student;
      studentId = student ? student.id : res.end();
      entryLevelId =
        student && student.entry_level_id ? student.entry_level_id : 1;

      admittedSemesterId =
        student && student.semester_admitted_id
          ? student.semester_admitted_id
          : 1;
      const { semester } = await getCurrentSemester(req);
      currentSemesterId = semester ? semester.id : 1;

      levelId = await getStudentLevelId(
        admittedSemesterId,
        currentSemesterId,
        entryLevelId,
        req
      );

      institutionId =
        (student && student.user && student.user.institution_id) || 0;

      paymentLog = await (
        await fetch(
          `${process.env.API_URL}/api/feestudentpaymentfrequency?student_id=${studentId}`,
          {
            method: "get",
            credentials: "include",
            headers: req
              ? { cookie: req.headers.cookie }
              : {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                },
          }
        )
      ).json();

      paymentLog = paymentLog.filter(
        (fee) => fee.payment_plan !== "CHANGED PLAN"
      );

      paidAndInitiatedFees = await (
        await fetch(
          `${process.env.API_URL}/api/feestudent?paid_fees=1&paid_fees=2&student_id=${studentId}`,
          {
            method: "get",
            credentials: "include",
            headers: req
              ? { cookie: req.headers.cookie }
              : {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                },
          }
        )
      ).json();

      fees = await (
        await fetch(
          `${process.env.API_URL}/api/fee/params?level_id=${levelId}&institution_id=${institutionId}`,
          {
            method: "get",
            credentials: "include",
            headers: req
              ? { cookie: req.headers.cookie }
              : {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                },
          }
        )
      ).json();

      filter_fees = fees.slice();
      let paidAndInitiatedFeesIdArray = [];
      if (paidAndInitiatedFees.length && fees.length) {
        //some paid fees logs exist, fetch associated amounts of paid and unpaid
        for (let i = 0; i < paidAndInitiatedFees.length; i++) {
          filter_fees = filter_fees.filter(
            (item) => item.id != paidAndInitiatedFees[i].fee_id
          );
          paidAndInitiatedFeesIdArray.push(paidAndInitiatedFees[i].fee_id);
        }

        //check if application and acceptance fee are in paidAndInitiatedFees
        if (
          paidAndInitiatedFeesIdArray.includes(1) ||
          paidAndInitiatedFeesIdArray.includes(2)
        ) {
          // application or acceptance have been initiated, remove the group fee from filter fees
          filter_fees = filter_fees.filter((item) => item.id != 13);
        } else if (paidAndInitiatedFeesIdArray.includes(13)) {
          // bulk application and acceptance have been initiated, remove the individual fees from filter fees
          filter_fees = filter_fees.filter(
            (item) => item.id != 1 && item.id != 2
          );
        } else if (
          !paidAndInitiatedFeesIdArray.includes(1) &&
          !paidAndInitiatedFeesIdArray.includes(2)
        ) {
          // application and acceptance fee has not been initiated, remove the individual fees from filter fees
          filter_fees = filter_fees.filter(
            (item) => item.id != 1 && item.id != 2
          );
        }
      }
      if (!paidAndInitiatedFees.length && fees.length) {
        //no fee has been initiated
        // application and acceptance fee has automatically not been initiated, remove the individual fees from filter fees
        filter_fees = filter_fees.filter(
          (item) => item.id != 1 && item.id != 2
        );
      }
    }
    paymentDetails = await (
      await fetch(`${process.env.API_URL}/api/paymentaccount`, {
        method: "get",
        credentials: "include",
        headers: req
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
      })
    ).json();

    return {
      filter_fees,
      studentId,
      student,
      currentSemesterId,
      paymentLog,
      userData,
      paymentDetails,
    };
  };

  handleChange = (e) => {
    const item = e.target.name;
    const isChecked = e.target.checked;
    this.setState((prevState) => ({
      checkedItems: prevState.checkedItems.set(item, isChecked),
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
      [name]: value,
    });

    let paymentPlan = value;
    let paymentAmount = 0;
    let no_payments;
    let feeName = this.state.feeName;
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
    if (
      (paymentPlan == "PER SEMESTER" || paymentPlan == "PER SESSION") &&
      feeName == "Pre-MBA School Fees"
    ) {
      //Pre MBA fees
      paymentAmount = totalAmount / 1;
      no_payments = 1;
    }
    if (paymentPlan == "MONTHLY" && feeName == "Pre-MBA School Fees") {
      //Pre MBA fees
      paymentAmount = totalAmount / 5;
      no_payments = 5;
    }

    // console.log(totalAmount, " tp paye ", paymentAmount);
    let transAmount = await getNewTransactionAmount(paymentAmount);

    this.setState({
      amount: transAmount,
      totalAmount: totalAmount,
      feeStudentPaymentFrequencyId: feeStudentPaymentFrequencyId,
      feeStudentPaymentId: feeStudentPaymentId,
      feeStudentId: feeStudentId,
      no_payments: no_payments,
    });
  };

  openModal = async (index, id, feeAmount) => {
    let feeId = id;

    let feesJsonData = {};
    let result = await getFeeById(feeId);
    let fee = result.fee;
    feesJsonData[0] = fee;
    let feeName = fee.name;

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

    if (feeName == "Pre-MBA School Fees") {
      //default for Pre MBA fees is monthly
      paymentAmount = totalAmount / 5;
      no_payments = 5;
      paymentPlan = "MONTHLY";
    }
    if (feeName == "MBA School Fees") {
      //default for  MBA fees is monthly
      paymentAmount = totalAmount / 18;
      no_payments = 18;
      paymentPlan = "MONTHLY";
    }
    let transAmount = await getNewTransactionAmount(paymentAmount);

    this.setState({
      amount: transAmount,
      feeName: feeName,
      paymentPlan: paymentPlan,
    });

    await fetch(`${process.env.API_URL}/api/feestudent`, {
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        name: fee.name,
        total_amount: totalAmount,
        fees: feesJsonData,
        semester_id: this.state.currentSemesterId,
        student_id: this.state.studentId,
        payment_plan: this.state.paymentPlan,
        fee_id: feeId,
        paid_fees: 2,
      }),
    })
      .then((response) => response.json())
      .then(async (json) => {
        let feeStudentId = json.id;

        await fetch(`${process.env.API_URL}/api/feestudentpaymentfrequency`, {
          //mode: "no-cors",
          method: "post",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            fee_student_id: feeStudentId,
            total_amount: totalAmount,
            payment_amount: paymentAmount,
            student_id: this.state.studentId,
            payment_plan: this.state.paymentPlan,
          }),
        })
          .then((response) => response.json())
          .then(async (json) => {
            let feeStudentPaymentFrequency = json;
            let feeStudentPaymentFrequencyId = json.id;
            await fetch(`${process.env.API_URL}/api/feestudentpayment`, {
              //mode: "no-cors",
              method: "post",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              body: JSON.stringify({
                fee_student_payment_frequency_id: feeStudentPaymentFrequencyId,
                amount: paymentAmount,
                transaction_id: getReference(),
                reference: getReference(),
              }),
            })
              .then((response) => response.json())
              .then((json) => {
                // Router.push(`/student/make-payment?id=${json.id}`);

                let transId = json.transaction_id;
                let allowPlanPayment = false;
                if (fee.optional) {
                  allowPlanPayment = true;
                }

                // filter out initated fee from outstanding fees
                var filter_outstanding_fees = this.state.fees.filter(
                  (item) => item.id != feeId
                );

                this.setState({
                  transaction_id: transId,
                  open: true,
                  showPlan: allowPlanPayment,
                  amount: transAmount,
                  fullAmount: totalAmount,
                  feeStudentPaymentFrequencyId: feeStudentPaymentFrequencyId,
                  feeStudentPaymentId: json.id,
                  feeStudentId: feeStudentId,

                  fees: filter_outstanding_fees, //update state of paymentlogs
                  paymentLogs: [
                    ...this.state.paymentLogs,
                    feeStudentPaymentFrequency,
                  ],
                });
              })
              .catch((e) => {
                console.log(e);
                //return e;
              });
          })
          .catch((e) => {
            console.log(e);
            //return e;
          });
      })
      .catch((e) => {
        console.log(e);
        //return e;
      });
  };
  closeModal = () => {
    this.setState({
      open: false,
      showPlan: false,
      transaction_id: "",
      paymentId: "",
      amount: 0,
      fullAmount: 0,
      paymentPlan: "PAY IN FULL",
      feeName: "",
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
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          payment_plan: paymentPlan,
        }),
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
              "Access-Control-Allow-Origin": "*",
            },
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
              "Access-Control-Allow-Origin": "*",
            },
          }
        );

        //create new ones: Backend already creates duplicate records based on the payment plan
        await fetch(`${process.env.API_URL}/api/feestudentpaymentfrequency`, {
          method: "post",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            fee_student_id: feeStudentId,
            total_amount: totalAmount,
            payment_amount: paymentAmount,
            student_id: this.state.studentId,
            payment_plan: paymentPlan,
          }),
        })
          .then((response) => response.json())
          .then((json) => {
            let lastFeeStudentPaymentFrequencyId = json.id;
            //create feestudentpayment for last feestudentpaymentfrequency
            fetch(`${process.env.API_URL}/api/feestudentpayment`, {
              //mode: "no-cors",
              method: "post",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
              body: JSON.stringify({
                fee_student_payment_frequency_id:
                  lastFeeStudentPaymentFrequencyId,
                amount: paymentAmount,
                transaction_id: getReference(),
                reference: getReference(),
              }),
            })
              .then((response) => response.json())
              .then((json) => {
                let paymentId = json.id;
                let transId = json.transaction_id;

                let fullFeeName =
                  json.feestudentpaymentfrequency.feestudent.name +
                  " " +
                  json.feestudentpaymentfrequency.payment_plan;

                this.setState({
                  transaction_id: transId,
                  paymentId: paymentId,
                  fullAmount: totalAmount,
                  feeStudentPaymentFrequencyId: feeStudentPaymentFrequencyId,
                  feeStudentPaymentId: json.id,
                  feeName: fullFeeName,
                });
              })
              .catch((e) => {
                console.log(e);
                // return e;
              });
          })
          .catch((e) => {
            console.log(e);
            // return e;
          });
      }
    }

    this.payWithPaystack();
  };
  payWithPaystack = () => {
    var handler = PaystackPop.setup({
      email: this.state.email,
      amount: parseInt(this.state.amount), //paystack amount is in kobo
      key: `${this.props.paymentDetails.test_public_key}`,
      currency: "NGN",
      ref: this.state.transaction_id, // generates a pseudo-unique reference. Please replace with a reference you generated. Or remove the line entirely so our API will generate one for you
      metadata: {
        custom_fields: [
          {
            display_name: "Fee",
            variable_name: "fee_name",
            value: this.state.feeName,
          },
          {
            display_name: "Name",
            variable_name: "name",
            value: this.state.name,
          },
          {
            display_name: "User id",
            variable_name: "user_id",
            value: this.state.userId,
          },
          {
            display_name: "Payment Plan",
            variable_name: "payment_plan",
            value: this.state.paymentPlan,
          },
          {
            display_name: "Fee Student Payment ID",
            variable_name: "fee_student_payment_id",
            value: this.state.paymentId,
          },
        ],
      },
      callback: (response) => {
        this.setState({
          open: false,
          show: false,
          showPlan: false,
          transaction_id: "",
          paymentId: "",
          amount: 0,
          paymentPlan: "PAY IN FULL",
          feeName: "",
        });
        //Router.push(`/student/payments`);
      },
      onClose: () => {
        this.setState({
          open: false,
          show: false,
          showPlan: false,
          transaction_id: "",
          paymentId: "",
          amount: 0,
          paymentPlan: "PAY IN FULL",
          feeName: "",
        });
        // console.log("Payment closed");

        //Router.push(`/student/payments`);
      },
    });
    handler.openIframe();
  };

  openPaymentLogModal = async (index, id, paymentAmount) => {
    let transAmount = await getNewTransactionAmount(paymentAmount);

    this.setState({
      paymentLogAmount: transAmount,
    });
    let feeStudentPaymentFrequencyId = id;
    await fetch(`${process.env.API_URL}/api/feestudentpayment`, {
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        fee_student_payment_frequency_id: feeStudentPaymentFrequencyId,
        amount: paymentAmount,
        transaction_id: getReference(),
        reference: getReference(),
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        let feeStudentPaymentId = json.id;
        let transId = json.transaction_id;

        let fullFeeName =
          json.feestudentpaymentfrequency.feestudent.name +
          " " +
          json.feestudentpaymentfrequency.payment_plan;

        this.setState({
          paymentLogTransactionId: transId,
          paymentLogId: feeStudentPaymentId,
          show: true,
          feeName: fullFeeName,
        });
      })
      .catch((e) => {
        console.log(e);
        // return e;
      });
  };
  closePaymentLogModal = () => {
    this.setState({
      show: false,
      paymentLogTransactionId: "",
      paymentLogId: "",
      paymentLogAmount: 0,
      feeName: "",
    });
  };
  paymentLogPayWithPaystack = () => {
    var handler = PaystackPop.setup({
      email: this.state.email,
      amount: parseInt(this.state.paymentLogAmount), //paystack amount is in kobo
      key: `${this.props.paymentDetails.test_public_key}`,
      currency: "NGN",
      ref: this.state.paymentLogTransactionId, // generates a pseudo-unique reference. Please replace with a reference you generated. Or remove the line entirely so our API will generate one for you
      metadata: {
        custom_fields: [
          {
            display_name: "Fee",
            variable_name: "fee_name",
            value: this.state.feeName,
          },
          {
            display_name: "Name",
            variable_name: "name",
            value: this.state.name,
          },
          {
            display_name: "User id",
            variable_name: "user_id",
            value: this.state.userId,
          },
          {
            display_name: "Payment Plan",
            variable_name: "payment_plan",
            value: this.state.paymentPlan,
          },
          {
            display_name: "Fee Student Payment ID",
            variable_name: "fee_student_payment_id",
            value: this.state.paymentLogId,
          },
        ],
      },
      callback: (response) => {
        this.setState({
          open: false,
          show: false,
          showPlan: false,
          transaction_id: "",
          paymentLogTransactionId: "",
          paymentLogId: "",
          amount: 0,
          paymentLogAmount: 0,
          paymentPlan: "PAY IN FULL",
          feeName: "",
        });
        //Router.push(`/student/payments`);
      },
      onClose: () => {
        this.setState({
          open: false,
          show: false,
          showPlan: false,
          transaction_id: "",
          paymentLogTransactionId: "",
          paymentLogId: "",
          amount: 0,
          paymentLogAmount: 0,
          paymentPlan: "PAY IN FULL",
          feeName: "",
        });
        // console.log("Payment closed");

        //Router.push(`/student/payments`);
      },
    });
    handler.openIframe();
  };

  handlePlanUpdate = async (fee, studentId = this.state.studentId) => {
    let temp;
    if (fee.length > 0) {
      temp = await fetch(
        `${process.env.API_URL}/api/feestudentpaymentfrequency?student_id=${studentId}`,
        {
          method: "get",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      temp = await temp.json();

      temp = temp.filter((val) => val.payment_plan !== "CHANGED PLAN");
      this.setState({
        paymentLogs: temp,
      });

      toast.success(
        "Your tuition payment plan has been changed successfully and your log has been updated with your new plan",
        { icon: "✅" }
      );

      return;
    }
    toast.error("Change of payment plan failed, please try again");
    return null;
  };

  render() {
    let tutionPlans = [];
    // console.log(this.props.paymentLog);
    const id = {};
    this.props.paymentLog.forEach((data) => {
      if (
        !id[data.feestudent.id] &&
        (data.feestudent.total_amount === "412200.00" ||
          data.feestudent.total_amount === "103500.00")
      ) {
        id[data.fee_student_id] = data.id;

        tutionPlans.push(data);
      }
    });

    return (
      <Layout pageTitle="Student Payments" userData={this.props.userData}>
        <Head>
          <script src="https://js.paystack.co/v1/inline.js"></script>
        </Head>
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="pull-right">
              {/* <OverlayTrigger
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
              </OverlayTrigger> */}
              <ChangePlanModal
                studentId={this.state.studentId}
                fees={tutionPlans}
                handlePlanUpdate={this.handlePlanUpdate}
              />
            </div>
            <h3>PAYMENT INSTRUCTIONS:</h3>
            <ul>
              <li>Please note that payment plans apply to Tuition only.</li>

              <li>
                To choose a payment plan; click on the Tuition fee to make
                payment, you will be presented with the available payment plan
                options. Once you choose a payment plan, it cannot be changed.
              </li>
              <li>
                At the point of payment, transaction fees would be included
              </li>
              {/* <li>
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
              </li> */}
            </ul>
            <br />
            <br />
            <div className="card-title">
              <h4>Payments</h4>

              <p>A list of the fees you are required to pay</p>
            </div>
          </div>
          <div className="card-body">
            <table className="table table-responsive table-hover">
              <thead>
                <tr>
                  <th>Fee</th>
                  <th>Amount</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {this.state.fees && this.state.fees.length ? (
                  this.state.fees.map((fee, index) => {
                    return (
                      <tr key={`${fee.id}`}>
                        <td className="w-15">
                          <span className="font-montserrat fs-18">
                            {fee.name}
                          </span>
                        </td>
                        <td className="w-15">
                          <span className="font-montserrat fs-18">
                            {formatAmount(fee.amount)} NGN
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
                                this.openModal(index, fee.id, fee.amount);
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
                                      onChange={(e) =>
                                        this.handlePlanChange(
                                          e,
                                          this.state.fullAmount,
                                          this.state
                                            .feeStudentPaymentFrequencyId,
                                          this.state.feeStudentPaymentId,
                                          this.state.feeStudentId
                                        )
                                      }
                                      defaultValue="MONTHLY"
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
                                  (transaction charges inclusive). Click Pay
                                  below to proceed to the payment gateway
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
                                paystackkey={`${this.props.paymentDetails.test_public_key}`}
                                tag="a"
                              /> */}
                              </Modal.Footer>
                            </Modal>
                          </>
                        </td>
                      </tr>
                    );
                  })
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

              {/* <p>
                List of your fees that are haven't been paid and those that you
                have paid for
              </p> */}
            </div>
          </div>
          <div className="card-body">
            <table className="table table-responsive table-hover">
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
                {this.state.paymentLogs && this.state.paymentLogs.length ? (
                  this.state.paymentLogs.map((payment, index) => (
                    <tr key={`${payment.id}`}>
                      <td className="font-montserrat all-caps fs-12 w-50">
                        {payment.feestudent.name}
                      </td>
                      <td className="font-montserrat all-caps fs-12 w-50">
                        {payment.payment_plan}
                      </td>
                      <td className="w-15">
                        <span className="font-montserrat fs-18">
                          {formatAmount(payment.payment_amount)} NGN
                        </span>
                      </td>
                      <td className="w-15">
                        <span className="font-montserrat fs-18">
                          {formatAmount(payment.total_amount)} NGN
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
                                  index,
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
                                <button
                                  id="make-payment"
                                  className="btn btn-primary mx-2 text-center btn-cons"
                                  onClick={this.paymentLogPayWithPaystack}
                                >
                                  Pay
                                </button>
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
const ToastWrapper = (props) => {
  return <Payment {...props} />;
};

ToastWrapper.getInitialProps = Payment.getInitialProps;

export default ToastWrapper;
