import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, FileText, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileParser } from "@/utils/fileParser";

interface ResumeFields {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  projects: string;
  certifications: string;
  languages: string;
  references: string;
}

interface ResumeParserProps {
  file: File;
  onFieldsExtracted: (fields: ResumeFields) => void;
  setIsProcessing: (processing: boolean) => void;
}

export const ResumeParser = ({ file, onFieldsExtracted, setIsProcessing }: ResumeParserProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const processingSteps = [
    { step: "Reading file content...", duration: 1500 },
    { step: "Analyzing document structure...", duration: 2000 },
    { step: "Extracting personal information...", duration: 2500 },
    { step: "Processing work experience...", duration: 3000 },
    { step: "Identifying skills and education...", duration: 2500 },
    { step: "Finalizing extraction...", duration: 1500 }
  ];

  // Simulate AI processing with realistic steps
  useEffect(() => {
    const processResume = async () => {
      setIsProcessing(true);
      let totalProgress = 0;
      
      try {
        // Read file content using the proper parser
        setCurrentStep("Reading file content...");
        const fileContent = await FileParser.parseFile(file);
        
        if (!fileContent || fileContent.trim().length < 50) {
          throw new Error("File appears to be empty or contains insufficient text content");
        }
        
        for (let i = 0; i < processingSteps.length; i++) {
          const step = processingSteps[i];
          setCurrentStep(step.step);
          
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, step.duration));
          
          totalProgress = ((i + 1) / processingSteps.length) * 100;
          setProgress(totalProgress);
        }

        // Extract fields using AI (simulated)
        const extractedFields = await extractResumeFields(fileContent);
        
        setIsComplete(true);
        setCurrentStep("Processing complete!");
        
        setTimeout(() => {
          onFieldsExtracted(extractedFields);
          setIsProcessing(false);
        }, 1000);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
        setError(`Failed to process resume: ${errorMessage}`);
        setIsProcessing(false);
        toast({
          title: "Processing Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    };

    processResume();
  }, [file]);

  const extractResumeFields = async (content: string): Promise<ResumeFields> => {
    // In production, this would call your AI service (OpenAI, Anthropic, etc.)
    // For demo purposes, we'll create realistic extracted data based on content analysis
    
    // Simple content analysis to make the demo more realistic
    const hasEmail = content.toLowerCase().includes('@') || content.includes('email');
    const hasPhone = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(content);
    const hasExperience = content.toLowerCase().includes('experience') || content.toLowerCase().includes('work');
    const hasEducation = content.toLowerCase().includes('education') || content.toLowerCase().includes('university') || content.toLowerCase().includes('degree');
    
    const sampleData: ResumeFields = {
      name: hasEmail ? "John Smith" : "Professional Resume",
      email: hasEmail ? "john.smith@email.com" : "your.email@example.com",
      phone: hasPhone ? "+1 (555) 123-4567" : "+1 (XXX) XXX-XXXX",
      location: "San Francisco, CA",
      summary: hasExperience ? 
        "Experienced professional with expertise in their field, demonstrating strong analytical and problem-solving skills. Proven track record of delivering results and collaborating effectively with cross-functional teams." :
        "Motivated professional seeking to leverage skills and experience in a dynamic environment. Strong communication abilities and commitment to continuous learning and growth.",
      experience: hasExperience ?
        `Senior Professional (2021-Present)
• Led key initiatives and projects with measurable impact
• Collaborated with cross-functional teams to deliver results
• Improved processes and efficiency through innovative solutions

Professional Role (2019-2021)
• Contributed to team objectives and organizational goals
• Developed skills in relevant areas of expertise
• Participated in strategic planning and execution` :
        `Professional Experience
• Please update with your specific work history
• Include job titles, companies, and dates
• Highlight key achievements and responsibilities`,
      education: hasEducation ?
        `Bachelor's Degree in [Field of Study]
[University Name] (2015-2019)
Relevant Coursework: [List relevant courses]
GPA: [If applicable]` :
        `Education Details
Please add your educational background
• Degree(s) obtained
• Institution(s) attended
• Graduation dates`,
      skills: `Professional Skills:
• Technical expertise in relevant areas
• Strong analytical and problem-solving abilities
• Excellent communication and interpersonal skills
• Project management and organizational capabilities
• Proficiency with industry-standard tools and software`,
      projects: content.toLowerCase().includes('project') ?
        `Key Projects:
• [Project Name] - Brief description of project scope and impact
• [Project Name] - Summary of contributions and technologies used
• [Project Name] - Overview of results and lessons learned` :
        "Please add relevant projects and portfolio items",
      certifications: content.toLowerCase().includes('certification') || content.toLowerCase().includes('certified') ?
        `Professional Certifications:
• [Certification Name] - Issuing Organization (Year)
• [Certification Name] - Issuing Organization (Year)` :
        "Add relevant certifications and professional credentials",
      languages: "English (Native/Fluent)\nAdd additional languages as applicable",
      references: "Available upon request"
    };

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return sampleData;
  };

  if (error) {
    return (
      <Card className="mx-auto max-w-2xl border-destructive/20 bg-destructive/5">
        <CardContent className="p-8 text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">Processing Failed</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          {isComplete ? (
            <CheckCircle2 className="h-16 w-16 text-success animate-bounce" />
          ) : (
            <div className="relative">
              <Brain className="h-16 w-16 text-primary animate-pulse" />
              <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-primary-glow animate-spin" />
            </div>
          )}
        </div>
        <CardTitle className="text-2xl font-bold">
          {isComplete ? "Processing Complete!" : "AI Processing Your Resume"}
        </CardTitle>
        <p className="text-muted-foreground">
          {isComplete 
            ? "Your resume has been successfully analyzed and structured" 
            : "Our AI is analyzing your resume and extracting key information"
          }
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* File Info */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Badge variant={isComplete ? "default" : "secondary"} className="bg-success text-success-foreground">
            {isComplete ? "Processed" : "Processing"}
          </Badge>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Current Step */}
        <div className="flex items-center space-x-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          {!isComplete && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
          {isComplete && <CheckCircle2 className="h-5 w-5 text-success" />}
          <p className={`font-medium ${isComplete ? 'text-success' : 'text-primary'}`}>
            {currentStep}
          </p>
        </div>

        {/* Processing Steps */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Processing Steps:</h4>
          <div className="grid grid-cols-1 gap-2">
            {processingSteps.map((step, index) => {
              const stepProgress = (index + 1) / processingSteps.length * 100;
              const isStepComplete = progress >= stepProgress;
              const isCurrentStepActive = progress >= (index / processingSteps.length * 100) && progress < stepProgress;
              
              return (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-2 rounded text-sm transition-all duration-300 ${
                    isStepComplete 
                      ? 'text-success bg-success/10' 
                      : isCurrentStepActive 
                      ? 'text-primary bg-primary/10' 
                      : 'text-muted-foreground'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${
                    isStepComplete ? 'bg-success' : isCurrentStepActive ? 'bg-primary animate-pulse' : 'bg-muted'
                  }`} />
                  <span>{step.step}</span>
                </div>
              );
            })}
          </div>
        </div>

        {isComplete && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Proceeding to template selection...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};