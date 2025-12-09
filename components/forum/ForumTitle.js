import React from "react";
import ForumUnits from "./ForumUnits";

const ForumTitle = props => {
  return (
    <>
      <div className="bg-dark m-b-30">
        <div className="container">
          <div className="row p-b-60 p-t-60">
            <div className="col-md-8 m-auto text-white p-b-30">
              <h1 className="text-white">
                {" "}
                {props.title || "Getting Started"}
              </h1>
              <p className="opacity-75">
                {props.description ||
                  "Lorem ipsum dolor sit amet, consectetur adipisicing elit. At autem corporis dicta dignissimos earum ex facere fuga, impedit itaque minima nisi numquam officiis quisquam sequi sint sit sunt tempora voluptate"}
              </p>
              <div className="row">
                <div className="col-lg-4">
                  <form action="#" className="form-dark">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search"
                    />
                  </form>
                </div>
              </div>
            </div>
            <div className="col-md-4 m-auto text-white p-b-30">
              <div className="text-md-right">
                {
                  <ForumUnits
                    btn={btn}
                    type={type}
                    handleThreadCreation={props.handleThreadCreation}
                    handleThreadChange={props.handleThreadChange}
                    handleCommentCreation={handleCommentCreation}
                    handleCommentChange={handleCommentChange}
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

export default ForumTitle;
