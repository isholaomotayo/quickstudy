import React from 'react';


const viewModal = props => {
  return (
    props.institution.map(institution => (
    <div className="modals">
    
      <div className="modal-header"> View Institution: {institution.id} </div>
      <div className="modals-content">
        <table className="table table-borderless">
          
             <tbody> 
               <tr>
              <th className="v-align-middle">Name</th>
              <td className="v-align-middle">
                <p>{institution.name}</p>
              </td>
            </tr>
            <tr>
              <th className="v-align-middle">Email</th>
              <td className="v-align-middle">{institution.email}</td>
            </tr>
            <tr>
              <th className="v-align-middle">Phone</th>
              <td className="v-align-middle">{institution.phone}</td>
            </tr>
            <tr>
              <th className="v-align-middle">Address</th>
              <td className="v-align-middle">{institution.address}</td>
            </tr>
            <tr>
              <th className="v-align-middle">Created At</th>
              <td className="v-align-middle">{institution.created_at}</td>
            </tr>
          </tbody>

        
            
        </table>
      </div>
    </div>
    ))
  );
};

export default viewModal;
