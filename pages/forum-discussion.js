import React from "react";
import fetch from "isomorphic-unfetch";
import ForumCategoryTitle from "../components/forum/ForumCategoryTitle";
import Layout from "../components/Layout";
import { protectPage } from "../helpers/utils";
import ForumCategory from "../components/forum/ForumCategory";
// import { createCategory } from "../helpers/forum-helpers/ForumCreate";
// import { updateTopic } from "../helpers/forum-helpers/CategoryEdit";

class ForumThreads extends React.Component {
  state = {
    threads: this.props.threads,
    title: "",
    body: "",
    thread: {}
  };

  static getInitialProps = async ({ res, req, query }) => {
    const allowedRoles = ["SUPERADMIN", "ADMIN", "FACULTY", "STUDENT", "STAFF"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );
    return await fetch(`${process.env.API_URL}/api/forumTopic`, {
      method: "get",
      credentials: "include",
      headers: req
        ? { cookie: req.headers.cookie }
        : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        return { threads: data };
      })
      .catch(err => err);
  };

  handleChange = e => {
    this.setState({
      name: e.target.value
    });
  };

  handleEditChange = e => {
    this.setState(
      {
        thread: {
          ...this.state.category,
          name: e.target.value
        }
      },
      () => console.log(this.state.category)
    );
  };

  handleCreation = async () => {
    const [categories] = await createCategory(this.state.name);

    this.setState({
      categories
    });
  };

  handleThreadUpdate = async () => {
    const editedCategory = await updateTopic(this.state.category);

    let newCatecogry = this.state.categories.filter(
      x => x.id !== editedCategory.id
    );
    let updatedCategories = [editedCategory, ...newCatecogry];
    this.setState({
      categories: updatedCategories
    });
  };
  handleCategoryEdit = id => {
    const edit_category = this.state.categories.filter(x => x.id == id);
    // console.log(edit_category);
    // console.log("HI");

    //this.state.category = edit_category[0];

    this.setState({
      category: edit_category[0]
    });
    // console.log("this is after the set name");
    // console.log(this.state);
  };

  handleThreadClick = id => {
    const deleteCategory = this.state.categories.filter(x => x.id == id);
    this.setState({
      category: deleteCategory[0]
    });
  };

  handleThreadDelete = async => {
    const deleteCategory = this.state.categories.filter(x => x.id == id);
    this.setState({
      threads: {
        ...thread
      }
    });
  };

  render() {
    console.log(this.props.thread);
    return (
      <Layout>
        <ForumCategoryTitle
          handleCreation={this.handleCreation}
          onChange={this.handleChange}
        />
        <ForumCategory
          categories={this.state.categories}
          handleCategoryEdit={this.handleCategoryEdit}
          handleEditChange={this.handleEditChange}
          singleCategory={this.state.category}
          handleThreadUpdate={this.handleThreadUpdate}
        />
      </Layout>
    );
  }
}

export default ForumThreads;
