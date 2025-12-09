import { useState } from "react"
import { CheckSquare, Circle, Check } from "lucide-react"

export default function QuestionTypeSelector({ 
  questionData, 
  onQuestionTypeChange,
  disabled = false 
}) {
  const [questionType, setQuestionType] = useState(
    questionData?.type || 
    (questionData?.single_choice ? "single" : "multiple")
  )

  const handleTypeChange = (newType) => {
    setQuestionType(newType)
    
    // Update the question data
    const updatedQuestion = {
      ...questionData,
      type: newType,
      single_choice: newType === "single"
    }
    
    onQuestionTypeChange(updatedQuestion)
  }

  return (
    <div style={{
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      padding: "16px",
      marginBottom: "16px"
    }}>
      <label style={{
        display: "block",
        fontSize: "14px",
        fontWeight: "600",
        color: "#374151",
        marginBottom: "8px"
      }}>
        Question Type
      </label>
      
      <div style={{
        display: "flex",
        gap: "12px",
        marginBottom: "12px"
      }}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleTypeChange("multiple")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            background: questionType === "multiple" ? "#3b82f6" : "#ffffff",
            color: questionType === "multiple" ? "white" : "#374151",
            border: "1px solid",
            borderColor: questionType === "multiple" ? "#3b82f6" : "#d1d5db",
            borderRadius: "6px",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.2s ease",
            opacity: disabled ? 0.6 : 1
          }}
        >
          <div style={{
            width: "16px",
            height: "16px",
            borderRadius: "3px",
            border: "2px solid",
            borderColor: questionType === "multiple" ? "white" : "#9ca3af",
            background: questionType === "multiple" ? "white" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {questionType === "multiple" && (
              <Check size={10} style={{ color: "#3b82f6" }} />
            )}
          </div>
          <span>Multiple Choice</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleTypeChange("single")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 16px",
            background: questionType === "single" ? "#16a34a" : "#ffffff",
            color: questionType === "single" ? "white" : "#374151",
            border: "1px solid",
            borderColor: questionType === "single" ? "#16a34a" : "#d1d5db",
            borderRadius: "6px",
            cursor: disabled ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.2s ease",
            opacity: disabled ? 0.6 : 1
          }}
        >
          <div style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            border: "2px solid",
            borderColor: questionType === "single" ? "white" : "#9ca3af",
            background: questionType === "single" ? "white" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            {questionType === "single" && (
              <div style={{ 
                width: "6px", 
                height: "6px", 
                borderRadius: "50%", 
                background: "#16a34a" 
              }} />
            )}
          </div>
          <span>Single Choice</span>
        </button>
      </div>

      <div style={{
        fontSize: "12px",
        color: "#6b7280",
        lineHeight: "1.4"
      }}>
        {questionType === "multiple" ? (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <CheckSquare size={16} style={{ color: "#6b7280" }} />
            <span>Students can select multiple answers (checkboxes)</span>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Circle size={16} style={{ color: "#6b7280" }} />
            <span>Students can select only one answer (radio buttons)</span>
          </div>
        )}
      </div>

      {/* Visual Preview */}
      <div style={{
        marginTop: "12px",
        padding: "12px",
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "6px"
      }}>
        <div style={{
          fontSize: "12px",
          color: "#6b7280",
          marginBottom: "8px",
          fontWeight: "500"
        }}>
          Preview:
        </div>
        <div style={{
          background: questionType === "multiple" 
            ? "rgba(59, 130, 246, 0.1)" 
            : "rgba(34, 197, 94, 0.1)",
          border: "1px solid",
          borderColor: questionType === "multiple"
            ? "rgba(59, 130, 246, 0.2)"
            : "rgba(34, 197, 94, 0.2)",
          borderRadius: "4px",
          padding: "6px 10px",
          fontSize: "11px",
          color: "#374151",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          {questionType === "multiple" ? (
            <CheckSquare size={12} style={{ color: "#374151" }} />
          ) : (
            <Circle size={12} style={{ color: "#374151" }} />
          )}
          <span>
            {questionType === "multiple" 
              ? "Multiple Choice: Select all that apply"
              : "Single Choice: Select one option"
            }
          </span>
        </div>
      </div>
    </div>
  )
}