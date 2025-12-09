import { Component } from "react";
import { GetFetch } from "../../helpers/FetchWrapper";

const Student_Get_All_Url = "http://localhost:3000/api/student";

class StudentRenderProps extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFetching: false,
      data: [],
    };
  }

  render = () => this.props.children(this.state);

  componentDidMount() {
    this.fetchUsers();
  }

  async fetchUsersWithFetch() {
    try {
      this.setState({ ...this.state, isFetching: true });
      const response = await fetch("http://localhost:3000/api/student", {
        method: "get",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      })
        .then((response) => response.json())
        .then((json) => {
          // console.log(json);
          return { json };
        })
        .catch((e) => {
          console.log(e);
          return e;
        });

      this.setState({ data: response.json, isFetching: false });
    } catch (e) {
      console.log(e);
      this.setState({ ...this.state, isFetching: false });
    }
  }

  fetchUsers = this.fetchUsersWithFetch;
}

export default StudentRenderProps;
