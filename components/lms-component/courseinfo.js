import React from "react";
import Link from "next/link";

const Courseinfo = (props) => {
  // console.log("stuffs ", props.course.department.name);
  // const { name } = props.course.department;
  // console.log(name);
  return <>
    <div
      className="card no-border bg-transparent full-width"
      data-social="item"
    >
      <div className="container-fluid p-t-30 p-b-30 ">
        <div className="row">
          <div className="col-lg-4">
            <div className="container-xs-height">
              <div className="row-xs-height">
                <div className="social-user-profile col-xs-height text-center col-top">
                  {/* <div className="thumbnail-wrapper d48 circular bordered b-white">
                    <img
                      alt="Avatar"
                      width={55}
                      height={55}
                      data-src-retina="assets/img/profiles/avatar_small2x.jpg"
                      data-src="assets/img/profiles/avatar.jpg"
                      src="https://www.naijaloaded.com.ng/wp-content/uploads/2017/11/presido-0.jpg"
                    />
                  </div> */}
                  <br />
                  {/* <i className="fa fa-check-circle text-success fs-16 m-t-10" /> */}
                </div>
                <div className="col-xs-height  p-l-20">
                  <h3 className="no-margin p-b-5">
                    Department of {props.course.department.name}
                  </h3>
                  {/* <p className="no-margin fs-16">is excited about the new pages design framework
                           </p> */}
                  <p className="hint-text m-t-5 small">
                    {props.course.department.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 mt-3">
            <p className="hint-text m-t-5 small">
              {props.course.description}
            </p>
          </div>
          <div className="col-lg-2 mt-3 text-center">
            <Link
              href={`/course-forum?id=${props.course.id}`}
              className="btn btn-complete ">
              Go to Forum
            </Link>
          </div>
        </div>
      </div>
    </div>
  </>;
};

export default Courseinfo;
