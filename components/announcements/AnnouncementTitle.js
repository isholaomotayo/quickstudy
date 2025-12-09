import React from "react";
import NewAnnouncementPopup from "./NewAnnouncementPopup";
import { validateObject } from "../../helpers/forum-helpers/validateObject";
import SearchComponent from "../SearchComponent";

const AnnouncementTitle = (props) => {
  const courseCheck = validateObject(props.course);

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
                  <h1 className="text-white">General Announcements</h1>
                  <p className="opacity-75">University General Announcements</p>
                </div>
              )}
              <div className="row">
                <SearchComponent
                  searchHandler={props.searchHandler}
                  placeholder="Search for announcement by title"
                  server={true}
                />
              </div>
            </div>
            <div className="col-md-4 m-auto text-white p-b-30">
              <div className="text-md-right">
                {props.role.includes("ADMIN") || props.role === "STAFF" ? (
                  <NewAnnouncementPopup
                    handleChange={props.handleChange}
                    handleEditorChange={props.handleEditorChange}
                    handleCreation={props.handleCreation}
                  />
                ) : null}
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

export default AnnouncementTitle;
