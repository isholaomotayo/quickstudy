import React from 'react';
import Link from 'next/link';
import CreateModal from './CreateModal';

const ActionLink = props => (
  <li>
    <Link
      href={`/institution/[action]/[id]`}
      as={`/institution/${props.title}/${props.id}`}
    >
      {props.name}
    </Link>
  </li>
);

export default function Institutions(props) {
  const handleViewClick = (param1) => (event) => {

    props.openView(param1);
  };

  return (
      // {/* START card */}
      <div className="card card-transparent">
        <div className="card-header ">
          <div className="card-title">Institutions</div>
          <div className="pull-right">
            <div className="col-xs-12">
              

             {/* Component for Create Institution Popup  */}
              <CreateModal handleChange={props.handleChange} handleSubmitClick={props.handleSubmitClick}></CreateModal>
            </div>
          </div>
          <div className="clearfix" />
        </div>
        <div className="card-body">
          <table
            className="table table-hover demo-table-dynamic table-responsive"
            id="tableWithDynamicRows"
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Email</th>
                <th>Address</th>
                <th colSpan="2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {props.institutions.map(institution => (
                <tr key={institution.id}>
                  <td className="v-align-middle">
                    <p>{institution.name}</p>
                  </td>
                  <td className="v-align-middle">
                    <p>{institution.code}</p>
                  </td>
                  <td className="v-align-middle">
                    <p>{institution.email}</p>
                  </td>
                  <td className="v-align-middle">
                    <p>{institution.address}</p>
                  </td>
                  <td className="v-align-middle">
                    <p>
                      <a title="View" onClick={handleViewClick(institution.id)}> 
                      <i className="fa fa-search-plus" /> 
                       View</a>
                    </p>
                  </td>
                  {/* <td className="v-align-middle">
                    <p>
                      <ActionLink
                        title="update"
                        name="Update"
                        id={institution.id}
                      />
                    </p>
                  </td> */}
                  <td className="v-align-middle">
                    <p>
                      <a title="Delete" onClick={()=>{
                        alert("Are you sure you want to delete this?")
                       props.handleDeleteClick(institution.id)
                      }}> 
                      <i className="fa fa-trash" /> 
                       Delete</a>
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      
      {/* END card */}
      
    </div>
  );
}
