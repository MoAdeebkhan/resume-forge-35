import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, FileText, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileParser } from "@/utils/fileParser";
import { ResumeExtractor, type ResumeFields } from "@/utils/resumeExtractor";
import { AIResumeExtractor } from "@/utils/aiResumeExtractor";

interface ResumeParserProps {
  file: File;
  onFieldsExtracted: (fields: ResumeFields, confidence?: Record<string, number>) => void;
  setIsProcessing: (processing: boolean) => void;
}

export const ResumeParser = ({ file, onFieldsExtracted, setIsProcessing }: ResumeParserProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const { toast } = useToast();

  const processingSteps = [
    { step: "Reading file content...", duration: 800 },
    { step: "Analyzing document structure...", duration: 1200 },
    { step: "Extracting personal information...", duration: 1500 },
    { step: "Processing work experience...", duration: 2000 },
    { step: "Identifying skills and education...", duration: 1800 },
    { step: "Finalizing extraction...", duration: 700 }
  ];

  const extractResumeFields = async (content: string): Promise<ResumeFields> => {
    console.log("Extracting fields from content:", content.substring(0, 200) + "...");
    
    try {
      // Use enhanced pattern-based extraction
      const extractedFields = AIResumeExtractor.extractFallback(content);
      console.log("Extracted fields:", extractedFields);
      
      // Simulate processing delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return extractedFields;
    } catch (error) {
      console.error("Error extracting resume fields:", error);
      throw new Error(`Failed to extract resume information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleStartProcessing = () => {
    processResume();
  };

  const processResume = async () => {
    setIsProcessing(true);
    setHasStarted(true);
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

      // Extract fields
      const extractedFields = await extractResumeFields(fileContent);
      
      // Generate confidence scores based on field completeness and content quality
      const confidenceScores: Record<string, number> = {
        name: extractedFields.name ? (extractedFields.name.length > 5 ? 0.9 : 0.7) : 0,
        email: extractedFields.email ? (extractedFields.email.includes('@') ? 0.95 : 0.6) : 0,
        phone: extractedFields.phone ? (extractedFields.phone.length > 8 ? 0.85 : 0.6) : 0,
        location: extractedFields.location ? (extractedFields.location.includes(',') ? 0.8 : 0.6) : 0,
        summary: extractedFields.summary ? (extractedFields.summary.length > 50 ? 0.8 : 0.5) : 0,
        experience: extractedFields.experience ? (extractedFields.experience.length > 100 ? 0.85 : 0.6) : 0,
        education: extractedFields.education ? (extractedFields.education.length > 50 ? 0.8 : 0.6) : 0,
        skills: extractedFields.skills ? (extractedFields.skills.split(',').length > 2 ? 0.9 : 0.7) : 0,
        projects: extractedFields.projects ? (extractedFields.projects.length > 80 ? 0.75 : 0.5) : 0,
        achievements: extractedFields.achievements ? (extractedFields.achievements.length > 50 ? 0.7 : 0.4) : 0
      };
      
      setIsComplete(true);
      setCurrentStep("Processing complete!");
      
      setTimeout(() => {
        onFieldsExtracted(extractedFields, confidenceScores);
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
          ) : hasStarted ? (
            <div className="relative">
              <Brain className="h-16 w-16 text-primary animate-pulse" />
              <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-primary-glow animate-spin" />
            </div>
          ) : (
            <FileText className="h-16 w-16 text-primary" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold">
          {isComplete ? "Processing Complete!" : hasStarted ? "Processing Your Resume" : "Resume Parser"}
        </CardTitle>
        <p className="text-muted-foreground">
          {isComplete 
            ? "Your resume has been successfully analyzed and structured" 
            : hasStarted 
            ? "Our system is analyzing your resume and extracting key information"
            : "Click below to start extracting information from your resume"
          }
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Start Processing Button */}
        {!hasStarted && !isComplete && (
          <div className="text-center space-y-4">
            <div className="p-6">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-primary to-primary-glow text-white">
                  <FileText className="h-8 w-8" />
                </div>
              </div>
              <h4 className="font-semibold text-lg mb-2">Smart Pattern Extraction</h4>
              <p className="text-muted-foreground mb-6">
                Advanced pattern matching technology to accurately extract your resume information - completely free!
              </p>
              <Button 
                onClick={handleStartProcessing}
                size="lg"
                className="w-full md:w-auto px-8"
              >
                Start Processing Resume
              </Button>
            </div>
          </div>
        )}

        {/* File Info */}
        {hasStarted && (
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • Smart Pattern Processing
                </p>
              </div>
            </div>
            <Badge variant={isComplete ? "default" : "secondary"} className="bg-success text-success-foreground">
              {isComplete ? "Processed" : "Processing"}
            </Badge>
          </div>
        )}

        {/* Progress */}
        {hasStarted && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        )}

        {/* Current Step */}
        {hasStarted && (
          <div className="flex items-center space-x-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            {!isComplete && <Loader2 className="h-5 w-5 text-primary animate-spin" />}
            {isComplete && <CheckCircle2 className="h-5 w-5 text-success" />}
            <p className={`font-medium ${isComplete ? 'text-success' : 'text-primary'}`}>
              {currentStep}
            </p>
          </div>
        )}

        {/* Processing Steps */}
        {hasStarted && (
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
        )}

        {isComplete && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Proceeding to field editing...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};