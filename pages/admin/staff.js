import React from "react";
import Layout from "../../components/Layout";
import toast from "react-hot-toast";
import Table from "../../components/Table";
import { getCookies } from "cookies-next";
import { protectPage, getTableData } from "../../helpers/utils";
import { postStaff } from "../../helpers/FetchWrapper";
import CreateStaffModal from "../../components/staff/CreateStaffModal";
import Link from "next/link";

class Staff extends React.Component {
  state = {
    allStaff: this.props.allStaff,
    search: "",
    username: "",
    password: "",
    confirmPassword: "",
    lastName: "",
    firstName: "",
    otherName: "",
    phone: "",
    email: "",
    department_id: "",
    staff_no: "",
    level: "",
    address: "",
    designation: "",
    role: "STAFF",
    institution_id: this.props.institutionId,
    staffIds: [],
    courseIds: [],
  };

  staffTableCols = ["id", "first_name", "last_name", "email"];

  staffFormFields = [
    "user_id",
    "staff_no",
    "designation",
    "level",
    "department_id",
    "email",
    "address",
    "created_at",
    "updated_at",
  ];

  staffSelectFields = {
    department_id: this.props.departments.map((department) => [
      department.id,
      department.name,
    ]),
  };

  static getInitialProps = async (ctx) => {
    const { req, res, query } = ctx;
    const allowedRoles = ["ADMIN", "SUPERADMIN"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );
    const { institutionId } = getCookies(ctx);

    const [departments] = await getTableData(
      "department",
      "",
      {},
      [],
      false,
      req
    );
    let [allStaff] = await getTableData("staff", "", {}, [], false, req);

    allStaff = allStaff.map((staff) => {
      return setStaffDetails(staff);
    });

    return { allStaff, departments, userData, institutionId };
  };

  handleSearchChange = (e) => {
    this.setState({
      search: e.target.value,
    });
  };
  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };
  handleStaffMultiChange = (option) => {
    this.setState({
      staffIds: option,
    });
  };

  handleSubmit = async (onSuccess) => {
    // Validate required fields
    const requiredFields = [
      "firstName",
      "lastName",
      "username",
      "password",
      "email",
      "department_id",
    ];
    const missingFields = requiredFields.filter((field) => !this.state[field]);

    if (missingFields.length > 0) {
      toast.error(
        `Please fill in all required fields: ${missingFields.join(", ")}`
      );
      return;
    }

    try {
      let response = await postStaff(this.state);

      if (response.status === 200) {
        const newStaff = await response.json();

        if (newStaff.id) {
          // Staff profile successfully created
          this.setState({
            username: "",
            password: "",
            confirmPassword: "",
            lastName: "",
            firstName: "",
            otherName: "",
            phone: "",
            department_id: "",
            email: "",
            staff_no: "",
            level: "",
            address: "",
            designation: "",
            role: "STAFF",
          });

          // Call the success callback with the created staff data
          if (onSuccess) {
            onSuccess(newStaff);
          }
        } else {
          toast.error("Staff profile created but returned invalid data.");
        }
      } else {
        let error = await response.json();
        console.log(error);
        let msg =
          "An error occurred while creating the staff profile. Please check the details and try again";

        if (error.message) {
          if (
            error.message.includes("User with this username already exists") ||
            error.message.includes("user_username_unique")
          ) {
            msg =
              "Another user already exists with this username. Please enter a different username and try again";
          } else if (error.message.includes("user_phone_unique")) {
            msg =
              "Another user already exists with this phone number. Please enter a different phone number and try again";
          } else if (error.message.includes("user_email_unique")) {
            msg =
              "Another user already exists with this email address. Please enter a different email address and try again";
          } else {
            msg = error.message;
          }
        }

        toast.error(msg, { icon: "❌" });
      }
    } catch (error) {
      console.error("Error creating staff:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  render() {
    const allStaffData = this.state.allStaff.filter((staff) => {
      const firstName = staff.first_name || staff.user?.first_name || "";
      const lastName = staff.last_name || staff.user?.last_name || "";
      const email = staff.email || staff.user?.email || "";

      return (
        firstName.toLowerCase().includes(this.state.search.toLowerCase()) ||
        lastName.toLowerCase().includes(this.state.search.toLowerCase()) ||
        email.toLowerCase().includes(this.state.search.toLowerCase())
      );
    });
    return (
      <Layout pageTitle="Staff" userData={this.props.userData}>
        <div className="card card-transparent">
          <div className="card-header">
            <div className="col-sm-12">
              <div className="pull-right">
                <CreateStaffModal
                  handleSubmit={(onSuccess) => this.handleSubmit(onSuccess)}
                  handleChange={this.handleChange}
                  state={this.state}
                  handleDoB={this.handleDoB}
                  departments={this.props.departments}
                />{" "}
              </div>
            </div>
            <div className="col-sm-12 col-md-6">
              <div className="card-title">
                <h4>Staff / Facilitators </h4>
              </div>
            </div>
            <div className="col-sm-12 col-md-6">
              <div className="row">
                <div className="col-sm-12 col-md-9 mb-3">
                  <form action="#" className="form-dark">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search for staff by name or email"
                      onChange={this.handleSearchChange}
                    />
                  </form>
                </div>
                <div className="col-sm-12 col-md-3 ">
                  <Link href="/admin/manage-users" className="btn btn-complete">
                    Manage Users
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="card-body">
            <Table
              rows={allStaffData}
              tableName={"staff"}
              tableCols={this.staffTableCols}
              formFields={this.staffFormFields}
              selectFields={this.staffSelectFields}
              disabledFields={["user_id"]}
              userData={this.props.userData}
              hideAdd={true}
              noAutoIDs={true}
              preRowUpdateFxn={setStaffDetails}
              modalSize="md"
            />
          </div>
        </div>
      </Layout>
    );
  }
}

function setStaffDetails(staff) {
  // Check if user data exists and is properly loaded
  if (staff.user && staff.user.first_name) {
    staff.first_name = staff.user.first_name;
    staff.last_name = staff.user.last_name;
    staff.email = staff.user.email;
  } else {
    // Fallback to direct properties if user relationship is not loaded
    staff.first_name = staff.first_name || staff.user?.first_name || "N/A";
    staff.last_name = staff.last_name || staff.user?.last_name || "N/A";
    staff.email = staff.email || staff.user?.email || "N/A";
  }

  return staff;
}

const ToastWrapper = (props) => {
  return <Staff {...props} />;
};

ToastWrapper.getInitialProps = Staff.getInitialProps;

export default ToastWrapper;
