"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Clock,
  CheckSquare,
  Circle,
  Check,
  ArrowLeft,
  ArrowRight,
  Flag,
  Eye,
  RotateCcw,
  Paperclip,
} from "lucide-react";
import { translateCode } from "../helpers/language/translate";
// import CountdownClock from "./CountdownClock";

const API_URL = process.env.API_URL;
const defaultFontFamily =
  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif';

export default function ImmersiveQuiz({
  // State for attempt history modal

  courseTest,
  courseQuestions = [],
  pastAttempts = [],
  userData,
  currentURL,
}) {
  // State management
  // Check if deadline has passed
  const deadlinePassed =
    courseTest?.deadline && new Date() > new Date(courseTest.deadline);
  const [showAttemptHistory, setShowAttemptHistory] = useState(false);
  const [questions, setQuestions] = useState([...courseQuestions]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("instructions");
  const [unfinishedTest, setUnfinishedTest] = useState(null);
  const [bestAttempt, setBestAttempt] = useState(null);

  // LocalStorage key for quiz progress
  const localStorageKey = `immersiveQuizProgress_${courseTest?.id}`;

  // Restore progress from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(localStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.answers && parsed.currentQuestion !== undefined) {
          setAnswers(parsed.answers);
          setCurrentQuestion(parsed.currentQuestion);
          setFlaggedQuestions(new Set(parsed.flaggedQuestions || []));
          setTimeRemaining(parsed.timeRemaining || 0);
        }
      } catch (e) {}
    }
  }, [courseTest?.id]);

  // Save progress to localStorage on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentScreen === "quiz") {
      localStorage.setItem(
        localStorageKey,
        JSON.stringify({
          answers,
          currentQuestion,
          flaggedQuestions: Array.from(flaggedQuestions),
          timeRemaining,
        })
      );
    }
  }, [
    answers,
    currentQuestion,
    flaggedQuestions,
    timeRemaining,
    currentScreen,
  ]);

  // Clear localStorage when test starts or finishes
  const clearLocalStorageProgress = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(localStorageKey);
    }
  };

  // Process past attempts (copied from learning-test.js logic)
  useEffect(() => {
    if (pastAttempts && pastAttempts.length) {
      const currentDatetime = new Date();
      let bestScore = null;
      let unfinished = null;
      let numFinishes = 0;

      pastAttempts.forEach((pastAttempt) => {
        const pastAttemptEndtime = new Date(pastAttempt.endtime);

        if (!bestScore || pastAttempt.score > bestScore.score) {
          bestScore = pastAttempt;
        }

        if (!pastAttempt.submitted_at && currentDatetime < pastAttemptEndtime) {
          unfinished = pastAttempt;
          unfinished.secsLeft = Math.floor(
            (new Date(unfinished.endtime).getTime() -
              currentDatetime.getTime()) /
              1000
          );
        } else {
          numFinishes += 1;
        }
      });

      setBestAttempt(bestScore);
      setUnfinishedTest(unfinished);

      if (unfinished) {
        setTimeRemaining(unfinished.secsLeft);
        setCurrentScreen("quiz");
      } else if (bestScore?.submitted_at) {
        setCurrentScreen("completed");
      }
    }
  }, [pastAttempts]);

  // Timer logic
  useEffect(() => {
    if (timeRemaining > 0 && !isQuizComplete && currentScreen === "quiz") {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && currentScreen === "quiz") {
      handleAutoSubmit();
    }
  }, [timeRemaining, isQuizComplete, currentScreen]);

  // Update selected answer when question changes
  useEffect(() => {
    setSelectedAnswer(answers[currentQuestion] ?? null);
  }, [currentQuestion, answers]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Helper function to get question type from backend
  const getQuestionType = (question) => {
    if (!question?.options) return "assignment";

    // Use question_type field from backend
    return question.question_type || "multiple";
  };

  const handleAnswerSelect = (answerValue) => {
    const currentQ = questions[currentQuestion];

    if (courseTest.format === "quiz" && currentQ.options) {
      const questionType = getQuestionType(currentQ);

      if (questionType === "multiple") {
        // Multiple choice - allow multiple selections
        const currentAnswers = Array.isArray(selectedAnswer)
          ? selectedAnswer
          : [];
        let newAnswers = currentAnswers.includes(answerValue)
          ? currentAnswers.filter((a) => a !== answerValue)
          : [...currentAnswers, answerValue];

        setSelectedAnswer(newAnswers);
        setAnswers((prev) => ({ ...prev, [currentQuestion]: newAnswers }));
      } else {
        // Single choice - only one selection allowed
        setSelectedAnswer(answerValue);
        setAnswers((prev) => ({ ...prev, [currentQuestion]: answerValue }));
      }
    } else if (courseTest.format === "assignment") {
      setSelectedAnswer(answerValue);
      setAnswers((prev) => ({ ...prev, [currentQuestion]: answerValue }));
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setCurrentScreen("pre-review");
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion)) {
        newSet.delete(currentQuestion);
      } else {
        newSet.add(currentQuestion);
      }
      return newSet;
    });
  };

  // Use existing API logic from learning-test.js
  const handleTestStart = async () => {
    clearLocalStorageProgress();
    const postData = {
      course_test_id: courseTest?.id,
    };

    const response = await fetch(`${API_URL}/api/studenttest/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=utf-8",
      },
      credentials: "include",
      body: JSON.stringify(postData),
    });

    if (response.ok) {
      const result = await response.json();
      if (result && result.id) {
        setTimeRemaining((courseTest?.duration_mins || 60) * 60);
        setCurrentScreen("quiz");
        toast.success("Test started successfully!");
      } else if (result && result.pageNotif) {
        const pageNotif = translateCode(result.pageNotif);
        toast.error(pageNotif);
      }
    }
  };

  const handleTestFinish = async () => {
    clearLocalStorageProgress();
    const questionsAnswers = [];

    questions.forEach((questionRow, index) => {
      const userAnswer = answers[index];
      let selection = {};

      if (courseTest.format === "quiz" && questionRow.options) {
        Object.entries(questionRow.options).forEach(([optionKey, option]) => {
          if (!option.text) return;

          if (Array.isArray(userAnswer)) {
            selection[optionKey] = {
              is_answer: userAnswer.includes(optionKey),
            };
          } else {
            selection[optionKey] = { is_answer: userAnswer === optionKey };
          }
        });

        questionsAnswers.push({
          questionId: questionRow.id,
          selection: selection,
        });
      } else if (courseTest.format === "assignment") {
        questionsAnswers.push({
          questionId: questionRow.id,
          text_answer: userAnswer?.text || userAnswer || "",
          file_answer: userAnswer?.file || "",
        });
      }
    });

    const response = await fetch(`${API_URL}/api/studenttest/finish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        student_test_id: unfinishedTest?.id,
        questions_answers: questionsAnswers,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      if (result && result.id) {
        setIsQuizComplete(true);
        setCurrentScreen("final-results");
        toast.success("Test submitted successfully!");
        // Reload page to get updated results
        setTimeout(() => window.location.reload(), 2000);
      } else if (result && result.pageNotif) {
        const pageNotif = translateCode(result.pageNotif);
        toast.error(pageNotif);
      }
    }
  };

  const handleAutoSubmit = () => {
    toast.loading("Time's up! Auto-submitting test...");
    handleTestFinish();
  };

  const goToQuestion = (questionIndex) => {
    setCurrentQuestion(questionIndex);
    setCurrentScreen("quiz");
  };

  // Check permissions (from learning-test.js)
  const writeAccess = ["SUPERADMIN", "ADMIN", "HOD", "STAFF"];
  const iCanWrite = writeAccess.indexOf(userData.role) > -1;
  const iCanTakeTest = userData.role === "STUDENT";
  const isOffline = courseTest.format === "offline";

  const progressPercentage = questions.length
    ? ((currentQuestion + 1) / questions.length) * 100
    : 0;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flaggedQuestions.size;

  // Instructions Screen
  if (currentScreen === "instructions") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #e6e9e6 0%, #cfd9df 100%)", // soft gray/blue gradient
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: defaultFontFamily,
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            width: "100%",
            background: "rgba(245, 245, 240, 0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid #e0e0e0",
            color: "#2d2d2d",
            padding: "40px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: "bold",
                marginBottom: "16px",
                color: "#2d2d2d",
              }}
            >
              {courseTest.name}
            </h1>
            <p style={{ fontSize: "1.25rem", opacity: 0.8, color: "#444" }}>
              Read instructions carefully before starting
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  marginBottom: "16px",
                }}
              >
                Test Information
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ opacity: 0.8 }}>Format:</span>
                  <span
                    style={{ fontWeight: "500", textTransform: "capitalize" }}
                  >
                    {courseTest.format}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ opacity: 0.8 }}>Duration:</span>
                  <span style={{ fontWeight: "500" }}>
                    {courseTest.duration_mins} minutes
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ opacity: 0.8 }}>Questions:</span>
                  <span style={{ fontWeight: "500" }}>{questions.length}</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ opacity: 0.8 }}>Max Score:</span>
                  <span style={{ fontWeight: "500" }}>
                    {courseTest.max_score}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ opacity: 0.8 }}>Attempts:</span>
                  <span style={{ fontWeight: "500" }}>
                    {courseTest.max_attempts}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ opacity: 0.8 }}>Deadline:</span>
                  <span style={{ fontWeight: "500" }}>
                    {new Date(courseTest.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "12px",
                padding: "24px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  marginBottom: "16px",
                }}
              >
                Instructions
              </h3>
              <div
                style={{
                  opacity: 0.9,
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.6",
                }}
              >
                {courseTest.instructions ||
                  "Complete all questions within the time limit."}
              </div>
            </div>
          </div>

          <div
            style={{ display: "flex", justifyContent: "center", gap: "16px" }}
          >
            {iCanTakeTest && !isOffline && !deadlinePassed && (
              <>
                {courseTest.format === "assignment" &&
                bestAttempt &&
                !bestAttempt.marked_by ? (
                  <div
                    style={{
                      background: "#fef3c7",
                      color: "#92400e",
                      border: "1px solid #f59e0b",
                      borderRadius: "8px",
                      padding: "16px 24px",
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      marginTop: "8px",
                      textAlign: "center",
                    }}
                  >
                    ⏳ You have a pending assignment submission waiting for
                    grading. Please wait for your instructor to grade it before
                    starting a new attempt.
                  </div>
                ) : (
                  <button
                    onClick={handleTestStart}
                    style={{
                      background: "linear-gradient(45deg, #7bb274, #a3c9a8)", // soft green gradient
                      border: "none",
                      color: "#2d2d2d",
                      padding: "12px 32px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "18px",
                      fontWeight: "600",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                      fontFamily: defaultFontFamily,
                    }}
                  >
                    Start Test →
                  </button>
                )}
              </>
            )}
            {iCanTakeTest && deadlinePassed && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  border: "1px solid #fca5a5",
                  borderRadius: "8px",
                  padding: "16px 24px",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  marginTop: "8px",
                  textAlign: "center",
                }}
              >
                The deadline for this test has passed. You can no longer start
                the test.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === "completed" && bestAttempt) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #e6e9e6 0%, #cfd9df 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: defaultFontFamily,
        }}
      >
        {/* Attempt History Modal Trigger */}
        {pastAttempts && pastAttempts.length > 0 && (
          <>
            {showAttemptHistory && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1000,
                }}
                onClick={() => setShowAttemptHistory(false)}
              >
                <div
                  style={{
                    background: "#222",
                    borderRadius: "12px",
                    padding: "32px",
                    minWidth: "340px",
                    maxWidth: "90vw",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                    color: "#fff",
                    position: "relative",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h2
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      marginBottom: "18px",
                    }}
                  >
                    Attempt History
                  </h2>
                  <button
                    onClick={() => setShowAttemptHistory(false)}
                    style={{
                      position: "absolute",
                      top: "16px",
                      right: "16px",
                      background: "rgba(59,130,246,0.2)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      padding: "4px 12px",
                    }}
                  >
                    &#10005;
                  </button>
                  <table
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "8px",
                      overflow: "hidden",
                      color: "#fff",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "rgba(59,130,246,0.15)" }}>
                        <th style={{ padding: "8px", textAlign: "left" }}>
                          Attempt
                        </th>
                        <th style={{ padding: "8px", textAlign: "left" }}>
                          Score
                        </th>
                        <th style={{ padding: "8px", textAlign: "left" }}>
                          Submitted
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastAttempts.map((attempt, idx) => (
                        <tr
                          key={attempt.id || idx}
                          style={{
                            borderBottom: "1px solid rgba(255,255,255,0.07)",
                          }}
                        >
                          <td style={{ padding: "8px" }}>{idx + 1}</td>
                          <td style={{ padding: "8px" }}>
                            {courseTest.format === "assignment" &&
                            !attempt.marked_by ? (
                              <span
                                style={{ color: "#f59e0b", fontWeight: "500" }}
                              >
                                Pending Grading
                              </span>
                            ) : (
                              `${attempt.score}/${courseTest.max_score}`
                            )}
                          </td>
                          <td style={{ padding: "8px" }}>
                            {attempt.submitted_at
                              ? new Date(attempt.submitted_at).toLocaleString()
                              : "Not submitted"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
        <div
          style={{
            maxWidth: "800px",
            width: "100%",
            background: "rgba(245, 245, 240, 0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid #e0e0e0",
            color: "#2d2d2d",
            padding: "40px",
            textAlign: "center",
            fontFamily: defaultFontFamily,
          }}
        >
          <h1
            style={{
              color: "#2d2d2d",
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "32px",
            }}
          >
            {courseTest.format === "assignment" && !bestAttempt.marked_by
              ? "Assignment Submitted"
              : "Test Completed"}
          </h1>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                background: "#e6f4ea",
                border: "1px solid #b7d7c9",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#5c8a5e",
                }}
              >
                {courseTest.format === "assignment" &&
                !bestAttempt.marked_by ? (
                  <span style={{ color: "#f59e0b", fontSize: "1.5rem" }}>
                    Pending Grading
                  </span>
                ) : (
                  `${bestAttempt.score}/${courseTest.max_score}`
                )}
              </div>
              <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>
                {courseTest.format === "assignment" && !bestAttempt.marked_by
                  ? "Status"
                  : "Your Score"}
              </div>
            </div>
            <div
              style={{
                background: "#e3eafc",
                border: "1px solid #b3c7e6",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#5a7ca8",
                }}
              >
                {courseTest.format === "assignment" &&
                !bestAttempt.marked_by ? (
                  <span style={{ color: "#f59e0b" }}>--</span>
                ) : (
                  `${Math.round(
                    (bestAttempt.score / courseTest.max_score) * 100
                  )}%`
                )}
              </div>
              <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>
                {courseTest.format === "assignment" && !bestAttempt.marked_by
                  ? "Grade"
                  : "Percentage"}
              </div>
            </div>
            <div
              style={{
                background: "#f3eafc",
                border: "1px solid #d1c7e6",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                  color: "#7c6ca8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {bestAttempt.submitted_at ? (
                  <Check size={32} style={{ color: "#9333ea" }} />
                ) : (
                  <span style={{ fontSize: "2rem" }}>✗</span>
                )}
              </div>
              <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>
                {bestAttempt.submitted_at ? "Submitted" : "Not Submitted"}
              </div>
            </div>
          </div>

          <div style={{ margin: "32px 0 0 0", textAlign: "center" }}>
            <div
              style={{
                fontSize: "1.1rem",
                color: "#22c55e",
                marginBottom: "8px",
              }}
            >
              {courseTest.format === "assignment" && !bestAttempt.marked_by
                ? "Assignment submitted successfully!"
                : "You submitted this test!"}
            </div>
            <div
              style={{
                fontSize: "1rem",
                color: "#2d2d2d",
                marginBottom: "8px",
              }}
            >
              On:{" "}
              {bestAttempt.submitted_at
                ? new Date(bestAttempt.submitted_at).toLocaleString()
                : "-"}
            </div>
            <div
              style={{
                fontSize: "1rem",
                color: "#2d2d2d",
                marginBottom: "8px",
              }}
            >
              {courseTest.format === "assignment" && !bestAttempt.marked_by ? (
                <span style={{ color: "#f59e0b" }}>
                  Status: Pending Grading
                </span>
              ) : (
                `Your best score: ${bestAttempt.score}/${courseTest.max_score}`
              )}
            </div>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "16px" }}
            >
              {pastAttempts &&
                pastAttempts.length < courseTest.max_attempts && (
                  <>
                    {courseTest.format === "assignment" &&
                    !bestAttempt.marked_by ? (
                      <div
                        style={{
                          background: "#fef3c7",
                          border: "1px solid #f59e0b",
                          color: "#92400e",
                          padding: "12px 24px",
                          borderRadius: "8px",
                          fontSize: "16px",
                          fontWeight: "500",
                          fontFamily: defaultFontFamily,
                        }}
                      >
                        ⏳ Waiting for grading...
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAnswers({});
                          setCurrentQuestion(0);
                          setCurrentScreen("instructions");
                          setUnfinishedTest(null);
                          setIsQuizComplete(false);
                        }}
                        style={{
                          background: "var(--info)",
                          border: "1px solid #e0e0e0",
                          color: "#2d2d2d",
                          padding: "12px 24px",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "16px",
                          fontWeight: "500",
                          fontFamily: defaultFontFamily,
                        }}
                      >
                        Try Again
                      </button>
                    )}
                  </>
                )}

              <button
                onClick={() => setShowAttemptHistory(true)}
                style={{
                  background: "var(--light)",
                  border: "1px solid #e0e0e0",
                  color: "#2d2d2d",
                  padding: "12px 24px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "500",
                  fontFamily: defaultFontFamily,
                }}
              >
                View Attempt History
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pre-Review Screen
  if (currentScreen === "pre-review") {
    const unansweredQuestions = questions.filter(
      (_, index) => answers[index] === undefined
    );

    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #e6e9e6 0%, #cfd9df 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: defaultFontFamily,
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            width: "100%",
            background: "rgba(245, 245, 240, 0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid #e0e0e0",
            color: "#2d2d2d",
            padding: "40px",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "24px",
                color: "#2d2d2d",
              }}
            >
              Review Your Answers
            </h1>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "16px",
              }}
            >
              <div
                style={{
                  background: "#e6f4ea",
                  border: "1px solid #b7d7c9",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {answeredCount}
                </div>
                <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                  Answered
                </div>
              </div>
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.2)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {questions.length - answeredCount}
                </div>
                <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                  Unanswered
                </div>
              </div>
              <div
                style={{
                  background: "#fbeee6",
                  border: "1px solid #e6c7b7",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {flaggedCount}
                </div>
                <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Flagged</div>
              </div>
              <div
                style={{
                  background: "rgba(147, 51, 234, 0.2)",
                  border: "1px solid rgba(147, 51, 234, 0.3)",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                  {formatTime(timeRemaining)}
                </div>
                <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                  Time Left
                </div>
              </div>
            </div>
          </div>

          {unansweredQuestions.length > 0 && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "12px",
                padding: "20px",
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  marginBottom: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                  <path d="M12 9v4" />
                  <path d="m12 17 .01 0" />
                </svg>
                Unanswered Questions
              </h3>
              <p style={{ opacity: 0.9, marginBottom: "16px" }}>
                You have {unansweredQuestions.length} unanswered question(s).
              </p>
            </div>
          )}

          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: "600",
                marginBottom: "16px",
              }}
            >
              Quick Navigation
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))",
                gap: "8px",
              }}
            >
              {questions.map((_, index) => {
                const isAnswered = answers[index] !== undefined;
                const isFlagged = flaggedQuestions.has(index);
                return (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    style={{
                      height: "48px",
                      position: "relative",
                      background: isAnswered
                        ? "#e5f9e5"
                        : "rgba(239, 68, 68, 0.2)",
                      border: isAnswered
                        ? "1px solid rgba(34, 197, 94, 0.4)"
                        : "1px solid rgba(239, 68, 68, 0.4)",
                      color: "white",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    Q{index + 1}
                    {isFlagged && (
                      <span
                        style={{
                          position: "absolute",
                          top: "-4px",
                          right: "-4px",
                          background: "#f59e0b",
                          borderRadius: "50%",
                          width: "12px",
                          height: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Flag size={6} style={{ color: "white" }} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{ display: "flex", justifyContent: "center", gap: "16px" }}
          >
            <button
              onClick={() => setCurrentScreen("quiz")}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid #e0e0e0",
                color: "#2d2d2d",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
                fontFamily: defaultFontFamily,
              }}
            >
              ← Back to Quiz
            </button>
            <button
              onClick={handleTestFinish}
              disabled={answeredCount === 0}
              style={{
                background:
                  answeredCount === 0
                    ? "#e0e0e0"
                    : "linear-gradient(45deg, #7bb274, #a3c9a8)",
                border: "none",
                color: "#2d2d2d",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: answeredCount === 0 ? "not-allowed" : "pointer",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              Submit Test →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Final Results Screen
  if (currentScreen === "final-results") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #e6e9e6 0%, #cfd9df 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          fontFamily: defaultFontFamily,
        }}
      >
        <div
          style={{
            maxWidth: "800px",
            width: "100%",
            background: "rgba(245, 245, 240, 0.8)",
            backdropFilter: "blur(20px)",
            borderRadius: "20px",
            border: "1px solid #e0e0e0",
            color: "#2d2d2d",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#2d2d2d",
            }}
          >
            Test Submitted Successfully!
          </h1>
          <p
            style={{
              fontSize: "1.25rem",
              opacity: 0.8,
              marginBottom: "32px",
              color: "#444",
            }}
          >
            {courseTest.format === "assignment"
              ? "Your assignment has been submitted for review."
              : "Your test has been graded automatically."}
          </p>

          <div
            style={{ display: "flex", justifyContent: "center", gap: "16px" }}
          >
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "linear-gradient(45deg, #7bb274, #a3c9a8)",
                border: "none",
                color: "#2d2d2d",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              <RotateCcw size={16} style={{ marginRight: "4px" }} />
              View Results
            </button>
            <button
              onClick={() =>
                (window.location.href = `/lms/course-module?course_module_id=${courseTest.course_module_id}`)
              }
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid #e0e0e0",
                color: "#2d2d2d",
                padding: "12px 24px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Quiz Interface
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e6e9e6 0%, #cfd9df 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: defaultFontFamily,
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          width: "100%",
          background: "rgba(245, 245, 240, 0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: "1px solid #e0e0e0",
          color: "#2d2d2d",
          padding: "32px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "1.25rem",
              fontWeight: "600",
            }}
          >
            <Clock size={20} style={{ color: "#2d2d2d" }} />
            {formatTime(timeRemaining)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={toggleFlag}
              style={{
                background: "transparent",
                border: "none",
                color: flaggedQuestions.has(currentQuestion)
                  ? "#b8860b"
                  : "#888",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <Flag
                size={16}
                style={{
                  color: flaggedQuestions.has(currentQuestion)
                    ? "#b8860b"
                    : "#888",
                }}
              />
              {flaggedQuestions.has(currentQuestion) ? "Flagged" : "Flag"}
            </button>
            <div style={{ fontSize: "0.875rem", fontWeight: "500" }}>
              Question {currentQuestion + 1} of {questions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            width: "100%",
            height: "8px",
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "4px",
            marginBottom: "24px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPercentage}%`,
              height: "100%",
              background: "linear-gradient(90deg, #a3c9a8, #b3c7e6)",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Question Navigator */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "4px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                border: "2px solid",
                borderColor:
                  index === currentQuestion
                    ? "white"
                    : answers[index] !== undefined
                    ? "rgba(34, 197, 94, 0.6)"
                    : "rgba(255, 255, 255, 0.3)",
                background:
                  index === currentQuestion
                    ? "#e6f4ea"
                    : answers[index] !== undefined
                    ? "#f5f5f0"
                    : "#e0e0e0",
                color: index === currentQuestion ? "#5c8a5e" : "#2d2d2d",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "600",
                transition: "all 0.2s ease",
                position: "relative",
                transform:
                  index === currentQuestion ? "scale(1.1)" : "scale(1)",
              }}
            >
              {index + 1}
              {flaggedQuestions.has(index) && (
                <span
                  style={{
                    position: "absolute",
                    top: "-2px",
                    right: "-2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Flag size={8} style={{ color: "#f59e0b" }} />
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Question Content */}
        <div style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "24px",
              lineHeight: "1.4",
              color: "#2d2d2d",
            }}
          >
            {questions[currentQuestion]?.question}
          </h2>

          {questions[currentQuestion]?.details && (
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                background: "rgba(59, 130, 246, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.3)",
                borderRadius: "12px",
                fontSize: "0.95rem",
                lineHeight: "1.6",
              }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: questions[currentQuestion].details,
                }}
              />
            </div>
          )}

          {/* Question Type Indicator & Answer Options */}
          {courseTest.format === "quiz" &&
          questions[currentQuestion]?.options ? (
            <div>
              {/* Question Type Indicator */}
              <div
                style={{
                  marginBottom: "16px",
                  padding: "8px 16px",
                  background:
                    getQuestionType(questions[currentQuestion]) === "multiple"
                      ? "#e3eafc"
                      : "#e6f4ea",
                  border: "1px solid",
                  borderColor:
                    getQuestionType(questions[currentQuestion]) === "multiple"
                      ? "#b3c7e6"
                      : "#b7d7c9",
                  borderRadius: "8px",
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.9)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {getQuestionType(questions[currentQuestion]) ===
                  "multiple" ? (
                    <CheckSquare size={16} style={{ color: "#2d2d2d" }} />
                  ) : (
                    <Circle size={16} style={{ color: "#2d2d2d" }} />
                  )}
                  <span style={{ color: "var(--gray)", fontWeight: "500" }}>
                    {getQuestionType(questions[currentQuestion]) === "multiple"
                      ? "Multiple Choice: Select all that apply"
                      : "Single Choice: Select one option"}
                  </span>
                </div>
              </div>

              {/* Answer Options */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {Object.entries(questions[currentQuestion].options)
                  .filter(
                    ([key, option]) => option.text && option.text.trim() !== ""
                  )
                  .map(([key, option]) => {
                    const questionType = getQuestionType(
                      questions[currentQuestion]
                    );
                    const isSelected = Array.isArray(selectedAnswer)
                      ? selectedAnswer.includes(key)
                      : selectedAnswer === key;

                    return (
                      <div
                        key={key}
                        onClick={() => handleAnswerSelect(key)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "16px",
                          borderRadius: "12px",
                          border: "1px solid",
                          borderColor: isSelected ? "#7bb274" : "#e0e0e0",
                          background: isSelected
                            ? "#e6f4ea"
                            : "rgba(255, 255, 255, 0.05)",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          color: "#2d2d2d",
                        }}
                        onMouseOver={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background =
                              "rgba(255, 255, 255, 0.1)";
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background =
                              "rgba(255, 255, 255, 0.05)";
                          }
                        }}
                      >
                        {/* Visual indicator based on question type */}
                        <div
                          style={{
                            width: "20px",
                            height: "20px",
                            borderRadius:
                              questionType === "multiple" ? "4px" : "50%",
                            border: "2px solid",
                            borderColor: isSelected ? "#7bb274" : "#e0e0e0",
                            background: isSelected ? "#e6f4ea" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {isSelected &&
                            (questionType === "multiple" ? (
                              <Check size={12} style={{ color: "#5c8a5e" }} />
                            ) : (
                              <div
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "50%",
                                  background: "#764ba2",
                                }}
                              />
                            ))}
                        </div>
                        <span style={{ fontSize: "1.125rem", flex: 1 }}>
                          {option.text}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : courseTest.format === "assignment" ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <textarea
                placeholder="Type your answer here..."
                value={selectedAnswer?.text || selectedAnswer || ""}
                onChange={(e) =>
                  handleAnswerSelect({
                    text: e.target.value,
                    file: selectedAnswer?.file || "",
                  })
                }
                style={{
                  minHeight: "128px",
                  background: "#f5f5f0",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "8px",
                  color: "#2d2d2d",
                  padding: "12px",
                  fontSize: "16px",
                  resize: "vertical",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Paperclip size={16} style={{ color: "#2d2d2d" }} />
                <label style={{ cursor: "pointer" }}>
                  Attach file (optional)
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleAnswerSelect({
                          text: selectedAnswer?.text || "",
                          file: file.name,
                        });
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          ) : null}
        </div>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid #e0e0e0",
              color: currentQuestion === 0 ? "#aaa" : "#2d2d2d",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: currentQuestion === 0 ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            <ArrowLeft size={16} style={{ marginRight: "4px" }} />
            Previous
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "0.875rem", opacity: 0.8 }}>
              {answeredCount}/{questions.length} answered
            </div>
            <button
              onClick={() => setCurrentScreen("pre-review")}
              style={{
                background: "rgba(59, 130, 246, 0.2)",
                border: "1px solid rgba(59, 130, 246, 0.4)",
                color: "#60a5fa",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <Eye size={16} style={{ marginRight: "4px" }} />
              Review
            </button>
          </div>

          <button
            onClick={handleNext}
            style={{
              background:
                answeredCount === 0
                  ? "#e0e0e0"
                  : "linear-gradient(45deg, #7bb274, #a3c9a8)",
              border: "none",
              color: "#2d2d2d",
              padding: "12px 24px",
              borderRadius: "8px",
              cursor: answeredCount === 0 ? "not-allowed" : "pointer",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            {currentQuestion === questions.length - 1
              ? "Review Answers"
              : "Next"}
            <ArrowRight size={16} style={{ marginLeft: "4px" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
