// import ReactStoreIndicator from "react-score-indicator";
import Link from "next/link";

const CourseProgress = () => {
  return (
    <section className="row icard">
      <div className="card m-b-30 ">
        <div className="card-header">
          <h5 className="card-title m-b-0 h5e">Your progress so far</h5>
        </div>
        <div className="card-body">
          <p className="card-text p-b-10">
            You are almost done, click the link to keep on learning{" "}
          </p>
          {/* <ReactStoreIndicator value={50} maxValue={100} width={150} /> */}
          <Link href="/lms/courses" legacyBehavior>
            <span className="btn btne card-footer">Continue</span>
          </Link>
        </div>
      </div>

      <style jsx>
        {`
          .icard {
            width: 300px !important;
          }
          .h5e {
            font-size: 1.8em !important;
          }
          .btne {
            background-color: #007bff;
            color: #fff;
          }
        `}
      </style>
    </section>
  );
};

export default CourseProgress;
