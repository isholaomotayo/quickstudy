import {Component} from 'react';
import { GetFetch } from '../../FetchWrapper';

const Institution_Get_All_Url = 'http://localhost:3000/api/institution';


class InstitutionRenderProps extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFetching: false,
            data: []
        };
    }

    render = () => this.props.children(this.state);

    componentDidMount() {
        this.fetchUsers();
    } 

    fetchUsersWithFetch = () => {
        this.setState({...this.state, isFetching: true});
        GetFetch(Institution_Get_All_Url)
            .then(response => {
                this.setState({data: response.data, isFetching: false})
            })
            .catch(e => {
                console.log(e);
                this.setState({...this.state, isFetching: false});
            });
    };

    fetchUsers = this.fetchUsersWithFetch
}

export default InstitutionRenderProps

