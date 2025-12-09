import React from "react";
import NewThreadPopup from "./NewThreadPopup";

const ForumThreadTitle = props => {
  return (
    <>
      <div className="bg-dark m-b-30">
        <div className="container">
          <div className="row p-b-60 p-t-60">
            <div className="col-md-8 m-auto text-white p-b-30">
              <h1 className="text-white">
                {" "}
                {"General Forum Topics and discussions"}
              </h1>
              <p className="opacity-75">
                {
                  "This is the general forum page where you can create discussion topics about all the ins and out related to the university. Please ensure you avoid the use of abusive and vulgar words"
                }
              </p>
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
                {
                  <NewThreadPopup
                    handleChange={props.handleChange}
                    handleCreation={props.handleCreation}
                  />
                }
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

export default ForumThreadTitle;
