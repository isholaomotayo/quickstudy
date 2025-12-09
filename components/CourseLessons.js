import { useState, useEffect } from "react";
import Link from "next/link";
import Modal from "./Modal";
import DBForm from "../helpers/DBForm";
import {
  sortObjectsByNumProperty,
  getTableSchema,
  setTableRow,
} from "../helpers/utils";

const CourseLessons = (props) => {
  const [lessonTestRows, setLessonTestRows] = useState({});
  const [testFormSchema, setTestFormSchema] = useState({});
  //console.log(lessonTestRows)

  const myData = props.userData;
  const writeAccess = props.writeAccess;
  const iCanWrite =
    typeof writeAccess == "undefined" || writeAccess.indexOf(myData.role) > -1;

  const testFormFields = [
    "name",
    "format",
    "instructions",
    "duration_mins",
    "deadline",
    "max_attempts",
  ];

  const testSelectFields = props.testSelectFields || {
    format: ["quiz", "assignment", "offline"],
  };

  useEffect(() => {
    if (iCanWrite) {
      getTableSchema("course_test", setTestFormSchema);
    }
  }, []);

  const addLessonTest = (test) => {
    let lesson_id = test.course_lesson_id,
      subList =
        lessonTestRows[lesson_id] && lessonTestRows[lesson_id].length
          ? [...lessonTestRows[lesson_id], test]
          : [test];
    setLessonTestRows({
      ...lessonTestRows,
      [lesson_id]: subList,
    });
    //console.log(subList, lessonTestRows)
  };

  // const setLessons = (record, isNewForm) => {
  //   setTableRow(props.lessonRows, props.setLessonRows)
  //   props.setActiveLesson(record)
  // }

  return (
    <div className="card">
      <div className="card-body lessons-nav">
        {props.lessonRows.map((lesson, i) => {
          if (lesson.course_tests && lesson.course_tests.length)
            lesson.course_tests = sortObjectsByNumProperty(
              lesson.course_tests,
              "id"
            );

          if (!(lesson.id in lessonTestRows)) {
            setLessonTestRows({
              ...lessonTestRows,
              [lesson.id]: lesson.course_tests || [],
            });
          }

          return (
            <div
              key={`lesson${lesson.id}`}
              className=""
              onClick={() => props.setActiveLesson(lesson)}
            >
              <div
                className={`row item ${
                  lesson.id == props.activeLesson.id ? "active" : ""
                }`}
              >
                <div className="col-sm-2">
                  <i className="fa fa-play-circle-o fa-lg mt-2 mr-1" />
                </div>
                <div className="col-sm-7">{lesson.name}</div>
                <div className="col-sm-3 p-0 text-right">
                  {iCanWrite ? (
                    <>
                      <Modal
                        openBtnIconClass="fa fa-check-circle"
                        openBtnSize="xs"
                        openBtnVariant="danger"
                        preModalTitle={`Create new TEST for:`}
                        modalTitle={lesson.name}
                        modalSize="lg"
                      >
                        {(closeModal) => (
                          <DBForm
                            tableName="course_test"
                            formFields={testFormFields}
                            preloads={{
                              course_lesson_id: lesson.id,
                              course_id: props.preloads.course_id,
                            }}
                            disabledFields={["max_score"]}
                            selectFields={testSelectFields}
                            setTableRow={addLessonTest}
                            afterSuccess={closeModal}
                            formSchema={testFormSchema}
                          />
                        )}
                      </Modal>
                    </>
                  ) : (
                    ""
                  )}
                </div>
              </div>
              <ul className="">
                {lessonTestRows[lesson.id] &&
                  lessonTestRows[lesson.id].map((test, j) => {
                    let beforeLast = j < lessonTestRows[lesson.id].length - 1;
                    return (
                      <li
                        key={`test${test.id}`}
                        className={beforeLast ? "underline-dash" : ""}
                      >
                        {
                          <Link
                            href={`/lms/learning-test?course_test_id=${test.id}`}
                            legacyBehavior
                          >
                            <a title={test.name}>
                              {/* Lesson Test: {i + 1}-{j + 1} */}
                              {test.format
                                ? test.format.toUpperCase()
                                : ""}: <br />
                              {test.name}
                            </a>
                          </Link>
                        }
                      </li>
                    );
                  })}
              </ul>
            </div>
          );
        })}
      </div>
      {iCanWrite ? (
        <div className=" card-footer">
          <Modal
            openBtnTitle={`${props.createBtnTitle || "Add Lesson"}`}
            openBtnVariant="primary"
            modalTitle="Add New Lesson"
            modalSize="xl"
            enforceFocus={false}
          >
            {(closeModal) => (
              <DBForm
                tableName="course_lesson"
                setTableRow={props.updatePage}
                afterSuccess={closeModal}
                formFields={props.lessonFormFields}
                editorField="content"
                numTableRows={props.lessonRows.length}
                formSchema={props.lessonFormSchema}
              />
            )}
          </Modal>
        </div>
      ) : (
        ""
      )}
      <style jsx>{`
        .duration-text {
          font-size: 0.8em;
        }
        .item,
        .footer {
          padding: 15px 15px !important;
        }
        .item {
          cursor: pointer;
        }
        .item.active {
          background: #ddd;
        }

        @media screen and (max-width: 1140px) {
          .item {
            padding: 5px 5px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CourseLessons;
