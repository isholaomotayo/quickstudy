import React from "react";
import DefaultLayout from '../components/DefaultLayout';
import Table from '../components/Table';
import Router from 'next/router';

const mockApplications = [
  {
    application: 'Admission Applications',
    session: '2019/2020',
    amount: '40,000 NGN',
    closingDate: 'February 13, 2020'
  },
  {
    application: 'Sandwich Application',
    session: '2019/2020',
    amount: '70,000 NGN',
    closingDate: 'December 20, 2020'
  },
  {
    application: 'Inter University Transfer Form',
    session: '2019/2020',
    amount: '20,000 NGN',
    closingDate: 'April 13, 2020'
  },
  {
    application: 'Change of Degree Form',
    session: '2019/2020',
    amount: '25,000 NGN',
    closingDate: 'November 30, 2019'
  }
];

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: '',
      username: '',
      password: '',
      toDashboard: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleChange(e) {
    const {name, value} = e.target;
    this.setState({
      [name]: value
    });
  }
  handleSubmit(e) {
    e.preventDefault();

    this.setState({
      toDashboard: true,
      url: this.state.username,
      username: '',
      password: ''

    });
    console.log('i fired');
  }
  render() {
    if (this.state.toDashboard === true) {

      Router.push(`/${this.state.url} `)
    }
    return (
      <DefaultLayout>
        <div className="jumbotron" data-pages="parallax">
          <div className=" container-fluid   container-fixed-lg">
            <div className="inner">
              <ul className="breadcrumb">
                <li>
                  <a href="#" className="active">
                    Welcome to University of Nigeria Nsukka Portal.
                  </a>
                </li>
              </ul>
              <div className="container-md-height m-b-20">
                <div className="row">
                  <div className="col-xl-7 col-lg-6 ">
                    <div className="full-height">
                      <div className="card-header ">
                        <div className="card-title">
                          Below are the list of open applications in the
                          University
                        </div>
                      </div>
                      <Table rows={mockApplications} />
                    </div>
                  </div>
                  <div className="col-xl-5 col-lg-6 col-top">
                    <div className="card card-default">
                      <div className="card-header ">
                        <div className="card-title text-center">
                          <img
                            className="image-responsive-height image-responsive-width"
                            src="/custom/img/unn-logo.png"
                            alt="Institution Logo"
                          />
                        </div>
                      </div>
                      <div className="card-body">
                        <h6>Enter your login credentials</h6>
                        <form role="form" onSubmit={this.handleSubmit}>
                          <div className="form-group form-group-default required ">
                            <label>Username</label>
                            <input
                              type="text"
                              name="username"
                              className="form-control"
                              required
                              onChange={this.handleChange}
                            />
                          </div>
                          <div className="form-group form-group-default required">
                            <label>Password</label>
                            <input
                              type="password"
                              name="password"
                              className="form-control"
                              onChange={this.handleChange}
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            className="btn btn-info btn-cons btn-rounded"
                          >
                            LOGIN
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }
}

export default Login;
