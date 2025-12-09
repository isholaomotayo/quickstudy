import React from "react";
import fetch from "isomorphic-unfetch";
import Layout from "../components/Layout";
import Pagination from "../components/Pagination";
import { withRouter } from "next/router";
import DiscussionTopicTitle from "../components/class-discussion/DiscussionTopicTitle";
import { createDisscussionTitle } from "../helpers/discussion-helpers/createDiscussion";
import { updateCourseDiscussionTopic } from "../helpers/discussion-helpers/updateDiscussion";
import { deleteCourseDiscussionTopic } from "../helpers/discussion-helpers/deleteDiscussion";
import CourseDiscussionTopic from "../components/class-discussion/ClassDiscussionTopicBody";
import { protectPage } from "../helpers/utils";
import toast from "react-hot-toast";

class DiscussionTopic extends React.Component {
  state = {
    discussions: this.props.discussions,
    authUser: this.props.userId,
    discussion: {},
    search: "",
    currentPage: 1,
    topicPerPage: 10,
    courseId: this.props.courseId,
  };

  static getInitialProps = async ({ res, req, query }) => {
    const allowedRoles = ["SUPERADMIN", "ADMIN", "FACULTY", "STUDENT", "STAFF"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let discussions;
    try {
      discussions = await fetch(
        `${process.env.API_URL}/api/discussionTopic/${query.course_id}`,
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

      discussions = discussions.status === 200 ? await discussions.json() : [];
      discussions = discussions.sort((a, b) => b.id - a.id);
    } catch (e) {
      console.log(e);
    }

    return {
      discussions,
      userId,
      userData,
      courseId: query.course_id,
      role,
    };
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      discussion: {
        ...this.state.discussion,
        [name]: value,
      },
    });
  };

  dateValidator = () => {
    const start_date = this.state.discussion.start_date;
    const end_date = this.state.discussion.end_date;

    if (
      !this.state.discussion.hasOwnProperty("start_date") ||
      !this.state.discussion.hasOwnProperty("end_date") ||
      start_date == undefined ||
      end_date == undefined
    ) {
      return false;
    }

    const start = new Date(start_date.replace("T", " ")).valueOf();
    const end = new Date(end_date.replace("T", " ")).valueOf();

    if (start > end) {
      return false;
    }

    return true;
  };

  handleStartDate = (date) => {
    this.setState({
      discussion: {
        ...this.state.discussion,
        start_date: `${date}`,
      },
    });
  };

  handleEndDate = (date) => {
    this.setState({
      discussion: {
        ...this.state.discussion,
        end_date: `${date}`,
      },
    });
  };

  handleSearchChange = (e) => {
    this.setState({
      search: e.target.value,
    });
  };

  handleCreation = async () => {
    let courseId = this.state.courseId;
    let userId = this.state.authUser;
    const data = {
      courseId,
      userId,
      ...this.state.discussion,
    };
    const discussions = await createDisscussionTitle(data);

    if (discussions.error) {
      toast.error("Topic creation failed");
      return null;
    }
    toast.success("Topic Created Successfully");
    this.setState({
      discussions: [...this.state.discussions, discussions],
      discussion: {},
    });
  };

  handleDiscussionUpdate = async () => {
    const editedTopic = await updateCourseDiscussionTopic(
      this.state.discussion
    );
    if (editedTopic.error) {
      toast.error("Updating  failed");
      return null;
    }
    let newTopic = this.state.discussions.filter(
      (x) => x.id !== Number(editedTopic.id)
    );
    let updatedtopics = [...newTopic, editedTopic];
    toast.success("Updated Successfully");
    this.setState({
      discussions: updatedtopics,
    });
  };

  handleDiscussionClick = (id) => {
    const editDiscussion = this.state.discussions.filter((x) => x.id == id);
    this.setState({
      discussion: {
        ...editDiscussion[0],
      },
    });
  };

  handleDiscussionDelete = async () => {
    const deletedTopic = await deleteCourseDiscussionTopic(
      this.state.discussion
    );
    let newTopic = this.state.discussions.filter(
      (x) => x.id !== this.state.discussion.id
    );

    if (deletedTopic.error) {
      toast.error("Deleting  failed");
      return null;
    }
    if (deletedTopic.status === 204) {
      toast.success("Deleted Successfully");
      this.setState({
        discussions: newTopic,
      });
    }
  };

  handleNextPage = () => {
    let maxPage = Math.ceil(
      this.state.discussions.length / this.state.topicPerPage
    );
    this.setState({
      currentPage:
        this.state.currentPage + 1 >= maxPage
          ? maxPage
          : this.state.currentPage + 1,
    });
  };

