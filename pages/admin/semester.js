import React, { useState, useMemo } from "react";
import Layout from "../../components/Layout";
import { protectPage } from "../../helpers/utils";
import fetch from "isomorphic-unfetch";
import { Container, Row, Col, Table, Form, Modal } from "react-bootstrap";
import toast from "react-hot-toast";

const SemesterModal = (props) => {
  const [show, setShow] = useState(false);
  const { semester = {}, isEdit = false, sessions = [] } = props;
  const [data, setData] = useState(semester);
  const handleShow = () => setShow(true);

  const handleClose = () => setShow(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(name, value);
    setData({
      ...data,
      [name]: value,
    });
  };

  return (
    <>
      {isEdit ? (
        <a className="text-warning link mx-2" onClick={handleShow}>
          Edit
        </a>
      ) : (
        <button className="btn btn-primary" onClick={handleShow}>
          New Semester
        </button>
      )}
      <Modal show={show} onHide={handleClose}>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            await props.callBack(data, handleClose);
          }}
        >
          <Modal.Header closeButton className="mb-3">
            <Modal.Title>
              {isEdit ? " Edit This" : "Create A"} Semester
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
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                name="start_date"
                required
                min={new Date()}
                onChange={handleChange}
                defaultValue={data.start_date}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>End Date</Form.Label>
              <Form.Control
                type="date"
                name="end_date"
                min={new Date()}
                required
                onChange={handleChange}
                defaultValue={data.end_date}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Position</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="2"
                name="position"
                required
                onChange={handleChange}
                defaultValue={data.position}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Active</Form.Label>
              <Form.Control
                as="select"
                name="is_active"
                required
                onChange={handleChange}
                defaultValue={data.is_active}
              >
                <option>Please Select An Option</option>
                <option value={true}>YES</option>
                <option value={false}>NO</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Session</Form.Label>
              <Form.Control
                as="select"
                name="session_id"
                required
                onChange={handleChange}
                defaultValue={data.session_id}
              >
                <option>Please Select An Option</option>
                {sessions.length > 0 &&
                  sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name}
                    </option>
                  ))}
              </Form.Control>
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

const Semester = (props) => {
  
  const [semesters, setSemesters] = useState(props.semesters);
  const handleCreation = async (data, cb) => {
    data.institution_id = props.userData.institution_id;
    let createdData;

    try {
      createdData = await fetch(`${process.env.API_URL}/api/semester`, {
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
        setSemesters([createdData, ...semesters]);
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
        `${process.env.API_URL}/api/semester/${data.id}`,
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
        const semesterToEdit = semesters.findIndex(
          (semester) => Number(semester.id) === Number(data.id)
        );
        const tempSemesters = [...semesters];
        tempSemesters.splice(semesterToEdit, 1, editedData);
        setSemesters([...tempSemesters]);

        toast.success("Semester updated");
        return cb();
      }

      toast.error("Cannot update semester, please try again");
      return cb();
    } catch (e) {
      console.log(e);
      toast.error("Cannot update semester, please try again");
      return cb();
    }
  };

  const handleDelete = async (id, cb) => {
    let deletedSemester;

    try {
      deletedSemester = await fetch(
        `${process.env.API_URL}/api/semester/${id}`,
        {
          method: "delete",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

      if (deletedSemester.status === 200) {
        const semesterLeft = semesters.filter(
          (semester) => Number(semester.id) !== Number(id)
        );
        setSemesters([...semesterLeft]);
        toast.success("Successfully deleted");
        return cb();
      }

      toast.error("Semester could not be deleted, please try again");
      return cb();
    } catch (e) {
      console.log(e);
      toast.error("Semester could not be deleted, please try again");
      return cb();
    }
  };
  const memoizedSemester = useMemo(() => {
    return semesters.length > 0 ? (
      semesters.map((semester, i) => (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{semester.name}</td>
          <td>{semester.start_date}</td>
          <td>{semester.end_date}</td>
          <td>{semester.position}</td>
          <td>{semester.is_active ? "YES" : "NO"}</td>
          <td
            style={{
              cursor: "pointer",
            }}
          >
            <SemesterModal
              isEdit={true}
              semester={semester}
              sessions={props.sessions}
              callBack={handleEdit}
            />
            <DeleteModal
              handleDelete={handleDelete}
              name={semester.name}
              id={semester.id}
            />
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td>No semester</td>
      </tr>
    );
  }, [semesters]);
  return (
    <Layout pageTitle="Semester" userData={props.userData}>
      <Container>
        <Row>
          <Col>
            <SemesterModal
              sessions={props.sessions}
              callBack={handleCreation}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <Table responsive striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Position</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>{memoizedSemester}</tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

Semester.getInitialProps = async (ctx) => {
  const { req, res } = ctx;
  const allowedRoles = ["ADMIN", "SUPERADMIN"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  let semesters, sessions;

  try {
    semesters = await fetch(`${process.env.API_URL}/api/semester`, {
      method: "get",
      credentials: "include",
      headers: req
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    });

    semesters = semesters.status === 200 ? await semesters.json() : [];

    semesters = semesters.sort((a, b) => a.id - b.id);

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
  } catch (e) {
    console.log(e);
  }

  return { userData, semesters, sessions };
};

export default Semester;
