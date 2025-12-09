import React from "react";
import fetch from "isomorphic-unfetch";
import Layout from "../components/Layout";

import Pagination from "../components/Pagination";
import { withRouter } from "next/router";
import { protectPage } from "../helpers/utils";
import toast from "react-hot-toast";

import CourseForumThreadTitle from "../components/forum/course-forum/CourseForumThreadTitle";
import CourseForumThread from "../components/forum/course-forum/CourseForumThread";
import { createCourseForumThread } from "../helpers/forum-helpers/courseforumcreation";
import { updateCourseForumThread } from "../helpers/forum-helpers/courseforumupdate";
import { deleteCourseForumThread } from "../helpers/forum-helpers/courseforumdeletion";
class ForumThreads extends React.Component {
  state = {
    threads: this.props.thread,
    topic: this.props.topic,
    authUser: this.props.userId,
    thread: [],
    search: "",
    currentPage: 1,
    threadPerPage: 10,
  };

  static getInitialProps = async ({ res, req, query }) => {
    const allowedRoles = ["SUPERADMIN", "ADMIN", "FACULTY", "STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let thread, topic;

    try {
      thread = await fetch(
        `${process.env.API_URL}/api/courseForumThread/${query.id}`,
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

      thread = thread.status === 200 ? await thread.json() : [];

      thread = thread.sort((a, b) => (b.id = a.id));

      topic = await fetch(`${process.env.API_URL}/api/courseForumTopic`, {
        method: "get",
        credentials: "include",
        headers: req
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
      });

      topic = topic.status === 200 ? await topic.json() : [];

      topic = topic.filter((x) => x.id == query.id);
    } catch (e) {
      console.log(e);
    }

    return {
      thread,
      topic,
      userId,
      userData,
    };
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      thread: {
        ...this.state.thread,
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
    const topicId = this.state.topic[0].id;
    const userId = this.state.authUser;

    const data = {
      topicId,
      userId,
      thread: this.state.thread,
    };
    const threads = await createCourseForumThread(data);

    if (threads.error) {
      toast.error("Creation failed");
      return null;
    } else {
      toast.success("Created Successfully");
      this.setState({ threads: [...this.state.threads, threads], thread: [] });
    }
  };

  handleThreadUpdate = async () => {
    const editedThread = await updateCourseForumThread(this.state.thread);
    console.log(editedThread);
    let newThread = this.state.threads.filter((x) => x.id !== editedThread.id);
    let updatedthreads = [...newThread, editedThread];

    if (editedThread.error) {
      toast.error("Updating  failed");
      return null;
    }
    toast.success("Updated Successfully");
    this.setState({
      threads: updatedthreads,
    });
  };

  handleThreadClick = (id) => {
    const edit_thread = this.state.threads.filter((x) => x.id == id);
    this.setState({
      thread: {
        ...edit_thread[0],
      },
    });
  };

  handleThreadDelete = async () => {
    const deletedTopic = await deleteCourseForumThread(this.state.thread);
    let newThreads = this.state.threads.filter(
      (x) => x.id !== this.state.thread.id
    );

    console.log(deletedTopic);

    if (deletedTopic.error) {
      toast.error("Deleting  failed");
      return null;
    }
    if (deletedTopic.status === 204) {
      toast.success("Deleted Successfully");
      this.setState({
        threads: newThreads,
      });
    }
  };

  handleNextPage = () => {
    let maxPage = Math.ceil(
      this.state.threads.length / this.state.threadPerPage
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
    const indexOfLastThread = this.state.currentPage * this.state.threadPerPage;
    const indexOfFirstThread = indexOfLastThread - this.state.threadPerPage;
    const currentThreads = this.state.threads
      .sort((a, b) => b.id - a.id)
      .slice(indexOfFirstThread, indexOfLastThread);
    const threaddata = currentThreads.filter((thread) => {
      return thread.body
        .toLowerCase()
        .includes(this.state.search.toLowerCase());
    });

    return (
      <Layout pageTitle="Course Comments" userData={this.props.userData}>
        <CourseForumThreadTitle
          topic={this.state.topic}
          handleChange={this.handleChange}
          handleCreation={this.handleCreation}
          handleSearchChange={this.handleSearchChange}
        />

        <CourseForumThread
          handleChange={this.handleChange}
          handleThreadUpdate={this.handleThreadUpdate}
          threads={threaddata}
          singleThread={this.state.thread}
          handleThreadClick={this.handleThreadClick}
          handleThreadDelete={this.handleThreadDelete}
          authUser={this.state.authUser}
        />

        <Pagination
          total={this.state.threads.length}
          dataPerPage={this.state.threadPerPage}
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
  return <ForumThreads {...props} />;
};
ToastWrapper.getInitialProps = ForumThreads.getInitialProps;
export default withRouter(ToastWrapper);
