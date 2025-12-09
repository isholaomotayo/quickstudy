import React from "react";
import Link from "next/link";
const Moduletitle = props => {
  return <>
    {/* END BREADCRUMB */}
    <div
      className="container-sm-height  "
      style={{ height: "50% !important" }}
    >
      <div className="row m-md-0">
        <div className="col-xl-4 col-lg-4 bg-transparent">
          {/* START card */}
          <div className="full-height">
            <div className="card-body  text-center mt-3">
              <img
                className="image-responsive-height demo-mw-500"
                src="https://i.ytimg.com/vi/L2WgJgAULo8/maxresdefault.jpg"
                style={{ width: "50%" }}
              />
            </div>
          </div>
          {/* END card */}
        </div>
        <div className="col-xl-8 col-lg-8 col-top">
          {/* START card */}
          <div className="card card-transparent">
            <div className="card-header mt-4">
              <div className="card-title">
                CSC - 101 -{" "}
                <h3>The Irregularities in Complicated systems </h3>
                <Link href={`/course-forum?id=${props.id}`} className="btn btn-complete ">
                  Go to Forum
                </Link>
              </div>
            </div>
          </div>
          {/* END card */}
        </div>
      </div>
    </div>
    {/* END JUMBOTRON */}
  </>;
};

export default Moduletitle;
