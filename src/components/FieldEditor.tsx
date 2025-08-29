import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Zap, 
  FolderOpen, 
  Award, 
  Languages, 
  Users,
  Save,
  RotateCcw
} from "lucide-react";
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

interface FieldEditorProps {
  fields: ResumeFields;
  onFieldsUpdated: (fields: ResumeFields) => void;
}

const fieldConfig = [
  {
    category: "Personal",
    fields: [
      { key: "name", label: "Full Name", icon: User, type: "input", required: true },
      { key: "email", label: "Email Address", icon: Mail, type: "input", required: true },
      { key: "phone", label: "Phone Number", icon: Phone, type: "input", required: true },
      { key: "location", label: "Location", icon: MapPin, type: "input", required: true }
    ]
  },
  {
    category: "Professional",
    fields: [
      { key: "summary", label: "Professional Summary", icon: FileText, type: "textarea", required: true },
      { key: "experience", label: "Work Experience", icon: Briefcase, type: "textarea", required: true },
      { key: "skills", label: "Skills & Expertise", icon: Zap, type: "textarea", required: true }
    ]
  },
  {
    category: "Additional",
    fields: [
      { key: "education", label: "Education", icon: GraduationCap, type: "textarea", required: false },
      { key: "projects", label: "Projects & Portfolio", icon: FolderOpen, type: "textarea", required: false },
      { key: "certifications", label: "Certifications & Awards", icon: Award, type: "textarea", required: false },
      { key: "languages", label: "Languages", icon: Languages, type: "textarea", required: false },
      { key: "references", label: "References", icon: Users, type: "textarea", required: false }
    ]
  }
];

export const FieldEditor = ({ fields, onFieldsUpdated }: FieldEditorProps) => {
  const [editedFields, setEditedFields] = useState<ResumeFields>(fields);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handleFieldChange = (key: keyof ResumeFields, value: string) => {
    setEditedFields(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onFieldsUpdated(editedFields);
    setHasChanges(false);
    toast({
      title: "Changes saved",
      description: "Your resume fields have been updated successfully."
    });
  };

  const handleReset = () => {
    setEditedFields(fields);
    setHasChanges(false);
    toast({
      title: "Changes reset",
      description: "All modifications have been reverted to the original extracted data."
    });
  };

  const getFieldValue = (key: string) => {
    return editedFields[key as keyof ResumeFields] || "";
  };

  const renderField = (field: any) => {
    const IconComponent = field.icon;
    const value = getFieldValue(field.key);
    const isEmpty = !value || value.trim() === "" || value === "Not Mentioned";

    return (
      <div key={field.key} className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor={field.key} className="flex items-center space-x-2 font-medium">
            <IconComponent className="h-4 w-4 text-primary" />
            <span>{field.label}</span>
            {field.required && <span className="text-destructive">*</span>}
          </Label>
          {isEmpty && (
            <Badge variant="outline" className="text-xs text-warning">
              Needs attention
            </Badge>
          )}
        </div>
        
        {field.type === "input" ? (
          <Input
            id={field.key}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={`Enter your ${field.label.toLowerCase()}`}
            className={`transition-all duration-200 ${
              isEmpty ? 'border-warning/50 focus:border-warning' : 'focus:border-primary'
            }`}
          />
        ) : (
          <Textarea
            id={field.key}
            value={value}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            placeholder={`Enter your ${field.label.toLowerCase()}`}
            rows={field.key === "summary" ? 4 : field.key === "experience" ? 8 : 6}
            className={`transition-all duration-200 resize-none ${
              isEmpty ? 'border-warning/50 focus:border-warning' : 'focus:border-primary'
            }`}
          />
        )}
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {isEmpty ? "This field appears to be empty or incomplete" : `${value.length} characters`}
          </span>
          {field.required && isEmpty && (
            <span className="text-warning">Required field</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="mx-auto max-w-4xl shadow-lg">
      <CardHeader className="border-b bg-gradient-to-r from-card to-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <span>Edit Your Resume</span>
            </CardTitle>
            <p className="text-muted-foreground mt-1">
              Review and edit the extracted information. All changes are automatically saved.
            </p>
          </div>
          
          {hasChanges && (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} className="bg-gradient-to-r from-success to-success/80">
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <Tabs defaultValue="Personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            {fieldConfig.map((category) => (
              <TabsTrigger key={category.category} value={category.category}>
                {category.category}
              </TabsTrigger>
            ))}
          </TabsList>

          {fieldConfig.map((category) => (
            <TabsContent key={category.category} value={category.category} className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold">{category.category} Information</h3>
                  <Badge variant="secondary" className="text-xs">
                    {category.fields.length} fields
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {category.fields.map(renderField)}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Summary Stats */}
        <div className="mt-8 pt-6 border-t bg-muted/20 rounded-lg p-4">
          <h4 className="font-medium mb-3 text-sm">Completion Status:</h4>
          <div className="flex flex-wrap gap-2">
            {fieldConfig.map((category) => {
              const filledFields = category.fields.filter(field => {
                const value = getFieldValue(field.key);
                return value && value.trim() !== "" && value !== "Not Mentioned";
              });
              const completion = (filledFields.length / category.fields.length) * 100;
              
              return (
                <Badge 
                  key={category.category}
                  variant={completion === 100 ? "default" : completion > 50 ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {category.category}: {Math.round(completion)}%
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};