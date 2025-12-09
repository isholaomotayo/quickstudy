import React from "react";

const Courseimage = props => {
  return (
    <>
      <div className="jumbotron" data-social="cover" data-pages="parallax">
        <div className="cover-photo">
          <img alt="Cover photo" src={props.image} />
        </div>
        <div className=" container-fluid   container-fixed-lg sm-p-l-0 sm-p-r-0">
          <div className="inner">
            <div className="pull-bottom bottom-left m-b-40 sm-p-l-15">
              <h1 className="text-white no-margin">
                {props.title || "Department of Computer Science"}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Courseimage;
