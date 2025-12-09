import Layout from '../../components/Layout';
import { protectPage } from '../../helpers/utils';

const CourseStudents = props => (
  <Layout pageTitle="Course Students" userData={props.userData}>
    <div className="card card-transparent">
      <div className="card-header ">
        <div className="card-title">
          <h4>Course Students</h4>
        </div>
      </div>
      <div className="card-body">
        <p>Course Registrations for CSC 201: Early Computer Languages</p>
        <table className="table table-responsive table-hover">
          <thead>
            <tr>
              <th>Student Reg No</th>
              <th>Course Unit</th>
              <th>Level</th>
              <th>Approved</th>
              <th>Semester</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <input type="text" className="form-control"></input>
              </td>

              <td>
                <input type="text" className="form-control"></input>
              </td>

              <td>
                <input type="text" className="form-control"></input>
              </td>

              <td>
                <select className="form-control">
                  <option value="">Select..</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </td>

              <td>
                <select className="form-control">
                  <option value="">Select..</option>
                  <option>First Semester 2018/2029</option>
                  <option>Second Semester 2018/2019</option>
                  <option>First Semester 2019/2020</option>
                </select>
              </td>
            </tr>
            <tr>
              <td>CSC/18/0001</td>
              <td>3</td>
              <td>200L</td>
              <td className="w-15">
                <span className="fs-18">No</span>
              </td>
              <td className="w-25">
                <span className="fs-18">First Semester 2019/2020</span>
              </td>
            </tr>

            <tr>
              <td>CSC/18/0002</td>
              <td>3</td>
              <td>200L</td>
              <td className="w-15">
                <span className="fs-18">No</span>
              </td>
              <td className="w-25">
                <span className="fs-18">First Semester 2019/2020</span>
              </td>
            </tr>

            <tr>
              <td>CSC/18/0003</td>
              <td>3</td>
              <td>200L</td>
              <td className="w-15">
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">First Semester 2019/2020</span>
              </td>
            </tr>
            <tr>
              <td>MTH/18/0001</td>
              <td>3</td>
              <td>200L</td>
              <td className="w-15">
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">Second Semester 2018/2019</span>
              </td>
            </tr>
            <tr>
              <td>MTH/17/0002</td>
              <td>3</td>
              <td>300L</td>
              <td className="w-15">
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">Second Semester 2018/2019</span>
              </td>
            </tr>
            <tr>
              <td>BIO/18/0001</td>
              <td>3</td>
              <td>100L</td>
              <td className="w-15">
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">Second Semester 2018/2019</span>
              </td>
            </tr>

            <tr>
              <td>CHM/18/0023</td>
              <td>3</td>
              <td>100L</td>
              <td className="w-15">
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">Second Semester 2018/2019</span>
              </td>
            </tr>
            <tr>
              <td>CHM/18/0105</td>
              <td>3</td>
              <td>100L</td>
              <td className="w-15">
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">Second Semester 2018/2019</span>
              </td>
            </tr>
            <tr>
              <td>CHM/18/0122</td>
              <td>3</td>
              <td>100L</td>
              <td className="w-15">
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">Second Semester 2018/2019</span>
              </td>
            </tr>

            <tr>
              <td>CSC/17/0041</td>
              <td>3</td>
              <td>200L</td>
              <td className="w-15">
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">First Semester 2018/2019</span>
              </td>
            </tr>
            <tr>
              <td>CHM/17/0011</td>
              <td>3</td>
              <td>300L</td>
              <td className="w-15">
                <span className="fs-18">Yes</span>
              </td>
              <td className="w-25">
                <span className="fs-18">First Semester 2018/2019</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Layout>
);
CourseStudents.getInitialProps = async ({ req, res, query }) => {
  const allowedRoles = ['ADMIN', 'SUPERADMIN'];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  return { userData };
};
export default CourseStudents;
