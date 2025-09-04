import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Palette, User, Mail, Phone, MapPin, FileText, Briefcase, GraduationCap, Award, Camera } from "lucide-react";

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

interface CreativeDesignerFormProps {
  fields: ResumeFields;
  onFieldsChange: (fields: ResumeFields) => void;
  extractedConfidence?: Record<string, number>;
}

export const CreativeDesignerForm = ({ fields, onFieldsChange, extractedConfidence = {} }: CreativeDesignerFormProps) => {
  const [formData, setFormData] = useState<ResumeFields>(fields);

  useEffect(() => {
    setFormData(fields);
  }, [fields]);

  const handleFieldChange = (fieldName: keyof ResumeFields, value: string) => {
    const updatedData = { ...formData, [fieldName]: value };
    setFormData(updatedData);
    onFieldsChange(updatedData);
  };

  const getConfidenceBadge = (fieldName: keyof ResumeFields) => {
    const confidence = extractedConfidence[fieldName];
    if (!confidence || confidence === 0) return null;
    
    const variant = confidence > 0.8 ? "default" : confidence > 0.5 ? "secondary" : "outline";
    const label = confidence > 0.8 ? "High" : confidence > 0.5 ? "Medium" : "Low";
    
    return <Badge variant={variant} className="text-xs ml-2">{label} confidence</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Creative Designer Resume
        </h2>
        <p className="text-muted-foreground">Showcase your creative talent with this vibrant design</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Preview */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="sticky top-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <Palette className="h-5 w-5 mr-2 text-purple-500" />
                Creative Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {/* Header Section with Creative Layout */}
              <div className="relative p-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                <div className="absolute top-2 right-2">
                  <Camera className="h-6 w-6 opacity-30" />
                </div>
                <h3 className="font-bold text-xl mb-2">
                  {formData.name || "Your Creative Name"}
                </h3>
                <div className="space-y-1 text-sm opacity-90">
                  {formData.email && <div className="flex items-center"><Mail className="h-3 w-3 mr-2" />{formData.email}</div>}
                  {formData.phone && <div className="flex items-center"><Phone className="h-3 w-3 mr-2" />{formData.phone}</div>}
                  {formData.location && <div className="flex items-center"><MapPin className="h-3 w-3 mr-2" />{formData.location}</div>}
                </div>
              </div>

              {/* Creative Summary */}
              {formData.summary && (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Creative Vision</h4>
                  <p className="text-xs text-muted-foreground">{formData.summary.slice(0, 120)}...</p>
                </div>
              )}

              {/* Skills with Creative Display */}
              {formData.skills && (
                <div>
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Creative Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.skills.split(',').slice(0, 5).map((skill, index) => (
                      <Badge 
                        key={index} 
                        className={`text-xs ${index % 2 === 0 ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700'} border-none`}
                      >
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio Projects */}
              {formData.projects && (
                <div>
                  <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">Featured Projects</h4>
                  <p className="text-xs text-muted-foreground">{formData.projects.slice(0, 80)}...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center text-purple-700 dark:text-purple-300">
                    Creative Name *
                    {getConfidenceBadge("name")}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    placeholder="Your Creative Identity"
                    className="border-purple-200 focus:border-purple-400 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center text-purple-700 dark:text-purple-300">
                    Email Address *
                    {getConfidenceBadge("email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="your.creative@email.com"
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center text-purple-700 dark:text-purple-300">
                    Phone Number *
                    {getConfidenceBadge("phone")}
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center text-purple-700 dark:text-purple-300">
                    Location
                    {getConfidenceBadge("location")}
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleFieldChange("location", e.target.value)}
                    placeholder="Creative Hub, NY"
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="text-purple-700 dark:text-purple-300">Portfolio Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleFieldChange("website", e.target.value)}
                    placeholder="www.yourcreativeportfolio.com"
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-purple-700 dark:text-purple-300">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => handleFieldChange("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/creativepro"
                    className="border-purple-200 focus:border-purple-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Creative Vision */}
          <Card className="border-pink-200 dark:border-pink-800">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
              <CardTitle className="flex items-center text-pink-700 dark:text-pink-300">
                <FileText className="h-5 w-5 mr-2" />
                Creative Vision & Philosophy
                {getConfidenceBadge("summary")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea
                value={formData.summary}
                onChange={(e) => handleFieldChange("summary", e.target.value)}
                placeholder="Describe your creative philosophy, artistic approach, and what drives your design passion..."
                className="min-h-[120px] border-pink-200 focus:border-pink-400"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {formData.summary.length}/600 characters - Tell your creative story
              </p>
            </CardContent>
          </Card>

          {/* Creative Experience */}
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                <Briefcase className="h-5 w-5 mr-2" />
                Creative Experience
                {getConfidenceBadge("experience")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea
                value={formData.experience}
                onChange={(e) => handleFieldChange("experience", e.target.value)}
                placeholder="Detail your creative roles, design projects, client work, and artistic achievements..."
                className="min-h-[200px] border-purple-200 focus:border-purple-400"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Highlight your most impactful creative projects and collaborations
              </p>
            </CardContent>
          </Card>

          {/* Education & Training */}
          <Card className="border-pink-200 dark:border-pink-800">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20">
              <CardTitle className="flex items-center text-pink-700 dark:text-pink-300">
                <GraduationCap className="h-5 w-5 mr-2" />
                Education & Creative Training
                {getConfidenceBadge("education")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea
                value={formData.education}
                onChange={(e) => handleFieldChange("education", e.target.value)}
                placeholder="List your design education, art schools, creative workshops, and relevant training..."
                className="min-h-[120px] border-pink-200 focus:border-pink-400"
              />
            </CardContent>
          </Card>

          {/* Creative Skills & Tools */}
          <Card className="border-purple-200 dark:border-purple-800">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardTitle className="flex items-center text-purple-700 dark:text-purple-300">
                <Award className="h-5 w-5 mr-2" />
                Creative Skills & Tools
                {getConfidenceBadge("skills")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Textarea
                value={formData.skills}
                onChange={(e) => handleFieldChange("skills", e.target.value)}
                placeholder="List your design software, artistic mediums, creative techniques (Adobe Creative Suite, Figma, Sketch, traditional art, etc.)..."
                className="min-h-[100px] border-purple-200 focus:border-purple-400"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Include both digital tools and traditional artistic skills
              </p>
            </CardContent>
          </Card>

          {/* Creative Portfolio Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-pink-200 dark:border-pink-800">
              <CardHeader>
                <CardTitle className="text-lg text-pink-700 dark:text-pink-300">Featured Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.projects}
                  onChange={(e) => handleFieldChange("projects", e.target.value)}
                  placeholder="Showcase your best creative projects, campaigns, and designs..."
                  className="min-h-[80px] border-pink-200 focus:border-pink-400"
                />
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-lg text-purple-700 dark:text-purple-300">Awards & Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.achievements}
                  onChange={(e) => handleFieldChange("achievements", e.target.value)}
                  placeholder="Creative awards, design competitions, featured work..."
                  className="min-h-[80px] border-purple-200 focus:border-purple-400"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="text-lg text-purple-700 dark:text-purple-300">Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.certifications}
                  onChange={(e) => handleFieldChange("certifications", e.target.value)}
                  placeholder="Design certifications, software proficiency credentials..."
                  className="min-h-[80px] border-purple-200 focus:border-purple-400"
                />
              </CardContent>
            </Card>

            <Card className="border-pink-200 dark:border-pink-800">
              <CardHeader>
                <CardTitle className="text-lg text-pink-700 dark:text-pink-300">Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.languages}
                  onChange={(e) => handleFieldChange("languages", e.target.value)}
                  placeholder="Languages for international creative collaboration..."
                  className="min-h-[80px] border-pink-200 focus:border-pink-400"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};