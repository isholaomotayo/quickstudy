import React from 'react'
import Table from '../Table';


const StudentTable = (props) => {
    return (
        <div>
        <Table rows={props.data} />
            <p>{props.isFetching ? 'Fetching students...' : ''}</p>
        </div>
    )
};

export default StudentTable
