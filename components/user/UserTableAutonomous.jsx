import React, {Component} from 'react'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table'
//import '../css/Table.css'
import 'react-bootstrap-table'
import axios from 'axios'

const USER_SERVICE_URL = 'https://jsonplaceholder.typicode.com/users';

function rowClassNameFormat(row, rowIdx) {
    return rowIdx % 2 === 0 ? 'Gold-Row' : 'Silver-Row';
}


class UserTableAutonomous extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFetching: false,
            users: []
        };
    }

    render() {
        return (
            <div>
                <BootstrapTable data={this.state.users} trClassName={rowClassNameFormat}>
                    <TableHeaderColumn isKey dataField='id'></TableHeaderColumn>
                    <TableHeaderColumn dataField='name'></TableHeaderColumn>
                    <TableHeaderColumn dataField='username'></TableHeaderColumn>
                </BootstrapTable>
                <p>{this.state.isFetching ? 'Fetching users...' : ''}</p>
            </div>
        )
    }

    componentDidMount() {
        this.fetchUsers();
        //this.timer = setInterval(() => this.fetchUsers(), 5000);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
        this.timer = null;
    }

    async fetchUsersAsync() {
        try {
            this.setState({...this.state, isFetching: true});
            const response = await fetch('http://localhost:3000/api/institution', {
                //mode: "no-cors",
                method: 'get',
                headers: {
                  'Content-Type': 'application/json',
                  Accept: 'application/json',
                  'Access-Control-Allow-Origin': '*'
                }
              })
                .then(response => response.json())
                .then(json => {
                  //console.log(json);
          
                  return { json };
                })
                .catch(e => {
                  console.log(e);
                  return e;
                });;
            this.setState({users: response.json, isFetching: false});
        } catch (e) {
            console.log(e);
            this.setState({...this.state, isFetching: false});
        }
    };

    fetchUsers = this.fetchUsersAsync;
}

export default UserTableAutonomous
