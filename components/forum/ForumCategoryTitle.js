import React from "react";
import NewCategoryPopup from "./NewCategoryPopup";

const ForumCategoryTitle = props => {
  return (
    <>
      <div className="bg-dark m-b-30">
        <div className="container">
          <div className="row p-b-60 p-t-60">
            <div className="col-md-8 m-auto text-white p-b-30">
              <h1 className="text-white">
                {" "}
                {props.title || "  General School Discussion "}
              </h1>
              <p> Discussion categories</p>
              <div className="row">
                <div className="col-lg-4">
                  <form action="#" className="form-dark">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search"
                      onChange={e => props.handleSearchChange(e)}
                    />
                  </form>
                </div>
              </div>
            </div>
            <div className="col-md-4 m-auto text-white p-b-30">
              <div className="text-md-right">
                {props.role === "ADMIN" || props.role === "SUPERADMIN" ? (
                  <NewCategoryPopup
                    onChange={props.onChange}
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

export default ForumCategoryTitle;
