
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import axios from 'axios';

const feedbackTypes = [
  'Feature Request',
  'General Feedback'
];

const Feedback: React.FC = () => {
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!feedbackType) {
      toast({
    title: "Error",
    description: "Please select a feedback type.",
    variant: "destructive",
  });
    return;
  }

  if (!feedbackText.trim()) {
    toast({
    title: "Error",
    description: "Please enter your feedback.",
    variant: "destructive",
  });
    return;
  }

  setIsSubmitting(true);
  const user_id = localStorage.getItem("user_id");
  const arr = { user_id, feedbackType, feedbackText };

  try {
    const res = await axios.post("http://127.0.0.1:5000/feedback", arr);
    if (res.status === 200) {
     toast({
      title: "Success",
      description: "Thank you for your feedback!",
    });
      setFeedbackType('');
      setFeedbackText('');
    } else {
        toast({
      title: "Error",
      description: res.data?.message || "Failed to send feedback. Please try again.",
      variant: "destructive",
    });
    }
  } catch (error: any) {
      toast({
    title: "Error",
    description: error?.response?.data?.message || "An error occurred while sending feedback.",
    variant: "destructive",
  });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Send Feedback</h1>
        <Card className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>We Value Your Input</CardTitle>
              <CardDescription>
                Your feedback helps us improve our platform. Tell us what you think!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="type" className="font-medium">Feedback Type</label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="feedback" className="font-medium">Your Feedback</label>
                <Textarea
                  id="feedback"
                  placeholder="Share your thoughts, suggestions, or report issues..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full md:w-auto" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Feedback;
