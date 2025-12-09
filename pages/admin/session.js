import { useState, useMemo, useEffect } from "react";
import Layout from "../../components/Layout";
import { protectPage } from "../../helpers/utils";
import fetch from "isomorphic-unfetch";
import { Container, Row, Col, Table, Form, Modal } from "react-bootstrap";
import toast from "react-hot-toast";

import { DatePicker, initializeIcons } from "@fluentui/react";

initializeIcons();

const _onParseDateFromString = (value) => {
  const date = new Date();
  const values = (value || "").trim().split("/");
  const day =
    values.length > 0
      ? Math.max(1, Math.min(31, parseInt(values[0], 10)))
      : date.getDate();
  const month =
    values.length > 1
      ? Math.max(1, Math.min(12, parseInt(values[1], 10))) - 1
      : date.getMonth();
  let year = values.length > 2 ? parseInt(values[2], 10) : date.getFullYear();
  if (year < 100) {
    year += date.getFullYear() - (date.getFullYear() % 100);
  }
  return new Date(year, month, day);
};

const SessionModal = (props) => {
  const [show, setShow] = useState(false);
  const { session = {}, isEdit = false } = props;
  const [data, setData] = useState(session);
  const [startDate, setStartDate] = useState(
    session.start_date !== undefined ? new Date(session.start_date) : ""
  );
  const [endDate, setEndDate] = useState(
    session.end_date !== undefined ? new Date(session.end_date) : ""
  );
  const handleShow = () => setShow(true);

  const handleClose = () => {
    setData({});
    setStartDate("");
    setEndDate("");
    setShow(false);
  };

  const handleDateChange = (date, name) => {
    // setData({
    //   ...data,
    //   [name]: date !== null ? date : ""
    // });

    if (name === "start_date") {
      date !== null && setStartDate(date);
      return;
    } else {
      date !== null && setEndDate(date);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setData({
      ...data,
      [name]: value,
    });
  };
  useEffect(() => {
    return () => console.log(startDate, "rerendering");
  }, [data, startDate, endDate]);

  return (
    <>
      {isEdit ? (
        <a className="text-warning link mx-2" onClick={handleShow}>
          Edit
        </a>
      ) : (
        <button className="btn btn-primary" onClick={handleShow}>
          New Session
        </button>
      )}
      <Modal show={show} onHide={handleClose} enforceFocus={false}>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            if (startDate > endDate) {
              toast("Your end date must be greater than start date", {
                icon: "⚠️",
              });
              return;
            }
            data.start_date = startDate;
            data.end_date = endDate;
            await props.callBack(data, handleClose);
          }}
        >
          <Modal.Header closeButton className="mb-3">
            <Modal.Title>
              {isEdit ? " Edit This" : "Create A"} Session
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                required
                onChange={handleChange}
                defaultValue={data.name}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Start Year</Form.Label>
              <Form.Control
                type="number"
                name="start_year"
                required
                onChange={handleChange}
                defaultValue={data.start_year}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>End Year</Form.Label>
              <Form.Control
                type="number"
                name="end_year"
                required
                onChange={handleChange}
                defaultValue={data.end_year}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Start Date</Form.Label>
              {process.browser && (
                <DatePicker
                  value={startDate}
                  isRequired={true}
                  placeholder="Select Start Date"
                  ariaLabel="Select a date"
                  allowTextInput={true}
                  onSelectDate={(value) =>
                    handleDateChange(value, "start_date")
                  }
                  parseDateFromString={_onParseDateFromString}
                />
              )}
            </Form.Group>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              {process.browser && (
                <DatePicker
                  value={endDate}
                  isRequired={true}
                  placeholder="Select End Date"
                  ariaLabel="Select a date"
                  minDate={startDate === undefined ? new Date() : startDate}
                  allowTextInput={true}
                  onSelectDate={(value) => handleDateChange(value, "end_date")}
                  parseDateFromString={_onParseDateFromString}
                />
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <button className="btn btn-complete">
              {isEdit ? " Update" : "Create"}
            </button>
            <button
              className="btn btn-danger"
              type="button"
              onClick={handleClose}
            >
              Cancel
            </button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};
const DeleteModal = (props) => {
  const [show, setShow] = useState(false);

  const { name = "", id } = props;
  const handleShow = () => setShow(true);

  const handleClose = () => setShow(false);

  return (
    <>
      <a className="text-danger text-link" onClick={handleShow}>
        Delete
      </a>

      <Modal show={show} onHide={handleClose}>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            await props.handleDelete(id, handleClose);
          }}
        >
          <Modal.Header closeButton className="mb-3">
            <Modal.Title>Delete {name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete {name}</p>
          </Modal.Body>
          <Modal.Footer>
            <button type="submit" className="btn btn-complete">
              Yes
            </button>
            <button
              className="btn btn-danger"
              type="button"
              onClick={handleClose}
            >
              No
            </button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

const Session = (props) => {
  const [sessions, setSessions] = useState(props.sessions);
  const handleCreation = async (data, cb) => {
    data.institution_id = props.userData.institution_id;
    let createdData;

    try {
      createdData = await fetch(`${process.env.API_URL}/api/session`, {
        method: "post",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(data),
      });

      if (createdData.status === 200) {
        createdData = await createdData.json();
        setSessions([createdData, ...sessions]);
        toast.success("Created Successfully");
        return cb();
      }
      toast.error("Failed to create, please try again");

      return cb();
    } catch (e) {
      toast.error("Failed to create, please try again");

      console.log(e);
      return cb();
    }
  };

  const handleEdit = async (data, cb) => {
    let editedData;

    try {
      editedData = await fetch(
        `${process.env.API_URL}/api/session/${data.id}`,
        {
          method: "put",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({ ...data }),
        }
      );

      if (editedData.status === 200) {
        editedData = await editedData.json();
        const sessionToEdit = sessions.findIndex(
          (session) => Number(session.id) === Number(data.id)
        );
        const tempSessions = [...sessions];
        tempSessions.splice(sessionToEdit, 1, editedData);
        setSessions([...tempSessions]);

        toast.success("Session updated");
        return cb();
      }

      toast.error("Cannot update session, please try again");
      return cb();
    } catch (e) {
      console.log(e);
      toast.error("Cannot update session, please try again");
      return cb();
    }
  };

  const handleDelete = async (id, cb) => {
    let deletedSession;

    try {
      deletedSession = await fetch(`${process.env.API_URL}/api/session/${id}`, {
        method: "delete",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });

      if (deletedSession.status === 200) {
        const sessionLeft = sessions.filter(
          (session) => Number(session.id) !== Number(id)
        );
        setSessions([...sessionLeft]);
        toast.success("Successfully deleted");
        return cb();
      }

      toast.error("Session could not be deleted, please try again");
      return cb();
    } catch (e) {
      console.log(e);
      toast.error("Session could not be deleted, please try again");
      return cb();
    }
  };
  const memoizedSession = useMemo(() => {
    return sessions.length > 0 ? (
      sessions.map((session, i) => (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{session.name}</td>
          <td>{session.start_year}</td>
          <td>{session.end_year}</td>
          <td>{session.start_date}</td>
          <td>{session.end_date}</td>

          <td
            style={{
              cursor: "pointer",
            }}
          >
            <SessionModal
              isEdit={true}
              session={session}
              callBack={handleEdit}
            />
            <DeleteModal
              handleDelete={handleDelete}
              name={session.name}
              id={session.id}
            />
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td>No Session</td>
      </tr>
    );
  }, [sessions]);
  return (
    <Layout pageTitle="Session" userData={props.userData}>
      <Container>
        <Row>
          <Col>
            <SessionModal callBack={handleCreation} />
          </Col>
        </Row>
        <Row>
          <Col>
            <Table responsive striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Start Year</th>
                  <th>End Year</th>
                  <th>Start Date</th>
                  <th>End Date</th>

                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{memoizedSession}</tbody>
            </Table>
          </Col>
        </Row>
      </Container>
      <style jsx global>
        {`
          .react-toast-notifications__container {
            z-index: 1000000000000 !important;
          }
        `}
      </style>
    </Layout>
  );
};

Session.getInitialProps = async (ctx) => {
  const { req, res } = ctx;
  const allowedRoles = ["ADMIN", "SUPERADMIN"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  let sessions;

  try {
    sessions = await fetch(`${process.env.API_URL}/api/session`, {
      method: "get",
      credentials: "include",
      headers: req
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    });

    sessions = sessions.status === 200 ? await sessions.json() : [];
    sessions = sessions.sort((a, b) => a.id - b.id);
  } catch (e) {
    console.log(e);
  }

  return { userData, sessions };
};

export default Session;
