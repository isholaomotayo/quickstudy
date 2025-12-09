import React from "react";
import Layout from "../../components/Layout";
import Pagination from "../../components/Pagination";
import { protectPage, getTableData } from "../../helpers/utils";
import {
  updateStudent,
  getAllProgrammes,
  getAllLevels,
} from "../../helpers/FetchWrapper";
import Link from "next/link";
import ViewStudentModal from "../../components/student/ViewStudentModal";
import SearchComponent from "../../components/SearchComponent";
import toast from "react-hot-toast";

class Students extends React.Component {
  state = {
    allStudents: this.props.allStudents,
    search: "",
    searching: false,
  };

  static getInitialProps = async ({ req, res, query, pathname }) => {
    const allowedRoles = ["ADMIN", "SUPERADMIN"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let [allStudents, nothing, error, pagingData] = await getTableData(
      "student",
      "",
      query,
      [],
      false,
      req
    );

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

    return { allStudents, programmes, levels, userData, pathname, pagingData };
  };

  handleSearchChange = (e) => {
    this.setState({
      search: e.target.value,
    });
  };

  handleSearch = async (searchTerm) => {
    try {
      this.setState({ searching: true });
      
      if (!searchTerm || searchTerm.trim() === "") {
        // If no search term, reload the page to get all students
        window.location.reload();
        return;
      }

      // Use the dedicated search endpoint
      const searchUrl = `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/api/student/search?searchValue=${encodeURIComponent(searchTerm.trim())}`;
      
      const response = await fetch(searchUrl, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const searchResults = data.students || data || [];
        
        this.setState({ 
          allStudents: searchResults,
          search: searchTerm,
          searching: false
        });
        
        if (searchResults.length === 0) {
          toast.info("No students found matching your search criteria");
        } else {
          toast.success(`Found ${searchResults.length} student(s)`);
        }
      } else {
        this.setState({ 
          allStudents: [],
          search: searchTerm,
          searching: false
        });
        toast.error("Search failed. Please try again.");
      }
    } catch (error) {
      console.error("Search error:", error);
      this.setState({ 
        allStudents: [],
        search: searchTerm,
        searching: false
      });
      toast.error("An error occurred while searching. Please try again.");
    }
  };
  handleChange = (index, student, e, meta) => {
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
    const originalIndex = this.state.allStudents.findIndex(
      (element) => element == student
    );
    let ua = Object.assign([...this.state.allStudents], {
      [originalIndex]: {
        ...this.state.allStudents[originalIndex],
        [name]: value,
      },
    });

    this.setState({ allStudents: ua });
  };

  handleSave = async (studentData, index) => {
    try {
      const updatedStudentObject = {
        student: {
          ...studentData,
        },
      };
      //let studentId = studentData.id;
      let { updatedStudent } = await updateStudent(updatedStudentObject);

      if (updatedStudent.id) {
        //student update successfull

        // // filter out updated student from students already saved in state
        // var filter_students = this.state.allStudents.filter(
        //   item => item.id != studentId
        // );
        // this.setState({
        //   allStudents: [...filter_students, updatedStudent]
        // });

        let ua = Object.assign([...this.state.allStudents], {
          [index]: {
            ...updatedStudent,
          },
        });
        this.setState({ allStudents: ua });

        toast.success("Student profile update successfully.");
      } else {
        toast.success(
          "Could not update this student profile. Please try again.",
          { icon: "✅" }
        );
      }
    } catch (e) {
      return toast.error("No entry found, please try again");
    }
  };

  render() {
    // const allStudentsData = this.state.allStudents.filter(student => {
    //   return (
    //     student.user.first_name
    //       .toLowerCase()
    //       .includes(this.state.search.toLowerCase()) ||
    //     student.user.last_name
    //       .toLowerCase()
    //       .includes(this.state.search.toLowerCase()) ||
    //     (student.reg_no &&
    //       student.reg_no
    //         .toLowerCase()
    //         .includes(this.state.search.toLowerCase())) ||
    //     student.user.email
    //       .toLowerCase()
    //       .includes(this.state.search.toLowerCase())
    //   );
    // });
    return (
      <Layout pageTitle="Students" userData={this.props.userData}>
        <div className="card card-transparent">
          <div className="card-header">
            <div className="col-sm-12">
              <div className="pull-right">
                {/* <a
                  href="/admin/student-courses"
                  className="btn btn-success btn-cons text-white"
                >
                  Student Course Registrations
                </a> */}
                <Link
                  href="/admin/manage-users"
                  className="btn btn-complete mr-3"
                >
                  Manage Users
                </Link>
                <Link
                  href="/admin/deferment"
                  className="btn btn-primary btn-cons text-white"
                >
                  Manage Deferred Students
                </Link>
              </div>
            </div>
            <div className="col-sm-12 col-md-6">
              <div className="card-title">
                <h4>Students </h4>
              </div>
            </div>
            <div className="row">
              <SearchComponent
                searchHandler={this.handleSearch}
                placeholder="Search for student by username, email or reg_no"
                server={true}
              />
            </div>
          </div>
          <div className="card-body">
            <table className="table table-responsible table-hover">
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Programme</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {this.state.searching ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      <div className="d-flex justify-content-center align-items-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Searching...</span>
                        </div>
                        <span className="ml-2">Searching students...</span>
                      </div>
                    </td>
                  </tr>
                ) : this.state.allStudents.length ? (
                  this.state.allStudents.map((student, index) => (
                    <tr key={`${student.id}`}>
                      <td className="font-montserrat fs-12 w-25">
                        {student.reg_no}
                      </td>

                      <td className="w-25">
                        <span className="font-montserrat fs-18">
                          {(student.programme_id && student.programme.name) ||
                            ""}
                        </span>
                      </td>
                      <td className="font-montserrat fs-12 w-25">
                        {`${student.user.first_name} ${student.user.last_name}`}
                      </td>

                      <td className="">
                        <span className="font-montserrat fs-18">
                          {student.user.email}
                        </span>
                      </td>
                      <td className="w-25">
                        <span className="font-montserrat fs-18">
                          {!!student.admission_status
                            ? student.admission_status
                            : ""}
                        </span>
                      </td>

                      <td>
                        <ViewStudentModal
                          student={student}
                          index={index}
                          handleSave={this.handleSave}
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
          {this.props.pagingData &&
            this.props.pagingData.rowCount > this.state.allStudents.length && (
              <Pagination
                total={+this.props.pagingData.rowCount}
                dataPerPage={+this.props.pagingData.pageSize}
                href={`${this.props.pathname}?pgsize=${+this.props.pagingData
                  .pageSize}&pg=`}
                currentPage={+this.props.pagingData.page}
              />
            )}
        </div>
      </Layout>
    );
  }
}

const ToastWrapper = (props) => {
  return <Students {...props} />;
};

ToastWrapper.getInitialProps = Students.getInitialProps;

export default ToastWrapper;
