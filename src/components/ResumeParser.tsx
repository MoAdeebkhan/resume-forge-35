import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, FileText, Sparkles, CheckCircle2, AlertCircle, Key, Zap } from "lucide-react";
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
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const { toast } = useToast();

  const processingSteps = useAI ? [
    { step: "Reading file content...", duration: 1000 },
    { step: "Connecting to AI service...", duration: 1500 },
    { step: "AI analyzing resume structure...", duration: 2000 },
    { step: "AI extracting personal information...", duration: 2500 },
    { step: "AI processing work experience...", duration: 2000 },
    { step: "AI identifying skills and education...", duration: 2000 },
    { step: "Finalizing AI extraction...", duration: 1000 }
  ] : [
    { step: "Reading file content...", duration: 1500 },
    { step: "Analyzing document structure...", duration: 2000 },
    { step: "Extracting personal information...", duration: 2500 },
    { step: "Processing work experience...", duration: 3000 },
    { step: "Identifying skills and education...", duration: 2500 },
    { step: "Finalizing extraction...", duration: 1500 }
  ];

  const extractResumeFields = async (content: string): Promise<ResumeFields> => {
    console.log("Extracting fields from content:", content.substring(0, 200) + "...");
    console.log("Using AI extraction:", useAI, "API Key provided:", !!apiKey);
    
    try {
      let extractedFields: ResumeFields;
      
      if (useAI && apiKey.trim()) {
        // Use AI-powered extraction
        extractedFields = await AIResumeExtractor.extractWithAI(content, apiKey.trim());
        console.log("AI extracted fields:", extractedFields);
      } else {
        // Use improved fallback extraction
        extractedFields = AIResumeExtractor.extractFallback(content);
        console.log("Fallback extracted fields:", extractedFields);
      }
      
      // Simulate processing delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return extractedFields;
    } catch (error) {
      console.error("Error extracting resume fields:", error);
      throw new Error(`Failed to extract resume information: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleStartProcessing = () => {
    if (useAI && !apiKey.trim()) {
      setShowApiKeyInput(true);
      return;
    }
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
      
      // Generate confidence scores based on field completeness and AI usage
      const confidenceScores: Record<string, number> = {
        name: extractedFields.name ? (useAI ? 0.95 : 0.85) : 0,
        email: extractedFields.email ? (useAI ? 0.98 : 0.9) : 0,
        phone: extractedFields.phone ? (useAI ? 0.9 : 0.8) : 0,
        location: extractedFields.location ? (useAI ? 0.85 : 0.75) : 0,
        summary: extractedFields.summary ? (useAI ? 0.9 : 0.7) : 0,
        experience: extractedFields.experience ? (useAI ? 0.95 : 0.8) : 0,
        education: extractedFields.education ? (useAI ? 0.9 : 0.8) : 0,
        skills: extractedFields.skills ? (useAI ? 0.95 : 0.85) : 0,
        projects: extractedFields.projects ? (useAI ? 0.85 : 0.7) : 0,
        achievements: extractedFields.achievements ? (useAI ? 0.8 : 0.6) : 0
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
          {isComplete ? "Processing Complete!" : hasStarted ? "AI Processing Your Resume" : "Choose Processing Method"}
        </CardTitle>
        <p className="text-muted-foreground">
          {isComplete 
            ? "Your resume has been successfully analyzed and structured" 
            : hasStarted 
            ? "Our system is analyzing your resume and extracting key information"
            : "Select how you'd like to extract information from your resume"
          }
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Method Selection */}
        {!hasStarted && !isComplete && (
          <div className="space-y-6">
            {!showApiKeyInput ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* AI-Powered Option */}
                  <Card 
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                      useAI ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setUseAI(true)}
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                          <Zap className="h-6 w-6" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold">AI-Powered Extraction</h4>
                        <p className="text-sm text-muted-foreground">
                          Most accurate results using advanced AI
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        Recommended
                      </Badge>
                    </CardContent>
                  </Card>

                  {/* Basic Option */}
                  <Card 
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                      !useAI ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setUseAI(false)}
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                          <FileText className="h-6 w-6" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold">Basic Extraction</h4>
                        <p className="text-sm text-muted-foreground">
                          Quick extraction using pattern matching
                        </p>
                      </div>
                      <Badge variant="outline">
                        Free
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center">
                  <Button 
                    onClick={() => {
                      if (useAI) {
                        setShowApiKeyInput(true);
                      } else {
                        handleStartProcessing();
                      }
                    }}
                    className="w-full md:w-auto"
                  >
                    {useAI ? 'Configure AI Settings' : 'Start Processing'}
                  </Button>
                </div>
              </div>
            ) : (
              /* API Key Input */
              <div className="space-y-4">
                <div className="text-center">
                  <Key className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Enter Perplexity API Key</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    To use AI-powered extraction, please enter your Perplexity API key.
                    <br />
                    <a href="https://www.perplexity.ai/settings/api" target="_blank" className="text-primary hover:underline">
                      Get your API key here
                    </a>
                  </p>
                </div>
                
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="apiKey">Perplexity API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="pplx-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleStartProcessing}
                      disabled={!apiKey.trim()}
                      className="flex-1"
                    >
                      Start AI Processing
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setUseAI(false);
                        setShowApiKeyInput(false);
                        handleStartProcessing();
                      }}
                    >
                      Use Basic Instead
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
                  {(file.size / 1024 / 1024).toFixed(2)} MB • {useAI ? 'AI Processing' : 'Basic Processing'}
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