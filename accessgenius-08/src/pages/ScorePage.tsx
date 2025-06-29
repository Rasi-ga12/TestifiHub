import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ScorePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, answers, questions } = location.state || {};

  if (!score || !answers || !questions) {
    return <div className="text-center mt-10 text-red-500">Missing assessment data</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 space-y-8">
      {/* Exit Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard")}
        >
          Exit to Dashboard
        </Button>
      </div>

      {/* Score Summary */}
      <Card>
        <CardContent className="text-center pt-6 space-y-2">
          <h2 className="text-3xl font-bold">Assessment Completed!</h2>
          <p className="text-muted-foreground text-lg">
            You scored <span className="font-semibold">{score}%</span>
          </p>
        </CardContent>
      </Card>

      {/* Answer Breakdown */}
      {questions.map((q: any, index: number) => {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer === q.correctAnswer;

        return (
          <div key={q.id} className="bg-white p-6 rounded-lg shadow space-y-3">
            <h3 className="font-semibold text-lg">Q{index + 1}: {q.text}</h3>
            <ul className="space-y-2">
              {q.options.map((option: any) => {
                const isSelected = option.id === userAnswer;
                const isCorrectAnswer = option.id === q.correctAnswer;

                let bg = "border border-gray-300";
                if (isCorrectAnswer && isSelected) bg = "bg-green-100 border-green-500";
                else if (isSelected && !isCorrectAnswer) bg = "bg-red-100 border-red-500";
                else if (isCorrectAnswer) bg = "bg-green-50 border-green-400";

                return (
                  <li key={option.id} className={`p-3 rounded-md ${bg}`}>
                    {option.text}
                    {isCorrectAnswer && <span className="ml-2 text-green-600 font-semibold">(Correct)</span>}
                    {isSelected && !isCorrectAnswer && <span className="ml-2 text-red-600 font-semibold">(Your Answer)</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      {/* Bottom Button */}
      <div className="text-center">
        <Button onClick={() => navigate("/dashboard")} className="mt-6">
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default ScorePage;