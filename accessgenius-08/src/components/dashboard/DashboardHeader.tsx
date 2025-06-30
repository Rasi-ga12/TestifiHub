import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, FileText } from 'lucide-react';
import { 
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '@/components/ui/dialog';
import { 
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem 
} from '@/components/ui/select';
import AssessmentGenerator from '@/components/assessments/AssessmentGenerator';
import QuestionGenerator from '@/components/assessments/QuestionGenerator';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  className?: string;
  actions?: React.ReactNode;
  userRole?: string;
  groups?: { id: string; name: string }[];
  canAccessQuestionGenerator?: () => boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  description,
  className,
  actions,
  userRole = 'user',
  groups = [],
  canAccessQuestionGenerator = () => false,
}) => {
  const [showGenerator, setShowGenerator] = useState(false);
  const [showQuestionGenerator, setShowQuestionGenerator] = useState(false);
  const [questionGeneratorSelectedGroup, setQuestionGeneratorSelectedGroup] = useState('');

  return (
    <div className={cn(
      "flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4",
      className
    )}>
      {/* Title & Description */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      
      {/* Actions & Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/*<Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>*/}

        {/* Conditional Assessment Button */}
        {userRole !== 'admin' && (
          <div className="flex gap-2">
            <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
              <DialogTrigger asChild>
                <Button className="flex items-center whitespace-nowrap text-base px-5 py-2 sm:text-sm sm:px-4 sm:py-2">
                  <Plus className="mr-2 h-4 w-4 sm:h-3 sm:w-3" />Take New Assessment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[900px]">
                <DialogHeader>
                  <DialogTitle>Take New Assessment</DialogTitle>
                  <DialogDescription>
                    Use our AI-powered assessment generator to create a new assessment.
                  </DialogDescription>
                </DialogHeader>
                <AssessmentGenerator />
              </DialogContent>
            </Dialog>

            {/* Question Generator Dialog */}
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
          </div>
        )}
        
        {actions}
      </div>
    </div>
  );
};

export default DashboardHeader;
