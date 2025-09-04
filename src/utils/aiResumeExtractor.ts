import { type ResumeFields } from './resumeExtractor';

export class AIResumeExtractor {
  
  static async extractWithAI(content: string, apiKey: string): Promise<ResumeFields> {
    if (!apiKey || !apiKey.trim()) {
      throw new Error('API key is required for AI extraction');
    }

    try {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-small-128k-online',
          messages: [
            {
              role: 'system',
              content: `You are a professional resume parser. Extract information from resume text and return ONLY a valid JSON object with these exact fields: name, email, phone, location, website, linkedin, summary, experience, education, skills, projects, certifications, languages, achievements. If a field is not found, return empty string "". Do not include any other text or explanations, only the JSON object.`
            },
            {
              role: 'user',
              content: `Extract resume information from this text:\n\n${content}`
            }
          ],
          temperature: 0.1,
          top_p: 0.9,
          max_tokens: 2000,
          return_images: false,
          return_related_questions: false,
          frequency_penalty: 1,
          presence_penalty: 0
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid API response format');
      }

      const extractedText = data.choices[0].message.content.trim();
      
      // Parse JSON response
      let extractedData;
      try {
        extractedData = JSON.parse(extractedText);
      } catch (parseError) {
        console.error('Failed to parse AI response as JSON:', extractedText);
        throw new Error('AI response was not valid JSON. Using fallback extraction.');
      }

      return this.validateExtractedFields(extractedData);

    } catch (error) {
      console.error('AI extraction failed:', error);
      // Fallback to pattern-based extraction
      return this.extractFallback(content);
    }
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

  // Fallback extraction using improved pattern matching
  static extractFallback(content: string): ResumeFields {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return {
      name: this.extractNameFallback(lines),
      email: this.extractEmailFallback(content),
      phone: this.extractPhoneFallback(content),
      location: this.extractLocationFallback(content),
      website: this.extractWebsiteFallback(content),
      linkedin: this.extractLinkedInFallback(content),
      summary: this.extractSectionFallback(content, ['summary', 'profile', 'objective']),
      experience: this.extractSectionFallback(content, ['experience', 'work', 'employment']),
      education: this.extractSectionFallback(content, ['education', 'qualification']),
      skills: this.extractSectionFallback(content, ['skills', 'technical', 'expertise']),
      projects: this.extractSectionFallback(content, ['projects', 'portfolio']),
      certifications: this.extractSectionFallback(content, ['certification', 'certificate', 'award']),
      languages: this.extractSectionFallback(content, ['language']),
      achievements: this.extractSectionFallback(content, ['achievement', 'accomplishment', 'award', 'honor'])
    };
  }

  private static extractNameFallback(lines: string[]): string {
    // First few lines are most likely to contain the name
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      // Skip lines that look like headers, contact info, etc.
      if (line.length > 50 || line.includes('@') || line.includes('resume') || 
          line.includes('curriculum') || line.includes('cv')) {
        continue;
      }
      // Look for name patterns
      if (/^[A-Z][a-z]+ [A-Z][a-z]+/.test(line) && line.split(' ').length <= 4) {
        return line;
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
      /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/,
      /(\+?[1-9]\d{0,3}[-.\s]?)?\(?(\d{3,4})\)?[-.\s]?(\d{3,4})[-.\s]?(\d{3,4})/
    ];
    
    for (const pattern of phonePatterns) {
      const match = content.match(pattern);
      if (match) return match[0];
    }
    return "";
  }

  private static extractLocationFallback(content: string): string {
    const locationPatterns = [
      /([A-Z][a-z]+,\s*[A-Z]{2})/,
      /([A-Z][a-z]+\s*[A-Z][a-z]*,\s*[A-Z][a-z]+)/,
      /([A-Z][a-z]+,\s*[A-Z][a-z]+,\s*[A-Z]{2,})/
    ];
    
    for (const pattern of locationPatterns) {
      const match = content.match(pattern);
      if (match) return match[1];
    }
    return "";
  }

  private static extractWebsiteFallback(content: string): string {
    const websiteMatch = content.match(/(https?:\/\/[^\s]+|www\.[^\s]+)/);
    return websiteMatch ? websiteMatch[0] : "";
  }

  private static extractLinkedInFallback(content: string): string {
    const linkedinMatch = content.match(/(https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/);
    return linkedinMatch ? linkedinMatch[0] : "";
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
                nextLine.length < 30 && !nextLine.includes('.')) {
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