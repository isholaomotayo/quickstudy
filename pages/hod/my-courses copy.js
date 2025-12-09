import HodLayout from '../../components/HodLayout';

const MyCourses = () => (
  <HodLayout pageTitle="My Courses">
    <div className="card card-transparent">
      <div className="card-header ">
        <div className="card-title">
          <h4>My Courses</h4>
        </div>
      </div>
      <div className="card-body">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Title</th>
              <th>Course Unit</th>
              <th>Semester</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CSC 201</td>

              <td>Early Computer Languages</td>
              <td>3</td>
              <td className="w-25">
                <span className="fs-18">First Semester</span>
              </td>
              <td>
                <span className="fs-18 text-danger">Delete</span>
              </td>
              <td>
                <tr>
                  <td>
                    <a
                      href="hod/course-students?course_id=1"
                      className="btn btn-complete btn-cons text-white"
                    >
                      <i className="fa fa-search-plus" /> View Students
                    </a>
                  </td>
                  <td>
                    <a
                      href="hod/course-results?course_id=1"
                      className="btn btn-primary btn-cons text-white"
                    >
                      <i className="fa fa-search-plus" /> Upload Results
                    </a>
                  </td>
                </tr>
              </td>
            </tr>

            <tr>
              <td>MTH 201</td>

              <td>Mathematical Statistics</td>
              <td>2</td>
              <td>
                <span className="fs-18">First Semester</span>
              </td>
              <td>
                <tr>
                  <td>
                    <a
                      href="hod/course-students?course_id=1"
                      className="btn btn-complete btn-cons text-white"
                    >
                      <i className="fa fa-search-plus" /> View Students
                    </a>
                  </td>
                  <td>
                    <a
                      href="hod/course-results?course_id=1"
                      className="btn btn-primary btn-cons text-white"
                    >
                      <i className="fa fa-search-plus" /> Upload Results
                    </a>
                  </td>
                </tr>
              </td>
            </tr>

            <tr>
              <td>GSE 203</td>

              <td>History of Nigeria</td>
              <td>2</td>
              <td className="w-25">
                <span className="fs-18">First Semester</span>
              </td>
              
              <td>
                <tr>
                  <td>
                    <a
                      href="hod/course-students?course_id=1"
                      className="btn btn-complete btn-cons text-white"
                    >
                      <i className="fa fa-search-plus" /> View Students
                    </a>
                  </td>
                  <td>
                    <a
                      href="hod/course-results?course_id=1"
                      className="btn btn-primary btn-cons text-white"
                    >
                      <i className="fa fa-search-plus" /> Upload Results
                    </a>
                  </td>
                </tr>
              </td>
            </tr>
            <tr>
              <td>SEO 001</td>

              <td>Human and Society</td>
              <td>4</td>
              <td>
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">Second Semester 2018/2019</span>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>PHY 105</td>
              <td>Basic Experimental Physics</td>
              <td>1</td>
              <td>
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">Second Semester 2018/2019</span>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>BIO 121</td>

              <td>Basic Biology Concepts</td>
              <td>2</td>
              <td>
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">Second Semester 2018/2019</span>
              </td>
              <td></td>
            </tr>

            <tr>
              <td>MTH 102</td>

              <td>Geometry I</td>
              <td>2</td>
              <td>
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">Second Semester 2018/2019</span>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>CHM 105</td>

              <td>Chemical Compounds I</td>
              <td>2</td>
              <td>
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">Second Semester 2018/2019</span>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>CHM 103</td>

              <td>Introduction to Chemistry</td>
              <td>2</td>
              <td>
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">Second Semester 2018/2019</span>
              </td>
              <td></td>
            </tr>

            <tr>
              <td>CSC 101</td>
              <td>Introduction to Computer</td>
              <td>2</td>
              <td>
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">First Semester 2018/2019</span>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>CSC 102</td>

              <td>Introduction to Automated Learning</td>
              <td>3</td>
              <td>
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">First Semester 2018/2019</span>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>GSE 101</td>

              <td>Use of English</td>
              <td>1</td>
              <td>
                <span className="fs-18">Yes</span>
              </td>

              <td className="w-25">
                <span className="fs-18">First Semester 2018/2019</span>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>GSE 102</td>

              <td>Conflict Resolution</td>
              <td>2</td>
              <td>
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">First Semester 2018/2019</span>
              </td>
              <td></td>
            </tr>
            <tr>
              <td>MTH 101</td>

              <td>Introduction to Mathematical Concepts</td>
              <td>3</td>
              <td>
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">First Semester 2018/2019</span>
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </HodLayout>
);
export default MyCourses;
