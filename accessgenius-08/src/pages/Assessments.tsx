import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Search, Users, Brain, Lightbulb } from "lucide-react";
import AssessmentGenerator from "@/components/assessments/AssessmentGenerator";
import QuestionGenerator from "@/components/assessments/QuestionGenerator";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AssessmentsProps {
  userRole?: 'admin' | 'class-faculty' | 'student' | 'placement-faculty';
}

const Assessments: React.FC<AssessmentsProps> = ({ userRole = 'class-faculty' }) => {
  const [activeTab, setActiveTab] = useState<string>("active");
  const [showGenerator, setShowGenerator] = useState(false);
  const [showQuestionGenerator, setShowQuestionGenerator] = useState(false);
  const [showAptitudeGenerator, setShowAptitudeGenerator] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [generatorSelectedGroup, setGeneratorSelectedGroup] = useState<string>("g1");
  const [questionGeneratorSelectedGroup, setQuestionGeneratorSelectedGroup] = useState<string>("g1");
  const [aptitudeGeneratorSelectedGroup, setAptitudeGeneratorSelectedGroup] = useState<string>("g4");
  
  const groups = [
    { id: "all", name: "All Groups" },
    { id: "g1", name: "Computer Science - Year 1" },
    { id: "g2", name: "Computer Science - Year 2" },
    { id: "g3", name: "Electronics - Year 1" },
    { id: "g4", name: "Placement Batch 2025" },
  ];
  
  const assessments = [
    { id: 1, title: "Midterm Physics Assessment", subject: "Physics", dueDate: "2025-04-10", status: "active", group: "g1" },
    { id: 2, title: "Chemistry Practical Evaluation", subject: "Chemistry", dueDate: "2025-04-15", status: "active", group: "g2" },
    { id: 3, title: "Mathematics Problem Set #3", subject: "Mathematics", dueDate: "2025-04-20", status: "active", group: "g3" },
    { id: 4, title: "Literature Review Essay", subject: "English", dueDate: "2025-03-30", status: "completed", group: "g1" },
    { id: 5, title: "Biology Final Exam", subject: "Biology", dueDate: "2025-05-15", status: "draft", group: "g2" },
    { id: 6, title: "Aptitude Test - Logical Reasoning", subject: "Aptitude", dueDate: "2025-04-25", status: "active", group: "g4" },
  ];

  const filteredAssessments = assessments.filter(assessment => {
    const statusMatch = assessment.status === activeTab;
    const groupMatch = selectedGroup === "all" || assessment.group === selectedGroup;
    return statusMatch && groupMatch;
  });

  const handleNewAssessment = () => {
    if (userRole === 'admin') {
      toast.error("Admins cannot create assessments");
      return;
    }
    
    setShowGenerator(true);
  };

  const handleNewAptitudeAssessment = () => {
    if (userRole !== 'placement-faculty') {
      toast.error("Only placement faculty can create aptitude assessments");
      return;
    }
    
    setShowAptitudeGenerator(true);
    toast.info("Creating new aptitude assessment");
  };
  
  const closeGenerator = () => {
    setShowGenerator(false);
  };
  
  const canAccessQuestionGenerator = () => {
    return userRole === 'class-faculty';
  };
  
  const canAccessAptitudeGenerator = () => {
    return userRole === 'placement-faculty';
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">
            {userRole === 'admin' 
              ? 'Assessment Progress Dashboard' 
              : userRole === 'placement-faculty'
                ? 'Placement Faculty Dashboard'
                : 'Faculty Assessment Dashboard'}
          </h1>
          {userRole !== 'admin' && (
            <div className="flex gap-2">
              <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
                <DialogTrigger asChild>
                  <Button className="flex items-center">
                    <Plus className="mr-2 h-4 w-4" /> Create New Assessment
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Assessment</DialogTitle>
                    <DialogDescription>
                      Use our AI-powered assessment generator to create a new assessment.
                    </DialogDescription>
                  </DialogHeader>
                  <AssessmentGenerator />
                </DialogContent>
              </Dialog>
              
              {canAccessQuestionGenerator() && (
                <Dialog open={showQuestionGenerator} onOpenChange={setShowQuestionGenerator}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" /> Generate Questions
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[900px]">
                    <DialogHeader>
                      <DialogTitle>AI Question Generator</DialogTitle>
                      <DialogDescription>
                        Generate questions from a syllabus using AI technology.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mb-4">
                      <label className="text-sm font-medium">Target Group</label>
                      <Select 
                        value={questionGeneratorSelectedGroup}
                        onValueChange={setQuestionGeneratorSelectedGroup}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a group" />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.filter(g => g.id !== "all").map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <QuestionGenerator />
                  </DialogContent>
                </Dialog>
              )}
              
              {canAccessAptitudeGenerator() && (
                <Dialog open={showAptitudeGenerator} onOpenChange={setShowAptitudeGenerator}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" className="flex items-center">
                      <Lightbulb className="mr-2 h-4 w-4" /> Create Aptitude Assessment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[900px]">
                    <DialogHeader>
                      <DialogTitle>Aptitude Assessment Generator</DialogTitle>
                      <DialogDescription>
                        Create aptitude tests with AI assistance for placement preparation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 space-y-6">
                      <p className="text-left text-muted-foreground">
                        This feature allows you to create aptitude assessments for placement preparation.
                        You can generate MCQ questions on various aptitude topics like logical reasoning,
                        quantitative aptitude, verbal ability, and more.
                      </p>
                      
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Assessment Title</label>
                          <Input placeholder="e.g., Placement Aptitude Test - Batch 2025" />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Aptitude Topics</label>
                          <Select defaultValue="logical">
                            <SelectTrigger>
                              <SelectValue placeholder="Select topic" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="logical">Logical Reasoning</SelectItem>
                              <SelectItem value="quantitative">Quantitative Aptitude</SelectItem>
                              <SelectItem value="verbal">Verbal Ability</SelectItem>
                              <SelectItem value="technical">Technical MCQs</SelectItem>
                              <SelectItem value="mixed">Mixed Aptitude</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Number of Questions</label>
                          <Input type="number" defaultValue="20" min="1" max="100" />
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Target Group</label>
                          <Select 
                            value={aptitudeGeneratorSelectedGroup}
                            onValueChange={setAptitudeGeneratorSelectedGroup}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a group" />
                            </SelectTrigger>
                            <SelectContent>
                              {groups.filter(g => g.id !== "all").map((group) => (
                                <SelectItem key={group.id} value={group.id}>
                                  {group.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Button className="w-full" onClick={() => {
                        toast.success("Aptitude assessment created successfully!");
                        setShowAptitudeGenerator(false);
                      }}>
                        <Brain className="mr-2 h-4 w-4" /> Generate Aptitude Assessment
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {userRole === 'admin' ? 'Assessment Analytics' : 'My Assessments'}
                </CardTitle>
                <div className="flex items-center gap-4">
                  <Select 
                    value={selectedGroup}
                    onValueChange={setSelectedGroup}
                  >
                    <SelectTrigger className="w-[220px]">
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/groups">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Groups
                    </Link>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search assessments..."
                    className="w-full pl-8"
                  />
                </div>
              </div>

              <Tabs defaultValue="active" onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="draft">Drafts</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Group</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssessments.map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <FileText className="mr-2 h-4 w-4 text-primary" />
                              {assessment.title}
                            </div>
                          </TableCell>
                          <TableCell>{assessment.subject}</TableCell>
                          <TableCell>
                            {groups.find(g => g.id === assessment.group)?.name || 'Unknown Group'}
                          </TableCell>
                          <TableCell>{assessment.dueDate}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                if (userRole === 'admin') {
                                  toast.info("Viewing analytics for " + assessment.title);
                                } else {
                                  toast.info("Viewing details for " + assessment.title);
                                }
                              }}
                            >
                              {userRole === 'admin' ? 'Analytics' : 'View'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Group</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssessments.map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <FileText className="mr-2 h-4 w-4 text-primary" />
                              {assessment.title}
                            </div>
                          </TableCell>
                          <TableCell>{assessment.subject}</TableCell>
                          <TableCell>
                            {groups.find(g => g.id === assessment.group)?.name || 'Unknown Group'}
                          </TableCell>
                          <TableCell>{assessment.dueDate}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                if (userRole === 'admin') {
                                  toast.info("Viewing results for " + assessment.title);
                                } else {
                                  toast.info("Viewing details for " + assessment.title);
                                }
                              }}
                            >
                              {userRole === 'admin' ? 'Results' : 'View'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="draft" className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Group</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAssessments.map((assessment) => (
                        <TableRow key={assessment.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <FileText className="mr-2 h-4 w-4 text-primary" />
                              {assessment.title}
                            </div>
                          </TableCell>
                          <TableCell>{assessment.subject}</TableCell>
                          <TableCell>
                            {groups.find(g => g.id === assessment.group)?.name || 'Unknown Group'}
                          </TableCell>
                          <TableCell>{assessment.dueDate}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toast.info("Editing " + assessment.title)}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Assessments;
