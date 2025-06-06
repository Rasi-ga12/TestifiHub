
import React, { useEffect, useState } from "react";
import { Link, useNavigate,To } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronRight } from "lucide-react";
import axios from "axios";


const user_id = localStorage.getItem("user_id");
const status = "pending";

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("pending");
  const [assessments, setAssessments] = useState([]);
  const [currentUser, setCurrentUser] = useState({ name: "" }); 
  const navigate = useNavigate();

  const request = { user_id };

  useEffect(() => {
    axios
      .post("http://localhost:5000/pending", request, {
        headers: { "Content-Type": "application/json" }
      })
      .then((response) => {
        setAssessments(response.data.assessments); 
        console.log(response.data.assessments)
        setCurrentUser({ name: response.data.user_name });
    
        
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const filteredAssessments = assessments.filter(
    (assessment) => assessment.status === activeTab
  );


  return (
    <MainLayout>
      <div className="py-6 space-y-8 animate-fade-in">
        <DashboardHeader
          title={`Welcome, ${currentUser.name}`}
          description="Track your assessment progress and upcoming deadlines"
        />

        {/*<DashboardStats role="student" />*/}

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>My Assessments</CardTitle>
            <CardDescription>
              View and complete your assigned assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value={ activeTab } className="space-y-4">
                {filteredAssessments.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No {activeTab} assessments found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        {activeTab==="pending"?(
                        <TableHead>Action</TableHead>):(<TableHead>Score</TableHead>)
                        } 
                        {activeTab==="completed"?
                        (<TableHead>preview</TableHead>):null}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssessments.map((assessment) => ( 
                        <TableRow key={assessment.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <FileText className="mr-2 h-4 w-4 text-primary" />
                              {assessment.topic}
                            </div>
                          </TableCell>
                          <TableCell>{assessment.subject}</TableCell>
                          <TableCell>{assessment.created_at}</TableCell>
                          <TableCell>{assessment.due_date}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                assessment.status === "pending"
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-green-50 text-green-700 border-green-200"
                              }
                            >
                              {assessment.status
                                .charAt(0)
                                .toUpperCase() +
                                assessment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell >
                            {activeTab=='pending'?(
                           <Link to={{pathname: `/take-assessment/${assessment.id}`,}}
                              state={{ score_id: assessment.id }}>
                              <Button variant="default" size="sm">
                                Start <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                            </Link>):(<TableCell >{assessment.score ?? 0}</TableCell>)}
                            
                          </TableCell>
                          <TableCell >
                            {activeTab=='completed'?(
                           <Link to={{pathname: `/preview-assessment/${assessment.id}`,}}
                              state={{ score_id: assessment.id }}>
                              <Button variant="default" size="sm">
                                preview <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                            </Link>):null}
                            
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
