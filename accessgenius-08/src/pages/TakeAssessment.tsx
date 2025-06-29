/*
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AssessmentTaker from "@/components/assessments/AssessmentTaker";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import axios from "axios"

const TakeAssessment: React.FC = () => {
  const navigate = useNavigate();
  //const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const location = useLocation();
  const {score_id } = location.state || {};
  const user_id = localStorage.getItem("user_id");
  const data= {
       user_id,       
       score_id, 
    }
   useEffect( () => {
 axios.post("http://localhost:5000/start",data,{headers: { "Content-Type": "application/json" }})
    .then((response) => {
      setQuestions(response.data);
      console.log(response.data)
    })
    .catch((error) => {
      console.error("Failed to load questions:", error);
    });
}, [user_id, score_id]);

  
  // Mock assessment data - in a real app this would be fetched from an API
  
  const assessmentData = {
    assessmentId: questions['id'] ,
    title: questions['title'],
    subject: questions['subject'],
    timeLimit: 60, // in minutes
    questions: questions['questions']
  };

  const handleComplete = (answers: Record<number, string>, score: number) => {
    setIsCompleted(true);
    // In a real application, you would submit this to your backend
    console.log("Assessment completed with answers:", answers);
    console.log("Score:", score);
    
    // Navigate back to student dashboard after a delay
    setTimeout(() => {
      navigate("/student-assessments");
    }, 3000);
  };

  const handleCancel = () => {
    toast.warning("Assessment canceled", {
      description: "Your progress will not be saved."
    });
    navigate("/student-assessments");
  };

  if (isCompleted) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="space-y-6">
              <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-green-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Assessment Completed!</h2>
              <p className="text-muted-foreground">
                Thank you for completing the assessment. You will be redirected to the dashboard shortly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AssessmentTaker 
      assessmentId={assessmentData.assessmentId}
      title={assessmentData.title}
      subject={assessmentData.subject}
      timeLimit={assessmentData.timeLimit}
      questions={assessmentData.questions}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
};
export default TakeAssessment;*/ 
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AssessmentTaker from "@/components/assessments/AssessmentTaker";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";
import axios from "axios";
import type { AssessmentTakerProps } from "@/components/assessments/AssessmentTaker";


const TakeAssessment: React.FC = () => {
  const navigate = useNavigate();
  //const { id } = useParams();
  const [isCompleted, setIsCompleted] = useState(false);
  const location = useLocation();
  const {score_id } = location.state || {};
  const user_id = localStorage.getItem("user_id");
  const data= {
       user_id:user_id,       
       score_id:score_id
    }
   const [assessmentData, setAssessmentdata] = useState<AssessmentTakerProps | null>(null);
   const [refreshed, setrefreshed] = useState(false);
  useEffect(() => {
  const alreadyLoaded = localStorage.getItem("exam_loaded");
  const examOver = localStorage.getItem("exam_over");

  if (examOver === "true") {
    setrefreshed(true);
    return;
  }

  const loadAssessment = () => {
    axios.post("http://localhost:5000/start", data, {
      headers: { "Content-Type": "application/json" },
    })
    .then((response) => {
      setAssessmentdata({
        assessmentId: score_id,
        title: response.data.title,
        subject: response.data.subject,
        timeLimit: 5,
        questions: response.data.questions,
        onComplete: null,
      });
    })
    .catch((error) => {
        toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to load assessment questions.",
      variant: "destructive",
    });
    });
  };

  if (alreadyLoaded) {
    axios.post("http://localhost:5000/update_exam_status", {
      user_id,
      score_id,
      status: "exit",
    })
    .then(() => {
      console.log("Exam status updated to exit.");
    })
    .catch((err) => {
      toast({
      title: "Error",
      description: err?.response?.data?.message || "Failed to update exam status on reload.",
      variant: "destructive",
    });
    });
    localStorage.setItem("exam_over", "true");
    setrefreshed(true);
  } else {
    localStorage.setItem("exam_loaded", "1");
    loadAssessment();   // Load the assessment on first load.
  }

  return () => {
    localStorage.removeItem("exam_loaded");
    localStorage.removeItem("exam_over");
  };
}, []);


  
  // Mock assessment data - in a real app this would be fetched from an API
  

  const handleComplete = async (answers: Record<number, string>) => {
  setIsCompleted(true);
  const data = { answers, user_id, score_id };

  try {
    const res = await axios.post("http://127.0.0.1:5000/submitting", data, {
      headers: { "Content-Type": "application/json" },
    });

    if (res.status === 200) {
          toast({
        title: "Assessment Submitted",
        description: res.data?.message || "Your assessment was submitted successfully.",
      });
    }
     else{   toast({
        title: "Error",
        description: res.data?.message || "Failed to submit assessment.",
        variant: "destructive",
      });}
  } catch (error) {
    console.error("Failed to submit assessment:", error);
    toast({
      title: "Error",
      description: error?.response?.data?.message || "Failed to submit assessment.",
      variant: "destructive",
    });
  }

  setTimeout(() => {
    navigate("/dashboard");
  }, 3000);
};

  const handleCancel = () => {
    toast({
    title: "Assessment canceled",
    description: "Your progress will not be saved.",
    variant: "destructive",
  });
    navigate("/dashboard");
  };

  if (isCompleted) {
    return (
      <div className="container max-w-4xl mx-auto py-10 px-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="space-y-6">
              <div className="rounded-full bg-green-100 p-3 w-16 h-16 mx-auto flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-8 w-8 text-green-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold">Assessment Completed!</h2>
              <p className="text-muted-foreground">
                Thank you for completing the assessment. You will be redirected to the dashboard shortly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
    
  }
if(refreshed){
  return(
  <div>
      {refreshed ? (<h2> You refresed, your assessment is over</h2>):(<h2>welcome</h2>)}
  </div>);
}
if (!assessmentData) {
  return (
    <div className="container max-w-4xl mx-auto py-10 px-4 text-center">
      <p>Loading assessment...</p>
    </div>
  );
}

  return (
    
    <AssessmentTaker 
      assessmentId={assessmentData.assessmentId}
      title={assessmentData.title}
      subject={assessmentData.subject}
      timeLimit={assessmentData.timeLimit}
      questions={assessmentData.questions}
      onComplete={handleComplete}
     // onCancel={handleCancel}
    />
    
  );
};

export default TakeAssessment;
