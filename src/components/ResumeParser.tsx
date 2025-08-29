import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, FileText, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    { step: "Reading file content...", duration: 1000 },
    { step: "Analyzing document structure...", duration: 1500 },
    { step: "Extracting personal information...", duration: 2000 },
    { step: "Processing work experience...", duration: 2500 },
    { step: "Identifying skills and education...", duration: 2000 },
    { step: "Finalizing extraction...", duration: 1000 }
  ];

  // Simulate AI processing with realistic steps
  useEffect(() => {
    const processResume = async () => {
      setIsProcessing(true);
      let totalProgress = 0;
      
      try {
        // Read file content
        const fileContent = await readFileContent(file);
        
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
        setError("Failed to process resume. Please try again.");
        setIsProcessing(false);
        toast({
          title: "Processing Error",
          description: "There was an issue processing your resume. Please try uploading again.",
          variant: "destructive"
        });
      }
    };

    processResume();
  }, [file]);

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      
      // For simplicity, read as text. In production, you'd handle different file types
      reader.readAsText(file);
    });
  };

  const extractResumeFields = async (content: string): Promise<ResumeFields> => {
    // In production, this would call your AI service (OpenAI, Anthropic, etc.)
    // For demo purposes, we'll create realistic extracted data
    
    const sampleData: ResumeFields = {
      name: "John Smith",
      email: "john.smith@email.com",
      phone: "+1 (555) 123-4567",
      location: "San Francisco, CA",
      summary: "Experienced software engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of delivering scalable solutions and leading cross-functional teams.",
      experience: "Senior Software Engineer at TechCorp (2021-Present)\n• Led development of microservices architecture serving 1M+ users\n• Improved application performance by 40% through optimization\n• Mentored 3 junior developers and established code review processes\n\nSoftware Engineer at StartupXYZ (2019-2021)\n• Built responsive web applications using React and TypeScript\n• Implemented CI/CD pipelines reducing deployment time by 60%\n• Collaborated with product team to deliver 15+ feature releases",
      education: "Bachelor of Science in Computer Science\nUniversity of California, Berkeley (2015-2019)\nGPA: 3.8/4.0\nRelevant Coursework: Data Structures, Algorithms, Software Engineering, Database Systems",
      skills: "Programming Languages: JavaScript, TypeScript, Python, Java\nFrameworks: React, Node.js, Express, Next.js\nDatabases: PostgreSQL, MongoDB, Redis\nCloud: AWS, Docker, Kubernetes\nTools: Git, Jenkins, Jira, Figma",
      projects: "E-Commerce Platform (2023)\n• Built full-stack e-commerce solution with React and Node.js\n• Integrated Stripe payments and inventory management\n• Deployed on AWS with 99.9% uptime\n\nTask Management App (2022)\n• Developed collaborative task management tool\n• Implemented real-time updates using WebSocket\n• Used by 500+ internal users",
      certifications: "AWS Certified Solutions Architect - Associate (2023)\nGoogle Cloud Professional Developer (2022)\nCertified Kubernetes Administrator (2021)",
      languages: "English (Native)\nSpanish (Conversational)\nMandarin (Basic)",
      references: "Available upon request"
    };

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
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