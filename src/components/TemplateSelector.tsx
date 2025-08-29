import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Palette, Star, Crown, Briefcase, GraduationCap } from "lucide-react";

interface TemplateSelectorProps {
  onTemplateSelected: (templateId: string) => void;
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

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      onTemplateSelected(selectedTemplate);
    }
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            Continue with {templates.find(t => t.id === selectedTemplate)?.name}
          </Button>
        </div>
      )}
    </div>
  );
};