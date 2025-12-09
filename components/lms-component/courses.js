import Link from "next/link";
const courseList = [
  {
    id: 1,
    title: "Masters in Engineering"
  },
  {
    id: 2,
    title: "Masters in Development"
  },
  {
    id: 3,
    title: "Masters in Fishing"
  }
];

const Courses = () => {
  return (
    <div>
      <div
        className="card"
        style={{
          width: "18rem",
          opacity: "0.9",
          color: "#fff",
          fontWeight: "bolder",
          backgroundImage: ` linear-gradient(to bottom, rgba(0, 0, 0, 0.52), rgba(117, 19, 93, 0.73)), url('https://beic.az/images/services/a86e7d722abackground-courses.jpg')`
        }}
      >
        <div className="card-body">
          <h5 className="card-title text-white bold">Advance Computing</h5>
          <p className="card-text">
            With supporting text below as a natural lead-in to additional
            content.
          </p>
          <a href="#" className="btn btn-primary">
            Learn
          </a>
        </div>
      </div>
      <div
        className="card"
        style={{
          width: "18rem",
          opacity: "0.9",
          color: "#fff",
          fontWeight: "bolder",
          backgroundImage: ` linear-gradient(to bottom, rgba(0, 0, 0, 0.52), rgba(117, 19, 93, 0.73)), url('https://leverageedu.com/blog/wp-content/uploads/2019/11/Short-Term-Courses-after-BTech.png')`
        }}
      >
        <div className="card-body">
          <h5 className="card-title text-white bold">Advance Imaging</h5>
          <p className="card-text">
            With supporting text below as a natural lead-in to additional
            content.
          </p>
          <a href="#" className="btn btn-primary">
            Learn
          </a>
        </div>
      </div>
      <Link href="/lms/courses " legacyBehavior>
        <a
          className="btn"
          style={{ backgroundColor: "#007BFF", color: "white" }}
        >
          Courses
        </a>
      </Link>

      <style jsx>
        {`
          .card {
            background-position: center center;
            background-repeat: no-repeat;
            background-size: cover;
          }
        `}
      </style>
    </div>
  );
};

export default Courses;
