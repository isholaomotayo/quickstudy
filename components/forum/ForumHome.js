import React from "react";
import ForumTopic from "./ForumTopic";

const ForumHome = () => {
  return (
    <>
      <div className="">
        <div className="row">
          <div className="col-md-12 m-b-30">
            <div className="card carde  mb-3">
              <div className="card-header border-bottom">
                <div className="row no-gutters align-items-center ">
                  <div className="col font-weight-bold">Topics</div>
                  <div className=" d-md-block col-8 text-muted">
                    <div className="row no-gutters align-items-center">
                      <div className="col-3">Threads</div>
                      <div className="col-3">Replies</div>
                      <div className="col-6">Last update</div>
                    </div>
                  </div>
                </div>
              </div>
              <ForumTopic />
              <ForumTopic />
              <ForumTopic />
              <ForumTopic />
              <div className="card-body py-3">
                <div className="row no-gutters align-items-center">
                  <div className="col">
                    <a
                      href="forum-thread.html"
                      className="text-big font-weight-semibold"
                    >
                      Announcements
                    </a>
                  </div>
                  <div className=" d-md-block col-8">
                    <div className="row no-gutters align-items-center">
                      <div className="col-3">68</div>
                      <div className="col-3">978</div>
                      <div className="media col-6 align-items-center">
                        <div className="avatar">
                          <div className="avatar avatar-title bg-info rounded-circle">
                            M
                          </div>
                        </div>
                        <div className="media-body  ml-2">
                          <a href="forum-thread.html" className="d-block ">
                            sit amet, consectetur adipisicing elit.
                          </a>
                          <div className="text-muted small ">
                            1d ago &nbsp;·&nbsp;{" "}
                            <a href="forum-thread.html" className="text-muted">
                              Monika Chaulagain
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <hr className="m-0" />
              <div className="card-body py-3">
                <div className="row no-gutters align-items-center">
                  <div className="col">
                    <a
                      href="forum-thread.html"
                      className="text-big font-weight-semibold"
                    >
                      Guides
                    </a>
                  </div>
                  <div className=" d-md-block col-8">
                    <div className="row no-gutters align-items-center">
                      <div className="col-3">265</div>
                      <div className="col-3">50</div>
                      <div className="media col-6 align-items-center">
                        <div className="avatar">
                          <div className="avatar avatar-title bg-warning rounded-circle">
                            G
                          </div>
                        </div>
                        <div className="media-body  ml-2">
                          <a href="forum-thread.html" className="d-block ">
                            {" "}
                            At autem dignissimos dolore ea est excepturi maxime
                            neque obca
                          </a>
                          <div className="text-muted small ">
                            1d ago &nbsp;·&nbsp;{" "}
                            <a href="forum-thread.html" className="text-muted">
                              Gloria Wade
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      `
      <style jsx>
        {`
          .carde {
            border-radius: 0.25rem;
          }
          .avatar .avatar-title {
            font-size: 18px;
          }
          .avatar {
            width: 3rem;
            height: 3rem;
          }
          .avatar-title {
            display: flex;
            width: 100%;
            height: 100%;
            color: #fff;
            background-color: #b1c2d9;
            align-items: center;
            justify-content: center;
          }
          .avatar {
            position: relative;
          }
          .rounded-circle {
            border-radius: 50% !important;
          }
        `}
      </style>
    </>
  );
};

export default ForumHome;
