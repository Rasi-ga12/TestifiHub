import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Brain, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

const formSchema = z.object({
  subject: z.string().min(1, { message: "Subject is required" }),
  topic: z.string().min(1, { message: "Topic is required" }),
  difficulty: z.string().min(1, { message: "Difficulty level is required" }),
  questionCount: z.coerce.number().int().min(1).max(50),
  content: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AssessmentTracker {
  date: string;
  count: number;
}

const AssessmentGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [remainingAssessments, setRemainingAssessments] = useState(3);
  const user_id = localStorage.getItem("user_id") || "guest_user";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      topic: "",
      difficulty: "medium",
      questionCount: 30,
      content: "",
    },
  });

  const subjects = [
    "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science",
    "English Literature", "History", "Geography", "Economics", "Business Studies"
  ];

  const difficulties = [
    { value: "easy", label: "Easy" },
    { value: "medium", label: "Medium" },
    { value: "hard", label: "Hard" },
    { value: "expert", label: "Expert" },
  ];

  // Initialize and track remaining assessments per day
  useEffect(() => {
    const key = `assessment_tracker_${user_id}`;
    const today = new Date().toISOString().split("T")[0];

    const tracker: AssessmentTracker = JSON.parse(localStorage.getItem(key) || "null") || {
      date: today,
      count: 0,
    };

    if (tracker.date !== today) {
      tracker.date = today;
      tracker.count = 0;
    }

    setRemainingAssessments(3 - tracker.count);
    localStorage.setItem(key, JSON.stringify(tracker));
  }, [user_id]);

  const handleSubmit = async (values: FormValues) => {
    if (remainingAssessments <= 0) {
      toast({
        title: "Limit Reached",
        description: "You have reached the daily limit of 3 assessments. Please try again tomorrow.",
      })
      return;
    }

    setIsGenerating(true);
    const key = `assessment_tracker_${user_id}`;
    const tracker: AssessmentTracker = JSON.parse(localStorage.getItem(key) || "null");

    try {
      const reqData = { user_id, values };
      const res = await axios.post("http://127.0.0.1:5000/generate_assessment", reqData, {
        headers: { "Content-Type": "application/json" },
      });

      await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate delay

      toast({
        title: "Assessment Generated",
        description: "Your assessment has been successfully generated.",
      })
      tracker.count += 1;
      setRemainingAssessments(3 - tracker.count);
      localStorage.setItem(key, JSON.stringify(tracker));
      window.location.href = "/dashboard";

    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to generate assessment. Please try again.",
        variant: "destructive",
      })
     
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto px-1">
    <Card className='w-full'>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle  className='text-lg sm:text-xl'>AI Assessment Generator</CardTitle>
        </div>
        <CardDescription className='text-sm sm:text-base'>Create custom assessments using AI technology</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="manual">
          <div className="flex justify-center mb-4">
            <TabsList className="bg-muted w-full sm:w-fit overflow-x-auto">
              <TabsTrigger value="manual">📋 Manual Input</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="manual" className="space-y-4 animate-fade-in-up">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject} value={subject.toLowerCase()}>
                                {subject}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topic</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Trigonometry, Cell Biology" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="difficulty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {difficulties.map((difficulty) => (
                              <SelectItem key={difficulty.value} value={difficulty.value}>
                                {difficulty.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="questionCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Questions</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="30" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full sm:w-1/2 mx-auto flex items-center justify-center"
                  size="lg"
                  disabled={isGenerating || remainingAssessments <= 0}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Assessment...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Assessment
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 text-sm text-muted-foreground text-center">
        <div className="flex items-center justify-center gap-1">
          <Brain className="h-4 w-4" />
          <span className="text-center sm:text-left">Powered by AI</span>
        </div>
        <span className="text-center sm:text-left" >Remaining Assessments: {remainingAssessments}</span>
        {isGenerating && <span>This may take a few moments...</span>}
      </CardFooter>
    </Card>
    </div>
  );
};

export default AssessmentGenerator;
