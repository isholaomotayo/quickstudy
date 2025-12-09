import React from 'react'
import EditModal, { updatexStudent } from './EditModal';
import ChangePasswordModal, { updatePassword } from '../ChangePasswordModal';

const UserProfile = (props) => {
    return (
        <>
       
      {/* START card */}
      <section>
  <div className="container">
    <div className="row ">
      <div className="col-lg-8  mt-2 " style={{marginLeft:'auto', marginRight:'auto'}}>
        <div className="card py-3 m-b-30">
          <div className="card-body">
            <>
             
              <div >
                <label className="avatar-input smr" style={{marginLeft:'40%', marginRight:'50%'}}>
                  <span className="avatar avatar-xl" style={{minWidth:'100px',minHeight:'100px'}}>
                    <img  src="https://images.all-free-download.com/images/graphiclarge/beautiful_nature_landscape_05_hd_picture_166223.jpg"  alt="..." className="avatar-img  rounded-circle" />
                    <span className="avatar-input-icon rounded-circle">
                      <i className=" fa-upload fs-16" />
                    </span>
                  </span>
                  {/* <input type="file" name="avatar" className="avatar-file-picker" /> */}
                </label>
             <div className='nonee' style={{marginLeft:'30%'}}>
             <EditModal
                  handleChange={props.handleChange}
                  handleSubmit={props.handleSubmit}
                  student={props.profile}
                />

                <ChangePasswordModal
                  handleChange={props.handleChange}
                  handleSubmit={props.handleSubmitPassword}
                />
             </div>
              </div>
               <h3>Program Details</h3>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="inputEmail6">Reg No</label>
                  <input type="text" defaultValue="CSC/18/0001" className="form-control bold text-dark" id="inputEmail6" placeholder="Name" readOnly />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="inputEmail4">Programme</label>
                  <input type="text" className="form-control bold text-dark" id="inputEmail4" placeholder="Email" defaultValue="BSc Computer Science" readOnly />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="asd">Level</label>
                  <input type="text" className="form-control bold text-dark" id="asd" placeholder="username" defaultValue="100L"  readOnly/>
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="inputPassword4">Status</label>
                  <input type="text" className="form-control bold text-dark" id="inputPassword4" placeholder="" defaultValue="Active" readOnly />
                </div>
              </div>
              
              <h3 className='mt-3'>Personal Details</h3>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="inputEmail6">Name</label>
                  <input type="text" defaultValue={`${props.profile.first_name} ${props.profile.last_name}`} className="form-control bold text-dark" id="inputEmail6" placeholder="Name" readOnly />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="inputEmail4">Email</label>
                  <input type="email" className="form-control bold text-dark" id="inputEmail4" placeholder="Email" defaultValue={props.profile.email} readOnly />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="asd">Phone</label>
                  <input type="text" className="form-control bold text-dark" id="asd" placeholder="phone" defaultValue={props.profile.phone}  readOnly/>
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="inputPassword4">Gender</label>
                  <input type="text" className="form-control bold text-dark" id="inputPassword4" placeholder="" defaultValue="Male" readOnly />
                </div>
                <div className="form-group col-md-12">
                  <label htmlFor="inputAddress">Address</label>
                  <input type="text" className="form-control bold text-dark"  id="inputAddress" defaultValue={props.profile.address} readOnly/>
                </div>

              </div>
           
            </>
          </div>
        </div>
       </div>
    </div>
  </div>
</section>

      {/* END card */}
    
      
    
    <style jsx>
      {`
        .avatar-input {
          position: relative;
          overflow: hidden;
      }
      .avatar {
        position: relative;
        display: inline-block;
    }
    .avatar-xl {
      width: 5.125rem;
      height: 5.125rem;
  }
  .avatar {
    width: 3rem;
    height: 3rem;
}
.avatar-img {
  width: 100%;
  height: 100%;
  -o-object-fit: cover;
  object-fit: cover;
}

.avatar-input .avatar-input-icon {
  position: absolute;
  top: 0;
  display: flex;
  width: 100%;
  height: 100%;
  transition: all ease .2s;
  opacity: 0;
  color: #fff;
  background: rgba(0,0,0,.37);
  justify-content: center;
  align-items: center;
}

.avatar-input .avatar-file-picker {
  position: absolute;
  z-index: 2;
  width: 1px;
  height: 1px;
  margin: 0;
  opacity: 0;
}

@media screen and (max-width: 768px){
    .smr{
        margin-left: 30% !important;
    }

    .nonee{
        margin: 0 !important;
    }
}
      `}
    </style>   
        </>
    )
}

export default UserProfile
