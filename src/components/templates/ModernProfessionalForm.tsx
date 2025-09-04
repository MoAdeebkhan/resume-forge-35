import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, FileText, Briefcase, GraduationCap, Award } from "lucide-react";

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

interface ModernProfessionalFormProps {
  fields: ResumeFields;
  onFieldsChange: (fields: ResumeFields) => void;
  extractedConfidence?: Record<string, number>;
}

export const ModernProfessionalForm = ({ fields, onFieldsChange, extractedConfidence = {} }: ModernProfessionalFormProps) => {
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
        <h2 className="text-2xl font-bold">Modern Professional Resume</h2>
        <p className="text-muted-foreground">Fill in your details to create a professional resume</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Preview */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {/* Header Section */}
              <div className="text-center space-y-2 p-4 bg-primary/5 rounded-lg">
                <h3 className="font-bold text-lg text-primary">
                  {formData.name || "Your Name"}
                </h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {formData.email && <div className="flex items-center justify-center"><Mail className="h-3 w-3 mr-1" />{formData.email}</div>}
                  {formData.phone && <div className="flex items-center justify-center"><Phone className="h-3 w-3 mr-1" />{formData.phone}</div>}
                  {formData.location && <div className="flex items-center justify-center"><MapPin className="h-3 w-3 mr-1" />{formData.location}</div>}
                </div>
              </div>

              {/* Summary */}
              {formData.summary && (
                <div>
                  <h4 className="font-semibold text-primary mb-2">Professional Summary</h4>
                  <p className="text-xs text-muted-foreground">{formData.summary.slice(0, 100)}...</p>
                </div>
              )}

              {/* Experience */}
              {formData.experience && (
                <div>
                  <h4 className="font-semibold text-primary mb-2">Experience</h4>
                  <p className="text-xs text-muted-foreground">{formData.experience.slice(0, 80)}...</p>
                </div>
              )}

              {/* Skills */}
              {formData.skills && (
                <div>
                  <h4 className="font-semibold text-primary mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.skills.split(',').slice(0, 4).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center">
                    Full Name *
                    {getConfidenceBadge("name")}
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    placeholder="John Doe"
                    className="font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center">
                    Email Address *
                    {getConfidenceBadge("email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    placeholder="john.doe@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center">
                    Phone Number *
                    {getConfidenceBadge("phone")}
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center">
                    Location
                    {getConfidenceBadge("location")}
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleFieldChange("location", e.target.value)}
                    placeholder="New York, NY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleFieldChange("website", e.target.value)}
                    placeholder="www.johndoe.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => handleFieldChange("linkedin", e.target.value)}
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Professional Summary
                {getConfidenceBadge("summary")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.summary}
                onChange={(e) => handleFieldChange("summary", e.target.value)}
                placeholder="Write a compelling professional summary that highlights your key achievements and career goals..."
                className="min-h-[120px]"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {formData.summary.length}/500 characters - Keep it concise and impactful
              </p>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Work Experience
                {getConfidenceBadge("experience")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.experience}
                onChange={(e) => handleFieldChange("experience", e.target.value)}
                placeholder="Include your work history, job titles, companies, dates, and key achievements..."
                className="min-h-[200px]"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Tip: Use bullet points and quantify your achievements with numbers and metrics
              </p>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Education
                {getConfidenceBadge("education")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.education}
                onChange={(e) => handleFieldChange("education", e.target.value)}
                placeholder="List your educational background, degrees, institutions, and graduation dates..."
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Skills & Expertise
                {getConfidenceBadge("skills")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.skills}
                onChange={(e) => handleFieldChange("skills", e.target.value)}
                placeholder="List your key skills, technologies, and areas of expertise (separate with commas)..."
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Separate skills with commas for better formatting
              </p>
            </CardContent>
          </Card>

          {/* Additional Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.certifications}
                  onChange={(e) => handleFieldChange("certifications", e.target.value)}
                  placeholder="Professional certifications..."
                  className="min-h-[80px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.languages}
                  onChange={(e) => handleFieldChange("languages", e.target.value)}
                  placeholder="Languages and proficiency levels..."
                  className="min-h-[80px]"
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.projects}
                  onChange={(e) => handleFieldChange("projects", e.target.value)}
                  placeholder="Notable projects and contributions..."
                  className="min-h-[80px]"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.achievements}
                  onChange={(e) => handleFieldChange("achievements", e.target.value)}
                  placeholder="Awards, recognitions, and achievements..."
                  className="min-h-[80px]"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};