import React from "react";
import fetch from "isomorphic-unfetch";
import Layout from "../components/Layout";
import { withRouter } from "next/router";
import { protectPage } from "../helpers/utils";
import ClassDiscussionCommentTitle from "../components/class-discussion/ClassDiscussionCommentTitle";
import { createDicsussionComment } from "../helpers/discussion-helpers/createDiscussion";
import ClassDiscussionCommentBody from "../components/class-discussion/ClassDiscussionCommentBody";
import { updateCourseDiscussionComment } from "../helpers/discussion-helpers/updateDiscussion";
import { deleteDiscussionComment } from "../helpers/discussion-helpers/deleteDiscussion";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";

class DiscussionComment extends React.Component {
  state = {
    comments: this.props.comments,
    topic: this.props.topic,
    authUser: this.props.userId,
    comment: [],
    search: "",
    currentPage: 1,
    commentPerPage: 10,
  };
  static getInitialProps = async ({ req, res, query }) => {
    const allowedRoles = ["SUPERADMIN", "ADMIN", "FACULTY", "STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let comments, topic;
    try {
      comments = await fetch(
        `${process.env.API_URL}/api/discussionComment/${query.id}`,
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
      comments = comments.status === 200 ? await comments.json() : [];
      comments = comments.sort((a, b) => b.id - a.id);

      topic = await fetch(`${process.env.API_URL}/api/discussionTopic`, {
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
      comments,
      topic,
      userId,
      userData,
    };
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      comment: {
        ...this.state.comment,
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
      ...this.state.comment,
    };
    const comment = await createDicsussionComment(data);

    if (comment.error) {
      toast.error("Creation failed");
      return;
    }
    if (comments.length !== 0) {
      toast.success("Created Successfully");
      this.setState({
        comments: [...this.state.comments, comment],
        comment: [],
      });
    }
  };

  handleDiscussionClick = (id) => {
    const editComment = this.state.comments.filter((x) => x.id == id);
    this.setState({
      comment: {
        ...editComment[0],
      },
    });
  };

  handleDiscussionUpdate = async () => {
    const comment = await updateCourseDiscussionComment(this.state.comment);

    let newComment = this.state.comments.filter(
      (x) => x.id !== Number(comment.id)
    );
    let updatedComments = [...newComment, comment];

    if (comment.error) {
      toast.error("Updating failed");
      return null;
    }
    toast.success("Updated Successfully");
    this.setState({
      comments: updatedComments,
    });
  };

  handleDiscussionDelete = async () => {
    const deleteComment = await deleteDiscussionComment(this.state.comment);
    let newComments = this.state.comments.filter(
      (x) => x.id !== this.state.comment.id
    );

    if (deleteComment.error) {
      toast.error("Deleting  failed");
      return null;
    }
    if (deleteComment.status === 204) {
      toast.success("Deleted Successfully");
      this.setState({
        comments: newComments,
      });
    }
  };
  handleNextPage = () => {
    let maxPage = Math.ceil(
      this.state.comments.length / this.state.commentPerPage
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
    const indexOfLastComment =
      this.state.currentPage * this.state.commentPerPage;
    const indexOfFirstComment = indexOfLastComment - this.state.commentPerPage;
    const currentComments = this.state.comments
      .sort((a, b) => b.id - a.id)
      .slice(indexOfFirstComment, indexOfLastComment);
    const commentData = currentComments.filter((thread) => {
      return thread.body
        .toLowerCase()
        .includes(this.state.search.toLowerCase());
    });
    return (
      <Layout
        pageTitle="Course Discussion Comments"
        userData={this.props.userData}
      >
        <ClassDiscussionCommentTitle
          topic={this.state.topic}
          handleChange={this.handleChange}
          handleSearchChange={this.handleSearchChange}
          handleCreation={this.handleCreation}
        />
        <ClassDiscussionCommentBody
          handleChange={this.handleChange}
          handleDiscussionUpdate={this.handleDiscussionUpdate}
          topic={this.state.topic}
          comments={commentData}
          comment={this.state.comment}
          handleDiscussionClick={this.handleDiscussionClick}
          handleDiscussionDelete={this.handleDiscussionDelete}
          authUser={this.state.authUser}
        />
        <Pagination
          total={this.state.comments.length}
          dataPerPage={this.state.commentPerPage}
          paginate={this.paginate}
          currentPage={this.state.currentPage}
          handleNextPage={this.handleNextPage}
          handlePreviousPage={this.handlePreviousPage}
        />
      </Layout>
    );
  }
}

export default withRouter(DiscussionComment);
