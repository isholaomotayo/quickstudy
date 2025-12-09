import React, { useMemo, useState } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import {
  confirmPayment,
  unconfirmPayment,
  getAffiliateReferrals
} from "../helpers/utils";

const ViewAffiliateData = props => {
  const { data = [], user = {}, show = true, role = "ADMIN" } = props;
  const [affData, setAffData] = useState(data);
  let amountDue = 0;

  const handleConfirmPayment = async data => {
    const paymentConfirm = await confirmPayment(data);

    if (paymentConfirm.success) {
      const tempAffData = await getAffiliateReferrals(
        { username: user.username, id: user.id },
        false
      );

      setAffData(tempAffData);
    }
  };

  const handleUnconfirmPayment = async data => {
    const unconfirmedPayment = await unconfirmPayment(data);

    if (unconfirmedPayment.success) {
      const tempAffData = await getAffiliateReferrals(
        { username: user.username, id: user.id },
        false
      );

      setAffData(tempAffData);
    }
  };
  const dataToRender = useMemo(() => {
    return (
      affData.length > 0 &&
      affData.map((val, i) => {
        if (val.affiliate_info.affiliate_status === "Tuition Confirmed") {
          amountDue = Number(amountDue) + Number(val.affiliate_info.amount_due);
        }
        return (
          <tr key={i}>
            <td>{i + 1}</td>
            <td className="bold">
              {val.first_name} {val.last_name}
            </td>
            <td className="bold">{val.email}</td>
            <td className="bold">{val.affiliate_info.affiliate_status}</td>
            <td className="bold">{val.affiliate_info.amount_due}</td>
            <td className="bold">{val.affiliate_info.paid}</td>
            {role.includes("ADMIN") &&
              val.affiliate_info.affiliate_status === "Tuition Confirmed" && (
                <td>
                  {val.affiliate_info.paid !== "YES" && (
                    <button
                      className="btn btn-success"
                      onClick={async e => {
                        e.preventDefault();

                        await handleConfirmPayment({
                          affiliate_id: user.id,
                          referral_id: val.id
                        });
                      }}
                    >
                      Confirm Payment
                    </button>
                  )}
                </td>
              )}
          </tr>
        );
      })
    );
  }, [affData]);
  return (
    <>
      <Container>
        <Row>
          <Col>
            <h2>Total Amount Due : {amountDue} Naira</h2>
          </Col>
        </Row>
        {show && (
          <Row>
            <Col>
              <p>
                Hello{" "}
                <span className="bold">
                  {user.first_name} {user.last_name}
                </span>
                , Below is the list of all prospective students who have used
                your referral code to apply on the system. Note that the status
                of the applicant is set to{" "}
                <span className="bold">Tuition Confirmed</span> when the student
                has paid the required fees and that is when you are eligible to
                receive commissions.
              </p>
            </Col>
          </Row>
        )}
        <Row>
          <Col>
            {data.length > 0 ? (
              <Table responsive="md" striped bordered hover>
                <thead>
                  <tr>
                    <th className="bold">#</th>
                    <th className="bold">Referral Name</th>
                    <th className="bold">Referral Email</th>
                    <th className="bold">Referral Status</th>
                    <th className="bold">Expected Income</th>
                    <th>Paid</th>
                    {role.includes("ADMIN") && <th className="bold">Action</th>}
                  </tr>
                </thead>
                <tbody>{dataToRender}</tbody>
              </Table>
            ) : (
              <div>Your affiliate code has not been used yet. </div>
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ViewAffiliateData;
