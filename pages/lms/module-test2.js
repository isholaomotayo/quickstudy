import Popup from "reactjs-popup";
import Layout from "../../components/Layout";
import CourseQuestion from "../../components/CourseQuestion";
import CreateButton from "../../helpers/CreateButton";
import DBForm from "../../helpers/DBForm";

import fetch from "isomorphic-unfetch";

const ModuleTest = ({ courseTestData, courseQuestionsData, ...props }) => {
  return (
    <Layout pageTitle="Module Test">
      <div className="text-center">
        <div className="inline-block">
          <h3>{courseTestData.title}</h3>
          <p>{courseTestData.instructions}</p>
          <p>
            <small>Duration: {courseTestData.duration_mins} mins</small>
          </p>
        </div>
      </div>
      <div className="text-right">
        <Popup
          trigger={(open) => <CreateButton open={open} title="Add Question" />}
          modal
          closeOnDocumentClick
        >
          <DBForm title="Add Question" />
        </Popup>
      </div>
      {courseQuestionsData.map((question, i) => (
        <CourseQuestion {...question} key={`question-${i}`} />
      ))}
      <button className="btn btn-sm btn-primary">Submit</button>
    </Layout>
  );
};

ModuleTest.getInitialProps = async ({ req, query: { id } }) => {
  const testDataRes = await fetch(`${API_HOST}/api/coursetests/${id}`);
  const courseTestData = await testDataRes.json();

  const questionsDataRes = await fetch(`${API_HOST}/api/coursequestions`);
  const courseQuestionsData = await questionsDataRes.json();

  // ${API_HOST}/api/schema/table_name
  const schemaRes = await fetch(`${API_HOST}/api/schema/course_question`);
  const schema = await schemaRes.json();

  return { courseTestData, courseQuestionsData, schema };
};

export default ModuleTest;
