import Script from "next/script";
import { useState } from "react";
import toast from "react-hot-toast";
import Layout from "../../components/Layout";

import {
  protectPage,
  getTableData,
  ucfirst,
  randomInteger,
} from "../../helpers/utils";
import {
  processPaystack,
  requestRemitaRRR,
  processRemita,
} from "../../helpers/paymentProcessors";
import { Accordion, Card, Row, Col, Table, Button } from "react-bootstrap";
import HTabs from "../../components/HTabs";
import { translateCode } from "../../helpers/language/translate";
import Pagination from "../../components/Pagination";

const API_URL = process.env.API_URL;

const Payments = (props) => {
  const [cartState, setCartState] = useState({}),
    [cartSum, setCartSum] = useState(0),
    [activePayPlan, setActivePayPlan] = useState(
      props.userData.fee_plan || "full"
    ),
    pageParentNavs = [],
    pagingData = props.pagingData,
    { fixedDues, flexibleDues } = props.myPayables,
    iCanPay = props.userData.role == "STUDENT";

  const payment_plan_options = {
    full: { title: "Full Payment" },
    monthly: { title: "Monthly Payment Plan" },
    semesterly: { title: "Semester Payment Plan" },
    sessionly: { title: "Session Payment Plan" },
  };

  const dataTabs = [
    {
      tabId: "history",
      tabTitle: "Payments History",
      paneTitle: "Payments History",
      paneSubTitle: "Click each row to see details.",
      paneContent: getHistoryPane(),
    },
  ];

  if (iCanPay)
    dataTabs.unshift({
      tabId: "outstanding",
      tabTitle: "Make Payments",
      paneTitle: "Make Your Payments",
      paneSubTitle:
        "Select all the fees you want to pay now, then click on the payment button in the Cart section.",
      paneContent: getOutstandingPane(),
    });

  return (
    <Layout
      pageTitle="Payments"
      userData={props.userData}
      parentNavs={pageParentNavs}
    >
      {" "}
      <Script src="https://js.paystack.co/v2/inline.js"></Script>
      {/* <Head>
     
        // <script src="https://login.remita.net/payment/v1/remita-pay-inline.bundle.js"></script> 
      </Head> */}
      <HTabs
        tabs={dataTabs}
        defaultPane={iCanPay ? "outstanding" : "history"}
      />
      <style jsx global>{`
        .accordion {
          border: none !important;
        }
        .card {
          margin-bottom: 0 !important;
          border-image: none 100% 1 0 stretch !important;
        }
        .card .card-header {
          cursor: pointer;
          background-color: #f5f5f5 !important;
        }
      `}</style>
    </Layout>
  );

  function getOutstandingPane() {
    let lastRowItem = null;

    const addToCart = (e) => {
      // {"3":{"quantity":4, "fee_plan": "monthly", selections:[]}, ...}
      const btnEnabled = e.target.getAttribute("data-btn-enabled"),
        duePlan = e.target.getAttribute("data-fee-plan"),
        periodName = (duePlan && duePlan.slice(0, -2)) || "";

      // if (btnEnabled != "1") {
      //   showToastAlert(
      //
      //     `Select ${periodName}s in the right order.`,
      //     "warning",
      //     4
      //   );
      //   return;
      // }

      const feeID = e.target.getAttribute("data-fee-id"),
        item_id = e.target.getAttribute("data-item-id"),
        feeName = e.target.getAttribute("data-fee-name"),
        dueRow = e.target.getAttribute("data-row-id"),
        unit_price = Number(e.target.getAttribute("data-unit-price"));

      let lineItem = cartState[feeID] && { ...cartState[feeID] };

      if (!(lineItem && lineItem.fee_plan == duePlan)) {
        lineItem = {
          name: feeName,
          quantity: 0,
          subtotal: 0,
          fee_plan: duePlan,
          unit_price,
          selections: [],
          plan_selections: [],
          ref_id: "",
        };
      }

      // Update cart only once per row click
      if (!lineItem.selections.includes(dueRow)) {
        lineItem.quantity += 1;
        lineItem.subtotal = lineItem.unit_price * lineItem.quantity;
        setCartSum(cartSum + +lineItem.unit_price);
        lineItem.selections.push(dueRow);

        // Track selections for items paid in part (for generating reference)
        if (feeID != item_id) lineItem.plan_selections.push(item_id);
      }
      // console.log(lineItem.selections, lineItem.plan_selections)
      if (lineItem.plan_selections.length) {
        let plan_selections = lineItem.plan_selections;
        plan_selections.sort();
        lineItem.ref_id = plan_selections[0];
        if (plan_selections.length > 1)
          lineItem.ref_id += "-" + plan_selections[plan_selections.length - 1];
      }
      //console.log(lineItem)
      setCartState({
        ...cartState,
        [feeID]: { ...lineItem },
      });
      toast.success(`Added ${feeName.toUpperCase()} to cart!`);
    };

    const clearCart = () => {
      setCartState({});
      setCartSum(0);
    };

    const handlePlanChange = (e) => {
      clearCart();
      setActivePayPlan(e.target.value);
    };

    const makePostData = (processor) => {
      //let refStr = `${getReference()}.${props.userData.id}`;
      let refStr = `${randomInteger(1000, 9999)}.${props.userData.id}`;
      const postData = {
        amount: cartSum,
        cart: {},
        processor,
      };

      Object.entries(cartState).forEach(([feeID, lineItem], i) => {
        const { quantity, fee_plan, ref_id, semester_id, session_id } =
          lineItem;
        if (!quantity) return;
        refStr += `.${feeID}`;

        postData.cart[feeID] = { quantity };
        if (fee_plan) postData.cart[feeID].fee_plan = fee_plan;
        if (semester_id) postData.cart[feeID].semester_id = semester_id;
        if (session_id) postData.cart[feeID].session_id = session_id;

        if (ref_id) refStr += `-${ref_id}`;
      });

      postData.reference = refStr;
      // console.log(postData);
      return postData;
    };

    const savePayment = async (postData) => {
      const saveEndpoint = API_URL + "/api/payment2";
      if (!Object.keys(postData.cart).length) return "no_items_selected";

      const response = await fetch(saveEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        credentials: "include",
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        const result = await response.json();

        if (result && result.pageNotif) {
          return result.pageNotif;
        } else if (result && result.id) {
          return result;
        }
      }

      return "payment_failed";
    };

    const paymentSuccessFxn = async (payData) => {
      clearCart();
      toast.success(translateCode("payment_successful"));
      await savePayment(payData);
    };

    const paymentFailureFxn = (payData, error) => {
      savePayment(payData);
      clearCart();
      toast.error(error || "Payment failed");
    };

    const payWithPaystack = async () => {
      const postData = makePostData("paystack");
      await processPaystack(
        postData,
        props.userData,
        paymentSuccessFxn,
        paymentFailureFxn,
        props.paymentDetails.public_key
      );
    };

    const payWithRemita = async () => {
      const postData = makePostData("remita");
      const remitaRRR = await requestRemitaRRR(postData, props.userData);
      if (remitaRRR) {
        await processRemita(
          postData,
          props.userData,
          remitaRRR,
          paymentSuccessFxn,
          paymentFailureFxn
        );
      }
    };

    return (
      <Row>
        <Col sm={{ span: 4, order: 2 }}>
          <Card>
            <Card.Header>Payment Cart</Card.Header>
            <Card.Body>
              <Table size="sm">
                <thead>
                  <tr>
                    <th width="50%">Item</th>
                    <th>Qty</th>
                    <th>Subtotal (₦)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(cartState).map(([feeID, lineItem], i) => {
                    // console.log(3333333, lineItem)
                    return (
                      <tr key={`cart_item_${i}`}>
                        <td>{lineItem.name.split(":")[0]}</td>
                        <td className="font-weight-bold">
                          {lineItem.quantity}
                        </td>
                        <td>₦ {lineItem.subtotal.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td colSpan="2">Total</td>
                    <td className="font-weight-bold">
                      ₦ {cartSum.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </Table>
              <Button
                name="pay_now"
                id="pay-now"
                title="Pay now"
                variant="success"
                onClick={payWithPaystack}
                disabled={!Object.keys(cartState).length}
                className="mx-2 my-3 font-weight-bold"
              >
                Make Payment
              </Button>
              {/* or 
                            <Button
                                name="remita_btn" 
                                id="remita_btn" 
                                title="Pay with Remita"
                                variant="success"
                                onClick={payWithRemita} 
                                disabled={!Object.keys(cartState).length}
                                className="mx-2 my-3 font-weight-bold"
                            >
                                Pay with Remita
                            </Button> */}
            </Card.Body>
          </Card>
        </Col>
        <Col sm={{ span: 8, order: 1 }}>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th colSpan="3" className="bg-dark text-white">
                  <b>Fixed Fees</b>
                </th>
              </tr>
            </thead>
            <tbody>
              {fixedDues && fixedDues.map((due, i) => getDueRow(due, `i-${i}`))}
            </tbody>
            <thead>
              <tr>
                <th colSpan="3" className="bg-dark text-white">
                  <Row>
                    <Col>
                      <b>Flexible Fees</b>
                    </Col>
                    <Col className="">
                      <select
                        name="pay_plan"
                        disabled={false}
                        id="pay_plan"
                        value={activePayPlan}
                        onChange={handlePlanChange}
                      >
                        {Object.entries(payment_plan_options).map(
                          ([plan, planDetails], i) => (
                            <option key={`plan-option-${i}`} value={plan}>
                              {planDetails.title}
                            </option>
                          )
                        )}
                      </select>
                    </Col>
                  </Row>
                </th>
              </tr>
            </thead>
            <tbody>
              {flexibleDues &&
                flexibleDues[activePayPlan].map((due, i) =>
                  getDueRow(due, `j-${i}`, activePayPlan)
                )}
            </tbody>
          </Table>
        </Col>
      </Row>
    );

    function getDueRow(due, rowID, plan) {
      const dataAttrs = {
        "data-fee-id": due.id,
        "data-item-id": due.item_id,
        "data-fee-name": due.name,
        "data-fee-plan": plan,
        "data-unit-price": due.unit_price,
        "data-row-id": rowID,
      };
      if (plan == "semesterly") dataAttrs["data-semester-id"] = due.semester_id;
      else if (plan == "sessionly")
        dataAttrs["data-session-id"] = due.session_id;

      // Manage order of button enabling
      let buttonEnabled = false,
        addedToCart = rowInState(due.id, rowID);

      if (!addedToCart) {
        let [rowvar, rowPos] = rowID.split("-"),
          newFeeType =
            rowPos === "0" || (lastRowItem && lastRowItem.id != due.id),
          prevRowPos = +rowPos - 1;

        if (newFeeType) buttonEnabled = true;
        else {
          let prevRowID = `${rowvar}-${prevRowPos}`;
          if (rowInState(due.id, prevRowID)) buttonEnabled = true;
        }
      }
      dataAttrs["data-btn-enabled"] = buttonEnabled ? 1 : 0;
      lastRowItem = due;

      return (
        <tr key={`due_${rowID}`}>
          <td>{due.name}</td>
          <td>₦ {due.unit_price.toLocaleString()}</td>
          <td>
            <Button
              id={`due_${rowID}`}
              variant="success"
              size="xs"
              {...dataAttrs}
              onClick={addToCart}
            >
              {addedToCart ? (
                "Added!"
              ) : (
                <>
                  <i
                    id={`item_icon_${due.id}`}
                    className="fa fa-lg fa-cart-plus mr-1"
                    {...dataAttrs}
                  />
                  Add to Cart
                </>
              )}
            </Button>
          </td>
        </tr>
      );
    }

    function rowInState(feeID, rowID) {
      const result =
        (cartState[feeID] &&
          cartState[feeID].selections &&
          cartState[feeID].selections.includes(rowID)) ||
        false;
      //console.log(cartState[feeID])
      return result;
    }
  }

  function getHistoryPane() {
    return (
      <>
        <Row className="font-weight-bold">
          <Col>Date</Col>
          {(props.isHigherAccess && (
            <>
              <Col>Student Name</Col>
              <Col>User Name</Col>
            </>
          )) ||
            ""}
          <Col>Amount</Col>
          <Col>Processor</Col>
          <Col>Reference</Col>
          <Col>Status</Col>
        </Row>
        <Accordion>
          {(props.paymentsHistory || []).map((payment, i) => {
            let payDate = new Date(payment.created_at);
            return (
              <Card key={`payment_${i}`}>
                <Accordion.Toggle as={Card.Header} eventKey={String(i)}>
                  <Row>
                    <Col>{payDate.toLocaleString().substr(0, 17)}</Col>
                    {(props.isHigherAccess && (
                      <>
                        <Col>{`${payment.first_name} ${payment.last_name}`}</Col>
                        <Col>{payment.username}</Col>
                      </>
                    )) ||
                      ""}
                    <Col>{payment.amount}</Col>
                    <Col>{payment.processor}</Col>
                    <Col>{payment.reference}</Col>
                    <Col>{payment.status ? "confirmed" : "pending"}</Col>
                  </Row>
                </Accordion.Toggle>
                <Accordion.Collapse eventKey={String(i)}>
                  <Card.Body>
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Unit Price</th>
                          <th>Plan</th>
                          <th>Quantity</th>
                          <th>Sub Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payment.cart &&
                          Object.entries(payment.cart).map(
                            ([feeID, lineItem], i) => {
                              let expiryDate = lineItem.expiry
                                ? new Date(lineItem.expiry)
                                : "";

                              return (
                                <tr key={`lineItem_${i}`}>
                                  <td>{lineItem.name}</td>
                                  <td>
                                    {!!lineItem.unit_price
                                      ? lineItem.unit_price.toLocaleString()
                                      : ""}
                                  </td>
                                  <td>
                                    {lineItem.fee_plan
                                      ? ucfirst(lineItem.fee_plan)
                                      : "Full"}
                                  </td>
                                  <td>{lineItem.quantity}</td>
                                  <td>
                                    {Number.isNaN(
                                      lineItem.unit_price * lineItem.quantity
                                    )
                                      ? "N/A"
                                      : lineItem.unit_price * lineItem.quantity}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            );
          })}
        </Accordion>
        {pagingData && pagingData.rowCount > props.numFetched && (
          <Pagination
            total={pagingData.rowCount}
            dataPerPage={pagingData.pageSize}
            href={`${props.pathname}?pgsize=${pagingData.pageSize}&pg=`}
            currentPage={pagingData.page}
          />
        )}
      </>
    );
  }
};

Payments.getInitialProps = async ({ req, res, query, pathname }) => {
  const allowedRoles = ["SUPERADMIN", "HOD", "STUDENT"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  const highRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"],
    isHigherAccess = highRoles.indexOf(role) > -1;

  let [paymentsHistory, nothing, error, pagingData] = await getTableData(
      "payment2",
      "",
      query,
      [],
      false,
      req
    ),
    myPayables = [];

  if (role == "STUDENT") {
    const [payables, nothing2, error2] = await getTableData(
      "payment2/payables",
      "",
      {},
      [],
      false,
      req
    );
    myPayables = payables;
  }

  const numFetched = (paymentsHistory && paymentsHistory.length) || 0;

  // Ensure paymentsHistory is always an array
  if (!Array.isArray(paymentsHistory)) {
    paymentsHistory = [];
  }

  if (numFetched) {
    if (isHigherAccess) {
      paymentsHistory = paymentsHistory.map((payment) => {
        payment.first_name = payment.student.user.first_name;
        payment.last_name = payment.student.user.last_name;
        payment.username = payment.student.user.username;
        payment.student_reg_no = payment.student.reg_no || "";

        return payment;
      });
    }
  }

  let [paymentDetails, nothing3, error3] = await getTableData(
    "payment_account",
    "",
    query,
    [],
    false,
    req
  );

  if (!(paymentDetails && paymentDetails.id)) paymentDetails = null;

  //console.log(paymentDetails, paymentsHistory, myPayables)
  return {
    paymentsHistory,
    paymentDetails,
    myPayables,
    error,
    userData,
    isHigherAccess,
    pagingData,
    numFetched,
    pathname,
  };
};

export default Payments;
