import { useState } from "react";
import Layout from "../../components/Layout";
import toast from "react-hot-toast";
import fetch from "isomorphic-unfetch";
import { protectPage } from "../../helpers/utils";
import Table from "react-bootstrap/Table";
import DefermentComponent from "../../components/deferment/DefermentComponent";
import Pagination from "../../components/Pagination";

const Deferment = props => {
  const [users, setUsers] = useState(props.users);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dataPerPage, setDataPerPage] = useState(15);

  

  const indexOfLastData = currentPage * dataPerPage;
  const indexOfFirstData = indexOfLastData - dataPerPage;
  const currentData = users.slice(indexOfFirstData, indexOfLastData);

  //   @TODO
  //     fix search issue
  // create put data
  // study protect page for limited access
  // work on student request deferment page

  // fix backend issues
  // test

  const dataToMap =
    search.length > 0
      ? users.filter(value => {
          return (
            value.user.first_name
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            value.user.last_name.toLowerCase().includes(search.toLowerCase()) ||
            value.admission_status
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
            value.admission_status
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            value.user.email.toLowerCase().includes(search.toLowerCase())
          );
        });

  const handleNextPage = () => {
    let maxPage = Math.ceil(users.length / dataPerPage);

    setCurrentPage(currentPage + 1 >= maxPage ? maxPage : currentPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1 <= 0 ? 1 : currentPage - 1);
  };

  const paginate = number => {
    setCurrentPage(number);
  };

  const handleDefermentProcess = async student => {
    const { user, admission_status, id } = student;
    const data = {
      user,
      admission_status
    };
    let response;

    let tempUsers = users.filter(x => {
      return x.id !== id;
    });

    try {
      response = await fetch(
        `${process.env.API_URL}/api/deferment/deferProcessByAdmin/${id}`,
        {
          //mode: "no-cors",
          method: "put",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          },
          body: JSON.stringify({
            ...data
          })
        }
      );

      response = response.status === 200 ? await response.json() : {};
    } catch (e) {
      console.log(e);
    }

    if (Object.entries(response).length > 0) {
      response.admission_status = "DEFERRED";
      const value =
        admission_status === "ACTIVE" ? tempUsers : [...tempUsers, response];

      setUsers(value);
      admission_status === "ACTIVE"
        ? toast.success("Student Successfully Resumed")
        : toast.success("Student Successfully Deferred");
      return;
    }

    toast.error("Failed to update");
  };

  return (
    <Layout userData={props.userData}>
      <div className="container">
        <div className="row">
          <div className="col-sm-6">
            <h4>Deferred Students</h4>
            <p className="mb-4">
              All users in your institutions who have requested to be deferred
              or who are currently deferred.
            </p>
          </div>
          <div className="col-sm-6 my-3">
            <input
              type="text"
              className="form-control"
              placeholder="Search for users by names. email or role"
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div>
        <Table responsive="sm" hover bordered size="sm">
          <thead>
            <tr className="text-center">
              <th>Reg No</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {dataToMap.map((data, i) => {
              const name = `${
                data.user.first_name ? data.user.first_name : ""
              } ${data.user.other_name ? data.user.other_name : ""} ${
                data.user.last_name ? data.user.last_name : ""
              }`;

              return (
                <tr key={i} className="text-center">
                  <td>{!!data.reg_no ? data.reg_no : ""}</td>
                  <td>{name}</td>
                  <td>{!!data.user.email ? data.user.email : ""}</td>
                  <td>
                    {!!data.admission_status ? data.admission_status : ""}
                  </td>
                  <td>
                    <DefermentComponent
                      data={data}
                      handleDefermentProcess={handleDefermentProcess}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      <div className="container mt-4">
        <div className="row">
          <div className="col-sm-12" style={{ width: "80%" }}>
            <Pagination
              total={users.length}
              dataPerPage={dataPerPage}
              paginate={paginate}
              currentPage={currentPage}
              handleNextPage={handleNextPage}
              handlePreviousPage={handlePreviousPage}
              color="bg-info"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

Deferment.getInitialProps = async ({ req, res, query }) => {
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  let users;

  try {
    users = await fetch(`${process.env.API_URL}/api/deferment`, {
      method: "get",
      credentials: "include",
      headers:
        req && req.headers && req.headers.cookie
          ? { cookie: req.headers.cookie }
          : {}
    });

    users = users.status === 200 ? await users.json() : [];

    users = users.sort((a, b) => {
      return b.admission_status.toLowerCase() > a.admission_status.toLowerCase()
        ? 1
        : a.admission_status.toLowerCase() > b.admission_status.toLowerCase()
        ? -1
        : 0;
    });
  } catch (e) {
    console.log(e);
  }
  return { userData, users };
};

export default Deferment;
