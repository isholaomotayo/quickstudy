import { useState, useEffect } from "react";
import { Form, Card, Row, Col, Button } from "react-bootstrap";
import toast from "react-hot-toast";
import Layout from "../../components/Layout";
import {
  getRequestOrigin,
  showToastAlert,
  protectPage,
  getTableData,
  userNameValid,
} from "../../helpers/utils";
import { translateCode } from "../../helpers/language/translate";

const API_URL = process.env.API_URL;

const Affiliate = (props) => {
  

  const affiliateData = { ...(props.user.affiliate || {}) };
  const currentHost = props.currentHost || getRequestOrigin();
  const [validated, setValidated] = useState(false);
  const [showView, setShowView] = useState(true);
  const [affiliateState, setAffiliateState] = useState({
    ...affiliateData,
    user_id: props.user.id,
    referral_code: props.user.username,
  });

  let pageNotif = "",
    pageNotifClass = "info";

  useEffect(() => {
    if (!(affiliateData && affiliateData.id)) {
      setShowView(false);
      pageNotif = translateCode("no_affiliate_profile");
      pageNotifClass = "error";
      toast(pageNotif);
    }
  }, []);

  const handleChange = (e) => {
    let fieldID = e.target.name,
      fieldVal = e.target.value;

    if (e.target.type && e.target.type === "checkbox") {
      fieldVal = e.target.checked;
    }

    setAffiliateState({
      ...affiliateState,
      [fieldID]: fieldVal,
    });
  };

  //console.log(answersByFieldState)

  const handleSubmit = async (event) => {
    const form = event.currentTarget;

    event.preventDefault();

    if (
      form.checkValidity() === false ||
      !userNameValid(affiliateState.referral_code)
    ) {
      event.stopPropagation();
    } else {
      const isNewForm = !affiliateState.id;
      const saveMethod = isNewForm ? "POST" : "PUT";
      const endpoint =
        API_URL +
        (props.postTo ||
          `/api/affiliate${isNewForm ? "" : "/" + affiliateData.id}`);

      if (!isNewForm && affiliateState.referral_code) {
        delete affiliateState.referral_code;
      }

      //console.log(affiliateState, postData)
      const response = await fetch(endpoint, {
        method: saveMethod,
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        credentials: "include",
        body: JSON.stringify(affiliateState),
      });

      if (response.ok) {
        const result = await response.json();

        if (result && result.pageNotif) {
          pageNotif = translateCode(result.pageNotif);
          pageNotifClass = "error";
        } else if (result && result.id) {
          pageNotif = "Saved!";
          pageNotifClass = "success";
        }

        if (pageNotif) toast(pageNotif);
      }

      setValidated(true);
    }
  };

  const stateRefCodeValid = userNameValid(affiliateState.referral_code);
  const savedRefCodeValid = userNameValid(props.user.username);

  return (
    <Layout pageTitle="My Affiliate Profile" userData={props.userData}>
      {showView && (
        <>
          <Card className="w-75 mx-auto">
            <Card.Body>
              {savedRefCodeValid && stateRefCodeValid ? (
                <>
                  <div>
                    Share your referral link (below) to invite friends, and earn
                    commissions when they pay.
                  </div>
                  <div>
                    <b>{`${currentHost}/r/${affiliateState.referral_code}`}</b>
                  </div>
                </>
              ) : (
                "Save your affiliate details below to get your referrer link."
              )}
            </Card.Body>
          </Card>

          <Card className="w-75 mx-auto">
            <Card.Body>
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group>
                  <Form.Label>Username (Refferal Code)</Form.Label>
                  <Form.Control
                    type="text"
                    name="referral_code"
                    value={affiliateState.referral_code}
                    disabled={savedRefCodeValid}
                    isInvalid={!stateRefCodeValid}
                    onChange={savedRefCodeValid ? null : handleChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    lowercase alphabets and numbers only
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Bank</Form.Label>
                  <Form.Control
                    type="text"
                    name="bank"
                    value={affiliateState.bank}
                    onChange={handleChange}
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Account Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="account_no"
                    value={affiliateState.account_no}
                    onChange={handleChange}
                  />
                  <Form.Text className="text-muted">
                    Your account for receiving commissions.
                  </Form.Text>
                </Form.Group>

                <Button variant="primary" type="submit">
                  Save
                </Button>
                <p className="text-danger">
                  <sub>
                    * Bank account name must be same as your registered name on
                    this site
                  </sub>
                </p>
              </Form>
            </Card.Body>
          </Card>
        </>
      )}
    </Layout>
  );
};

Affiliate.getInitialProps = async ({ req, res, query }) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "STUDENT",
    "AFFILIATE",
  ];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);
  const myQuery = { id: userId };

  const [users, nothing, error] = await getTableData(
    "user",
    "id",
    myQuery,
    [],
    false,
    req
  );
  const user = (users.length && users[0]) || {};
  const currentHost = getRequestOrigin(req);

  return { user, userData, error, currentHost };
};

export default Affiliate;
