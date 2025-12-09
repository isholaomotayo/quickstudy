import React from "react";
import Curriculums from "./curriculums";
import Announcement from "./announcement";
import Courseinfo from "./courseinfo";
import Courseimage from "./courseimage";

const Layoutss = (props) => {
  // console.log(props.course);
  return (
    <>
      <article className=" ">
        <section className="content ">
          <div className="social-wrapper">
            <div className="social " data-pages="social">
              <Courseimage
                image="https://thenaturebus.com/wp-content/uploads/2017/11/tree-1024x427.jpg"
                title={props.course.name}
              />
              <div className=" container-fluid   container-fixed-lg sm-p-l-0 sm-p-r-0">
                <div className="feed">
                  <div className="day" data-social="day">
                    <Courseinfo course={props.course} />
                    <div className="row">
                      <div className="col-md-8">
                        <div
                          className="card bg-transparent card-borderless social-card col2 "
                          data-social="item"
                        >
                          <Curriculums modules={props.course.course_modules} />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <Announcement id={props.id} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </article>
    </>
  );
};

export default Layoutss;