  handlePreviousPage = () => {
    this.setState({
      currentPage:
        this.state.currentPage - 1 <= 0 ? 1 : this.state.currentPage - 1,
    });
  };
  paginate = (number) => {
    this.setState({
      currentPage: number,
    });
  };

  render() {
    console.log(this.state.discussions);
    const indexOfLastTopic = this.state.currentPage * this.state.topicPerPage;
    const indexOfFirstTopic = indexOfLastTopic - this.state.topicPerPage;
    const currentTopics = this.state.discussions
      .sort((a, b) => b.id - a.id)
      .slice(indexOfFirstTopic, indexOfLastTopic);
    const topicsdata = currentTopics.filter((topic) => {
      return topic.title
        .toLowerCase()
        .includes(this.state.search.toLowerCase());
    });
    return (
      <Layout pageTitle="Course Topics" userData={this.props.userData}>
        <DiscussionTopicTitle
          course={this.state.course}
          handleCreation={this.handleCreation}
          handleChange={this.handleChange}
          handleSearchChange={this.handleSearchChange}
          handleStartDate={this.handleStartDate}
          handleEndDate={this.handleEndDate}
          dateValidator={this.dateValidator}
          role={this.props.role}
        />
        <CourseDiscussionTopic
          topics={topicsdata}
          handleThreadClick={this.handleDiscussionClick}
          singleTopic={this.state.discussion}
          handleChange={this.handleChange}
          handleThreadUpdate={this.handleDiscussionUpdate}
          handleThreadDelete={this.handleDiscussionDelete}
          authUser={this.state.authUser}
          handleStartDate={this.handleStartDate}
          dateValidator={this.dateValidator}
          handleEndDate={this.handleEndDate}
        />
        <Pagination
          total={this.state.discussions.length}
          dataPerPage={this.state.topicPerPage}
          paginate={this.paginate}
          currentPage={this.state.currentPage}
          handleNextPage={this.handleNextPage}
          handlePreviousPage={this.handlePreviousPage}
        />
      </Layout>
    );
  }
}

const ToastWrapper = (props) => {
  return <DiscussionTopic {...props} />;
};
ToastWrapper.getInitialProps = DiscussionTopic.getInitialProps;

export default withRouter(ToastWrapper);

