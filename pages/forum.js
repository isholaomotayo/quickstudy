import React from "react";
import fetch from "isomorphic-unfetch";
import ForumCategoryTitle from "../components/forum/ForumCategoryTitle";
import Layout from "../components/Layout";
import ForumCategory from "../components/forum/ForumCategory";
import { createCategory } from "../helpers/forum-helpers/ForumCreate";
import { updateTopic } from "../helpers/forum-helpers/CategoryEdit";
import Pagination from "../components/Pagination";
import { deleteCategory } from "../helpers/forum-helpers/ForumDelete";
import { protectPage } from "../helpers/utils";
import toast from "react-hot-toast";

class ForumThreads extends React.Component {
  state = {
    categories: this.props.categories,
    authUser: this.props.userId,
    name: "",
    category: {},
    search: "",
    currentPage: 1,
    categoryPerPage: 10,
  };

  static getInitialProps = async ({ query, req, res }) => {
    const allowedRoles = ["SUPERADMIN", "ADMIN", "STAFF", "STUDENT"];
    const { token, role, userId, userData } = protectPage(
      req,
      res,
      allowedRoles
    );

    let categories;
    try {
      categories = await fetch(`${process.env.API_URL}/api/forumCategory`, {
        method: "get",
        credentials: "include",
        headers: req
          ? { cookie: req.headers.cookie }
          : {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
      });

      categories = categories.status === 200 ? await categories.json() : [];
      categories = categories.sort((a, b) => b.id - a.id);
    } catch (e) {
      console.log(e);
    }
    return { categories, userId, userData, role };
  };

  handleChange = (e) => {
    this.setState({
      name: e.target.value,
    });
  };

  handleSearchChange = (e) => {
    this.setState({
      search: e.target.value,
    });
  };

  handleEditChange = (e) => {
    this.setState({
      category: {
        ...this.state.category,
        name: e.target.value,
      },
    });
  };

  handleCreation = async () => {
    if (this.state.name.length === 0) {
      toast("You cannot leave the form blank", { icon: "⚠️" });
      return;
    }
    const category = await createCategory(this.state.name);
    console.log(category);
    if (category.error && category.error.error) {
      toast.error("Could not create category");
      return;
    }

    this.setState({
      categories: [...this.state.categories, category],
      name: "",
    });
    toast.success("Category created successfully");
  };

  handleCategoryUpdate = async () => {
    const editedCategory = await updateTopic(this.state.category);
    if (!editedCategory.hasOwnProperty("name")) {
      toast.error("Could not update category");
      return;
    }
    let newCatecogry = this.state.categories.filter(
      (x) => x.id !== editedCategory.id
    );
    let updatedCategories = [...newCatecogry, editedCategory];

    toast.success("Category updated successfully");

    this.setState({
      categories: updatedCategories,
    });
  };
  handleCategoryEdit = (id) => {
    const edit_category = this.state.categories.filter((x) => x.id == id);
    this.setState({
      category: edit_category[0],
    });
  };

  handleCategoryDelete = async () => {
    const deletedCategory = await deleteCategory(this.state.category.id);
    let newCategory = this.state.categories.filter(
      (x) => x.id !== this.state.category.id
    );
    if (deletedCategory.error) {
      toast.error("Category could not be deleted");
    }
    if (deletedCategory.status === 204) {
      toast.success("Category deleted successfully");
      this.setState({
        categories: newCategory,
      });
    }
  };

  paginate = (number) => {
    this.setState({
      currentPage: number,
    });
  };

  render() {
    const indexOfLastCategory =
      this.state.currentPage * this.state.categoryPerPage;
    const indexOfFirstCategory =
      indexOfLastCategory - this.state.categoryPerPage;
    const currentCategories = this.state.categories.slice(
      indexOfFirstCategory,
      indexOfLastCategory
    );
    const categoriesdata = currentCategories.filter((category) => {
      return category.name
        .toLowerCase()
        .includes(this.state.search.toLowerCase());
    });
    return (
      <Layout pageTitle="University Forum" userData={this.props.userData}>
        <ForumCategoryTitle
          handleCreation={this.handleCreation}
          onChange={this.handleChange}
          handleSearchChange={this.handleSearchChange}
          role={this.props.role}
        />
        <ForumCategory
          categories={categoriesdata}
          handleCategoryEdit={this.handleCategoryEdit}
          handleEditChange={this.handleEditChange}
          singleCategory={this.state.category}
          handleCategoryUpdate={this.handleCategoryUpdate}
          searchValue={this.state.search}
          updated={this.state.newData}
          handleCategoryDelete={this.handleCategoryDelete}
          authUser={this.state.authUser}
          role={this.props.role}
        />
        <Pagination
          total={this.state.categories.length}
          dataPerPage={this.state.categoryPerPage}
          paginate={this.paginate}
          currentPage={this.state.currentPage}
        />
      </Layout>
    );
  }
}

export default ForumThreads;
