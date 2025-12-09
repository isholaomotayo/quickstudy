import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";
import Pagination from "../Pagination";
const DataComponent = props => {
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState("");
  const [data, setData] = useState(props.data);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataPerPage, setDataPerPage] = useState(15);

  const indexOfLastData = currentPage * dataPerPage;
  const indexOfFirstData = indexOfLastData - dataPerPage;
  const currentData = data
    .sort((a, b) => b.id - a.id)
    .slice(indexOfFirstData, indexOfLastData);

  const dataToMap =
    search.length > 0
      ? data.filter(value => {
          return (
            value.user.first_name
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            value.user.last_name.toLowerCase().includes(search.toLowerCase()) ||
            value.user.other_name
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            value.user.email.toLowerCase().includes(search.toLowerCase())
          );
        })
      : currentData.filter(value => {
          return (
            value.user.first_name
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            value.user.last_name.toLowerCase().includes(search.toLowerCase()) ||
            value.user.other_name
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            value.user.email.toLowerCase().includes(search.toLowerCase())
          );
        });

  const handleSearch = e => setSearch(e.target.value);

  const handleShow = () => setShow(true);

  const handleClose = () => setShow(false);

  const handleNextPage = () => {
    let maxPage = Math.ceil(data.length / dataPerPage);

    setCurrentPage(currentPage + 1 >= maxPage ? maxPage : currentPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1 <= 0 ? 1 : currentPage - 1);
  };

  const paginate = number => {
    setCurrentPage(number);
  };

  const renderSwitch = type => {
    switch (type) {
      case "applicant":
        return dataToMap.map((value, i) => {
          return (
            <tr role="row" className="odd" key={i}>
              <td className="v-align-middle">
                <p>{`${value.user.first_name} ${
                  value.user.other_name !== null ? value.user.other_name : ""
                } ${value.user.last_name}`}</p>
              </td>
              <td className="v-align-middle">
                <p>{value.user.email}</p>
              </td>
              <td className="v-align-middle">
                <p>{value.user.phone}</p>
              </td>
              <td className="v-align-middle">
                <p>{value.user.role}</p>
              </td>
            </tr>
          );
        });
      case "admitted":
        return dataToMap.map((value, i) => {
          return (
            <tr role="row" className="odd" key={i}>
              <td className="v-align-middle">
                <p>{`${value.user.first_name} ${
                  value.user.other_name !== null ? value.user.other_name : ""
                } ${value.user.last_name}`}</p>
              </td>
              <td className="v-align-middle">
                <p>{value.user.email}</p>
              </td>
              <td className="v-align-middle">
                <p>
                  {value.hasOwnProperty("programme")
                    ? value.programme.prefix
                    : ""}
                </p>
              </td>
              <td className="v-align-middle">
                {props.department.map(x => {
                  return (
                    <p key={x.id}>
                      {value.hasOwnProperty("programme")
                        ? value.programme.department_id === x.id
                          ? x.name
                          : ""
                        : ""}
                    </p>
                  );
                })}
              </td>
            </tr>
          );
        });
      case "completed":
        return dataToMap.map((value, i) => {
          return (
            <tr role="row" className="odd" key={i}>
              <td className="v-align-middle">
                <p>{`${value.user.first_name} ${
                  value.user.other_name !== null ? value.user.other_name : ""
                } ${value.user.last_name}`}</p>
              </td>
              <td className="v-align-middle">
                <p>{value.user.email}</p>
              </td>
              <td className="v-align-middle">
                <p>
                  {value.hasOwnProperty("programme")
                    ? value.programme.prefix
                    : ""}
                </p>
              </td>
              <td className="v-align-middle">
                {props.department.map(x => {
                  return (
                    <p key={x.id}>
                      {value.programme.department_id === x.id ? x.name : ""}
                    </p>
                  );
                })}
              </td>
            </tr>
          );
        });
      case "accepted":
        return dataToMap.map((value, i) => {
          return (
            <tr role="row" className="odd" key={i}>
              <td className="v-align-middle">
                <p>{`${value.user.first_name} ${
                  value.user.other_name !== null ? value.user.other_name : ""
                } ${value.user.last_name}`}</p>
              </td>
              <td className="v-align-middle">
                <p>{value.user.email}</p>
              </td>

              <>
                <td className="v-align-middle">
                  <p>{value.fees[0].name}</p>
                </td>
                <td className="v-align-middle">
                  <p>{value.fees[0].amount}</p>
                </td>
                <td className="v-align-middle">
                  <p>{value.paid_fees}</p>
                </td>
                <td className="v-align-middle">
                  <p>{value.payment_plan}</p>
                </td>
              </>
            </tr>
          );
        });

      default:
        return (
          <tr role="row" className="odd">
            <td className="v-align-middle">
              <p>No data to display</p>
            </td>
          </tr>
        );
    }
  };

  return (
    <>
      <Button
        className=" btn-default"
        onClick={() => {
          handleShow();
        }}
      >
        {" "}
        View <i className="pt-2 fa fa-eye" />
      </Button>
      <Modal
        show={show}
        onHide={handleShow}
        dialogClassName="modal-90w modal-w"
      >
        <Modal.Body>
          <div className=" container-fluid   container-fixed-lg bg-white">
            <div className="card card-transparent">
              <div className="card-header border-bottom">
                <div className="row">
                  <div className="col-sm-6 col-md-6">
                    <h3 className=" bold mb-5">All Applicants</h3>
                  </div>
                  <div className="col-sm-6 col-md-6">
                    <label>Search</label>
                    <input
                      type="text"
                      className="form-control mb-5  bg-gray"
                      placeholder="Search for apllicants by names or email address"
                      onChange={handleSearch}
                    />
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <div
                    id="basicTable_wrapper"
                    className="dataTables_wrapper no-footer"
                  >
                    <table
                      className="table table-hover dataTable no-footer"
                      id="basicTable"
                      role="grid"
                    >
                      <thead>
                        <tr role="row">
                          {props.title.map((value, i) => {
                            return (
                              <th
                                style={{ width: 109 }}
                                className="sorting_desc"
                                tabIndex={0}
                                aria-controls="basicTable"
                                rowSpan={1}
                                colSpan={1}
                                aria-label="Title: activate to sort column ascending"
                                aria-sort="descending"
                                key={i}
                              >
                                {value}
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>{renderSwitch(props.type)}</tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Pagination
            total={data.length}
            dataPerPage={dataPerPage}
            paginate={paginate}
            currentPage={currentPage}
            handleNextPage={handleNextPage}
            handlePreviousPage={handlePreviousPage}
            color="bg-info"
          />
          <Button variant="secondary btn-info" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
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

export default DataComponent;
