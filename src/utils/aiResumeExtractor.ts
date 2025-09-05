import { type ResumeFields } from './resumeExtractor';

export class AIResumeExtractor {
  
  static async extractWithAI(content: string, apiKey: string): Promise<ResumeFields> {
    // AI extraction is removed - fallback to pattern-based extraction
    return this.extractFallback(content);
  }

  private static validateExtractedFields(data: any): ResumeFields {
    const defaultFields: ResumeFields = {
      name: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      summary: "",
      experience: "",
      education: "",
      skills: "",
      projects: "",
      certifications: "",
      languages: "",
      achievements: ""
    };

    // Ensure all required fields exist and are strings
    const result: ResumeFields = { ...defaultFields };
    
    for (const key in defaultFields) {
      if (data[key] && typeof data[key] === 'string') {
        result[key as keyof ResumeFields] = data[key].trim();
      }
    }

    return result;
  }

  // Enhanced pattern-based extraction - completely free and accurate
  static extractFallback(content: string): ResumeFields {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const cleanContent = content.toLowerCase();
    
    return {
      name: this.extractNameFallback(lines),
      email: this.extractEmailFallback(content),
      phone: this.extractPhoneFallback(content),
      location: this.extractLocationFallback(content),
      website: this.extractWebsiteFallback(content),
      linkedin: this.extractLinkedInFallback(content),
      summary: this.extractSectionFallback(content, ['summary', 'profile', 'objective', 'about']),
      experience: this.extractSectionFallback(content, ['experience', 'work', 'employment', 'career', 'professional']),
      education: this.extractSectionFallback(content, ['education', 'qualification', 'academic', 'degree']),
      skills: this.extractSkillsFallback(content),
      projects: this.extractSectionFallback(content, ['projects', 'portfolio', 'work samples']),
      certifications: this.extractSectionFallback(content, ['certification', 'certificate', 'licenses']),
      languages: this.extractSectionFallback(content, ['language', 'linguistic']),
      achievements: this.extractSectionFallback(content, ['achievement', 'accomplishment', 'award', 'honor', 'recognition'])
    };
  }

  private static extractNameFallback(lines: string[]): string {
    // Enhanced name extraction with multiple patterns
    for (let i = 0; i < Math.min(8, lines.length); i++) {
      const line = lines[i];
      // Skip unwanted patterns
      if (line.length > 60 || line.includes('@') || line.includes('www.') || 
          line.toLowerCase().includes('resume') || line.toLowerCase().includes('curriculum') || 
          line.toLowerCase().includes('cv') || line.includes('http') || 
          /^\d/.test(line) || line.includes('|')) {
        continue;
      }
      
      // Look for name patterns - enhanced patterns
      const namePatterns = [
        /^([A-Z][a-z]+ [A-Z][a-z]+)$/, // First Last
        /^([A-Z][a-z]+ [A-Z]\. [A-Z][a-z]+)$/, // First M. Last
        /^([A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+)$/, // First Middle Last
        /^([A-Z][A-Z]+ [A-Z][A-Z]+)$/, // ALL CAPS names
        /^([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})(?:\s*,.*)?$/ // Name with possible title after comma
      ];
      
      for (const pattern of namePatterns) {
        const match = line.match(pattern);
        if (match && match[1] && match[1].split(' ').length <= 4) {
          return match[1].trim();
        }
      }
    }
    return "";
  }

  private static extractEmailFallback(content: string): string {
    const emailMatch = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    return emailMatch ? emailMatch[0] : "";
  }

  private static extractPhoneFallback(content: string): string {
    const phonePatterns = [
      /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g, // US format
      /(\+?[1-9]\d{0,3}[-.\s]?)?\(?(\d{3,4})\)?[-.\s]?(\d{3,4})[-.\s]?(\d{3,4})/g, // International
      /(?:phone|tel|mobile|cell)[:.\s]*(\+?[\d\s\-\(\)\.]{10,})/gi, // Labeled phone
      /(\+\d{1,3}[\s\-]?\d{3,4}[\s\-]?\d{3,4}[\s\-]?\d{3,4})/g // International with +
    ];
    
    for (const pattern of phonePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        // Return the most likely phone number (longest one)
        const sorted = matches.sort((a, b) => b.length - a.length);
        const phone = sorted[0].replace(/(?:phone|tel|mobile|cell)[:.\s]*/gi, '').trim();
        if (phone.length >= 10) return phone;
      }
    }
    return "";
  }

