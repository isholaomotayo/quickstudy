import { Component } from "react";
import Layout from "../../components/Layout";
import AnnouncementTitle from "../../components/announcements/AnnouncementTitle";
import fetch from "isomorphic-unfetch";
import AnnouncementListComponent from "../../components/announcements/AnnouncementListComponent";
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../../components/announcements/anouncementhelpers";
import { protectPage, getTableData } from "../../helpers/utils";
import Pagination from "../../components/Pagination";

class Announcement extends Component {
  state = {
    announcements: this.props.announcements,
    course: this.props.course,
    announcement: {},
    authUser: this.props.userId,
    search: "",
    pagingData: this.props.pagingData,
    pathname: this.props.pathname,
  };

  static getInitialProps = async ({ req, res, err, pathname, query }) => {
    const allowedRoles = ["SUPERADMIN", "ADMIN", "STAFF", "STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let course;
    let [announcements, _, __, pagingData] = await getTableData(
      `courseAnnouncement`,
      "",
      query,
      [],
      false,
      req
    );

    try {
      course = await fetch(
        `${process.env.API_URL}/api/course/${query.course_id}`,
        {
          method: "get",
          credentials: "include",
          headers: req
            ? { cookie: req.headers.cookie }
            : {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
              },
        }
      );

      course = course.status === 200 ? await course.json() : {};
    } catch (e) {
      console.log(e);
    }

    return {
      announcements,
      course,
      userData,
      userId,
      role,
      pagingData,
      pathname,
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

  handleSearch = async (searchValue = "") => {
    if (searchValue.length === 0) {
      return toast("You must enter a value to search for", {
        icon: "⚠️",
      });
    }

    try {
      let [response, _, error, pagingData] = await getTableData(
        "courseAnnouncement",
        "",
        { title: searchValue },
        [],
        false,
        false
      );

      if (error && error.error && error.message) {
        return toast.success(
          `No entry found. Error Message: ${error.message}`,
          { icon: "✅" }
        );
      }
    } catch (e) {
      return toast.error("No entry found, please try again");
    }
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
    this.setState({
      announcement: {
        ...this.state.announcement,
        [fieldID]: fieldVal,
      },
    });
  };

  handleCreation = async () => {
    let data = {
      userId: this.state.authUser,
      courseId: this.state.course.id,
      announcement: this.state.announcement,
    };

    const announcement = await createAnnouncement(data);

    if (Object.entries(announcement).length === 0) {
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
    const updatedAnnouncement = await updateAnnouncement(
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

    toast.success("Updated Successfully");

    this.setState({
      announcements,
    });
  };

  handleDelete = async () => {
    const deletedAnnouncement = await deleteAnnouncement(
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

  handleSearchChange = (e) => {
    this.setState({
      search: e.target.value,
    });
  };

  render() {
    return (
      <Layout pageTitle="Course Announcements" userData={this.props.userData}>
        <AnnouncementTitle
          course={this.state.course}
          handleCreation={this.handleCreation}
          handleChange={this.handleChange}
          searchHandler={this.handleSearch}
          handleEditorChange={this.handleEditorChange}
          role={this.props.role}
        />
        <AnnouncementListComponent
          announcements={this.state.announcements}
          singleAnnouncement={this.state.announcement}
          handleChange={this.handleChange}
          handleClick={this.handleClick}
          handleUpdate={this.handleUpdate}
          handleDelete={this.handleDelete}
          handleEditorChange={this.handleEditorChange}
          authUser={this.state.authUser}
          role={this.props.role}
        />

        {this.state.pagingData &&
          this.state.pagingData.rowCount > this.state.announcements.length && (
            <Pagination
              total={+this.state.pagingData.rowCount}
              dataPerPage={+this.state.pagingData.pageSize}
              href={`${this.state.pathname}?course_id=${
                this.state.course.id
              }&pgsize=${+this.state.pagingData.pageSize}&pg=`}
              currentPage={+this.state.pagingData.page}
            />
          )}
      </Layout>
    );
  }
}

const ToastWrapper = (props) => {
  return <Announcement {...props} />;
};
ToastWrapper.getInitialProps = Announcement.getInitialProps;

export default ToastWrapper;
