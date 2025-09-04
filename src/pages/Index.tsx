import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ResumeParser } from "@/components/ResumeParser";
import { TemplateSelector } from "@/components/TemplateSelector";
import { TemplateFormRenderer } from "@/components/templates/TemplateFormRenderer";
import { ExportSection } from "@/components/ExportSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, FileText, Zap, Download } from "lucide-react";

interface ResumeFields {
  name: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  summary: string;
  experience: string;
  education: string;
  skills: string;
  certifications: string;
  languages: string;
  projects: string;
  achievements: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedFields, setExtractedFields] = useState<ResumeFields | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedConfidence, setExtractedConfidence] = useState<Record<string, number>>({});

  const steps = [
    { id: 1, title: "Upload Resume", icon: FileText, description: "Upload your current resume in any format" },
    { id: 2, title: "AI Processing", icon: Sparkles, description: "Let AI extract and structure your information" },
    { id: 3, title: "Choose Template", icon: Zap, description: "Select a professional template design" },
    { id: 4, title: "Edit & Export", icon: Download, description: "Review, edit and download your new resume" }
  ];

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setCurrentStep(2);
  };

  const handleFieldsExtracted = (fields: ResumeFields, confidence?: Record<string, number>) => {
    setExtractedFields(fields);
    if (confidence) {
      setExtractedConfidence(confidence);
    }
    setCurrentStep(3);
  };

  const handleTemplateSelected = (templateId: string) => {
    setSelectedTemplate(templateId);
    setCurrentStep(4);
  };

  const handleFieldsUpdated = (updatedFields: ResumeFields) => {
    setExtractedFields(updatedFields);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary-glow/10" />
        
        <div className="relative mx-auto max-w-6xl text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium animate-fade-in">
            <Sparkles className="mr-2 h-4 w-4" />
            AI-Powered Resume Converter
          </Badge>
          
          <h1 className="mb-6 text-5xl font-bold tracking-tight animate-fade-in md:text-7xl">
            Transform Your{" "}
            <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              Resume
            </span>
          </h1>
          
          <p className="mb-12 text-xl text-muted-foreground animate-slide-up max-w-3xl mx-auto">
            Upload any resume format and instantly convert it to beautiful, professional templates. 
            Our AI preserves your experience while enhancing the presentation.
          </p>

          {/* Progress Steps */}
          <div className="mb-16 flex flex-wrap justify-center gap-4 animate-slide-up">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <Card key={step.id} className={`relative transition-all duration-500 ${
                  isActive ? 'ring-2 ring-primary shadow-lg scale-105 bg-gradient-to-br from-card to-primary/5' : 
                  isCompleted ? 'bg-success/5 border-success/20' : 'hover:shadow-md'
                }`}>
                  <CardContent className="p-6 text-center">
                    <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                      isActive ? 'bg-primary text-primary-foreground' :
                      isCompleted ? 'bg-success text-success-foreground' : 'bg-muted'
                    }`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-sm">{step.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl">
          {currentStep === 1 && (
            <div className="animate-fade-in">
              <FileUpload onFileUpload={handleFileUpload} />
            </div>
          )}

          {currentStep === 2 && uploadedFile && (
            <div className="animate-fade-in">
              <ResumeParser 
                file={uploadedFile} 
                onFieldsExtracted={handleFieldsExtracted}
                setIsProcessing={setIsProcessing}
              />
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-fade-in">
              <TemplateSelector onTemplateSelected={handleTemplateSelected} />
            </div>
          )}

          {currentStep === 4 && extractedFields && (
            <div className="animate-fade-in space-y-8">
              <TemplateFormRenderer 
                templateId={selectedTemplate}
                fields={extractedFields}
                onFieldsChange={setExtractedFields}
                extractedConfidence={extractedConfidence}
              />
              <div className="border-t pt-8">
                <ExportSection 
                  fields={extractedFields} 
                  templateId={selectedTemplate}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          {currentStep > 1 && (
            <div className="mt-12 flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={isProcessing}
              >
                Back to Previous Step
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;