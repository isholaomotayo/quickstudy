import React from "react";
import NewAnnouncementPopup from "./NewAnnouncementPopup";
import { validateObject } from "../../helpers/forum-helpers/validateObject";

const SchoolAnnouncementTitle = props => {
  const courseCheck = validateObject(props.course);

  // console.log(courseCheck);
  return (
    <>
      <div className="bg-dark m-b-30">
        <div className="container">
          <div className="row p-b-60 p-t-60">
            <div className="col-md-8 m-auto text-white p-b-30">
              {!courseCheck ? (
                <div>
                  <h1 className="text-white">
                    {`${props.course.name}-${props.course.code}`}
                  </h1>
                  <p className="opacity-75">{`${props.course.description}`}</p>
                </div>
              ) : (
                <div>
                  <h1 className="text-white">Getting Started</h1>
                  <p className="opacity-75">
                    You currently have no course, please ensure you are
                    accessing the correct page or add a course
                  </p>
                </div>
              )}
              <div className="row">
                <div className="col-lg-4">
                  <form action="#" className="form-dark">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search"
                      onChange={props.handleSearchChange}
                    />
                  </form>
                </div>
              </div>
            </div>
            <div className="col-md-4 m-auto text-white p-b-30">
              <div className="text-md-right">
                <NewAnnouncementPopup
                  handleChange={props.handleChange}
                  handleCreation={props.handleCreation}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>
        {`
          .p-t-60,
          p-b-60 {
            padding-top: 60px;
            padding-bottom: 60px;
          }
        `}
      </style>
    </>
  );
};

export default SchoolAnnouncementTitle;
