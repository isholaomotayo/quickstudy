import React from "react";
import Head from "next/head";
import fetch from "isomorphic-unfetch";
import Institutions from "../../components/institution";
import ViewModal from "../../components/institution/ViewModal";

import Popup from "reactjs-popup";
import Layout from "../../components/Layout";

class InstituitionApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      institutions: [],
      institution: [],

      open: false,
      institutionName: "",
      institutionCode: "",
      institutionPhone: "",
      institutionEmail: "",
      institutionAddress: "",

      successMessage: ""
    };

    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmitClick = this.handleSubmitClick.bind(this);
  }
  componentDidMount() {
    fetch(`${process.env.API_URL}/api/institution`, {
      //mode: "no-cors",
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    })
      .then(response => response.json())
      .then(json => {
        console.log(json);
        this.setState({
          institutions: json
        });
      })
      .catch(e => {
        console.log(e);
        return e;
      });
    console.log("hello");
  }

  openModal = id => {
    var institution_id = id;
    console.log("i am always run");
    console.log("my id is " + id);
    fetch(`${process.env.API_URL}/api/institution/${institution_id}`, {
      //mode: "no-cors",
      method: "get",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    })
      .then(response => response.json())
      .then(json => {
        console.log(json);
        this.setState({
          institution: json,
          open: true
        });
      })
      .catch(e => {
        console.log(e);
        return e;
      });
    console.log("i am fetching");
  };

  closeModal() {
    this.setState({
      open: false,
      institution: []
    });
  }
  handleChange(e) {
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });
  }
  handleSubmitClick(e) {
    fetch(`${process.env.API_URL}/api/institution`, {
      //mode: "no-cors",
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        name: this.state.institutionName,
        phone: this.state.institutionPhone,
        email: this.state.institutionEmail,
        address: this.state.institutionAddress
      })
    })
      .then(response => response.json())
      .then(json => {
        this.setState({
          successMessage: "New Institution has been successfully added",

          institutions: [...this.state.institutions, json],

          institutionName: "",
          institutionCode: "",
          institutionPhone: "",
          institutionEmail: "",
          institutionAddress: ""
        });
      })
      .catch(e => {
        console.log(e);
        return e;
      });
  }
  handleDeleteClick(id) {
    var institution_id = id;
    fetch(`${process.env.API_URL}/api/institution/${institution_id}`, {
      //mode: "no-cors",
      method: "delete",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    })
      .then(response => response.json())
      .then(json => {
        this.setState({
          successMessage: "New Institution has been successfully deleted"
        });
        window.location.reload();
      });
  }

  render() {
    return (
      <Layout pageTitle="Institutions">
        {/* Success Message display */}
        <p className="small hint-text pull-left no-margin">
          {this.state.successMessage}
        </p>

        {/* Component for  Institutions grid  */}
        <Institutions
          institutions={this.state.institutions}
          openView={this.openModal}
          handleChange={this.handleChange}
          handleSubmitClick={this.handleSubmitClick}
          handleDeleteClick={this.handleDeleteClick}
        />

        <div>
          {/* Popup for View Institutions  */}
          <Popup
            open={this.state.open}
            closeOnDocumentClick
            onClose={this.closeModal}
          >
            <div className="modals">
              <a className="close" onClick={this.closeModal}>
                &times;
              </a>
              <ViewModal institution={this.state.institution} />
            </div>
          </Popup>
        </div>
      </Layout>
    );
  }
}

export default InstituitionApp;
