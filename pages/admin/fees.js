import React, { useState } from "react";
import Layout from "../../components/Layout";
import { protectPage } from "../../helpers/utils";
import toast from "react-hot-toast";
import { Modal, Form, Table } from "react-bootstrap";
const FeeModal = (props) => {
  const [show, setShow] = useState(false);

  const { fee = {}, isEdit = true, levels = [], keys = 0 } = props;
  const [data, setData] = useState(fee);
  const handleShow = () => setShow(true);

  const handleClose = () => setShow(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData({
      ...data,
      [name]: value,
    });
  };
  return (
    <div key={keys}>
      {isEdit ? (
        <a className="text-warning btn-link cursor" onClick={handleShow}>
          Edit
        </a>
      ) : (
        <button className={`btn btn-primary mx-2 my-2`} onClick={handleShow}>
          Create
        </button>
      )}

      <Modal show={show} onHide={handleClose} key={keys}>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            await props.dispatch(data, handleClose);
          }}
        >
          <Modal.Header closeButton className="mb-3">
            <Modal.Title>{isEdit ? " Edit This" : "Create A"} Fee</Modal.Title>
            <Form.Text>
              All amounts should be in two decimal places e.g{" "}
              <span
                style={{
                  fontWeight: "bolder",
                }}
              >
                (19123.00)
              </span>
            </Form.Text>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>
                Fee Name <span className="text-danger">*</span>{" "}
              </Form.Label>
              <Form.Control
                required
                onChange={handleChange}
                type="text"
                name="name"
                defaultValue={fee.name}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>
                Fee Description <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                required
                onChange={handleChange}
                as="textarea"
                name="description"
                defaultValue={fee.description}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>
                Fee Amount <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                required
                onChange={handleChange}
                step="0.01"
                type="number"
                min="0"
                name="amount"
                defaultValue={fee.amount}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Monthly Amount</Form.Label>
              <Form.Control
                onChange={handleChange}
                step="0.01"
                type="number"
                min="0"
                name="monthly"
                defaultValue={fee.monthly}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>
                How many times will this amount be paid monthly
              </Form.Label>
              <Form.Control
                onChange={handleChange}
                type="number"
                min="0"
                name="monthly_parts"
                defaultValue={fee.monthly_parts}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Semesterly Amount</Form.Label>
              <Form.Control
                onChange={handleChange}
                step="0.01"
                type="number"
                min="0"
                name="semesterly"
                defaultValue={fee.semesterly}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>
                How many times will this amount be paid semesterly
              </Form.Label>
              <Form.Control
                onChange={handleChange}
                type="number"
                min="0"
                name="semesterly_parts"
                defaultValue={fee.semesterly_parts}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Sessionly Amount</Form.Label>
              <Form.Control
                onChange={handleChange}
                step="0.01"
                type="number"
                min="0"
                name="sessionly"
                defaultValue={fee.sessionly}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>
                How many times will this amount be paid sessionly
              </Form.Label>
              <Form.Control
                onChange={handleChange}
                type="number"
                min="0"
                name="sessionly_parts"
                defaultValue={fee.sessionly_parts}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Is Active</Form.Label>
              <Form.Control
                required
                onChange={handleChange}
                as="select"
                name="active"
                defaultValue={fee.active}
              >
                <option>Please select an option below</option>

                <option value="true">True</option>
                <option value="false">False</option>
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Level</Form.Label>
              <Form.Control
                required
                onChange={handleChange}
                as="select"
                name="level_id"
                defaultValue={fee.level_id}
              >
                <option>All Levels</option>

                {levels.map((level) => {
                  return <option value={+level.id}>{level.name}</option>;
                })}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Is Compulsory</Form.Label>
              <Form.Control
                required
                onChange={handleChange}
                as="select"
                name="compulsory"
                defaultValue={fee.compulsory}
              >
                <option>Please select an option below</option>
                <option value="1">True</option>
                <option value="0">False</option>
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
    </div>
  );
};

