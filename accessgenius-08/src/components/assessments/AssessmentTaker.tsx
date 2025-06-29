/*
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Clock, AlertTriangle, ArrowLeft, ArrowRight, Flag, Send } from "lucide-react";

import { toast } from "sonner";
import { useBreakpoint } from '@/hooks/use-mobile';


interface Question {
  id: number;
  text: string;
  options: { id: string; option: string }[];
}

export interface AssessmentTakerProps {
  assessmentId: number;
  title: string;
  subject: string;
  timeLimit: number;
  questions: Question[];
  onComplete: (answers: Record<number, string>) => void;
}

const AssessmentTaker: React.FC<AssessmentTakerProps> = ({
  title,
  subject,
  timeLimit,
  questions = [],  // default to empty array
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [remainingTime, setRemainingTime] = useState(timeLimit * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {isMobile,isTablet} = useBreakpoint();

  const navigate = useNavigate();

  // If questions list is empty or undefined, show a message instead of trying to render the quiz
  if (!questions || questions.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <Card className="shadow-md">
          <CardContent>
            <p className="text-center text-gray-600">No questions available to display.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          //handleComplete(answers);
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, answerId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerId }));
  };

  const handleFlagQuestion = () => {
    setFlaggedQuestions(prev => {
      const updated = new Set(prev);
      if (updated.has(currentQuestion.id)) {
        updated.delete(currentQuestion.id);
      } else {
        updated.add(currentQuestion.id);
      }
      return updated;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitAssessment = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onComplete(answers);
    }, 500);
  };

  const lowTimeWarning = remainingTime < 300;

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${lowTimeWarning ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              <Clock className="h-4 w-4" />
              <span className="font-medium">{formatTime(remainingTime)}</span>
            </div>

            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              Exit
            </Button>
          </div>

          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{subject} - Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
          </div>

          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {lowTimeWarning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Time is running out!</AlertTitle>
              <AlertDescription>You have less than 5 minutes remaining to complete this assessment.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="text-lg font-medium">{currentQuestion.text}</div>

            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
              className="space-y-3"
            >
              {currentQuestion.options.map(option => (
                <div key={option.id} className="flex items-center space-x-2 p-3 rounded-md border hover:bg-muted transition-colors">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-grow cursor-pointer">{option.option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="flex justify-between pt-6">
          <Button
            variant={flaggedQuestions.has(currentQuestion.id) ? "default" : "outline"}
            size="sm"
            onClick={handleFlagQuestion}
          >
            <Flag className="mr-1 h-4 w-4" />
            {flaggedQuestions.has(currentQuestion.id) ? "Unflag" : "Flag for review"}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentQuestionIndex === 0}
              onClick={handlePrevQuestion}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextQuestion}
              >
                Next
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleSubmitAssessment}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : (
                  <>
                    <Send className="mr-1 h-4 w-4" />
                    Submit Assessment
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AssessmentTaker;*/
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Clock, AlertTriangle, ArrowLeft, ArrowRight, Flag, Send } from "lucide-react";

interface Question {
  id: number;
  text: string;
  options: { id: string; option: string }[];
}

export interface AssessmentTakerProps {
  assessmentId: number;
  title: string;
  subject: string;
  timeLimit: number;
  questions: Question[];
  onComplete: (answers: Record<number, string>) => void;
}

const AssessmentTaker: React.FC<AssessmentTakerProps> = ({
  title,
  subject,
  timeLimit,
  questions = [],
  onComplete
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const answersRef = useRef<Record<number, string>>({}); 
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [remainingTime, setRemainingTime] = useState(timeLimit * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionId: number, answerId: string) => {
    setAnswers(prev => {
      const updated = { ...prev, [questionId]: answerId };
      answersRef.current = updated; 
      return updated;
    });
  };

  const handleFlagQuestion = () => {
    setFlaggedQuestions(prev => {
      const updated = new Set(prev);
      if (updated.has(currentQuestion.id)) {
        updated.delete(currentQuestion.id);
      } else {
        updated.add(currentQuestion.id);
      }
      return updated;
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitAssessment = () => {
    setIsSubmitting(true);
    const finalAnswers = { ...answersRef.current }; 
    console.log("Submitted answers:", finalAnswers);
    setTimeout(() => {

      /*const score = calculateScore();
      toast.success("Assessment submitted successfully!", {
        description: `Your score: ${score}%`
      });
      navigate("/score", {
        state: {score,answers,questions
        }
      });
      onComplete(answers, score);
    }, 1500);*/

      onComplete(finalAnswers);
    }, 500);

  };

  const lowTimeWarning = remainingTime < 300;

  if (!questions || questions.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <Card className="shadow-md">
          <CardContent>
            <p className="text-center text-gray-600">No questions available to display.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Go Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${lowTimeWarning ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
              <Clock className="h-4 w-4" />
              <span className="font-medium">{formatTime(remainingTime)}</span>
            </div>

            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              Exit
            </Button>
          </div>

          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{subject} - Question {currentQuestionIndex + 1} of {questions.length}</CardDescription>
          </div>

          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {lowTimeWarning && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Time is running out!</AlertTitle>
              <AlertDescription>You have less than 5 minutes remaining to complete this assessment.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="text-lg font-medium">{currentQuestion.text}</div>

            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
              className="space-y-3"
            >
              {currentQuestion.options.map(option => (

                /* <label key={option.id} htmlFor={option.id} className={`flex items-center space-x-3 border p-4 rounded-md  hover:bg-muted transition-colors cursor pointer ${isMobile ? "text-base":"text-sm"}`}>
                  <RadioGroupItem value={option.id} id={option.id} className="shrink-0" />
                  <span className="flex-grow">{option.text}</span>
                </label> */

                 <div key={option.id} className="flex items-center space-x-2 p-3 rounded-md border hover:bg-muted transition-colors">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-grow cursor-pointer">{option.option}</Label>
                </div> 

              ))}
            </RadioGroup>
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="flex justify-between pt-6">
          <Button
            variant={flaggedQuestions.has(currentQuestion.id) ? "default" : "outline"}
            size="sm"
            onClick={handleFlagQuestion}
          >
            <Flag className="mr-1 h-4 w-4" />
            {flaggedQuestions.has(currentQuestion.id) ? "Unflag" : "Flag for review"}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentQuestionIndex === 0}
              onClick={handlePrevQuestion}
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextQuestion}
              >
                Next
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleSubmitAssessment}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : (
                  <>
                    <Send className="mr-1 h-4 w-4" />
                    Submit Assessment
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AssessmentTaker;