/*

@TODO
import React from "react";
import fetch from "isomorphic-unfetch";
import Layout from "../components/Layout";
import Pagination from "../components/Pagination";
import { withRouter } from "next/router";
import DiscussionTopicTitle from "../components/class-discussion/DiscussionTopicTitle";
import { createDisscussionTitle } from "../helpers/discussion-helpers/createDiscussion";
import { updateCourseDiscussionTopic } from "../helpers/discussion-helpers/updateDiscussion";
import { deleteCourseDiscussionTopic } from "../helpers/discussion-helpers/deleteDiscussion";
import CourseDiscussionTopic from "../components/class-discussion/ClassDiscussionTopicBody";
import { protectPage, getTableData } from "../helpers/utils";
import toast from "react-hot-toast";

class DiscussionTopic extends React.Component {
  state = {
    discussions: this.props.discussions,
    authUser: this.props.userId,
    discussion: {},
    search: "",
    currentPage: 1,
    topicPerPage: 10,
    courseId: this.props.courseId,
    pagingData: this.props.pagingData,
    pathname: this.props.pathname
  };

  static getInitialProps = async ({ res, req, pathname, query }) => {
    const allowedRoles = ["SUPERADMIN", "ADMIN", "FACULTY", "STUDENT", "STAFF"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let [discussions, data, error, pagingData] = await getTableData(
      "discussionTopic",
      "",
      query,
      [],
      false,
      req
    );

    return {
      discussions,
      userId,
      userData,
      courseId: query.course_id,
      role,
      pathname,
      pagingData
    };
  };

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({
      discussion: {
        ...this.state.discussion,
        [name]: value
      }
    });
  };

  dateValidator = () => {
    const start_date = this.state.discussion.start_date;
    const end_date = this.state.discussion.end_date;

    if (
      !this.state.discussion.hasOwnProperty("start_date") ||
      !this.state.discussion.hasOwnProperty("end_date") ||
      start_date == undefined ||
      end_date == undefined
    ) {
      return false;
    }

    const start = new Date(start_date.replace("T", " ")).valueOf();
    const end = new Date(end_date.replace("T", " ")).valueOf();

    if (start > end) {
      return false;
    }

    return true;
  };

  handleStartDate = date => {
    this.setState({
      discussion: {
        ...this.state.discussion,
        start_date: `${date}`
      }
    });
  };

  handleEndDate = date => {
    this.setState({
      discussion: {
        ...this.state.discussion,
        end_date: `${date}`
      }
    });
  };

  handleSearchChange = e => {
    this.setState({
      search: e.target.value
    });
  };

  handleCreation = async () => {
    let courseId = this.state.courseId;
    let userId = this.state.authUser;
    const data = {
      courseId,
      userId,
      ...this.state.discussion
    };
    const discussions = await createDisscussionTitle(data);

    if (discussions.error) {
      toast.error("Topic creation failed");
      return null;
    }
    toast.success("Topic Created Successfully");
    this.setState({
      discussions: [...this.state.discussions, discussions],
      discussion: {}
    });
  };

  handleDiscussionUpdate = async () => {
    const editedTopic = await updateCourseDiscussionTopic(
      this.state.discussion
    );
    if (editedTopic.error) {
      toast.error("Updating  failed");
      return null;
    }
    let newTopic = this.state.discussions.filter(
      x => x.id !== Number(editedTopic.id)
    );
    let updatedtopics = [...newTopic, editedTopic];
    toast.success("Updated Successfully");
    this.setState({
      discussions: updatedtopics
    });
  };

  handleDiscussionClick = id => {
    const editDiscussion = this.state.discussions.filter(x => x.id == id);
    this.setState({
      discussion: {
        ...editDiscussion[0]
      }
    });
  };

  handleDiscussionDelete = async () => {
    const deletedTopic = await deleteCourseDiscussionTopic(
      this.state.discussion
    );
    let newTopic = this.state.discussions.filter(
      x => x.id !== this.state.discussion.id
    );

    if (deletedTopic.error) {
      toast.error("Deleting  failed");
      return null;
    }
    if (deletedTopic.status === 204) {
      toast.success("Deleted Successfully");
      this.setState({
        discussions: newTopic
      });
    }
  };

  handleNextPage = () => {
    let maxPage = Math.ceil(
      this.state.discussions.length / this.state.topicPerPage
    );
    this.setState({
      currentPage:
        this.state.currentPage + 1 >= maxPage
          ? maxPage
          : this.state.currentPage + 1
    });
  };

  handlePreviousPage = () => {
    this.setState({
      currentPage:
        this.state.currentPage - 1 <= 0 ? 1 : this.state.currentPage - 1
    });
  };
  paginate = number => {
    this.setState({
      currentPage: number
    });
  };

  render() {
    const indexOfLastTopic = this.state.currentPage * this.state.topicPerPage;
    const indexOfFirstTopic = indexOfLastTopic - this.state.topicPerPage;
    const currentTopics = this.state.discussions
      .sort((a, b) => b.id - a.id)
      .slice(indexOfFirstTopic, indexOfLastTopic);
    const topicsdata = currentTopics.filter(topic => {
      return topic.title
        .toLowerCase()
        .includes(this.state.search.toLowerCase());
    });

    const { discussions, pagingData } = this.props;
    console.log({ discussions, pagingData });
    return (
      <Layout pageTitle="Course Topics" userData={this.props.userData}>
        {/* <DiscussionTopicTitle
          course={this.state.course}
          handleCreation={this.handleCreation}
          handleChange={this.handleChange}
          handleSearchChange={this.handleSearchChange}
          handleStartDate={this.handleStartDate}
          handleEndDate={this.handleEndDate}
          dateValidator={this.dateValidator}
          role={this.props.role}
        />
        <CourseDiscussionTopic
          topics={topicsdata}
          handleThreadClick={this.handleDiscussionClick}
          singleTopic={this.state.discussion}
          handleChange={this.handleChange}
          handleThreadUpdate={this.handleDiscussionUpdate}
          handleThreadDelete={this.handleDiscussionDelete}
          authUser={this.state.authUser}
          handleStartDate={this.handleStartDate}
          dateValidator={this.dateValidator}
          handleEndDate={this.handleEndDate}
        /> 
//         {this.state.pagingData &&
//           this.state.pagingData.rowCount > this.state.discussions.length && (
//             <Pagination
//               total={+this.state.pagingData.rowCount}
//               dataPerPage={+this.state.pagingData.pageSize}
//               href={`${this.state.pathname}?course_id=${
//                 this.state.courseId
//               }&pgsize=${+this.state.pagingData.pageSize}&pg=`}
//               currentPage={+this.state.pagingData.page}
//             />
//           )}
//       </Layout>
//     );
//   }
// }

// const ToastWrapper = props => {
//   
//   return <DiscussionTopic {...props} />;
// };
// ToastWrapper.getInitialProps = DiscussionTopic.getInitialProps;

// export default withRouter(ToastWrapper);

*/