const DeleteModal = (props) => {
  const [show, setShow] = useState(false);

  const { name = "", keys = 0, id } = props;
  const handleShow = () => setShow(true);

  const handleClose = () => setShow(false);

  return (
    <div key={keys}>
      <a className="btn-link cursor text-danger" onClick={handleShow}>
        Delete
      </a>
      <Modal show={show} onHide={handleClose} key={keys}>
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
    </div>
  );
};

class Payment extends React.Component {
  state = {
    fees: this.props.fees,
  };
  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["SUPERADMIN", "ADMIN"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );
    let levels;

    levels = await fetch(`${process.env.API_URL}/api/level`, {
      method: "get",
      credentials: "include",
      headers: req
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
    });
    levels = levels.status === 200 ? await levels.json() : [];
    let fees = await (
      await fetch(`${process.env.API_URL}/api/fee`, {
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

    fees - fees.sort((a, b) => a.id - b.id);
    return { fees, userData, levels };
  };

  handleCreate = async (data, cb) => {
    let createdData;
    data.frequency = 1;

    if ("active" in data === false) {
      data.active = true;
    }
    if ("compulsory" in data === false) {
      data.compulsory = 1;
    }
    if ("optional" in data === false) {
      data.optional = 0;
    }

    try {
      createdData = await fetch(`${process.env.API_URL}/api/fee`, {
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
        this.setState({
          fees: [createdData, ...this.state.fees],
        });

        toast.success("Successfully created a new fee");
        return cb();
      }
      toast.error("Cannot create fee, please try again");
      return cb();
    } catch (e) {
      console.log(e);
      toast.error("Cannot create fee, please try again");
    }
  };

  handleEdit = async (data, cb) => {
    let editedData;
    data.active = Boolean(data.active);
    data.compulsory = Number(data.compulsory);

    try {
      editedData = await fetch(`${process.env.API_URL}/api/fee/${data.id}`, {
        method: "put",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ ...data }),
      });

      if (editedData.status === 200) {
        // return;
        editedData = await editedData.json();
        const feeToEdit = this.state.fees.findIndex(
          (fee) => +fee.id === +data.id
        );
        const tempFees = [...this.state.fees];
        tempFees.splice(feeToEdit, 1, editedData);
        this.setState({
          fees: [...tempFees],
        });

        toast.success("Successfully updated this fee");
        return cb();
      }

      toast.error("Cannot update fee, please try again");
      return cb();
    } catch (e) {
      console.log(e);
      toast.error("Cannot update fee, please try again");
    }
  };

  handleDelete = async (id, cb) => {
    let deletedFee;

    try {
      deletedFee = await fetch(`${process.env.API_URL}/api/fee/${id}`, {
        method: "delete",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });

      if (deletedFee.status === 200) {
        const feesLeft = this.state.fees.filter((fee) => +fee.id !== +id);
        this.setState({
          fees: [...feesLeft],
        });
        toast.success("Successfully deleted the fee");
        return cb();
      }

      toast.error("Fee could not be deleted, please try again");
      return cb();
    } catch (e) {
      console.log(e);
      toast.error("Fee could not be deleted, please try again");
    }
  };

  render() {
    return (
      <Layout pageTitle="Student Payments" userData={this.props.userData}>
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="card-title">
              <h4>List of Fees</h4>
            </div>
            <div>
              <FeeModal
                isEdit={false}
                dispatch={this.handleCreate}
                levels={this.props.levels}
              />
            </div>
          </div>
          <div className="card-body">
            <Table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Full Amount</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {this.state.fees.length ? (
                  this.state.fees.map((fee, i) => (
                    <tr key={`${fee.id}`}>
                      <td className="font-montserrat all-caps fs-12 w-50">
                        {fee.name}
                      </td>
                      <td className="w-15">
                        <span className="font-montserrat fs-18">
                          {fee.amount} NGN
                        </span>
                      </td>

                      <td className="w-25" key={i}>
                        <FeeModal
                          keys={i}
                          fee={fee}
                          dispatch={this.handleEdit}
                          levels={this.props.levels}
                        />
                        <DeleteModal
                          name={fee.name}
                          id={fee.id}
                          keys={i}
                          handleDelete={this.handleDelete}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>No records found</tr>
                )}
              </tbody>
            </Table>
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
