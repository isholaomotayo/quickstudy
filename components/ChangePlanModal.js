import { Modal, Button } from "react-bootstrap";
import { useState } from "react";
import fetch from "isomorphic-unfetch";

const possiblePlans = ["MONTHLY", "PAY IN FULL", "PER SEMESTER", "PER SESSION"];

const ChangePlanModal = props => {
  const [show, setShow] = useState(false);
  const [plan, setPlan] = useState("");
  const [feeId, setFeeId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

  const handleSubmit = async () => {
    setLoading(true);
    const data = {
      id: feeId,
      student_id: props.studentId,
      changed_plan: plan
    };
    let fees, temp;

    try {
      fees = await fetch(`${process.env.API_URL}/api/paymentplan`, {
        method: "post",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          id: Number(feeId),
          student_id: Number(props.studentId),
          changed_plan: plan
        })
      });

      fees = fees.status === 200 ? await fees.json() : [];
      fees =
        fees.length > 0
          ? fees.filter(fee => fee.payment_plan !== "CHANGED PLAN")
          : [];
    } catch (e) {
      console.log(e);
    }
    props.handlePlanUpdate(fees);
    setLoading(false);
    setPlan("");
    setFeeId("");
    handleClose();
  };

  return (
    <>
      <a
        className="btn btn-info btn-cons text-white"
        title="Coming Soon"
        onClick={handleShow}
      >
        <i className="fa fa-pencil" /> Change Payment Plan
      </a>

      <Modal
        show={show}
        onHide={handleClose}

        //  dialogClassName="modal-90w modal-w"
      >
        <form
          role="form"
          onSubmit={async e => {
            e.preventDefault();
            await handleSubmit();
          }}
        >
          <Modal.Header closeButton className="mb-3">
            <Modal.Title>Change Your Payment Plan</Modal.Title>
            {/* <span>
              (You are about to change your payment plan, please ensure you
              choose the correct option out of the drop down)
            </span> */}
          </Modal.Header>
          <Modal.Body>
            <div className="container">
              <div className="row">
                <div className="col-sm-12 col-md-12">
                  <div className="form-row">
                    <div className="form-group col-md-12  mb-5">
                      <h4 className="mx-3">Current payment plan</h4>
                      <select
                        id="id"
                        className="form-control"
                        defaultValue={feeId}
                        onChange={e => {
                          setFeeId(e.target.value);
                          //   handlePaymentPlanSelection(e.target.value);
                        }}
                      >
                        <option value="Select">Select</option>
                        {props.fees.map(fee => {
                          return (
                            <option value={fee.fee_student_id} key={fee.id}>
                              {fee.feestudent.name} -{" "}
                              {fee.feestudent.total_amount}- {fee.payment_plan}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-md-12">
                      <h4>Select the plan you want to change to</h4>
                      <select
                        id={plan}
                        className="form-control"
                        defaultValue={plan}
                        onChange={e => {
                          setPlan(e.target.value);
                        }}
                      >
                        <option value="Select">Select</option>
                        {possiblePlans
                          // .filter(fee => fee !== paymentPlan)
                          .map((fee, i) => {
                            return (
                              <option value={fee} key={i}>
                                {fee}
                              </option>
                            );
                          })}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary btn-info" onClick={handleClose}>
              Close
            </Button>
            <Button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? "Loading" : "Confirm"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};

export default ChangePlanModal;
