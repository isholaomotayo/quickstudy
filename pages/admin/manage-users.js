import { Component } from "react";
import Layout from "../../components/Layout";
import { protectPage, getTableData } from "../../helpers/utils";
import Table from "react-bootstrap/Table";
import EditUserModal from "../../components/user/EditUserModal";
import EditStaffModal from "../../components/user/EditStaffModal";
import Pagination from "../../components/Pagination";
import { Sort } from "../../helpers/manage-users/manageUser";
import CourseApprovalModal from "../../components/CourseApprovalModal";
import SearchComponent from "../../components/SearchComponent";
import EditAffiliateModal from "../../components/EditAffiliateModal";
import toast from "react-hot-toast";

class ManageUsers extends Component {
  state = {
    search: "",
    user: this.props.allUsers,
    authUser: this.props.userId,
    searching: false,
  };
  static getInitialProps = async ({ req, res, query, pathname }) => {
    const allowedRoles = ["ADMIN", "SUPERADMIN"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let [allUsers, nothing, error, pagingData] = await getTableData(
      "user",
      "",
      query,
      [],
      false,
      req
    );

    allUsers = Sort(allUsers);

    return {
      userData,
      userId,
      role,
      allUsers,
      pagingData,
      pathname,
    };
  };

  onSearchChange = (e) => {
    this.setState({
      search: e.target.value,
    });
  };

  handleSearch = async (searchTerm) => {
    try {
      this.setState({ searching: true });
      
      if (!searchTerm || searchTerm.trim() === "") {
        // If no search term, reload the page to get all users
        window.location.reload();
        return;
      }

      // Use the dedicated search endpoint
      const searchUrl = `${process.env.NEXT_PUBLIC_API_URL || process.env.API_URL}/api/user/search?searchValue=${encodeURIComponent(searchTerm.trim())}`;
      
      const response = await fetch(searchUrl, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const searchResults = data.users || data || [];
        
        this.setState({ 
          user: searchResults,
          search: searchTerm,
          searching: false
        });
        
        if (searchResults.length === 0) {
          toast.info("No users found matching your search criteria");
        } else {
          toast.success(`Found ${searchResults.length} user(s)`);
        }
      } else {
        this.setState({ 
          user: [],
          search: searchTerm,
          searching: false
        });
        toast.error("Search failed. Please try again.");
      }
    } catch (error) {
      console.error("Search error:", error);
      this.setState({ 
        user: [],
        search: searchTerm,
        searching: false
      });
      toast.error("An error occurred while searching. Please try again.");
    }
  };

  handleUserUpdate = async (data) => {
    try {
      if (Object.keys(data).length === 0) {
        toast.success(
          "Updating  failed, please fill all required fields and try again",
          { icon: "✅" }
        );
        return;
      }
      return toast.error("No entry found, please try again");
    } catch (e) {
      console.log(e);
      return toast.error("No entry found, please try again");
    }
  };

  renderButton = (role = "", props) => {
    if (role === "AFFILIATE") {
      return (
        <EditAffiliateModal
          user={props}
          handleUserUpdate={this.handleUserUpdate}
        />
      );
    } else if (
      role.includes("ADMIN") ||
      role === "HOD" ||
      role === "STAFF" ||
      role === "LECTURER"
    ) {
      return (
        <EditStaffModal user={props} handleUserUpdate={this.handleUserUpdate} />
      );
    } else {
      return (
        <EditUserModal user={props} handleUserUpdate={this.handleUserUpdate} />
      );
    }
  };

  render() {
    return (
      <Layout userData={this.props.userData}>
        <div className="container">
          <div className="row">
            <div className="col-sm-6">
              <h4>All Users in your Institution</h4>
              <p className="mb-4">
                All users in your institutions showing their names, mail, and
                roles. Here you can also edit their details but do so with
                caution.
              </p>
              <p>
                Filter users by their <span className="bold">email</span>,{" "}
                <span className="bold">username</span> or{" "}
                <span className="bold">role</span>. Press{" "}
                <span className="bold">reset</span> to reset searched data
              </p>
            </div>
          </div>
          <div className="row">
            <SearchComponent
              searchHandler={this.handleSearch}
              placeholder="Search for users by Username, Email or Role"
              server={true}
            />
          </div>
        </div>
        <div className="container mt-4">
          <div className="row">
            <div className="col-sm-12" style={{ width: "80%" }}>
              {this.props.pagingData &&
                this.props.pagingData.rowCount > this.state.user.length && (
                  <Pagination
                    total={+this.props.pagingData.rowCount}
                    dataPerPage={+this.props.pagingData.pageSize}
                    href={`${this.props.pathname}?pgsize=${+this.props
                      .pagingData.pageSize}&pg=`}
                    currentPage={+this.props.pagingData.page}
                  />
                )}
            </div>
          </div>
        </div>
        <div>
          <Table responsive="sm" hover bordered size="sm">
            <thead>
              <tr className="text-center">
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {this.state.searching ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    <div className="d-flex justify-content-center align-items-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Searching...</span>
                      </div>
                      <span className="ml-2">Searching users...</span>
                    </div>
                  </td>
                </tr>
              ) : this.state.user.length > 0 ? (
                this.state.user.map((x, i) => {
                  const name = `${x.first_name ? x.first_name : ""} ${
                    x.other_name ? x.other_name : ""
                  } ${x.last_name ? x.last_name : ""}`;
                  return (
                    <tr key={i} className="text-center">
                      <td>
                        {name}{" "}
                        {x.account_active === false && (
                          <span className="text-danger">(Deactivated)</span>
                        )}
                      </td>
                      <td>{x.email}</td>
                      <td>{x.role}</td>
                      <td>
                        {this.renderButton(x.role, x)}

                        {x.role === "STUDENT" ? (
                          <CourseApprovalModal
                            user={x}
                            handleUserUpdate={this.handleUserUpdate}
                          />
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="text-center">
                  <td colSpan="4">
                    <p>No data found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
        <div className="container mt-4">
          <div className="row">
            <div className="col-sm-12" style={{ width: "80%" }}>
              {this.props.pagingData &&
                this.props.pagingData.rowCount > this.state.user.length && (
                  <Pagination
                    total={+this.props.pagingData.rowCount}
                    dataPerPage={+this.props.pagingData.pageSize}
                    href={`${this.props.pathname}?pgsize=${+this.props
                      .pagingData.pageSize}&pg=`}
                    currentPage={+this.props.pagingData.page}
                  />
                )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

const ToastWrapper = (props) => {
  return <ManageUsers {...props} />;
};
ToastWrapper.getInitialProps = ManageUsers.getInitialProps;

export default ToastWrapper;
