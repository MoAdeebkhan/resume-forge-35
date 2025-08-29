import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Palette, Star, Crown, Briefcase, GraduationCap, Upload, FileText, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TemplateSelectorProps {
  onTemplateSelected: (templateId: string) => void;
}

interface CustomTemplate {
  id: string;
  name: string;
  file: File;
  uploadDate: string;
}

const templates = [
  {
    id: "modern-professional",
    name: "Modern Professional",
    description: "Clean, modern design perfect for corporate roles",
    icon: Briefcase,
    badge: "Popular",
    color: "from-blue-500 to-blue-600",
    features: ["ATS-Friendly", "Clean Layout", "Professional Colors"]
  },
  {
    id: "creative-designer",
    name: "Creative Designer",
    description: "Bold and creative layout for design professionals",
    icon: Palette,
    badge: "Creative",
    color: "from-purple-500 to-pink-500",
    features: ["Visual Impact", "Color Accent", "Portfolio Focus"]
  },
  {
    id: "executive-premium",
    name: "Executive Premium",
    description: "Premium template for senior executives and leaders",
    icon: Crown,
    badge: "Premium",
    color: "from-amber-500 to-orange-500",
    features: ["Luxury Design", "Executive Style", "Leadership Focus"]
  },
  {
    id: "academic-scholar",
    name: "Academic Scholar",
    description: "Traditional academic format for research positions",
    icon: GraduationCap,
    badge: "Academic",
    color: "from-green-500 to-emerald-500",
    features: ["Research Focus", "Publication Ready", "Academic Standards"]
  },
  {
    id: "minimalist-clean",
    name: "Minimalist Clean",
    description: "Simple, clean design that highlights your content",
    icon: Star,
    badge: "Minimal",
    color: "from-gray-500 to-slate-600",
    features: ["Minimal Design", "Content Focus", "Easy Reading"]
  },
  {
    id: "tech-startup",
    name: "Tech Startup",
    description: "Modern tech-focused template for startup culture",
    icon: Briefcase,
    badge: "Tech",
    color: "from-cyan-500 to-blue-500",
    features: ["Tech Style", "Startup Vibe", "Innovation Focus"]
  }
];

