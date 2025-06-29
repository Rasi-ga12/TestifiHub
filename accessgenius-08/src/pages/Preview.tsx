import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

interface Option {
  id: string;
  option: string;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
  correct_option: string;
  user_choice: string;
}

interface AssessmentData {
  id: string;
  questions: Question[];
}

const Preview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score_id } = location.state || {};
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const user_id = localStorage.getItem("user_id");

  useEffect(() => {
    const data = { user_id, score_id };

    axios
      .post("http://localhost:5000/preview", data, {
        headers: { "Content-Type": "application/json" },
      })
      .then((response) => {
        setAssessmentData(response.data);
      })
      .catch((error) => {
        console.error("Failed to load preview data:", error);
      });
  }, [score_id, user_id]);

  if (!assessmentData) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4 text-center">
        <p>Loading assessment preview...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 space-y-8">
      {assessmentData.questions.map((question, qIndex) => (
        <Card key={question.id}>
          <CardContent className="py-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Q{qIndex + 1}. {question.text}
              {!question.user_choice && (
              <span style={{ color: "red", display: "inline", marginLeft: "8px" }}>
                (Skipped)
              </span>
              )}
            </h2>
            <div className="space-y-2">
              {question.options.map((opt) => {
                const isCorrect = opt.id === question.correct_option;
                const isUserChoice = opt.id === question.user_choice;
                
                const optionClass = isCorrect
                  ? "bg-green-100 border-green-500 text-green-700"
                  : isUserChoice && opt.id !== question.correct_option
                  ? "bg-red-100 border-red-500 text-red-700"
                  : "border-gray-300";

                return (
                  <div
                    key={opt.id}
                    className={`border rounded p-2 ${optionClass}`}
                  >
                    <span className="font-semibold mr-2">{opt.id.toUpperCase()}.</span>
                    {opt.option}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="text-center">
        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Preview;
