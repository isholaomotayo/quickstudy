import { useRef } from "react";
import ChangePasswordModal from "../components/ChangePasswordModal";
import DefermentStudentComponent from "./deferment/DefermentStudentComponent";
import toast from "react-hot-toast";
import IDCardComponent, { ComponentValue } from "./IDCardComponent";
import ReactToPrint from "react-to-print";

const resumeHandler = async (id) => {
  let student;
  const data = {
    admission_status: "NONE",
  };
  try {
    student = await fetch(
      `${process.env.API_URL}/api/deferment/deferProcessByStudent/${id}`,
      {
        //mode: "no-cors",
        method: "put",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          ...data,
        }),
      }
    );

    student = student.status === 200 ? await student.json() : {};
  } catch (e) {
    console.log(e);
  }

  if (Object.entries(student).length > 0) {
    toast.success(
      "Your resumption request has been sent, you will get a response in your mail"
    );
    return;
  }
  toast.error("Your resumption request was not successful, please try again");
};

const ResumeButton = (props) => (
  <button
    className=" bold btn btn-success"
    onClick={() => resumeHandler(props.id)}
  >
    Resume My Studies
  </button>
);

const UpdateProfile = ({
  student,
  user,
  edit,
  editHandler,
  onChange,
  handleUpdate,
  handleChange,
  handleSubmitPassword,
  institution,
}) => {
  const componentRef = useRef();
  const buttonRender = (id) => {
    if (student.student.admission_status === "ACTIVE") {
      return <DefermentStudentComponent id={id} />;
    } else if (student.student.admission_status === "DEFERRED") {
      return <ResumeButton id={id} />;
    } else {
      return null;
    }
  };

  return (
    <div className="card-body">
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="d-flex  mb-3 justify-content-center ">
          <button
            type="submit"
            className={`btn btn-${edit ? "warning" : "danger"} mx-2  btn-cta`}
            onClick={editHandler}
          >
            {edit ? "Edit" : "Cancel"}
          </button>
          <button
            type="submit"
            className="btn btn-success btn-cta"
            onClick={handleUpdate}
          >
            Save
          </button>
          <ChangePasswordModal
            handleChange={handleChange}
            handleSubmit={handleSubmitPassword}
          />
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
              id={user.first_name || ""}
              disabled={edit}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor={user.last_name}>Last Name</label>
            <input
              onChange={onChange}
              type="text"
              name="last_name"
              defaultValue={user.last_name || ""}
              className="form-control bg-white"
              id={user.last_name}
              disabled={edit}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor={user.other_name}>Other</label>
            <input
              onChange={onChange}
              type="text"
              name="other_name"
              defaultValue={user.other_name || ""}
              className="form-control bold"
              id={user.other_name}
              disabled={edit}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor={`regno`}>Reg No</label>
            <input
              type="text"
              defaultValue={student.student.reg_no || ""}
              className="form-control bold"
              id={`regno`}
              readOnly
            />
          </div>

          <div className="form-group col-md-6">
            <label htmlFor={`semester-admitted`}>Semester Admitted</label>
            <input
              type="text"
              defaultValue={
                student.student.semester_admitted_id
                  ? student.student.semester.name
                  : ""
              }
              className="form-control bold"
              id={`semester-admitted`}
              readOnly
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor={`program`}>Programme </label>
            <input
              type="text"
              defaultValue={student.student.programme.name || ""}
              className="form-control bold"
              id={`program`}
              readOnly
            />
          </div>

          <div className="form-group col-md-6">
            <label htmlFor={user.email}>Email</label>
            <input
              type="email"
              className="form-control bold"
              id={user.email}
              defaultValue={user.email || ""}
              readOnly
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor={`${user.username}U`}>Username</label>
            <input
              type="text"
              defaultValue={user.username || ""}
              className="form-control bold"
              id={`${user.username}`}
              readOnly
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor={student.student.dob}>Date of Birth</label>
            <input
              type="date"
              className="form-control bold"
              id={student.student.dob}
              defaultValue={student?.student?.dob?.substr(0, 10) ?? ""}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor={user.phone}>Phone</label>
            <input
              type="number"
              className="form-control bold"
              id={user.phone}
              defaultValue={user.phone || ""}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor={student.student.address}>Address</label>
          <input
            type="text"
            className="form-control bold"
            id={student.student.address}
            defaultValue={student.student.address || ""}
            readOnly
          />
        </div>
        <div className="row no-gutters">
          {institution.hasOwnProperty("id_card") &&
            !!institution.id_card &&
            institution.id_card.hasOwnProperty("front") &&
            institution.id_card.hasOwnProperty("back") && (
              <div className="col">
                <ReactToPrint
                  trigger={() => (
                    <button className="btn btn-primary px-3">
                      Print ID Card!
                    </button>
                  )}
                  content={() => componentRef.current}
                />
                <div
                  style={{
                    display: "none",
                  }}
                >
                  <IDCardComponent student={student.student} />
                </div>
              </div>
            )}
          <div className="col">{buttonRender(student.student.id)}</div>
        </div>
      </form>

      <div
        style={{
          display: "none",
        }}
      >
        <ComponentValue
          ref={componentRef}
          student={student.student}
          institution={institution}
        />
      </div>

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

export default UpdateProfile;