export const TemplateSelector = ({ onTemplateSelected }: TemplateSelectorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [hoveredTemplate, setHoveredTemplate] = useState<string>("");
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      onTemplateSelected(selectedTemplate);
    }
  };

  const validateTemplateFile = (file: File): boolean => {
    const acceptedTypes = ['.docx', '.doc'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!acceptedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a DOCX or DOC template file.",
        variant: "destructive"
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Template file must be smaller than 5MB.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleTemplateUpload = (file: File) => {
    if (validateTemplateFile(file)) {
      const customTemplate: CustomTemplate = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.(docx|doc)$/i, ''),
        file: file,
        uploadDate: new Date().toLocaleDateString()
      };
      
      setCustomTemplates(prev => [...prev, customTemplate]);
      setSelectedTemplate(customTemplate.id);
      
      toast({
        title: "Template uploaded successfully",
        description: `${customTemplate.name} is ready to use.`
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleTemplateUpload(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleTemplateUpload(files[0]);
    }
    // Reset the input value so the same file can be uploaded again
    e.target.value = '';
  };

  const removeCustomTemplate = (templateId: string) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
    if (selectedTemplate === templateId) {
      setSelectedTemplate("");
    }
    toast({
      title: "Template removed",
      description: "Custom template has been deleted."
    });
  };

  const getBadgeVariant = (badge: string) => {
    switch (badge) {
      case "Popular": return "default";
      case "Premium": return "secondary";
      case "Creative": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Choose Your Template</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Select a professional template that matches your industry and personal style. 
          All templates are ATS-friendly and optimized for modern hiring practices.
        </p>
      </div>

      {/* Custom Template Upload Section */}
      <Card className="mb-8 border-dashed border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary-glow/5">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
                <Plus className="h-8 w-8" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Upload Your Own Template</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Have a specific template design? Upload your own DOCX template with placeholders like {`{name}`}, {`{email}`}, etc.
              </p>
            </div>

            {/* Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-300 cursor-pointer ${
                isDragOver 
                  ? 'border-primary bg-primary/10 scale-[1.02]' 
                  : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              <input
                type="file"
                accept=".docx,.doc"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <div className="space-y-3">
                <Upload className={`mx-auto h-12 w-12 ${isDragOver ? 'text-primary' : 'text-muted-foreground'} transition-colors`} />
                <div>
                  <p className={`font-medium ${isDragOver ? 'text-primary' : 'text-foreground'}`}>
                    {isDragOver ? 'Drop your template here' : 'Drag and drop your template'}
                  </p>
                  <p className="text-sm text-muted-foreground">or click to browse (DOCX, DOC files only)</p>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>💡 <strong>Tip:</strong> Use placeholders like {`{name}`}, {`{email}`}, {`{experience}`} in your template</p>
              <p>🔒 Maximum file size: 5MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Custom Templates */}
        {customTemplates.map((template) => {
          const isSelected = selectedTemplate === template.id;
          
          return (
            <Card
              key={template.id}
              className={`relative cursor-pointer transition-all duration-300 hover:scale-105 border-2 ${
                isSelected 
                  ? 'ring-2 ring-primary shadow-lg bg-gradient-to-br from-card to-primary/5 border-primary' 
                  : 'border-success/30 hover:shadow-md bg-gradient-to-br from-card to-success/5'
              }`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-success rounded-full p-2 shadow-lg">
                    <CheckCircle2 className="h-5 w-5 text-success-foreground" />
                  </div>
                </div>
              )}

              <div className="absolute top-3 right-3 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCustomTemplate(template.id);
                  }}
                >
                  ×
                </Button>
              </div>

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between pr-8">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-success to-emerald-500 text-white">
                    <FileText className="h-6 w-6" />
                  </div>
                  <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                    Custom
                  </Badge>
                </div>
                <CardTitle className="text-lg pr-8">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Uploaded on {template.uploadDate}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Template Preview */}
                <div className="aspect-[3/4] bg-gradient-to-br from-success/10 to-success/20 rounded-md border-2 border-dashed border-success/30 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="mx-auto mb-2 h-8 w-8 text-success" />
                    <p className="text-xs text-muted-foreground">Your Template</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs w-full justify-center">
                    Personal Template
                  </Badge>
                </div>

                {isSelected && (
                  <div className="pt-2 border-t animate-fade-in">
                    <p className="text-sm text-primary font-medium">
                      ✓ Selected
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Predefined Templates */}
        {templates.map((template) => {
          const IconComponent = template.icon;
          const isSelected = selectedTemplate === template.id;
          const isHovered = hoveredTemplate === template.id;
          
          return (
            <Card
              key={template.id}
              className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                isSelected 
                  ? 'ring-2 ring-primary shadow-lg bg-gradient-to-br from-card to-primary/5' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleTemplateSelect(template.id)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate("")}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-success rounded-full p-2 shadow-lg">
                    <CheckCircle2 className="h-5 w-5 text-success-foreground" />
                  </div>
                </div>
              )}

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${template.color} text-white`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <Badge variant={getBadgeVariant(template.badge)} className="text-xs">
                    {template.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Template Preview */}
                <div className="aspect-[3/4] bg-gradient-to-br from-muted/30 to-muted/50 rounded-md border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`mx-auto mb-2 h-8 w-8 rounded bg-gradient-to-r ${template.color} opacity-60`} />
                    <p className="text-xs text-muted-foreground">Template Preview</p>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.features.map((feature) => (
                      <Badge key={feature} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Hover/Select State */}
                {(isSelected || isHovered) && (
                  <div className="pt-2 border-t animate-fade-in">
                    <p className="text-sm text-primary font-medium">
                      {isSelected ? "✓ Selected" : "Click to select"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Continue Button */}
        {selectedTemplate && (
        <div className="flex justify-center pt-8 animate-fade-in">
          <Button 
            onClick={handleContinue}
            className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-dark hover:to-primary text-primary-foreground font-medium px-8 py-3 text-lg"
          >
            Continue with {
              customTemplates.find(t => t.id === selectedTemplate)?.name || 
              templates.find(t => t.id === selectedTemplate)?.name
            }
          </Button>
        </div>
      )}
    </div>
  );
};