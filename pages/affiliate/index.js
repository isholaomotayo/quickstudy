import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Layout from "../../components/Layout";
import { Table, Modal } from "react-bootstrap";

import {
  showToastAlert,
  protectPage,
  getTableData,
  getAffiliateReferrals
} from "../../helpers/utils";
import { translateCode } from "../../helpers/language/translate";
import ViewAffiliateData from "../../components/ViewAffiliateData";

const MoreAffiliateModal = props => {
  const [show, setShow] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = props.setLoading;
  const { user = {}, role = "ADMIN" } = props;
  const handleShow = async () => {
    setLoading(true);
    const finalData = await getAffiliateReferrals(
      { username: user.username, id: user.id },
      false
    );

    setData(finalData);
    setLoading(false);
    setShow(true);
  };

  const handleClose = () => setShow(false);

  return (
    <>
      <button
        disabled={loading}
        className="btn btn-primary"
        onClick={async e => await handleShow()}
      >
        More
      </button>

      <Modal
        show={show}
        onHide={handleClose}
        dialogClassName="modal-90w modal-w"
      >
        <Modal.Header closeButton>
          <p>{`${user.first_name} ${user.last_name} Referrals`}</p>
        </Modal.Header>

        <Modal.Body>
          <ViewAffiliateData data={data} user={user} show={false} role={role} />
        </Modal.Body>
      </Modal>
      <style jsx global>
        {`
          .modal-w {
            width: 90vw !important;
            margin: 20px auto !important;
            margin-left: 30px;
          }
          .modal-dialog.modal-90w.modal-w {
          }
        `}
      </style>
    </>
  );
};

const Referrals = props => {
  
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const eligibleUser = props.eligibleUser;
  let pageNotif = "",
    pageNotifClass = "info";

  const allAffiliateData =
    props.userData.role.includes("ADMIN") &&
    props.finalData.filter(aff => {
      return (
        aff.user.first_name.toLowerCase().includes(search.toLowerCase()) ||
        aff.user.last_name.toLowerCase().includes(search.toLowerCase()) ||
        aff.user.username.toLowerCase().includes(search.toLowerCase()) ||
        aff.user.email.toLowerCase().includes(search.toLowerCase())
      );
    });

  const dataToRender = useMemo(() => {
    return (
      allAffiliateData.length > 0 &&
      allAffiliateData.map((val, i) => {
        return (
          <tr key={i}>
            <td>{i + 1}</td>
            <td>
              {val.user.first_name} {val.user.last_name}
            </td>
            <td>{val.user.email}</td>
            <td>
              {val.bank} - {val.account_no}
            </td>
            <td>
              <MoreAffiliateModal
                user={val.user}
                setLoading={[loading, setLoading]}
                role={props.userData.role}
              />
            </td>
          </tr>
        );
      })
    );
  }, [allAffiliateData]);

  useEffect(() => {
    if ((eligibleUser && !eligibleUser.affiliate) || !eligibleUser) {
      pageNotif = translateCode("no_affiliate_profile");
      pageNotifClass = "error";
      toast(pageNotif);
    }
  }, []);

  return (
    <Layout pageTitle="Referrals" userData={props.userData}>
      {props.userData.role.includes("ADMIN") ? (
        <>
          <input
            type="text"
            placeholder="Search for an affiliate by name, email or username"
            className="form-control my-5"
            onChange={e => setSearch(e.target.value)}
          />
          <Table responsive="md" striped bordered hover>
            <thead>
              <tr>
                <th className="bold">#</th>
                <th className="bold">Affiliate Name</th>
                <th className="bold">Affiliate Email</th>
                <th className="bold">Affiliate Bank Details</th>
                <th className="bold">Action</th>
              </tr>
            </thead>
            <tbody>{dataToRender}</tbody>
          </Table>
        </>
      ) : (
        eligibleUser &&
        eligibleUser.affiliate && (
          <ViewAffiliateData
            data={props.finalData}
            query={props.userData}
            role={props.userData.role}
          />
        )
      )}
    </Layout>
  );
};

Referrals.getInitialProps = async ({ req, res, pathname }) => {
  const allowedRoles = [
    "SUPERADMIN",
    "ADMIN",
    "HOD",
    "STAFF",
    "STUDENT",
    "AFFILIATE"
  ];
  const eligibleRoles = ["HOD", "STAFF", "STUDENT", "AFFILIATE"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);
  const myRefQuery = { referral_code: userData.username };
  let eligibleUser = null;
  let finalData = [];

  const [referrals, nothing, error, pagingData] = await getTableData(
    "user",
    "referral_code",
    myRefQuery,
    [],
    false,
    req
  );

  if (eligibleRoles.indexOf(role) > -1) {
    const [users, nothing2, error2] = await getTableData(
      "user",
      "id",
      { id: userId },
      [],
      false,
      req
    );
    eligibleUser = (users.length && users[0]) || {};
  }

  if (eligibleUser && eligibleUser.affiliate) {
    finalData = await getAffiliateReferrals(
      { username: userData.username, id: userData.id },
      req
    );
  } else if (role.includes("ADMIN")) {
    finalData = await fetch(`${process.env.API_URL}/api/affiliate`, {
      method: "get",
      credentials: "include",
      headers: req
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
    });
    finalData = finalData.status === 200 ? await finalData.json() : [];
  }

  return {
    referrals,
    userData,
    error,
    pagingData,
    pathname,
    eligibleUser,
    finalData
  };
};

export default Referrals;
