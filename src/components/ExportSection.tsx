import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  FileText, 
  File as FileIcon, 
  CheckCircle2, 
  Loader2, 
  Eye, 
  Share2,
  Mail,
  Printer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TemplateProcessor } from "@/utils/templateProcessor";
import { type ResumeFields } from "@/utils/resumeExtractor";

interface ExportSectionProps {
  fields: ResumeFields;
  templateId: string;
}

interface CustomTemplate {
  id: string;
  name: string;
  file: File;
  uploadDate: string;
}

const exportFormats = [
  {
    id: "pdf",
    name: "PDF Document",
    description: "Professional PDF ready for email and printing",
    icon: FileText,
    badge: "Recommended",
    color: "from-red-500 to-red-600"
  },
  {
    id: "docx",
    name: "Word Document",
    description: "Editable Word document for further customization",
    icon: FileIcon,
    badge: "Editable",
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "html",
    name: "Web Page",
    description: "Shareable web version with modern styling",
    icon: Share2,
    badge: "Shareable",
    color: "from-green-500 to-green-600"
  }
];

export const ExportSection = ({ fields, templateId }: ExportSectionProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const { toast } = useToast();

  const generateResume = async (format: string) => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const isCustomTemplate = templateId.startsWith('custom-');
      
      // Simulate generation process with appropriate steps
      const steps = [
        "Loading template...",
        isCustomTemplate ? "Processing custom template..." : "Applying template styles...",
        "Extracting template structure...",
        "Replacing placeholders with your data...",
        "Formatting content...",
        "Optimizing layout...",
        "Generating final document...",
        "Preparing download..."
      ];

      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setGenerationProgress(((i + 1) / steps.length) * 100);
      }

      // Generate the actual resume content
      const resumeContent = await generateResumeContent(fields, templateId, format);
      
      if (format === "pdf" || format === "docx") {
        downloadFile(resumeContent, format);
      } else if (format === "html") {
        setPreviewUrl(resumeContent);
      }

      setIsComplete(true);
      setIsGenerating(false);

      toast({
        title: "Resume generated successfully!",
        description: `Your ${format.toUpperCase()} resume has been processed with ${isCustomTemplate ? 'your custom template' : 'the selected template'}.`
      });

    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "There was an error generating your resume. Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateResumeContent = async (fields: ResumeFields, templateId: string, format: string): Promise<string> => {
    const isCustomTemplate = templateId.startsWith('custom-');
    
    if (isCustomTemplate) {
      // Get the custom template file from localStorage or your storage solution
      const customTemplates = JSON.parse(localStorage.getItem('customTemplates') || '[]');
      const template = customTemplates.find((t: any) => t.id === templateId);
      
      if (template && template.fileData) {
        try {
          // Reconstruct the file from stored data
          const fileBlob = new Blob([new Uint8Array(template.fileData)], { 
            type: template.fileType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
          });
          
          // Create file object from blob
          const templateFile = new File([fileBlob], template.fileName || template.name, { 
            type: template.fileType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
          });
          
          // Process the custom template
          const processedContent = await TemplateProcessor.processCustomTemplate(templateFile, fields);
          return processedContent;
        } catch (error) {
          console.error('Custom template processing failed:', error);
          throw new Error('Failed to process your custom template. Please ensure it contains valid placeholders.');
        }
      } else {
        throw new Error('Custom template not found. Please re-upload your template.');
      }
    }
    
    // Fallback for predefined templates (HTML format)
    if (format === "html") {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${fields.name || 'Resume'} - Resume</title>
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #6366f1; 
              padding-bottom: 20px; 
              margin-bottom: 30px; 
            }
            .name { 
              font-size: 2.5em; 
              font-weight: bold; 
              color: #6366f1; 
              margin: 0; 
            }
            .contact { margin: 10px 0; }
            .section { margin: 30px 0; }
            .section-title { 
              font-size: 1.4em; 
              font-weight: bold; 
              color: #6366f1; 
              border-bottom: 1px solid #e5e7eb; 
              padding-bottom: 5px; 
              margin-bottom: 15px; 
            }
            .content { white-space: pre-line; }
            .empty-section { display: none; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="name">${fields.name || '[Your Name]'}</h1>
            <div class="contact">
              ${[fields.email, fields.phone, fields.location].filter(Boolean).join(' | ') || '[Contact Information]'}
            </div>
          </div>
          
          ${fields.summary ? `
          <div class="section">
            <h2 class="section-title">Professional Summary</h2>
            <div class="content">${fields.summary}</div>
          </div>
          ` : ''}
          
          ${fields.experience ? `
          <div class="section">
            <h2 class="section-title">Work Experience</h2>
            <div class="content">${fields.experience}</div>
          </div>
          ` : ''}
          
          ${fields.education ? `
          <div class="section">
            <h2 class="section-title">Education</h2>
            <div class="content">${fields.education}</div>
          </div>
          ` : ''}
          
          ${fields.skills ? `
          <div class="section">
            <h2 class="section-title">Skills</h2>
            <div class="content">${fields.skills}</div>
          </div>
          ` : ''}
          
          ${fields.projects && fields.projects.trim() ? `
          <div class="section">
            <h2 class="section-title">Projects</h2>
            <div class="content">${fields.projects}</div>
          </div>
          ` : ''}
          
          ${fields.certifications && fields.certifications.trim() ? `
          <div class="section">
            <h2 class="section-title">Certifications</h2>
            <div class="content">${fields.certifications}</div>
          </div>
          ` : ''}

          ${fields.languages && fields.languages.trim() ? `
          <div class="section">
            <h2 class="section-title">Languages</h2>
            <div class="content">${fields.languages}</div>
          </div>
          ` : ''}

          ${fields.achievements && fields.achievements.trim() ? `
          <div class="section">
            <h2 class="section-title">Achievements</h2>
            <div class="content">${fields.achievements}</div>
          </div>
          ` : ''}
        </body>
        </html>
      `;
    }
    
    return "resume-content-blob"; // For PDF/DOCX with predefined templates
  };

  const downloadFile = (content: string, format: string) => {
    const blob = new Blob([content], { 
      type: format === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fields.name.replace(/\s+/g, '_')}_Resume.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const previewResume = async () => {
    try {
      const htmlContent = await generateResumeContent(fields, templateId, "html");
      const newWindow = window.open("", "_blank");
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      }
    } catch (error) {
      toast({
        title: "Preview failed",
        description: error instanceof Error ? error.message : "Failed to generate preview",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Card className="shadow-lg">
        <CardHeader className="text-center bg-gradient-to-r from-card to-primary/5">
          <CardTitle className="text-2xl font-bold flex items-center justify-center space-x-2">
            <Download className="h-6 w-6 text-primary" />
            <span>Export Your Resume</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Choose your preferred format and download your professionally formatted resume
          </p>
        </CardHeader>

        <CardContent className="p-8 space-y-8">
          {/* Preview Section */}
          <div className="text-center space-y-4 p-6 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/20">
            <Eye className="h-12 w-12 text-primary mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Preview Your Resume</h3>
              <p className="text-sm text-muted-foreground mb-4">
                See how your resume will look before downloading
              </p>
              <Button onClick={previewResume} variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview Resume
              </Button>
            </div>
          </div>

          {/* Export Formats */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Choose Export Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {exportFormats.map((format) => {
                const IconComponent = format.icon;
                
                return (
                  <Card 
                    key={format.id} 
                    className="cursor-pointer hover:shadow-md transition-all duration-300 hover:scale-105"
                    onClick={() => generateResume(format.id)}
                  >
                    <CardContent className="p-6 text-center space-y-4">
                      <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-lg bg-gradient-to-r ${format.color} text-white`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {format.badge}
                        </Badge>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold">{format.name}</h4>
                        <p className="text-sm text-muted-foreground">{format.description}</p>
                      </div>
                      
                      <Button 
                        className="w-full" 
                        variant={format.id === "pdf" ? "default" : "outline"}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Download {format.name}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 text-center space-y-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                <div>
                  <h4 className="font-semibold text-primary">Generating Your Resume</h4>
                  <p className="text-sm text-muted-foreground">Please wait while we create your professional resume...</p>
                </div>
                <div className="space-y-2">
                  <Progress value={generationProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">{Math.round(generationProgress)}% complete</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success Message */}
          {isComplete && (
            <Card className="border-success/20 bg-success/5 animate-fade-in">
              <CardContent className="p-6 text-center space-y-4">
                <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
                <div>
                  <h4 className="font-semibold text-success">Resume Generated Successfully!</h4>
                  <p className="text-sm text-muted-foreground">
                    Your resume has been created and is ready to use. Good luck with your applications!
                  </p>
                </div>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Resume
                  </Button>
                  <Button variant="outline" size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Print Resume
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <div className="text-center text-sm text-muted-foreground space-y-2 pt-6 border-t">
            <p className="font-medium">💡 Pro Tips:</p>
            <ul className="text-xs space-y-1 max-w-md mx-auto">
              <li>• PDF format is recommended for job applications</li>
              <li>• Word format allows further customization</li>
              <li>• Always proofread before sending to employers</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};