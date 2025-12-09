import React from 'react';
import CreateModal from './CreateModal';


const tableHead = {
  student: ['Code', 'E-mail', 'Name', 'Address'],
  lecturer: ['Code', 'E-mail', 'Name', 'Address'],
  admin: ['Code', 'E-mails', 'Name', 'Addresses'],
};

export const getAllInstitutions = () =>
  fetch('http://localhost:3000/api/institution', {
    //mode: "no-cors",
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    }
  })
    .then(response => response.json())
    .then(json => {
      return { json };
    })
    .catch(e => {
      console.log(e);
      return e;
    });


export default function InstitutionTable(props) {
  const handleViewClick = (param1) => () => {
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
            <CreateModal
              handleChange={props.handleChange}
              handleSubmitClick={props.handleSubmitClick}
            />
          </div>
        </div>
        <div className="clearfix" />
      </div>
      <div className="card-body">
        <table
          className="table table-hover demo-table-dynamic table-responsive-block"
          id="tableWithDynamicRows"
        >
          <thead>
            <tr>
              {tableHead.admin.map((head) => (
                <th>{head}</th>
              ))}

              <th colSpan="2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {props.institutions.map((institution) => (
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
                      View
                    </a>
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
                    <a
                      title="Delete"
                      onClick={() => {
                        alert('Are you sure you want to delete this?');
                        props.handleDeleteClick(institution.id);
                      }}
                    >
                      <i className="fa fa-trash" />
                      Delete
                    </a>
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
