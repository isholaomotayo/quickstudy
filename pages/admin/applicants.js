import React from "react";
import Layout from "../../components/Layout";
import {
  getStaffByUserId,
  getCurrentSemester,
  getApplicants,
  admitStudent,
  setUserRole,
  getAllProgrammes,
  getAllLevels,
} from "../../helpers/FetchWrapper";
import { protectPage } from "../../helpers/utils";

import toast from "react-hot-toast";
import ViewApplicationModal from "../../components/ViewApplicationModal";
import SearchComponent from "../../components/SearchComponent";
const columns = ["id", "reg_no", "last_name", "first_name", "email"];
//const formFields = ['id', 'reg_no', 'last_name', 'first_name', 'email'];
class Applicants extends React.Component {
  state = {
    applicants: this.props.applicants,
  };

  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["ADMIN", "SUPERADMIN"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    const { staff } = await getStaffByUserId(userId, req);

    // retrieve applicant id in an institution
    let { applicants } = await getApplicants(req);

    applicants =
      applicants &&
      applicants
        .filter((applicant) => applicant.student.status === true)
        .sort(function (a, b) {
          return b.id - a.id;
        });

    let { programmes } = await getAllProgrammes(req);
    programmes = programmes
      ? programmes.map((obj) => ({
          ...obj,
          label: obj.name,
          value: obj.id,
        }))
      : null;

    let { levels } = await getAllLevels(req);
    levels = levels
      ? levels.map((obj) => ({
          ...obj,
          label: obj.name,
          value: obj.id,
        }))
      : null;
    return { applicants, programmes, levels, userData };
  };

  handleSearch = async (searchValue = "") => {
    if (searchValue.length === 0) {
      return toast("You must enter a value to search for", { icon: "⚠️" });
    }

    let response;
    try {
      response = await fetch(
        `${
          process.env.API_URL
        }/api/user/search?searchValue=${searchValue.trim()}`,
        {
          method: "get",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
      if (response.status === 200) {
        response = await response.json();

        this.setState({
          applicants: response,
        });

        return toast.success(`Successfully loaded data for ${searchValue}`, {
          icon: "✅",
        });
      }
      return toast.error("No entry found, please try again");
    } catch (e) {
      console.log(e);
      return toast.error("No entry found, please try again");
    }
  };

  handleChange = (index, applicant, e, meta) => {
    let { name, value } = e != null && e.target ? e.target : { e, e };
    meta
      ? ((name = meta.name),
        (value =
          Array.isArray(e) && e != null
            ? e.reduce((t, c) => [...t, c.id], [])
            : e != null && e.id))
      : name;

    /** for cases where the index is changed as a result of using filters, to get the accurate object to be modified,
     * get the index of the object in the main state object
     */
    const originalIndex = this.state.applicants.findIndex(
      (element) => element == applicant
    );

    let ua = Object.assign([...this.state.applicants], {
      [originalIndex]: {
        ...this.state.applicants[originalIndex],
        student: {
          ...this.state.applicants[originalIndex]["student"],
          [name]: value,
        },
      },
    });

    this.setState({ applicants: ua });
  };

  handleAdmit = async (user) => {
    const { semester } = await getCurrentSemester();
    let semester_admitted_id = semester && semester.id;
    let session_admitted_id = semester && semester.session_id;
    const updatedStudentObject = {
      ...user.student,
      semester_admitted_id: semester_admitted_id,
      session_admitted_id: session_admitted_id,
      admitted: true,
    };
    let applicantId = updatedStudentObject.user_id;
    let admitnewStudent = await admitStudent(updatedStudentObject);
    if (admitnewStudent.status === 200) {
      //set userRole to student
      let updateUserRole = await setUserRole(applicantId, "STUDENT");

      // filter out admitted applicant from institutions already saved in state
      var filter_applicants = this.state.applicants.filter(
        (item) => item.id != applicantId
      );
      this.setState({
        applicants: filter_applicants,
      });

      toast.success("Student successfully admitted.");
    } else {
      toast.error("Could not admit this student. Please try again.");
    }
  };

  handleRejectClick = (id, cb) => {
    cb();
    if (!id) {
      toast.error("Could not reject this student. Please try again.");

      return;
    }
    // let applicantId = id;
    // var filter_applicant = this.state.applicants.filter(
    //   item => item.id !== applicantId
    // );
    const applicants = this.state.applicants.filter((item) => +item.id !== +id);

    this.setState({
      applicants: applicants,
    });
    toast.success("Applicant Successfully Rejected");
  };

  render() {
    return (
      <Layout pageTitle="Applicants" userData={this.props.userData}>
        <div className="card card-transparent">
          <div className="card-header ">
            <div className="container">
              <div className="row">
                <div className="col-sm-12 col-md-6">
                  <div className="card-title">
                    <h4>Applicants</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <SearchComponent
              searchHandler={this.handleSearch}
              placeholder="Search for users by Username, Email "
              server={true}
            />
          </div>
          <div className="card-body">
            <table className="table table-condensed table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Programme</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th colSpan="2">Email</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {this.state.applicants.length ? (
                  this.state.applicants.map((applicant, index) => (
                    <tr key={`${applicant.id}`}>
                      <td className="font-montserrat fs-12 w-50">
                        {applicant.id}
                      </td>
                      <td className="w-15">
                        <span className="font-montserrat fs-18">
                          {applicant.student.programme_id
                            ? applicant.student.programme?.name
                            : applicant.student.programme_id}
                        </span>
                      </td>
                      <td className="font-montserrat fs-12 w-50">
                        {applicant.first_name}
                      </td>
                      <td className="w-15">
                        <span className="font-montserrat fs-18">
                          {applicant.last_name}
                        </span>
                      </td>
                      <td className="w-25" colSpan="2">
                        <span className="font-montserrat fs-18">
                          {applicant.email}
                        </span>
                      </td>
                      <td>
                        <ViewApplicationModal
                          applicant={applicant}
                          index={index}
                          handleAdmit={this.handleAdmit}
                          handleReject={this.handleRejectClick}
                          programmes={this.props.programmes}
                          levels={this.props.levels}
                          handleChange={this.handleChange}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="w-100">No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Layout>
    );
  }
}
const ToastWrapper = (props) => {
  return <Applicants {...props} />;
};

ToastWrapper.getInitialProps = Applicants.getInitialProps;

export default ToastWrapper;
