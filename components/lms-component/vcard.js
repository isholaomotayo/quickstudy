import Link from "next/link";
import CourseProgress from "../lms-component/courseProgress";
import Courses from "../lms-component/courses";
const VideoCard = () => {
  return (
    <article className="container">
      <div className="row">
        <div className="col-lg-4 m-b-30">
          <div className="card m-b-30 ">
            <div className="card-media">
              <div className="embed-responsive embed-responsive-16by9">
                <iframe
                  width={1280}
                  height={720}
                  src="https://www.youtube.com/embed/bTqVqk7FSmY?autoplay=0&share=0"
                  allow="autoplay; encrypted-media"
                />
              </div>
            </div>
            <div className="card-body">
              <h5 className="card-title">The empirism in complexities</h5>
            </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item bg-dark text-white">
                MODULES TO BE COVERED{" "}
                <Link href="/lms/courses" legacyBehavior>
                  <a className="btn btn-success float-right">Go</a>
                </Link>{" "}
              </li>
              <li className="list-group-item">What is empirism?</li>
              <li className="list-group-item">
                What is the space time quantomics
              </li>
            </ul>
          </div>
        </div>
        <div className="card-body pt0">
          <div className="col-lg-4 m-b-30 ">
            <CourseProgress />
          </div>
        </div>
        <div className="card-body pt0">
          <Link href="/courses" legacyBehavior>
            <h5
              className="card-title mt0"
              style={{ cursor: "pointer", color: "#007BFF" }}
            >
              My Courses
            </h5>
          </Link>

          <div className="col-lg-8 m-b-30 ">
            <Courses />
          </div>
        </div>
      </div>

      <style jsx>
        {`
          .csce {
            display: flex;
            flex-direction: row !important;
          }
          .left-pan {
            margin-left: 30px;
          }

          h4 {
            font-size: 14px;
          }
          .pt0 {
            padding-top: 0 !important;
          }
          .mt0 {
            margin-top: 0 !important;
          }
        `}
      </style>
    </article>
  );
};

export default VideoCard;
