import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Upload, Sparkles, CheckCircle, Plus, X, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const schema = z.object({
  subject: z.string().min(1, "Subject is required"),
  inputMethod: z.enum(["upload", "manual"]),
  syllabusText: z.string().optional(),
});

// Define the mark category type
interface MarkCategory {
  id: string;
  marks: number;
  questionCount: number;
  total: number;
}

const QuestionGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedQuestions, setGeneratedQuestions] = useState<string | null>(null);
  const [markCategories, setMarkCategories] = useState<MarkCategory[]>([
    { id: '1', marks: 1, questionCount: 5, total: 5 },
    { id: '2', marks: 5, questionCount: 3, total: 15 },
  ]);
  
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      subject: "",
      inputMethod: "upload",
    }
  });
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success(`File "${file.name}" uploaded successfully`);
    }
  };
  
  const handleMarkCategoryChange = (id: string, field: 'marks' | 'questionCount', value: number) => {
    setMarkCategories(prev => 
      prev.map(category => {
        if (category.id === id) {
          const updatedCategory = { 
            ...category, 
            [field]: value 
          };
          return { 
            ...updatedCategory, 
            total: updatedCategory.marks * updatedCategory.questionCount 
          };
        }
        return category;
      })
    );
  };
  
  const addMarkCategory = () => {
    const newId = String(markCategories.length + 1);
    setMarkCategories([
      ...markCategories, 
      { id: newId, marks: 0, questionCount: 0, total: 0 }
    ]);
  };
  
  const removeMarkCategory = (id: string) => {
    if (markCategories.length > 1) {
      setMarkCategories(markCategories.filter(category => category.id !== id));
    } else {
      toast.error("You must have at least one mark category");
    }
  };

  const onSubmit = async (data: z.infer<typeof schema>) => {
    // Check if mark categories are valid
    const hasInvalidCategory = markCategories.some(
      category => category.marks <= 0 || category.questionCount <= 0
    );
    
    if (hasInvalidCategory) {
      toast.error("All mark categories must have values greater than zero");
      return;
    }
    
    // Check if syllabus is provided when manual input is selected
    if (data.inputMethod === "manual" && (!data.syllabusText || data.syllabusText.trim() === "")) {
      toast.error("Please provide syllabus text for manual input");
      return;
    }
    
    // Check if file is uploaded when upload is selected
    if (data.inputMethod === "upload" && !uploadedFile) {
      toast.error("Please upload a syllabus file");
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedQuestions(null);
    
    // Simulate AI generation process with progress
    const totalSteps = 5;
    const updateProgress = (step: number) => {
      setGenerationProgress(Math.round((step / totalSteps) * 100));
    };
    
    try {
      // Simulating AI processing steps
      await new Promise(resolve => setTimeout(() => {
        updateProgress(1);
        resolve(null);
      }, 1000));
      
      await new Promise(resolve => setTimeout(() => {
        updateProgress(2);
        resolve(null);
      }, 1000));
      
      await new Promise(resolve => setTimeout(() => {
        updateProgress(3);
        resolve(null);
      }, 1000));
      
      await new Promise(resolve => setTimeout(() => {
        updateProgress(4);
        resolve(null);
      }, 1000));
      
      await new Promise(resolve => setTimeout(() => {
        updateProgress(5);
        
        // Generate questions based on mark categories
        const questions = markCategories.flatMap(category => {
          const categoryQuestions = [];
          for (let i = 1; i <= category.questionCount; i++) {
            categoryQuestions.push(`${categoryQuestions.length + 1}. Explain the concept of [topic] and its application in real-world scenarios. [${category.marks} marks]`);
          }
          return categoryQuestions;
        });
        
        const mockQuestions = `
## ${data.subject} Assessment
### Input Method: ${data.inputMethod === "upload" ? `File Upload: ${uploadedFile?.name}` : "Manual Input"}

${questions.join('\n\n')}
`;
        
        setGeneratedQuestions(mockQuestions);
        toast.success("Questions generated successfully!");
        resolve(null);
      }, 1000));
      
    } catch (error) {
      toast.error("Failed to generate questions. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const inputMethod = form.watch("inputMethod");
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Question Generator
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {generatedQuestions ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Generated Questions</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setGeneratedQuestions(null)}
              >
                Generate Again
              </Button>
            </div>
            
            <div className="border rounded-md p-4 bg-muted/30">
              <pre className="whitespace-pre-wrap text-sm font-mono">{generatedQuestions}</pre>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText(generatedQuestions);
                toast.success("Questions copied to clipboard");
              }}>
                Copy to Clipboard
              </Button>
              <Button onClick={() => {
                toast.success("Questions saved to assessment", {
                  description: "The questions have been added to your assessment."
                });
              }}>
                Save to Assessment
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Physics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="inputMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input Method</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select input method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="upload">Upload File</SelectItem>
                        <SelectItem value="manual">Manual Input</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {inputMethod === "upload" ? (
                <div className="space-y-2">
                  <FormLabel>Upload Syllabus</FormLabel>
                  <div className="border border-dashed rounded-md p-6 text-center space-y-4">
                    <div className="flex flex-col items-center justify-center">
                      {uploadedFile ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span>{uploadedFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Drag & drop a file here, or click to browse
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      id="syllabus-upload"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => document.getElementById('syllabus-upload')?.click()}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Browse Files
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported formats: PDF, DOC, DOCX, TXT
                    </p>
                  </div>
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="syllabusText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Syllabus</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste or type your syllabus content here" 
                          className="min-h-32" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Mark Categories</FormLabel>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <div className="grid grid-cols-4 bg-muted p-3 border-b text-sm font-medium">
                    <div>Marks</div>
                    <div>Number of Questions</div>
                    <div>Total</div>
                    <div className="text-right">Action</div>
                  </div>
                  
                  <div className="divide-y">
                    {markCategories.map((category) => (
                      <div key={category.id} className="grid grid-cols-4 p-3 items-center">
                        <div>
                          <Input 
                            type="number" 
                            min={1}
                            value={category.marks || ''}
                            onChange={(e) => handleMarkCategoryChange(
                              category.id, 
                              'marks', 
                              parseInt(e.target.value) || 0
                            )}
                            className="w-20"
                          />
                        </div>
                        <div>
                          <Input 
                            type="number" 
                            min={1}
                            value={category.questionCount || ''}
                            onChange={(e) => handleMarkCategoryChange(
                              category.id, 
                              'questionCount', 
                              parseInt(e.target.value) || 0
                            )}
                            className="w-20"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{category.total}</span>
                          <Calculator className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-right">
                          <Button 
                            type="button"
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeMarkCategory(category.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 bg-muted/50 border-t">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="w-full flex items-center justify-center"
                      onClick={addMarkCategory}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Row
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="text-sm text-muted-foreground">
                    Total marks: {markCategories.reduce((sum, category) => sum + category.total, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total questions: {markCategories.reduce((sum, category) => sum + category.questionCount, 0)}
                  </div>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4 animate-pulse" />
                      <span>Generating Questions...</span>
                    </div>
                    <Progress value={generationProgress} className="h-1" />
                  </div>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Questions
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default QuestionGenerator;
