import HodLayout from '../../components/HodLayout';



const CourseResults = () => (
    <HodLayout pageTitle="Course Results">
      <div className="card card-transparent">
        <div className="card-header ">
          <div className="card-title">
            <h4>Course Results</h4>
          </div>
          <div className="pull-right">
          <div className="col-xs-12">
            <a href="student-gpa" className="btn btn-complete btn-cons text-white">
              <i className="fa fa-search-plus" /> View GPA Records
            </a>
             
          </div>
        </div>
        <div className="clearfix" />
        </div>
        <div className="card-body">

        <p>Course Results for CSC 201: Early Computer Languages</p>
        <table className="table table-condensed table-responsive table-hover">
      <thead>
        <tr>
          <th>Reg No</th>
          <th>Course Unit</th>
          <th>Score/Grade</th>
          <th>Level</th>
          <th>Semester</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="font-montserrat all-caps fs-12 w-10">CSC/17/0001</td>
          <td className="text-middle  w-15">
            <span className="hint-text small">2</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">70A</span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">200L</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
        </tr>
        <tr>
          <td className="font-montserrat all-caps fs-12 w-10">CHM/17/0001</td>
          <td className="text-middle  w-15">
            <span className="hint-text small">3</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">82B</span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">200L</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
        </tr>
        <tr>
          
        <td className="font-montserrat all-caps fs-12 w-10">MTH/17/0001</td>
          <td className="text-middle  w-15">
            <span className="hint-text small">1</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">50C</span>
          </td>

          <td className="w-5">
            <span className="font-montserrat fs-18">200L</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
        </tr>
        <tr>
          <td className="font-montserrat all-caps fs-12 w-10">CSC/17/0002</td>
          <td className="text-middle  w-15">
            <span className="hint-text small">2</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">69B</span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">200L</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
        </tr>
        <tr>
          
        <td className="font-montserrat all-caps fs-12 w-10">CHM/17/0002</td>
          <td className="text-middle  w-15">
            <span className="hint-text small">3</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">60B</span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">200L</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
        </tr>
        <tr>
          <td className="font-montserrat all-caps fs-12 w-10">MTH/17/0002</td>
          <td className="text-middle  w-15">
            <span className="hint-text small">1</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">73A</span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">200L</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
        </tr>
       </tbody>
    </table>
  
        </div>
      </div>
    </HodLayout>
  );
  export default CourseResults;