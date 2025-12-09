import { Component } from "react";
import Layout from "../components/Layout";
import SchoolAnnouncementTitle from "../components/announcements/AnnouncementTitle";
import AnnouncementListComponent from "../components/announcements/AnnouncementListComponent";
import {
  createSchoolAnnouncement,
  updateSchoolAnnouncement,
  deleteSchoolAnnouncement,
} from "../components/announcements/schoolannouncementhelpers";
import { protectPage, getTableData } from "../helpers/utils";

import Pagination from "../components/Pagination";
import toast from "react-hot-toast";

class Announcement extends Component {
  state = {
    announcements: this.props.announcements,
    pagingData: this.props.pagingData,
    course: {},
    announcement: {},
    authUser: this.props.userId,
    search: "",
    currentPage: 1,
    announcementPerPage: 10,
    pathname: this.props.pathname,
  };

  static getInitialProps = async ({ req, res, err, pathname, query }) => {
    const allowedRoles = ["SUPERADMIN", "STAFF", "ADMIN", "FACULTY", "STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let [announcements, _, __, pagingData] = await getTableData(
      "schoolAnnouncement",
      "",
      query,
      [],
      false,
      req
    );

    return {
      announcements,
      userData,
      pathname,
      userId,
      role,
      pagingData,
    };
  };

  handleChange = (e) => {
    const { name, value } = e.target;

    this.setState({
      announcement: {
        ...this.state.announcement,
        [name]: value,
      },
    });
  };

  handleEditorChange = (e) => {
    let fieldID = e.target.name,
      fieldVal = e.target.value;

    if (e.target.type && e.target.type === "checkbox") {
      fieldVal = e.target.checked;
    } else if (e.target.type && e.target.type === "file") {
      fieldVal = e.target.files && e.target.files[0];
    } else if ("targetElm" in e.target) {
      // <== Look Here!!!
      fieldID = e.target.targetElm.name;
      fieldVal = e.target.getContent();
    }
    if (e.target.dataset && e.target.dataset.statepath) {
      let stateStructure = e.target.dataset.statepath.split("__");
      fieldID = stateStructure[0];
      if (!this.state.announcement[fieldID])
        this.state.announcement[fieldID] = {};
      fieldVal = this.state.announcement[fieldID];
      if (!fieldVal[stateStructure[1]]) fieldVal[stateStructure[1]] = {};
      fieldVal[stateStructure[1]][stateStructure[2]] =
        e.target.type == "checkbox" ? e.target.checked : e.target.value;
    }
    this.setState(
      {
        announcement: {
          ...this.state.announcement,
          [fieldID]: fieldVal,
        },
      },
      () => {
        console.log(this.state.announcement);
      }
    );
  };

  handleCreation = async () => {
    let data = {
      userId: this.state.authUser,
      institution_id: this.props.userData.institution_id,
      announcement: this.state.announcement,
    };

    const announcement = await createSchoolAnnouncement(data);

    if (Object.keys(announcement).length === 0) {
      toast.error("Creation failed");
      return;
    }
    toast.success("Created Successfully");

    this.setState({
      announcements: [...this.state.announcements, announcement],
      announcement: [],
    });
  };
  handleClick = (id) => {
    const editedAnnouncement = this.state.announcements.filter(
      (x) => x.id == id
    );
    this.setState({
      announcement: {
        ...editedAnnouncement[0],
      },
    });
  };

  handleUpdate = async () => {
    const updatedAnnouncement = await updateSchoolAnnouncement(
      this.state.announcement
    );

    if (Object.entries(updatedAnnouncement).length === 0) {
      toast.error("Updating  failed");
      return;
    }
    let newAnnouncement = this.state.announcements.filter(
      (x) => x.id !== updatedAnnouncement.id
    );
    let announcements = [...newAnnouncement, updatedAnnouncement];

    this.setState(
      {
        announcements,
      },
      () => toast.success("Updated Successfully")
    );
  };

  handleDelete = async () => {
    const deletedAnnouncement = await deleteSchoolAnnouncement(
      this.state.announcement
    );
    let newAnnouncement = this.state.announcements.filter(
      (x) => x.id !== this.state.announcement.id
    );

    if (deletedAnnouncement.status === 204) {
      toast.success("Deleted Successfully");
      this.setState({
        announcements: newAnnouncement,
        announcement: [],
      });
      return;
    }

    toast.error("Deleting  failed");
  };

  handleSearch = async (searchValue = "") => {
    if (searchValue.length === 0) {
      return toast("You must enter a value to search for", {
        icon: "⚠️",
      });
    }

    try {
      let [response, _, error, pagingData] = await getTableData(
        "schoolAnnouncement",
        "",
        { title: searchValue },
        [],
        false,
        false
      );

      if (error && error.error && error.message) {
        return toast.error(`No entry found. Error Message: ${error.message}`, {
          icon: "⚠️",
        });
      }
      this.setState({
        announcements: response,
        pagingData,
      });

      return toast.success(`Successfully loaded data for ${searchValue}`, {
        icon: "✅",
      });
    } catch (e) {
      return toast.error("No entry found, please try again");
    }
  };

  render() {
    return (
      <Layout pageTitle="Course Announcements" userData={this.props.userData}>
        <SchoolAnnouncementTitle
          course={this.state.course}
          handleCreation={this.handleCreation}
          handleChange={this.handleChange}
          role={this.props.role}
          handleEditorChange={this.handleEditorChange}
          searchHandler={this.handleSearch}
        />
        <AnnouncementListComponent
          announcements={this.state.announcements}
          singleAnnouncement={this.state.announcement}
          handleChange={this.handleChange}
          handleClick={this.handleClick}
          handleUpdate={this.handleUpdate}
          handleDelete={this.handleDelete}
          handleEditorChange={this.handleEditorChange}
          role={this.props.userData.role}
          authUser={this.state.authUser}
        />

        {this.state.pagingData &&
          this.state.pagingData.rowCount > this.state.announcements.length && (
            <Pagination
              total={+this.state.pagingData.rowCount}
              dataPerPage={+this.state.pagingData.pageSize}
              href={`${this.state.pathname}?pgsize=${+this.state.pagingData
                .pageSize}&pg=`}
              currentPage={+this.state.pagingData.page}
            />
          )}
      </Layout>
    );
  }
}

export default Announcement;
