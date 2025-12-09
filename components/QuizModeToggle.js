import { useState, useEffect } from "react";

export default function QuizModeToggle({
  courseTestId,
  currentMode = "legacy",
}) {
  const [showComparison, setShowComparison] = useState(false);
  const [userPreference, setUserPreference] = useState("legacy");

  useEffect(() => {
    // Check user preference from localStorage
    const savedPreference = localStorage.getItem("quiz_mode_preference");
    if (savedPreference) {
      setUserPreference(savedPreference);
    }
  }, []);

  const handleModeSwitch = (mode) => {
    localStorage.setItem("quiz_mode_preference", mode);
    setUserPreference(mode);

    if (mode === "immersive") {
      window.location.href = `/lms/immersive-test?course_test_id=${courseTestId}`;
    } else {
      window.location.href = `/lms/learning-test?course_test_id=${courseTestId}`;
    }
  };

  if (showComparison) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.9)",
          zIndex: 10000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            width: "100%",
            background: "white",
            borderRadius: "12px",
            padding: "32px",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                marginBottom: "8px",
                color: "#1f2937",
              }}
            >
              Choose Your Quiz Experience
            </h2>
            <p style={{ fontSize: "1.125rem", color: "#6b7280" }}>
              Select the interface that works best for you
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginBottom: "32px",
            }}
          >
            {/* Immersive Mode */}
            <div
              onClick={() => handleModeSwitch("immersive")}
              style={{
                background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                color: "white",
                padding: "24px",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 25px rgba(139, 92, 246, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 15px rgba(139, 92, 246, 0.3)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>✨</span>
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      margin: 0,
                    }}
                  >
                    Immersive Mode
                  </h3>
                  <span
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    NEW
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontSize: "1rem",
                  opacity: 0.9,
                  marginBottom: "20px",
                  lineHeight: "1.5",
                }}
              >
                Experience our modern, intuitive quiz interface with enhanced
                features and beautiful design.
              </p>

              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    fontSize: "14px",
                    opacity: 0.9,
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <span>• Modern, responsive design</span>
                  <span>• Enhanced user experience</span>
                  <span>• Visual progress tracking</span>
                  <span>• Question flagging & review</span>
                  <span>• Improved navigation</span>
                  <span>• Mobile-optimized interface</span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span>⚡</span>
                  <span style={{ fontSize: "14px", opacity: 0.9 }}>
                    Recommended
                  </span>
                </div>
                <span style={{ fontSize: "18px" }}>→</span>
              </div>
            </div>

            {/* Legacy Mode */}
            <div
              onClick={() => handleModeSwitch("legacy")}
              style={{
                background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                color: "white",
                padding: "24px",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                boxShadow: "0 4px 15px rgba(107, 114, 128, 0.3)",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 25px rgba(107, 114, 128, 0.4)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 15px rgba(107, 114, 128, 0.3)";
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "8px",
                    padding: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>📖</span>
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      margin: 0,
                    }}
                  >
                    Legacy Mode
                  </h3>
                  <span
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                    }}
                  >
                    CLASSIC
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontSize: "1rem",
                  opacity: 0.9,
                  marginBottom: "20px",
                  lineHeight: "1.5",
                }}
              >
                Use the traditional quiz interface with all existing features
                and admin tools.
              </p>

              <div style={{ marginBottom: "20px" }}>
                <div
                  style={{
                    fontSize: "14px",
                    opacity: 0.9,
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <span>• Traditional interface</span>
                  <span>• Familiar workflow</span>
                  <span>• Established functionality</span>
                  <span>• Admin management tools</span>
                  <span>• File upload support</span>
                  <span>• Proven reliability</span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span>⚙️</span>
                  <span style={{ fontSize: "14px", opacity: 0.9 }}>
                    Full featured
                  </span>
                </div>
                <span style={{ fontSize: "18px" }}>→</span>
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: "24px",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "center",
              gap: "16px",
            }}
          >
            <button
              onClick={() => setShowComparison(false)}
              style={{
                background: "#f3f4f6",
                border: "1px solid #d1d5db",
                color: "#374151",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancel
            </button>
            <div
              style={{
                textAlign: "center",
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              You can always switch modes later from the quiz interface
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        padding: "12px 16px",
        marginBottom: "16px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "20px" }}>
            {currentMode === "immersive" ? "✨" : "📖"}
          </span>
          <div>
            <div style={{ fontWeight: "600", color: "#1f2937" }}>
              {currentMode === "immersive" ? "Immersive Mode" : "Legacy Mode"}
            </div>
            <div style={{ fontSize: "13px", color: "#6b7280" }}>
              {currentMode === "immersive"
                ? "Enhanced quiz experience"
                : "Traditional quiz interface"}
            </div>
          </div>
          {currentMode === "immersive" && (
            <span
              style={{
                background: "linear-gradient(45deg, #8b5cf6, #3b82f6)",
                color: "white",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: "600",
              }}
            >
              NEW
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              onClick={() => handleModeSwitch("legacy")}
              style={{
                background:
                  currentMode === "legacy" ? "#4b5563" : "transparent",
                border: "1px solid #d1d5db",
                color: currentMode === "legacy" ? "white" : "#6b7280",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              📖 Legacy
            </button>
            <button
              onClick={() => handleModeSwitch("immersive")}
              style={{
                background:
                  currentMode === "immersive"
                    ? "linear-gradient(45deg, #8b5cf6, #3b82f6)"
                    : "transparent",
                border: "1px solid #d1d5db",
                color: currentMode === "immersive" ? "white" : "#6b7280",
                padding: "6px 12px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: "500",
              }}
            >
              ✨ Immersive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
