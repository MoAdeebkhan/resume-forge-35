export interface ResumeFields {
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

export class ResumeExtractor {
  
  static extractResumeFields(content: string): ResumeFields {
    const cleanContent = this.cleanText(content);
    
    return {
      name: this.extractName(cleanContent),
      email: this.extractEmail(cleanContent),
      phone: this.extractPhone(cleanContent),
      location: this.extractLocation(cleanContent),
      summary: this.extractSummary(cleanContent),
      experience: this.extractExperience(cleanContent),
      education: this.extractEducation(cleanContent),
      skills: this.extractSkills(cleanContent),
      projects: this.extractProjects(cleanContent),
      certifications: this.extractCertifications(cleanContent),
      languages: this.extractLanguages(cleanContent),
      references: this.extractReferences(cleanContent)
    };
  }

  private static cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s@.\-()]/g, ' ')
      .trim();
  }

  private static extractName(content: string): string {
    // Look for name patterns at the beginning of the document
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // First non-empty line that looks like a name (2-4 words, capitalized)
    for (const line of lines.slice(0, 5)) {
      const namePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]*){1,3})$/;
      const match = line.match(namePattern);
      if (match && !this.containsCommonWords(match[1])) {
        return match[1];
      }
    }
    
    // Look for "Name:" pattern
    const nameMatch = content.match(/(?:Name|Full Name):\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]*){1,3})/i);
    if (nameMatch) return nameMatch[1];
    
    return "";
  }

  private static containsCommonWords(text: string): boolean {
    const commonWords = ['resume', 'cv', 'curriculum', 'vitae', 'profile', 'contact', 'information', 'email', 'phone', 'address'];
    return commonWords.some(word => text.toLowerCase().includes(word));
  }

  private static extractEmail(content: string): string {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = content.match(emailPattern);
    return match ? match[0] : "";
  }

  private static extractPhone(content: string): string {
    // Multiple phone number patterns
    const phonePatterns = [
      /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
      /(\+\d{1,3}[-.\s]?)?\d{10,}/,
      /(\+\d{1,3}[-.\s]?)?[\d\s\-\.()]{10,}/
    ];
    
    for (const pattern of phonePatterns) {
      const match = content.match(pattern);
      if (match) {
        return match[0].replace(/\s+/g, ' ').trim();
      }
    }
    return "";
  }

  private static extractLocation(content: string): string {
    // Look for city, state patterns
    const locationPatterns = [
      /([A-Z][a-z]+,?\s+[A-Z]{2}(?:\s+\d{5})?)/,
      /([A-Z][a-z]+,\s*[A-Z][a-z]+)/,
      /Address:\s*([^\n]+)/i,
      /Location:\s*([^\n]+)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = content.match(pattern);
      if (match) return match[1].trim();
    }
    return "";
  }

  private static extractSummary(content: string): string {
    const summaryPatterns = [
      /(?:Summary|Professional Summary|Profile|Objective):\s*([^]*?)(?=\n\s*(?:[A-Z][A-Za-z\s]+:|$))/i,
      /(?:Summary|Professional Summary|Profile|Objective)\n\s*([^]*?)(?=\n\s*[A-Z])/i
    ];
    
    for (const pattern of summaryPatterns) {
      const match = content.match(pattern);
      if (match && match[1].trim().length > 20) {
        return match[1].trim().substring(0, 500);
      }
    }
    return "";
  }

  private static extractExperience(content: string): string {
    const experiencePatterns = [
      /(?:Experience|Work Experience|Employment|Professional Experience):\s*([^]*?)(?=\n\s*(?:Education|Skills|Projects|$))/i,
      /(?:Experience|Work Experience|Employment)\n\s*([^]*?)(?=\n\s*(?:Education|Skills|Projects))/i
    ];
    
    for (const pattern of experiencePatterns) {
      const match = content.match(pattern);
      if (match && match[1].trim().length > 20) {
        return this.formatSection(match[1].trim());
      }
    }

    // Alternative: look for job titles and companies
    const jobPattern = /([A-Z][a-z\s]+)\s+(?:at\s+)?([A-Z][A-Za-z\s&.,]+)(?:\s+\(?\d{4}[-\s](?:Present|\d{4})\)?)/g;
    const jobs = [];
    let jobMatch;
    while ((jobMatch = jobPattern.exec(content)) !== null) {
      jobs.push(`${jobMatch[1]} at ${jobMatch[2]}`);
    }
    
    return jobs.length > 0 ? jobs.join('\n') : "";
  }

  private static extractEducation(content: string): string {
    const educationPatterns = [
      /(?:Education|Academic Background):\s*([^]*?)(?=\n\s*(?:Experience|Skills|Projects|$))/i,
      /(?:Education|Academic Background)\n\s*([^]*?)(?=\n\s*(?:Experience|Skills|Projects))/i
    ];
    
    for (const pattern of educationPatterns) {
      const match = content.match(pattern);
      if (match && match[1].trim().length > 10) {
        return this.formatSection(match[1].trim());
      }
    }

    // Look for degree patterns
    const degreePatterns = [
      /(Bachelor|Master|PhD|B\.S\.|M\.S\.|B\.A\.|M\.A\.|MBA)[^]*?(?=\n[A-Z]|$)/gi
    ];
    
    for (const pattern of degreePatterns) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        return matches.join('\n');
      }
    }
    
    return "";
  }

  private static extractSkills(content: string): string {
    const skillsPatterns = [
      /(?:Skills|Technical Skills|Core Skills):\s*([^]*?)(?=\n\s*(?:[A-Z][A-Za-z\s]+:|$))/i,
      /(?:Skills|Technical Skills|Core Skills)\n\s*([^]*?)(?=\n\s*[A-Z])/i
    ];
    
    for (const pattern of skillsPatterns) {
      const match = content.match(pattern);
      if (match && match[1].trim().length > 10) {
        return this.formatSection(match[1].trim());
      }
    }
    return "";
  }

  private static extractProjects(content: string): string {
    const projectPatterns = [
      /(?:Projects|Project Experience):\s*([^]*?)(?=\n\s*(?:[A-Z][A-Za-z\s]+:|$))/i,
      /(?:Projects|Project Experience)\n\s*([^]*?)(?=\n\s*[A-Z])/i
    ];
    
    for (const pattern of projectPatterns) {
      const match = content.match(pattern);
      if (match && match[1].trim().length > 10) {
        return this.formatSection(match[1].trim());
      }
    }
    return "";
  }

  private static extractCertifications(content: string): string {
    const certPatterns = [
      /(?:Certifications?|Certificates?):\s*([^]*?)(?=\n\s*(?:[A-Z][A-Za-z\s]+:|$))/i,
      /(?:Certifications?|Certificates?)\n\s*([^]*?)(?=\n\s*[A-Z])/i
    ];
    
    for (const pattern of certPatterns) {
      const match = content.match(pattern);
      if (match && match[1].trim().length > 5) {
        return this.formatSection(match[1].trim());
      }
    }
    
    // Look for certification keywords
    const certKeywords = ['certified', 'certification', 'certificate', 'license'];
    const lines = content.split('\n');
    const certLines = lines.filter(line => 
      certKeywords.some(keyword => line.toLowerCase().includes(keyword))
    );
    
    return certLines.length > 0 ? certLines.join('\n') : "";
  }

  private static extractLanguages(content: string): string {
    const langPatterns = [
      /(?:Languages?):\s*([^]*?)(?=\n\s*(?:[A-Z][A-Za-z\s]+:|$))/i,
      /(?:Languages?)\n\s*([^]*?)(?=\n\s*[A-Z])/i
    ];
    
    for (const pattern of langPatterns) {
      const match = content.match(pattern);
      if (match && match[1].trim().length > 3) {
        return this.formatSection(match[1].trim());
      }
    }
    
    // Common language patterns
    const commonLanguages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Portuguese', 'Italian', 'Russian', 'Arabic'];
    const foundLanguages = commonLanguages.filter(lang => 
      content.includes(lang)
    );
    
    return foundLanguages.length > 0 ? foundLanguages.join(', ') : "";
  }

  private static extractReferences(content: string): string {
    const refPatterns = [
      /(?:References?):\s*([^]*?)(?=\n\s*(?:[A-Z][A-Za-z\s]+:|$))/i,
      /(?:References?)\n\s*([^]*?)$/i
    ];
    
    for (const pattern of refPatterns) {
      const match = content.match(pattern);
      if (match && match[1].trim().length > 5) {
        return this.formatSection(match[1].trim());
      }
    }
    
    if (content.toLowerCase().includes('references available') || content.toLowerCase().includes('upon request')) {
      return "Available upon request";
    }
    
    return "";
  }

  private static formatSection(text: string): string {
    return text
      .trim()
      .replace(/\s{2,}/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .substring(0, 1000); // Limit length
  }
}