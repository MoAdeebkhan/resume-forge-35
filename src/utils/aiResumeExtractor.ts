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
              content: `You are a professional resume parser. Extract information from resume text and return ONLY a valid JSON object with these exact fields: name, email, phone, location, summary, experience, education, skills, projects, certifications, languages, references. If a field is not found, return empty string "". Do not include any other text or explanations, only the JSON object.`
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
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('No response from AI service');
      }

      // Clean and parse the JSON response
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, '').trim();
      const extractedData = JSON.parse(cleanedResponse);

      // Validate and sanitize the response
      return this.validateExtractedFields(extractedData);

    } catch (error) {
      console.error('AI extraction error:', error);
      throw new Error(`AI extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static validateExtractedFields(data: any): ResumeFields {
    const defaultFields: ResumeFields = {
      name: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
      experience: "",
      education: "",
      skills: "",
      projects: "",
      certifications: "",
      languages: "",
      references: ""
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

  // Fallback extraction for when AI is not available
  static extractFallback(content: string): ResumeFields {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return {
      name: this.extractNameFallback(lines),
      email: this.extractEmailFallback(content),
      phone: this.extractPhoneFallback(content),
      location: this.extractLocationFallback(content),
      summary: this.extractSectionFallback(content, ['summary', 'profile', 'objective']),
      experience: this.extractSectionFallback(content, ['experience', 'work', 'employment']),
      education: this.extractSectionFallback(content, ['education', 'qualification']),
      skills: this.extractSectionFallback(content, ['skills', 'technical', 'expertise']),
      projects: this.extractSectionFallback(content, ['projects', 'portfolio']),
      certifications: this.extractSectionFallback(content, ['certification', 'certificate', 'award']),
      languages: this.extractSectionFallback(content, ['language']),
      references: this.extractSectionFallback(content, ['reference'])
    };
  }

  private static extractNameFallback(lines: string[]): string {
    // First few lines that look like names (2-4 words, capitalized, no common resume words)
    for (const line of lines.slice(0, 5)) {
      const words = line.split(/\s+/).filter(word => word.length > 0);
      if (words.length >= 2 && words.length <= 4) {
        const isName = words.every(word => /^[A-Z][a-z]*$/.test(word));
        const hasCommonWords = /resume|cv|developer|engineer|manager|director/i.test(line);
        if (isName && !hasCommonWords) {
          return line;
        }
      }
    }
    return "";
  }

  private static extractEmailFallback(content: string): string {
    const emailMatch = content.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return emailMatch ? emailMatch[0] : "";
  }

  private static extractPhoneFallback(content: string): string {
    const phoneMatches = [
      /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
      /(\+\d{1,3}[-.\s]?)?\d{10,}/
    ];
    
    for (const pattern of phoneMatches) {
      const match = content.match(pattern);
      if (match) return match[0];
    }
    return "";
  }

  private static extractLocationFallback(content: string): string {
    const locationPatterns = [
      /([A-Z][a-z]+,?\s+[A-Z]{2})/,
      /([A-Z][a-z]+,\s*[A-Z][a-z]+)/
    ];
    
    for (const pattern of locationPatterns) {
      const match = content.match(pattern);
      if (match) return match[1];
    }
    return "";
  }

  private static extractSectionFallback(content: string, keywords: string[]): string {
    const lines = content.split('\n');
    
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}[^\\n]*:?\\s*`, 'i');
      const sectionStartIndex = lines.findIndex(line => regex.test(line));
      
      if (sectionStartIndex !== -1) {
        const sectionLines = [];
        for (let i = sectionStartIndex + 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Stop if we hit another section header
          if (/^[A-Z][A-Za-z\s]+:?\s*$/.test(line) && 
              keywords.every(k => !line.toLowerCase().includes(k.toLowerCase()))) {
            break;
          }
          
          sectionLines.push(line);
          
          // Limit section length
          if (sectionLines.length > 10) break;
        }
        
        const result = sectionLines.join('\n').trim();
        if (result.length > 10) return result;
      }
    }
    
    return "";
  }
}