import React from "react";
import fetch from "isomorphic-unfetch";
import Layout from "../components/Layout";
import Pagination from "../components/Pagination";
import { withRouter } from "next/router";
import CourseForumTopicTitle from "../components/forum/course-forum/CourseForumTopicTitle";
import CourseForumTopic from "../components/forum/course-forum/CourseForumTopic";
import { createCourseForumTopic } from "../helpers/forum-helpers/courseforumcreation";
import { updateCourseForumTopic } from "../helpers/forum-helpers/courseforumupdate";
import { deleteCourseForumTopic } from "../helpers/forum-helpers/courseforumdeletion";
import toast from "react-hot-toast";
import { protectPage } from "../helpers/utils";

class ForumThreads extends React.Component {
  state = {
    topics: this.props.topics,
    course: this.props.course,
    authUser: this.props.userId,
    topic: [],
    search: "",
    currentPage: 1,
    topicPerPage: 10,
  };

  static getInitialProps = async ({ res, req, query }) => {
    const allowedRoles = ["SUPERADMIN", "ADMIN", "STAFF", "STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let topics, course;

    try {
      topics = await fetch(
        `${process.env.API_URL}/api/courseForumTopic/${query.course_id}`,
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
      topics = topics.status === 200 ? await topics.json() : [];

      topics = topics.sort((a, b) => b.id - a.id);

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
      topics,
      userId,
      course,
      userData,
    };
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    // console.log(name, value);
    this.setState({
      topic: {
        ...this.state.topic,
        [name]: value,
      },
    });
  };

  handleSearchChange = (e) => {
    this.setState({
      search: e.target.value,
    });
  };

  handleCreation = async () => {
    let courseId = this.state.course.id;
    let userId = this.state.authUser;
    let topicData = this.state.topic;
    const data = {
      courseId,
      userId,
      topicData,
    };
    const topics = await createCourseForumTopic(data);
    console.log(topics);

    if (topics.error) {
      toast.error("Creation failed");
      return null;
    }
    toast.success("Created Successfully");
    this.setState({
      topics,
      topic: [],
    });
  };

  handleThreadUpdate = async () => {
    const editedTopic = await updateCourseForumTopic(this.state.topic);
    if (editedTopic.error) {
      toast.error("Updating  failed");
      return null;
    }
    console.log(editedTopic);
    let newTopic = this.state.topics.filter((x) => x.id !== editedTopic.id);
    let updatedtopics = [...newTopic, editedTopic];
    updatedtopics = updatedtopics.sort((a, b) => b.id - a.id);
    toast.success("Updated Successfully");
    this.setState({
      topics: updatedtopics,
    });
  };

  handleThreadClick = (id) => {
    const edit_topic = this.state.topics.filter((x) => x.id == id);
    this.setState({
      topic: {
        ...edit_topic[0],
      },
    });
  };

  handleThreadDelete = async () => {
    const deletedTopic = await deleteCourseForumTopic(this.state.topic);
    let newTopic = this.state.topics.filter(
      (x) => x.id !== this.state.topic.id
    );
    newTopic = newTopic.sort((a, b) => b.id - a.id);
    if (deletedTopic.error) {
      toast.error("Deleting  failed");
      return null;
    }
    if (deletedTopic.status === 204) {
      toast.success("Deleted Successfully");
      this.setState({
        topics: newTopic,
        topic: [],
      });
    }
  };

  handleNextPage = () => {
    let maxPage = Math.ceil(this.state.topics.length / this.state.topicPerPage);
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
    const indexOfLastTopic = this.state.currentPage * this.state.topicPerPage;
    const indexOfFirstTopic = indexOfLastTopic - this.state.topicPerPage;
    const currentTopics = this.state.topics.slice(
      indexOfFirstTopic,
      indexOfLastTopic
    );
    const topicsdata = currentTopics.filter((topic) => {
      return topic.title
        .toLowerCase()
        .includes(this.state.search.toLowerCase());
    });

    return (
      <Layout pageTitle="Course Topics" userData={this.props.userData}>
        <CourseForumTopicTitle
          course={this.state.course}
          handleCreation={this.handleCreation}
          handleChange={this.handleChange}
          handleSearchChange={this.handleSearchChange}
        />
        <CourseForumTopic
          topics={topicsdata}
          handleThreadClick={this.handleThreadClick}
          singleTopic={this.state.topic}
          handleChange={this.handleChange}
          handleThreadUpdate={this.handleThreadUpdate}
          handleThreadDelete={this.handleThreadDelete}
          authUser={this.state.authUser}
        />

        <Pagination
          total={this.state.topics.length}
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

export default withRouter(ForumThreads);