  private static extractLocationFallback(content: string): string {
    const locationPatterns = [
      /([A-Z][a-z]+,\s*[A-Z]{2}(?:\s+\d{5})?)/g, // City, ST or City, ST 12345
      /([A-Z][a-z]+\s*[A-Z][a-z]*,\s*[A-Z][a-z]+)/g, // City Name, Country
      /([A-Z][a-z]+,\s*[A-Z][a-z]+,\s*[A-Z]{2,})/g, // City, State, Country
      /(?:location|address|based in|lives in)[:.\s]*([A-Z][a-z\s,]+(?:[A-Z]{2,}|\d{5}))/gi, // Labeled location
      /([A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*[A-Z]{2,})/g // Enhanced city, country/state
    ];
    
    for (const pattern of locationPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          const location = match.replace(/(?:location|address|based in|lives in)[:.\s]*/gi, '').trim();
          if (location.length > 3 && location.includes(',')) {
            return location;
          }
        }
      }
    }
    return "";
  }

  private static extractWebsiteFallback(content: string): string {
    const websitePatterns = [
      /(https?:\/\/[^\s]+)/g,
      /(www\.[^\s]+)/g,
      /(?:website|portfolio|site)[:.\s]*((?:https?:\/\/)?[^\s]+\.[a-z]{2,})/gi
    ];
    
    for (const pattern of websitePatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          const url = match.replace(/(?:website|portfolio|site)[:.\s]*/gi, '').trim();
          if (url.includes('.') && !url.includes('@') && !url.includes('linkedin')) {
            return url.startsWith('http') ? url : `https://${url}`;
          }
        }
      }
    }
    return "";
  }

  private static extractLinkedInFallback(content: string): string {
    const linkedinPatterns = [
      /(https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/g,
      /(?:linkedin|linked in)[:.\s]*((?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+)/gi
    ];
    
    for (const pattern of linkedinPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        const linkedin = matches[0].replace(/(?:linkedin|linked in)[:.\s]*/gi, '').trim();
        return linkedin.startsWith('http') ? linkedin : `https://${linkedin}`;
      }
    }
    return "";
  }

  // Enhanced skills extraction
  private static extractSkillsFallback(content: string): string {
    // First try to find a dedicated skills section
    const skillsSection = this.extractSectionFallback(content, ['skills', 'technical skills', 'core competencies', 'expertise', 'technologies']);
    if (skillsSection) return skillsSection;
    
    // Look for common programming languages and technologies
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring',
      'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
      'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'Linux', 'Apache', 'Nginx',
      'Machine Learning', 'AI', 'Data Science', 'Analytics', 'Tableau', 'Power BI'
    ];
    
    const foundSkills: string[] = [];
    const lowerContent = content.toLowerCase();
    
    for (const skill of commonSkills) {
      if (lowerContent.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    }
    
    return foundSkills.length > 0 ? foundSkills.join(', ') : "";
  }

  private static extractSectionFallback(content: string, keywords: string[]): string {
    const lines = content.split('\n');
    
    for (const keyword of keywords) {
      const regex = new RegExp(`^\\s*${keyword}\\s*:?\\s*$`, 'i');
      
      for (let i = 0; i < lines.length; i++) {
        if (regex.test(lines[i])) {
          const sectionContent = [];
          
          // Collect content until next section or end
          for (let j = i + 1; j < lines.length; j++) {
            const nextLine = lines[j].trim();
            
            // Stop if we hit another section header
            if (nextLine && /^[A-Z][A-Za-z\s]+:?\s*$/.test(nextLine) && 
                nextLine.length < 50 && !nextLine.includes('.') && !nextLine.includes(',')) {
              break;
            }
            
            if (nextLine) {
              sectionContent.push(nextLine);
            }
          }
          
          if (sectionContent.length > 0) {
            return sectionContent.join('\n').trim();
          }
        }
      }
    }
    
    return "";
  }
}