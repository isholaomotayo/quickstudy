import Layout from '../../components/Layout';
import { protectPage } from '../../helpers/utils';

const StudentGpa = props => (
  <Layout pageTitle="Course Results" userData={props.userData}>
    <h3 className="all-caps semi-bold">Student GPAs</h3>

    <div className="pull-right">
      <div className="col-xs-12">
        <a href="student-gpa" className="btn btn-complete btn-cons text-white">
          <i className="fa fa-search-plus" /> View All Results
        </a>
      </div>
    </div>
    <table className="table table-condensed table-hover">
      <thead>
        <tr>
          <th>Reg No</th>
          <th>Semester</th>
          <th>Level</th>
          <th>Prev GPA</th>
          <th>Current GPA</th>
          <th>Cumulative GPA</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            {' '}
            <span className="font-montserrat fs-18">CSC/18/0001</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">100L</span>
          </td>
          <td className="font-montserrat all-caps fs-12 w-10">0.00</td>
          <td className="font-montserrat all-caps fs-12 w-50">4.5</td>
          <td className="text-middle  w-15">
            <span className="hint-text small">4.5</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">
              <i className="fa fa-search-plus" /> View
            </span>
          </td>
        </tr>
        <tr>
          <td>
            {' '}
            <span className="font-montserrat fs-18">CSC/18/0001</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              Second Semester 2018/2019
            </span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">100L</span>
          </td>
          <td className="font-montserrat all-caps fs-12 w-10">4.53</td>
          <td className="font-montserrat all-caps fs-12 w-50">4.56</td>
          <td className="text-middle  w-15">
            <span className="hint-text small">4.53</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18 fa-fa-search-plus">
              {' '}
              <i className="fa fa-search-plus" />
              View
            </span>
          </td>
        </tr>

        <tr>
          <td>
            {' '}
            <span className="font-montserrat fs-18">CSC/18/0002</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">100L</span>
          </td>
          <td className="font-montserrat all-caps fs-12 w-10">0.00</td>
          <td className="font-montserrat all-caps fs-12 w-50">3.5</td>
          <td className="text-middle  w-15">
            <span className="hint-text small">3.5</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">
              <i className="fa fa-search-plus" /> View
            </span>
          </td>
        </tr>
        <tr>
          <td>
            {' '}
            <span className="font-montserrat fs-18">CSC/18/0002</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              Second Semester 2018/2019
            </span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">100L</span>
          </td>
          <td className="font-montserrat all-caps fs-12 w-10">3.53</td>
          <td className="font-montserrat all-caps fs-12 w-50">4.56</td>
          <td className="text-middle  w-15">
            <span className="hint-text small">3.53</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18 fa-fa-search-plus">
              {' '}
              <i className="fa fa-search-plus" />
              View
            </span>
          </td>
        </tr>
        <tr>
          <td>
            {' '}
            <span className="font-montserrat fs-18">CSC/18/0003</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">100L</span>
          </td>
          <td className="font-montserrat all-caps fs-12 w-10">0.00</td>
          <td className="font-montserrat all-caps fs-12 w-50">2.5</td>
          <td className="text-middle  w-15">
            <span className="hint-text small">3.5</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">
              <i className="fa fa-search-plus" /> View
            </span>
          </td>
        </tr>
        <tr>
          <td>
            {' '}
            <span className="font-montserrat fs-18">CSC/18/0003</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              Second Semester 2018/2019
            </span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">100L</span>
          </td>
          <td className="font-montserrat all-caps fs-12 w-10">2.53</td>
          <td className="font-montserrat all-caps fs-12 w-50">4.56</td>
          <td className="text-middle  w-15">
            <span className="hint-text small">2.53</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18 fa-fa-search-plus">
              {' '}
              <i className="fa fa-search-plus" />
              View
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </Layout>
);
StudentGpa.getInitialProps = async ({ req, res, query }) => {
  const allowedRoles = ['ADMIN', 'SUPERADMIN'];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  return { userData };
};
export default StudentGpa;
