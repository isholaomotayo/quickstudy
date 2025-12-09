import React from "react";
import fetch from "isomorphic-unfetch";
import Layout from "../components/Layout";
import { protectPage } from "../helpers/utils";
import Pagination from "../components/Pagination";
import { withRouter } from "next/router";
import toast from "react-hot-toast";
import ForumCommentTitle from "../components/forum/ForumCommentTitle";
import { createComment } from "../helpers/forum-helpers/ForumCreate";
import CommentComponent from "../components/forum/CommentComponent";
import { updateComment } from "../helpers/forum-helpers/CategoryEdit";
import { deleteComment } from "../helpers/forum-helpers/ForumDelete";
export class ForumComments extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      comments: this.props.comments,
      thread: this.props.threadRelatedComment,
      comment: {},
      userId: this.props.userId,
      search: "",
      currentPage: 1,
      commentPerPage: 10,
    };
  }

  static getInitialProps = async ({ res, req, query }) => {
    const allowedRoles = ["SUPERADMIN", "ADMIN", "FACULTY", "STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let comments, threadRelatedComment;

    try {
      comments = await fetch(
        `${process.env.API_URL}/api/forumThread/${query.id}`,
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

      threadRelatedComment = await await fetch(
        `${process.env.API_URL}/api/forumTopic/${query.id}`,
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

      threadRelatedComment =
        threadRelatedComment.status === 200
          ? await threadRelatedComment.json()
          : {};
    } catch (e) {
      console.log(e);
    }

    return {
      comments,
      threadRelatedComment,
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

  handleCreation = async () => {
    const userId = this.state.userId;
    const threadId = this.state.thread.id;
    const { comment } = this.state.comment;

    let data = {
      userId,
      threadId,
      comment,
    };

    const response = await createComment(data);
    const commentss = this.state.comments.concat(response);

    if (response.error) {
      toast.error("Could not create comment");
      return;
    }

    toast.success("Comment created successfully");
    this.setState({
      comments: [...commentss],
      comment: {},
    });
  };

  handleCommentEdit = (id) => {
    const EditComment = this.state.comments.filter((x) => x.id === id);
    this.setState({
      comment: { ...EditComment[0] },
    });
  };

  handleCommentUpdate = async () => {
    const editedComment = await updateComment(this.state.comment);

    if (editedComment.error) {
      toast.error("Could not update comment");
      return;
    }
    let newComment = this.state.comments.filter(
      (x) => x.id !== editedComment.id
    );
    let updatedComments = [...newComment, editedComment];

    toast.success("comment updated successfully");

    this.setState({
      comments: updatedComments,
    });
  };

  handleCommentDelete = async () => {
    const deletedComment = await deleteComment(this.state.comment.id);

    if (deletedComment.error) {
      toast.error("comment could not be deleted");
      return;
    }
    let newComments = this.state.comments.filter(
      (x) => x.id !== this.state.comment.id
    );
    if (Object.entries(deletedComment).length === 0) {
      toast.success("Thread deleted successfully");
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
  handleSearchChange = (e) => {
    this.setState({
      search: e.target.value,
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
    const indexOfFirstComment = indexOfLastComment - this.state.categoryPerPage;
    const currentComments = this.state.comments
      .sort((a, b) => b.id - a.id)
      .slice(indexOfFirstComment, indexOfLastComment);
    const commentsdata = currentComments.filter((comment) => {
      return comment.body
        .toLowerCase()
        .includes(this.state.search.toLowerCase());
    });
    console.log(this.props.comments);
    console.log(this.props.threadRelatedComment);

    return (
      <Layout pageTitle="Forum" userData={this.props.userData}>
        <ForumCommentTitle
          thread={this.state.thread}
          handleChange={this.handleChange}
          handleCreation={this.handleCreation}
          handleSearchChange={this.handleSearchChange}
        />
        <CommentComponent
          comments={commentsdata}
          handleCommentEdit={this.handleCommentEdit}
          handleCommentUpdate={this.handleCommentUpdate}
          handleChange={this.handleChange}
          singleComment={this.state.comment}
          handleCommentDelete={this.handleCommentDelete}
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

const ToastWrapper = (props) => {
  return <ForumComments {...props} />;
};
ToastWrapper.getInitialProps = ForumComments.getInitialProps;

export default withRouter(ToastWrapper);
