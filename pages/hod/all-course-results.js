import HodLayout from '../../components/HodLayout';



const CourseResults = () => (
    <HodLayout pageTitle="Course Results">
      <div className="card card-transparent">
        <div className="card-header ">
          <div className="card-title">
            <h4>All Students Results</h4>
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

        <table className="table table-condensed table-responsive table-hover">
      <thead>
        <tr>
          <th>Reg No</th>
          <th>Course Code</th>
          <th>Course Title</th>
          <th>Course Unit</th>
          <th>Score/Grade</th>
          <th>Level</th>
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
                <input type="text" className="form-control"></input>
              </td>
              <td>
                <input type="text" className="form-control"></input>
              </td>

              <td>
                <select className="form-control">
                  <option value="">Select..</option>
                  <option>100L</option>
                  <option>200L</option>
                  <option>300L</option>
                  <option>400L</option>
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
          <td className="font-montserrat all-caps fs-12 w-10">CSC/18/0001</td>
          <td className="font-montserrat all-caps fs-12 w-10">CSC 101</td>
          <td className="font-montserrat all-caps fs-12 w-50">
            Introduction to Computer
          </td>
          <td className="text-middle  w-15">
            <span className="hint-text small">2</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">70A</span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">100L</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
        </tr>
        <tr>
          <td className="font-montserrat all-caps fs-12 w-10">CSC/18/0001</td>
          <td className="font-montserrat all-caps fs-12 w-10">CSC 102</td>

          <td className="font-montserrat all-caps fs-12 w-50">
            Introduction to Automated Learning
          </td>
          <td className="text-middle  w-15">
            <span className="hint-text small">3</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">82B</span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">100L</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
        </tr>
        <tr>
          <td className="font-montserrat all-caps fs-12 w-10">CSC/18/0001</td>
          <td className="font-montserrat all-caps fs-12 w-10">GSE 101</td>

          <td className="font-montserrat all-caps fs-12 w-50">
            Use of English
          </td>
          <td className="text-middle  w-15">
            <span className="hint-text small">1</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">50C</span>
          </td>

          <td className="w-5">
            <span className="font-montserrat fs-18">100L</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
        </tr>
        <tr>
          <td className="font-montserrat all-caps fs-12 w-10">CSC/18/0001</td>
          <td className="font-montserrat all-caps fs-12 w-10">GSE 102</td>

          <td className="font-montserrat all-caps fs-12 w-50">
            Conflict Resolution
          </td>
          <td className="text-middle  w-15">
            <span className="hint-text small">2</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">69B</span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">100L</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
        </tr>
        <tr>
          <td className="font-montserrat all-caps fs-12 w-10">CSC/18/0001</td>
          <td className="font-montserrat all-caps fs-12 w-10">MTH 101</td>

          <td className="font-montserrat all-caps fs-12 w-50">
            Introduction to Mathematical Concepts
          </td>
          <td className="text-middle  w-15">
            <span className="hint-text small">3</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">60B</span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">100L</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
        </tr>
        <tr>
          <td className="font-montserrat all-caps fs-12 w-10">CSC/18/0001</td>
          <td className="font-montserrat all-caps fs-12 w-10">MTH 102</td>

          <td className="font-montserrat all-caps fs-12 w-50">Geometry I</td>
          <td className="text-middle  w-15">
            <span className="hint-text small">2</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">73A</span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">100L</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
        </tr>
        <tr>
          <td className="font-montserrat all-caps fs-12 w-10">CSC/18/0001</td>
          <td className="font-montserrat all-caps fs-12 w-10">SEO 001</td>

          <td className="font-montserrat all-caps fs-12 w-50">
            Human and Society
          </td>
          <td className="text-middle  w-15">
            <span className="hint-text small">4</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">69B</span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">100L</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
        </tr>
        <tr>
          <td className="font-montserrat all-caps fs-12 w-10">CSC/18/0001</td>
          <td className="font-montserrat all-caps fs-12 w-10">PHY 105</td>

          <td className="font-montserrat all-caps fs-12 w-50">
            Basic Experimental Physics
          </td>
          <td className="text-middle  w-15">
            <span className="hint-text small">1</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">45D</span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">100L</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
        </tr>
        <tr>
          <td className="font-montserrat all-caps fs-12 w-10">CSC/18/0002</td>
          <td className="font-montserrat all-caps fs-12 w-10">BIO 121</td>

          <td className="font-montserrat all-caps fs-12 w-50">
            Basic Biology Concepts
          </td>
          <td className="text-middle  w-15">
            <span className="hint-text small">2</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">40E</span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">100L</span>
          </td>
          <td className="w-25">
            <span className="font-montserrat fs-18">
              First Semester 2018/2019
            </span>
          </td>
        </tr>
        <tr>
          <td className="font-montserrat all-caps fs-12 w-10">CSC/18/0005</td>
          <td className="font-montserrat all-caps fs-12 w-10">CHM 103</td>

          <td className="font-montserrat all-caps fs-12 w-50">
            Introduction to Chemistry
          </td>
          <td className="text-middle  w-15">
            <span className="hint-text small">2</span>
          </td>
          <td className="w-15">
            <span className="font-montserrat fs-18">30F</span>
          </td>
          <td className="w-5">
            <span className="font-montserrat fs-18">100L</span>
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