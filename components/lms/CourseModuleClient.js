"use client";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useState as useStateForModal,
} from "react";
import { toast } from "react-hot-toast";
import DBForm from "../../helpers/DBForm";
import { translateCode } from "../../helpers/language/translate";
import { deleteTableRow, showToastAlert } from "../../helpers/utils";
import Modal from "../Modal";
import ModuleTestLink from "../ModuleTestLink";
import AIAssistant from "./AIAssistant";
export default function CourseModuleClient({
  courseModuleData,
  courseLessons,
  userData,
  error,
  lessonFormSchema,
  updatePageServer, // optional noop placeholder
}) {
  const [lessonRows, setLessonRows] = useState([...courseLessons]);
  const [activeLesson, _setActiveLesson] = useState(courseLessons[0] || {});

  const writeAccess = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const deleteAccess = ["SUPERADMIN", "ADMIN"];
  const iCanWrite = writeAccess.indexOf(userData.role) > -1;
  const iCanDelete = deleteAccess && deleteAccess.indexOf(userData.role) > -1;

  const moduleId = courseModuleData?.id || courseModuleData?.course_id;

  const [progress, setProgress] = useState({
    completed: new Set(),
    lastLessonId: null,
  });
  const [showAssistant, setShowAssistant] = useState(false);
  const [selectionPopover, setSelectionPopover] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
  });
  const contentRef = useRef(null);

  const saveProgress = useCallback(
    async (p) => {
      try {
        const toSave = {
          completed_lessons: Array.from(p.completed || []),
          last_lesson_id: p.lastLessonId || null,
          current_lesson_id: p.lastLessonId || null,
        };

        await fetch(`/api/module-progress/${moduleId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(toSave),
        });
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    },
    [moduleId]
  );

  const loadProgress = useCallback(async () => {
    try {
      const response = await fetch(`/api/module-progress/${moduleId}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        return {
          completed: new Set(data.completed || []),
          lastLessonId: data.lastLessonId || null,
        };
      }
    } catch (error) {
      console.error("Error loading progress:", error);
    }

    return { completed: new Set(), lastLessonId: null };
  }, [moduleId]);

  const selectLesson = useCallback(
    (lesson) => {
      _setActiveLesson(lesson || {});
      setProgress((prev) => {
        const next = {
          ...prev,
          completed: new Set(prev.completed),
          lastLessonId: lesson?.id || null,
        };
        saveProgress(next); // This is now async but we don't need to wait
        return next;
      });
    },
    [saveProgress]
  );

  useEffect(() => {
    const initializeProgress = async () => {
      const p = await loadProgress();
      const last = lessonRows.find((l) => l.id === p.lastLessonId);
      if (last) _setActiveLesson(last);
      else if (lessonRows[0]) _setActiveLesson(lessonRows[0]);
      setProgress(p);
    };

    initializeProgress();
  }, [moduleId, loadProgress, lessonRows]);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    const iframes = container.querySelectorAll("iframe");
    iframes.forEach((iframe) => {
      iframe.setAttribute("frameBorder", "0");
      iframe.style.border = "0";
      iframe.style.width = "100%";
      iframe.style.minHeight = "400px";
      iframe.style.height = "auto";
      iframe.style.maxWidth = "100%";

      if (!iframe.parentElement.classList.contains("video-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.className = "video-wrapper";
        wrapper.style.position = "relative";
        wrapper.style.width = "100%";
        wrapper.style.paddingBottom = "56.25%"; // 16:9 aspect ratio
        wrapper.style.height = "0";
        wrapper.style.marginBottom = "20px";

        iframe.parentElement.insertBefore(wrapper, iframe);
        wrapper.appendChild(iframe);

        // Style the iframe inside the wrapper
        iframe.style.position = "absolute";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
      }
    });
  }, [activeLesson?.id]);

  useEffect(() => {
    const handleSelection = () => {
      // Small delay to ensure selection is complete
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
          setSelectionPopover((s) => ({ ...s, visible: false }));
          return;
        }

        const range = sel.getRangeAt(0);
        const text = sel.toString().trim();

        // Check if selection is within lesson content and is meaningful
        if (
          !text ||
          text.length < 3 ||
          !contentRef.current ||
          !contentRef.current.contains(range.commonAncestorContainer)
        ) {
          setSelectionPopover((s) => ({ ...s, visible: false }));
          return;
        }

        const rect = range.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top - 50; // Position above selection

        setSelectionPopover({ visible: true, x, y, text });
      }, 100);
    };

    const hidePopover = (e) => {
      // Don't hide if clicking on the popover itself
      if (e.target.closest(".selection-popover")) {
        return;
      }
      setSelectionPopover((s) => ({ ...s, visible: false }));
    };

    // Use mouseup instead of selectionchange for better control
    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("click", hidePopover);

    return () => {
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("click", hidePopover);
    };
  }, []);

  const updatePage = (record, isNewForm, isDelete, delItemID) => {
    // Keep same API as pages version
    setLessonRows((rows) => {
      const idx = rows.findIndex((r) => r.id === (record?.id || delItemID));
      let newRows = [...rows];
      if (isDelete) newRows = rows.filter((r) => r.id !== Number(delItemID));
      else if (idx > -1 && record) newRows[idx] = record;
      else if (record) newRows.push(record);
      return newRows;
    });
    _setActiveLesson(isDelete ? {} : { ...record });

    if (isDelete && delItemID) {
      setProgress((prev) => {
        const nextCompleted = new Set(prev.completed);
        nextCompleted.delete(Number(delItemID));
        const next = {
          completed: nextCompleted,
          lastLessonId:
            prev.lastLessonId === Number(delItemID) ? null : prev.lastLessonId,
        };
        saveProgress(next); // This is now async but we don't need to wait
        return next;
      });
    }
  };

  const handleLessonDelete = async (e) => {
    if (!e?.target?.id) return;
    if (confirm(translateCode("confirm_delete_item"))) {
      const itemID = e.target.id.split("_").slice(-1)[0];
      const delData = await deleteTableRow("course_lesson", itemID);
      if (delData && delData.error && delData.message) {
        showToastAlert(delData.message, "error", 10);
      } else {
        updatePage(null, false, true, itemID);
        showToastAlert(translateCode("deleted"), "success", 10);
      }
    }
  };

  const totalLessons = lessonRows?.length || 0;
  const isCompleted = activeLesson?.id
    ? progress.completed.has(activeLesson.id)
    : false;
  const percent = totalLessons
    ? Math.round((progress.completed.size / totalLessons) * 100)
    : 0;

  const toggleComplete = () => {
    if (!activeLesson?.id) return;
    setProgress((prev) => {
      const completed = new Set(prev.completed);
      if (completed.has(activeLesson.id)) completed.delete(activeLesson.id);
      else completed.add(activeLesson.id);
      const next = { completed, lastLessonId: activeLesson.id };
      saveProgress(next); // This is now async but we don't need to wait
      return next;
    });
  };

  const gotoByOffset = (offset) => {
    if (!activeLesson?.id) return;
    const idx = lessonRows.findIndex((l) => l.id === activeLesson.id);
    if (idx === -1) return;

    // Auto-complete current lesson when moving to next lesson (offset > 0)
    if (offset > 0 && !progress.completed.has(activeLesson.id)) {
      setProgress((prev) => {
        const completed = new Set(prev.completed);
        completed.add(activeLesson.id);
        const next = { completed, lastLessonId: activeLesson.id };
        saveProgress(next); // This is now async but we don't need to wait
        return next;
      });
    }

    const next = lessonRows[idx + offset];
    if (next) selectLesson(next);
  };
  const continueLearning = () => {
    if (!progress.lastLessonId) return;
    const last = lessonRows.find((l) => l.id === progress.lastLessonId);
    if (last) selectLesson(last);
  };

  const openEditModal = (lesson) => {
    const content = (
      <DBForm
        tableName="course_lesson"
        rowData={lesson}
        setTableRow={updatePage}
        afterSuccess={() => {
          toast.success("Lesson updated successfully");
        }}
        formFields={[
          "order",
          "name",
          "description",
          "content",
          "created_at",
          "updated_at",
        ]}
        editorField="content"
      />
    );

    // Note: This modal functionality has been removed as it was using react-popupbox
    // Consider using the Modal component from components/Modal.js instead
    console.log("Modal functionality removed - use Modal component instead");
  };
  return (
    <div className="learning-container">
      {/* Course Header */}
      <div className="course-header">
        <div className="course-info">
          <Link
            href={`/course?course_id=${courseModuleData.course_id}`}
            className="course-label-link"
          >
            <i className="fa fa-arrow-left mr-1" />
            <span className="course-label"> Course</span>
          </Link>
          <h1 className="course-title">{courseModuleData.name}</h1>
        </div>
        <div className="course-actions">
          <Link
            href={`/discussion-topic?course_id=${courseModuleData.course_id}`}
            title="Discussions"
          >
            <div className="btn-icon discussions-btn">
              <i className="fa fa-comments" />
              <span>Discussions</span>
            </div>
          </Link>
          <Link
            href={`/course-forum?course_id=${courseModuleData.course_id}`}
            title="Course Forum"
          >
            <div className="btn-icon forum-btn">
              <i className="fa fa-users" />
              <span>Forum</span>
            </div>
          </Link>
          <button
            className="btn-icon ai-assistant-btn"
            onClick={() => setShowAssistant(true)}
            title="AI Learning Assistant"
          >
            <i className="fa fa-magic" />
            <span>AI Assistant</span>
          </button>
        </div>
      </div>

      <div className="learning-layout">
        {/* Sidebar Navigation */}
        <div className="sidebar">
          <div className="progress-section">
            <div className="progress-header">
              <span className="progress-text">Lesson progress: {percent}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>

          {/* Course Structure */}
          <div className="course-structure">
            <div className="structure-header">
              <h3>Lessons</h3>
              <span className="lesson-count">
                {progress.completed.size}/{lessonRows.length}
              </span>
              {iCanWrite && (
                <>
                  <Modal
                    openBtnTitle={"Add Lesson"}
                    modalTitle="Add New Lesson"
                    modalSize="xl"
                    enforceFocus={false}
                    customTrigger={
                      <button
                        className="icon-btn add-lesson-btn"
                        title="Add lesson"
                        style={{ marginLeft: 8 }}
                      >
                        <i className="fa fa-plus" />
                      </button>
                    }
                  >
                    <DBForm
                      tableName="course_lesson"
                      setTableRow={updatePage}
                      afterSuccess={() => {
                        closeModal();
                        setShowAddLessonModal(false);
                      }}
                      formFields={lessonFormSchema}
                      editorField="content"
                      numTableRows={lessonRows.length}
                      formSchema={lessonFormSchema}
                    />
                  </Modal>
                </>
              )}
            </div>

            <div className="lessons-list">
              {lessonRows.map((lesson, index) => {
                const isActive = activeLesson?.id === lesson.id;
                const isComplete = progress.completed.has(lesson.id);

                return (
                  <div key={lesson.id}>
                    <div
                      className={`lesson-item ${isActive ? "active" : ""} ${
                        isComplete ? "completed" : ""
                      }`}
                      onClick={() => selectLesson(lesson)}
                    >
                      <div className="lesson-status">
                        {isComplete ? (
                          <i className="fa fa-check-circle completed-icon" />
                        ) : isActive ? (
                          <i className="fa fa-play-circle active-icon" />
                        ) : (
                          <i className="fa fa-circle-o pending-icon" />
                        )}
                      </div>
                      <div className="lesson-details">
                        <span className="lesson-name">{lesson.name}</span>
                        <span className="lesson-duration">15 min</span>
                      </div>
                      {iCanWrite && (
                        <button
                          className="edit-lesson-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(lesson);
                          }}
                          title="Edit lesson"
                        >
                          <i className="fa fa-pencil" />
                        </button>
                      )}
                    </div>
                    {/* Render lesson tests below each lesson */}
                    {lesson.course_tests && lesson.course_tests.length > 0 && (
                      <div
                        className="lesson-tests-list"
                        style={{
                          marginLeft: 6,
                          marginTop: 6,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        {lesson.course_tests.map((test, j) => (
                          <div
                            key={`test${test.id || j}`}
                            className="lesson-test-item"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              background: "#f1f5f9",
                              borderRadius: 6,
                              padding: "6px 10px",
                              border: "1px solid #e2e8f0",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                width: "100%",
                              }}
                            >
                              <Link
                                href={`/lms/immersive-test?course_test_id=${test.id}`}
                                legacyBehavior
                              >
                                <a
                                  title={test.name}
                                  style={{
                                    color: "#3b82f6",
                                    fontSize: 14,
                                    fontWeight: 500,
                                    textDecoration: "none",
                                    flex: 1,
                                  }}
                                >
                                  {test.format ? test.format.toUpperCase() : ""}
                                  {test.format ? ": " : ""}
                                  {test.name}
                                </a>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {courseModuleData?.course_tests &&
              courseModuleData.course_tests.length > 0 && (
                <div className="module-tests-section" style={{ marginTop: 32 }}>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#1e293b",
                      marginBottom: 12,
                    }}
                  >
                    Module Tests
                  </h3>
                  <div
                    className="module-tests-list"
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {courseModuleData.course_tests.map((test, idx) => (
                      <div
                        key={test.id || idx}
                        className="module-test-item"
                        style={{
                          background: "#f1f5f9",
                          borderRadius: 8,
                          padding: "10px 12px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ fontWeight: 500, color: "#1e293b" }}>
                          {test.name || "Untitled Test"}
                        </div>
                        {test.type && (
                          <div style={{ fontSize: 13, color: "#64748b" }}>
                            <b>Type:</b> {test.type}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Module Test Link */}
          <ModuleTestLink
            module={courseModuleData}
            preloads={{ course_id: courseModuleData.course_id }}
            writeAccess={writeAccess}
            userData={userData}
          />
        </div>

        {/* Main Content Area */}
        <div className="main-content">
          <div className="lesson-header">
            {/* <span className="lesson-type">Text lesson</span> */}
            <h2 className="lesson-title">
              {(activeLesson && activeLesson.name) || "Select a lesson"}
            </h2>
          </div>

          <div className="lesson-content-container">
            {selectionPopover.visible && (
              <div
                className="selection-popover"
                style={{
                  left: selectionPopover.x,
                  top: selectionPopover.y,
                  position: "fixed",
                  transform: "translateX(-50%)",
                  zIndex: 1000,
                }}
              >
                <button
                  className="btn btn-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAssistant(true);
                    // Clear selection after opening assistant
                    setTimeout(() => {
                      setSelectionPopover((s) => ({ ...s, visible: false }));
                    }, 100);
                  }}
                  title="Summarize selection"
                >
                  <i className="fa fa-align-left" /> Summarize
                </button>
                <button
                  className="btn btn-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAssistant(true);
                    // Clear selection after opening assistant
                    setTimeout(() => {
                      setSelectionPopover((s) => ({ ...s, visible: false }));
                    }, 100);
                  }}
                  title="Ask about selection"
                >
                  <i className="fa fa-question-circle" /> Ask
                </button>
              </div>
            )}

            <div
              ref={contentRef}
              className="lesson-content"
              dangerouslySetInnerHTML={{
                __html:
                  (activeLesson && activeLesson.content) ||
                  "<p>Select a lesson from the sidebar to begin learning.</p>",
              }}
            />

            {activeLesson?.description && (
              <div className="lesson-description">
                <h4>Lesson Summary</h4>
                <p>{activeLesson.description}</p>
              </div>
            )}

            {/* Lesson Navigation Footer */}
            <div className="lesson-footer">
              <div className="footer-content">
                <div className="completion-section">
                  <button
                    className={`completion-btn ${
                      isCompleted ? "completed" : ""
                    }`}
                    onClick={toggleComplete}
                    disabled={!activeLesson?.id}
                  >
                    {isCompleted ? (
                      <>
                        <i className="fa fa-check" />
                        Completed
                      </>
                    ) : (
                      <>
                        <i className="fa fa-circle-o" />
                        Mark as completed
                      </>
                    )}
                  </button>
                </div>

                <div className="navigation-section">
                  <button
                    className="nav-btn prev-btn"
                    onClick={() => gotoByOffset(-1)}
                    disabled={
                      !activeLesson?.id ||
                      lessonRows.findIndex((l) => l.id === activeLesson.id) <= 0
                    }
                  >
                    <i className="fa fa-arrow-left" />
                  </button>

                  <button
                    className="nav-btn next-btn primary"
                    onClick={() => gotoByOffset(1)}
                    disabled={
                      !activeLesson?.id ||
                      lessonRows.findIndex((l) => l.id === activeLesson.id) >=
                        lessonRows.length - 1
                    }
                  >
                    Next
                    <i className="fa fa-arrow-right" />
                  </button>
                </div>
              </div>

              {iCanDelete && activeLesson && activeLesson.id && (
                <button
                  id={`delitem_id_${activeLesson.id}`}
                  className="delete-btn"
                  title="Delete lesson"
                  onClick={handleLessonDelete}
                >
                  <i
                    id={`item_icon_${activeLesson.id}`}
                    className="fa fa-trash"
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Assistant Modal (using new component) */}
      {showAssistant && (
        <div className="assistant-overlay" role="dialog" aria-modal="true">
          <AIAssistant
            courseData={courseModuleData}
            currentModuleId={moduleId}
            currentLessonId={activeLesson?.id}
            student={userData}
            selectedText={
              selectionPopover.visible ? selectionPopover.text : null
            }
            onClose={() => {
              setShowAssistant(false);
              setSelectionPopover((s) => ({ ...s, visible: false }));
            }}
          />
        </div>
      )}

      <style jsx>{`
        .icon-btn.add-lesson-btn {
          background: #e0f2fe;
          border: 1px solid #38bdf8;
          color: #0ea5e9;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .icon-btn.add-lesson-btn:hover {
          background: #bae6fd;
          border-color: #0ea5e9;
          color: #0284c7;
        }
        .learning-container {
          max-width: 1200px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
        }

        .course-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }

        .course-info .course-label {
          font-size: 14px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
        }

        .course-label-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: #64748b;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
          padding: 6px 12px;
          border-radius: 6px;
          transition: all 0.2s ease;
          margin-bottom: 4px;
        }

        .course-label-link:hover {
          background: #f1f5f9;
          color: #3b82f6;
          text-decoration: none;
        }

        .course-label-link .fa-arrow-left {
          font-size: 12px;
        }

        .course-title {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin: 4px 0 0 0;
        }

        .course-actions {
          display: flex;
          gap: 12px;
        }

        .btn-icon {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #475569;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
          font-weight: 500;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .btn-icon:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #475569;
          text-decoration: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }

        .btn-icon:active {
          transform: translateY(0);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .discussions-btn:hover {
          background: #eff6ff !important;
          border-color: #93c5fd !important;
          color: #2563eb !important;
        }

        .forum-btn:hover {
          background: #f0fdf4 !important;
          border-color: #86efac !important;
          color: #16a34a !important;
        }

        .ai-assistant-btn:hover {
          background: #fdf4ff !important;
          border-color: #e879f9 !important;
          color: #a21caf !important;
        }

        .learning-layout {
          display: flex;
          min-height: calc(100vh - 100px);
        }

        .sidebar {
          width: 300px;
          background: white;
          border-right: 1px solid #e2e8f0;
          padding: 24px;
          overflow-y: auto;
        }

        .progress-section {
          margin-bottom: 32px;
        }

        .progress-header {
          margin-bottom: 8px;
        }

        .progress-text {
          font-size: 14px;
          color: #475569;
          font-weight: 500;
        }

        .progress-bar {
          width: 100%;
          height: 6px;
          background: #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #3b82f6;
          transition: width 0.3s ease;
        }

        .course-structure {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
        }

        .structure-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .structure-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .lesson-count {
          font-size: 12px;
          color: #64748b;
          background: #e2e8f0;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .expand-btn {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
        }

        .lessons-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .lesson-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
          border: 1px solid transparent;
        }

        .lesson-item:hover {
          background: #f1f5f9;
          border-color: #e2e8f0;
        }

        .lesson-item.active {
          background: #eff6ff;
          border-color: #3b82f6;
        }

        .lesson-item.completed {
          background: #f0fdf4;
        }

        .lesson-status {
          flex-shrink: 0;
        }

        .completed-icon {
          color: #16a34a;
          font-size: 16px;
        }

        .active-icon {
          color: #3b82f6;
          font-size: 16px;
        }

        .pending-icon {
          color: #cbd5e1;
          font-size: 16px;
        }

        .lesson-details {
          flex: 1;
          min-width: 0;
        }

        .lesson-name {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lesson-duration {
          font-size: 12px;
          color: #64748b;
        }

        .edit-lesson-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 4px;
          color: #64748b;
          padding: 4px 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 12px;
          margin-left: auto;
        }

        .edit-lesson-btn:hover {
          background: #e2e8f0;
          color: #3b82f6;
        }

        .main-content {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          overflow-x: hidden;
          height: calc(100vh - 100px);
          max-height: calc(100vh - 100px);
        }

        .lesson-header {
          margin-bottom: 24px;
        }

        .lesson-type {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 500;
          margin-bottom: 8px;
          display: block;
        }

        .lesson-title {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
          line-height: 1.2;
        }

        .lesson-content-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: visible;
          margin-bottom: 24px;
        }

        .lesson-content {
          padding: 32px;
          font-size: 16px;
          line-height: 1.7;
          color: #374151;
          min-height: 400px;
          overflow-y: visible;
          word-wrap: break-word;
        }

        .lesson-content iframe {
          max-width: 100%;
          border: none;
        }

        .lesson-content .video-wrapper {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          height: 0;
          margin-bottom: 20px;
          overflow: hidden;
        }

        .lesson-content .video-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .lesson-content h1,
        .lesson-content h2,
        .lesson-content h3,
        .lesson-content h4,
        .lesson-content h5,
        .lesson-content h6 {
          color: #1e293b;
          margin-top: 32px;
          margin-bottom: 16px;
        }

        .lesson-content h1 {
          font-size: 24px;
        }
        .lesson-content h2 {
          font-size: 20px;
        }
        .lesson-content h3 {
          font-size: 18px;
        }

        .lesson-content p {
          margin-bottom: 16px;
        }

        .lesson-content ul,
        .lesson-content ol {
          margin-bottom: 16px;
          padding-left: 24px;
        }

        .lesson-content li {
          margin-bottom: 8px;
        }

        .lesson-description {
          padding: 24px 32px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }

        .lesson-description h4 {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .lesson-description p {
          color: #64748b;
          margin: 0;
          line-height: 1.6;
        }

        .lesson-footer {
          padding: 24px 32px;
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
          position: relative;
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .completion-section {
          flex: 1;
        }

        .completion-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .completion-btn:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .completion-btn.completed {
          background: #dcfce7;
          border-color: #16a34a;
          color: #16a34a;
        }

        .completion-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .navigation-section {
          display: flex;
          gap: 12px;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          color: #475569;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .nav-btn.primary {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .nav-btn.primary:hover {
          background: #2563eb;
          border-color: #2563eb;
        }

        .nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .delete-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #dc2626;
          padding: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .delete-btn:hover {
          background: #fecaca;
          border-color: #f87171;
        }

        .selection-popover {
          position: absolute;
          transform: translate(-50%, -100%);
          background: #111827;
          color: #fff;
          padding: 6px 8px;
          border-radius: 8px;
          display: flex;
          gap: 6px;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
          z-index: 5;
        }

        .selection-popover .btn {
          color: #fff;
          background: transparent;
          border: none;
          font-size: 12px;
          padding: 2px 6px;
        }

        .selection-popover .btn:hover {
          text-decoration: underline;
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .learning-layout {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #e2e8f0;
            padding: 16px;
          }

          .main-content {
            padding: 16px;
          }

          .lesson-content {
            padding: 24px;
          }

          .lesson-footer {
            padding: 16px 24px;
          }

          .footer-content {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .navigation-section {
            justify-content: space-between;
          }
        }

        @media (max-width: 640px) {
          .course-header {
            padding: 16px;
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .course-title {
            font-size: 24px;
          }

          .lesson-title {
            font-size: 24px;
          }

          .lesson-content {
            padding: 16px;
          }

          .lesson-footer {
            padding: 16px;
          }

          .nav-btn {
            padding: 10px 16px;
            font-size: 13px;
          }
        }

        /* AI Assistant Overlay */
        .assistant-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }
      `}</style>
    </div>
  );
}
