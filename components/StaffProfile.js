import React from "react";
import dayjs from "dayjs";
import ChangePasswordModal from "./ChangePasswordModal";
// import { isString } from "util";
dayjs().format();
const StaffProfile = ({
  staff,
  user,
  edit,
  editHandler,
  onChange,
  handleUpdate,
  handleChange,
  handleSubmitPassword
}) => {
  const dob = dayjs(staff.dob);
  const dates = `${dob.$D}/${dob.$m}/${dob.$y}`;

  // console.log(isString(dates));
  return (
    <div className="card-body">
      <form onSubmit={e => e.preventDefault()}>
        {/* <h3 >Personal Data</h3>
              <p className="text-muted">
                Use this page to update your contact information and change your password.
              </p> */}
        {/* <div className="text-center">
          <label className="avatar-input">
            <span className="avatar avatar-xl">
              <img
                src={`${user.avatar || "/custom/img/default-user.png"}`}
                alt="..."
                className="avatar-img  rounded-circle"
              />
              <span className="avatar-input-icon rounded-circle">
                <i className=" fa-upload fs-16" />
              </span>
            </span>
       
          </label>
        </div> */}
        <div className="d-flex  mb-3 justify-content-center ">
          <button
            type="submit"
            className={`btn btn-${edit ? "warning" : "danger"} mx-1  btn-cta`}
            onClick={editHandler}
          >
            {edit ? "Edit" : "Cancel"}
          </button>
          <ChangePasswordModal
            handleChange={handleChange}
            handleSubmit={handleSubmitPassword}
          />
          <button
            type="submit"
            className="btn btn-success btn-cta mx-1"
            onClick={handleUpdate}
          >
            Save
          </button>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor={user.first_name}>First Name</label>
            <input
              onChange={onChange}
              type="text"
              defaultValue={user.first_name}
              name="first_name"
              className="form-control bg-white"
              id={user.first_name}
              disabled={edit}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor={user.last_name}>Last Name</label>
            <input
              onChange={onChange}
              type="text"
              name="last_name"
              defaultValue={user.last_name}
              className="form-control bg-white"
              id={user.last_name}
              disabled={edit}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor={user.other_name}>Other</label>
            <input
              type="text"
              name="other_name"
              defaultValue={user.other_name || ""}
              className="form-control bg-white"
              id={user.other_name}
              disabled={edit}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor={`regno`}>Reg No</label>
            <input
              type="text"
              defaultValue={
                staff.hasOwnProperty("staff_no") ? staff.staff_no : ""
              }
              className="form-control bold"
              id={`regno`}
              readOnly
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor={`designation`}>Designation</label>
            <input
              type="text"
              defaultValue={
                staff.hasOwnProperty("designation") ? staff.designation : ""
              }
              className="form-control bold"
              id={`designation`}
              readOnly
            />
          </div>

          <div className="form-group col-md-6">
            <label htmlFor={`program`}>Level </label>
            <input
              type="text"
              defaultValue={staff.hasOwnProperty("level") ? staff.level : ""}
              className="form-control bold"
              id={`program`}
              readOnly
            />
          </div>

          <div className="form-group col-md-12">
            <label htmlFor={`deparment`}>Department</label>
            <input
              type="text"
              defaultValue={
                staff.hasOwnProperty("department") ? staff.department.name : ""
              }
              className="form-control bold"
              id={`deparment`}
              readOnly
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor={user.email}>Email</label>
            <input
              type="email"
              className="form-control bold"
              id={user.email}
              defaultValue={user.email}
              readOnly
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor={`${user.username}U`}>Username</label>
            <input
              type="text"
              defaultValue={user.username}
              className="form-control bold"
              id={`${user.username}U`}
              readOnly
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor={staff.dob}>Date of Birth</label>
            <input
              type="text"
              className="form-control bold"
              id={staff.dob}
              defaultValue={`${isNaN(dob.$D) ? "" : dates}`}
              readOnly
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor={user.phone}>Phone</label>
            <input
              type="number"
              className="form-control bold"
              id={user.phone}
              defaultValue={user.phone}
              disabled
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor={staff.hasOwnProperty("address") ? staff.address : ""}>
            Address
          </label>
          <input
            type="text"
            className="form-control bold"
            id={staff.address}
            defaultValue={staff.address || ""}
            readOnly
          />
        </div>
      </form>

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
            transition: all ease 0.2s;
            opacity: 0;
            color: #fff;
            background: rgba(0, 0, 0, 0.37);
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
        `}
      </style>
    </div>
  );
};

export default StaffProfile;
