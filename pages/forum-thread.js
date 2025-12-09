import React from "react";
import fetch from "isomorphic-unfetch";
import Layout from "../components/Layout";
import { createThread } from "../helpers/forum-helpers/ForumCreate";
import { updateThread } from "../helpers/forum-helpers/CategoryEdit";
import Pagination from "../components/Pagination";
import { withRouter } from "next/router";
import ForumThreadTitle from "../components/forum/ForumThreadTitle";
import ForumThread from "../components/forum/ForumThread";
import { deleteThread } from "../helpers/forum-helpers/ForumDelete";
import { protectPage } from "../helpers/utils";

class ForumThreads extends React.Component {
  state = {
    threads: this.props.threads,
    authUser: this.props.userId,
    thread: [],
    search: "",
    currentPage: 1,
    threadPerPage: 10,
  };

  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["SUPERADMIN", "ADMIN", "FACULTY", "STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let threads;
    try {
      threads = await fetch(`${process.env.API_URL}/api/forumTopic`, {
        method: "get",
        credentials: "include",
        headers: req
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
      });
      threads = threads.status === 200 ? await threads.json() : [];
      threads = threads.sort((a, b) => b.id - a.id);
    } catch (e) {
      console.log(e);
    }
    return { threads, userData, userId };
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
    const data = {
      ...this.state.thread,
      userId: this.state.authUser,
    };
    const thread = await createThread(data);
    // this.setState({ threads: [threads] });

    if (!thread.hasOwnProperty("title") || !thread.hasOwnProperty("body")) {
      toast.error("Could not create forum topic");
      return;
    }
    let threads = [...this.state.threads, thread];
    threads = threads.sort((a, b) => b.id - a.id);

    toast.success("Forum thread created successfully");

    this.setState({
      threads,
      thread: [],
    });
  };

  handleThreadUpdate = async () => {
    const editedThread = await updateThread(this.state.thread);
    if (
      !editedThread.hasOwnProperty("title") ||
      !editedThread.hasOwnProperty("body")
    ) {
      toast.error("Could not update forum thread");
      return;
    }
    let newThread = this.state.threads.filter((x) => x.id !== editedThread.id);
    let updatedthreads = [...newThread, editedThread];

    toast.success("thread updated successfully");
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
    const deletedThread = await deleteThread(this.state.thread);
    let newThreads = this.state.threads.filter(
      (x) => x.id !== this.state.thread.id
    );

    if (typeof deletedThread !== "object") {
      toast.error("Thread could not be deleted");
      return;
    }

    toast.success("Thread deleted successfully");
    this.setState({
      threads: newThreads,
    });
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
    const threadsdata = currentThreads.filter((thread) => {
      return thread.title
        .toLowerCase()
        .includes(this.state.search.toLowerCase());
    });

    return (
      <Layout
        pageTitle="University Forum Topics"
        userData={this.props.userData}
      >
        <ForumThreadTitle
          handleChange={this.handleChange}
          handleCreation={this.handleCreation}
          handleSearchChange={this.handleSearchChange}
        />
        <ForumThread
          handleChange={this.handleChange}
          threads={threadsdata}
          handleThreadUpdate={this.handleThreadUpdate}
          handleThreadClick={this.handleThreadClick}
          singleThread={this.state.thread}
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

export default withRouter(ForumThreads);
