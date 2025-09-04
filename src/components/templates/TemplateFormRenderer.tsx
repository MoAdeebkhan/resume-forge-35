import { ModernProfessionalForm } from "./ModernProfessionalForm";
import { CreativeDesignerForm } from "./CreativeDesignerForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, AlertCircle } from "lucide-react";

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

interface TemplateFormRendererProps {
  templateId: string;
  fields: ResumeFields;
  onFieldsChange: (fields: ResumeFields) => void;
  extractedConfidence?: Record<string, number>;
}

// Generic form component for templates that don't have custom forms yet
const GenericTemplateForm = ({ fields, onFieldsChange, templateId, extractedConfidence = {} }: {
  fields: ResumeFields;
  onFieldsChange: (fields: ResumeFields) => void;
  templateId: string;
  extractedConfidence?: Record<string, number>;
}) => {
  // For now, use the ModernProfessionalForm as a fallback
  // In the future, we can create specific forms for each template
  return (
    <div className="space-y-4">
      <Card className="border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
            <AlertCircle className="h-5 w-5 mr-2" />
            Template Form Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The custom form for "{templateId}" template is under development. 
            Using the professional template form for now.
          </p>
        </CardContent>
      </Card>
      <ModernProfessionalForm 
        fields={fields} 
        onFieldsChange={onFieldsChange}
        extractedConfidence={extractedConfidence}
      />
    </div>
  );
};

export const TemplateFormRenderer = ({ 
  templateId, 
  fields, 
  onFieldsChange, 
  extractedConfidence = {} 
}: TemplateFormRendererProps) => {
  
  // Route to the appropriate template form
  switch (templateId) {
    case "modern-professional":
      return (
        <ModernProfessionalForm 
          fields={fields} 
          onFieldsChange={onFieldsChange}
          extractedConfidence={extractedConfidence}
        />
      );
      
    case "creative-designer":
      return (
        <CreativeDesignerForm 
          fields={fields} 
          onFieldsChange={onFieldsChange}
          extractedConfidence={extractedConfidence}
        />
      );
      
    case "executive-premium":
    case "academic-scholar":
    case "minimalist-clean":
    case "tech-startup":
      return (
        <GenericTemplateForm 
          fields={fields} 
          onFieldsChange={onFieldsChange}
          templateId={templateId}
          extractedConfidence={extractedConfidence}
        />
      );
      
    // Handle custom templates
    default:
      if (templateId.startsWith("custom-")) {
        return (
          <div className="space-y-4">
            <Card className="border-success/30 bg-gradient-to-r from-success/5 to-emerald-50 dark:from-success/10 dark:to-emerald-950/20">
              <CardHeader>
                <CardTitle className="flex items-center text-success">
                  <FileText className="h-5 w-5 mr-2" />
                  Custom Template Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Editing form for your custom template. The final output will use your template's exact formatting and design.
                </p>
              </CardContent>
            </Card>
            <ModernProfessionalForm 
              fields={fields} 
              onFieldsChange={onFieldsChange}
              extractedConfidence={extractedConfidence}
            />
          </div>
        );
      }
      
      return (
        <GenericTemplateForm 
          fields={fields} 
          onFieldsChange={onFieldsChange}
          templateId={templateId}
          extractedConfidence={extractedConfidence}
        />
      );
  }
};