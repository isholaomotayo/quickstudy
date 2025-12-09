import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import Modal from "../../components/Modal";
import CourseLessons from "../../components/CourseLessons";
import ModuleTestLink from "../../components/ModuleTestLink";
import {
  showToastAlert,
  checkAndShowIfError,
  protectPage,
  getTableSchema,
  getTableData,
  setTableRow,
  deleteTableRow,
  bounceToPage,
} from "../../helpers/utils";
import DBForm from "../../helpers/DBForm";
import { translateCode } from "../../helpers/language/translate";

const CourseModule = (props) => {
  const pageParentNavs = [
    { route: "/lms/courses", title: "Learning Courses" },
    {
      route: `/lms/course?course_id=${props.courseModuleData.course_id}`,
      title: "Course",
    },
  ];

  const [lessonFormSchema, setLessonFormSchema] = useState({}),
    [lessonRows, setLessonRows] = useState([...props.courseLessons]),
    [activeLesson, setActiveLesson] = useState(props.courseLessons[0] || {}),
    writeAccess = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"],
    deleteAccess = ["SUPERADMIN", "ADMIN"],
    iCanWrite = writeAccess.indexOf(props.userData.role) > -1,
    iCanDelete = deleteAccess && deleteAccess.indexOf(props.userData.role) > -1;

  const lessonFormFields = [
    "order",
    "name",
    "description",
    "content",
    "created_at",
    "updated_at",
  ];

  let pageNotif = "",
    pageNotifClass = "";

  useEffect(() => {
    checkAndShowIfError(props.error);

    getTableSchema("course_lesson", setLessonFormSchema);
  }, []);

  const updatePage = (record, isNewForm, isDelete, delItemID) => {
    setTableRow(
      lessonRows,
      setLessonRows,
      isDelete,
      delItemID
    )(record, isNewForm);
    setActiveLesson(isDelete ? {} : { ...record });
  };

  const handleLessonDelete = async (e) => {
    if (confirm(translateCode("confirm_delete_item"))) {
      let itemID = e.target.id.split("_").slice(-1)[0];
      const delData = await deleteTableRow("course_lesson", itemID);

      if (delData && delData.error && delData.message) {
        pageNotif = delData.message;
        pageNotifClass = "error";
      } else {
        updatePage(null, false, true, itemID); // Delete from UI
        pageNotif = translateCode("deleted");
        pageNotifClass = "success";
      }

      showToastAlert(pageNotif, pageNotifClass, 10);
    }
  };

  return (
    <Layout
      pageTitle={`Module: ${props.courseModuleData.name}`}
      userData={props.userData}
      parentNavs={pageParentNavs}
    >
      <div className="">
        <div></div>
        <div className="row">
          <div className="col-xs-7 col-md-9 order-md-2 ">
            <h5 className="card-title mt-0">
              {(activeLesson && activeLesson.name) || ""}
            </h5>
            <div className="card lesson-content-wrapper bg-white">
              <div className="lesson-top pr-3 pt-2">
                {iCanWrite && activeLesson && activeLesson.id ? (
                  <Modal
                    openBtnIconClass="fa fa-pencil"
                    openBtnSize="lg"
                    preModalTitle={`Edit LESSON:`}
                    modalTitle={activeLesson.name}
                    modalSize="xl"
                    enforceFocus={false}
                  >
                    {(closeModal) => (
                      <DBForm
                        tableName="course_lesson"
                        formSchema={lessonFormSchema}
                        rowData={activeLesson}
                        setTableRow={updatePage}
                        afterSuccess={closeModal}
                        formFields={lessonFormFields}
                        editorField="content"
                      />
                    )}
                  </Modal>
                ) : (
                  ""
                )}
              </div>
              <div
                className="lesson-content bg-white text-dark p-2"
                dangerouslySetInnerHTML={{
                  __html: (activeLesson && activeLesson.content) || "",
                }}
              ></div>
              <div className="lesson-bottom pr-3 pt-2">
                {iCanDelete && activeLesson && activeLesson.id ? (
                  <a
                    id={`delitem_id_${activeLesson.id}`}
                    className="del-button text-danger"
                    title="Delete"
                    onClick={handleLessonDelete}
                  >
                    <i
                      id={`item_icon_${activeLesson.id}`}
                      className="fa fa-times-circle-o fa-lg"
                    />
                  </a>
                ) : (
                  ""
                )}
              </div>
            </div>
            <div className="card lesson-description">
              <div className="card-body pt-1">
                <p className="card-text">
                  {(activeLesson && activeLesson.description) || ""}
                </p>
              </div>
            </div>
          </div>
          <div className="col-xs-5 col-md-3 order-md-1 sub-nav">
            <CourseLessons
              lessonFormFields={lessonFormFields}
              lessonRows={lessonRows}
              setActiveLesson={setActiveLesson}
              activeLesson={activeLesson}
              updatePage={updatePage}
              preloads={{ course_id: props.courseModuleData.course_id }}
              writeAccess={["SUPERADMIN", "ADMIN", "HOD", "STAFF"]}
              userData={props.userData}
            />
            <ModuleTestLink
              module={props.courseModuleData}
              preloads={{ course_id: props.courseModuleData.course_id }}
              writeAccess={["SUPERADMIN", "ADMIN", "HOD", "STAFF"]}
              userData={props.userData}
            />
          </div>
        </div>
      </div>
      <style jsx>{`
        .lesson-content-wrapper {
          min-height: 440px;
          position: relative;
        }
        .lesson-top {
          position: absolute;
          top: 0;
          right: 1%;
        }
        .lesson-bottom {
          position: absolute;
          bottom: 5%;
          right: 1%;
        }
        .lesson-content {
          position: absolute;
          top: 5%;
          left: 7%;
          right: 7%;
          width: 86%;
          height: 90%;
          overflow-y: scroll;
        }

        a.del-button:hover {
          cursor: pointer !important;
        }

        .text-danger {
          color: pink !important;
        }

        .lesson-content iframe {
          display: block;
          margin-left: auto !important;
          margin-right: auto !important;
        }

        @media screen and (max-width: 1140px) {
          .lesson-content-wrapper {
          }
        }
        h3 {
          margin-bottom: 0;
        }
      `}</style>
    </Layout>
  );
};

CourseModule.getInitialProps = async ({ req, res, query }) => {
  // If not explicitly using legacy=1, send users to the new App Router page
  if (!(query && query.legacy === "1")) {
    const params = new URLSearchParams(query || {});
    params.delete("legacy");
    const qs = params.toString();
    bounceToPage(`/lms/course-module-v2${qs ? `?${qs}` : ""}`, res);
    return {};
  }

  const allowedRoles = ["SUPERADMIN", "ADMIN", "HOD", "STAFF", "STUDENT"];
  const { token, role, userId, userData } = protectPage(req, res, allowedRoles);

  const lineage = ["course_lesson", "course_test"];
  const [courseLessons, courseModuleData, error] = await getTableData(
    "course_lesson",
    "course_module_id",
    query,
    lineage,
    true,
    req
  );

  return { courseModuleData, courseLessons, userData, error };
};

export default CourseModule;
