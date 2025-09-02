import * as mammoth from 'mammoth';
import { FileParser } from './fileParser';
import { type ResumeFields } from './resumeExtractor';


export interface CustomTemplate {
  id: string;
  name: string;
  file: File;
  uploadDate: string;
}

export class TemplateProcessor {
  private static readonly FIELD_MAPPINGS = {
    // Common placeholder patterns
    name: ['{{name}}', '{name}', '[NAME]', '<<NAME>>', '{FULL_NAME}', '{{FULL_NAME}}'],
    email: ['{{email}}', '{email}', '[EMAIL]', '<<EMAIL>>', '{EMAIL_ADDRESS}', '{{EMAIL_ADDRESS}}'],
    phone: ['{{phone}}', '{phone}', '[PHONE]', '<<PHONE>>', '{PHONE_NUMBER}', '{{PHONE_NUMBER}}'],
    location: ['{{location}}', '{location}', '[LOCATION]', '<<LOCATION>>', '{ADDRESS}', '{{ADDRESS}}'],
    summary: ['{{summary}}', '{summary}', '[SUMMARY]', '<<SUMMARY>>', '{PROFESSIONAL_SUMMARY}', '{{PROFESSIONAL_SUMMARY}}', '{OBJECTIVE}', '{{OBJECTIVE}}'],
    experience: ['{{experience}}', '{experience}', '[EXPERIENCE]', '<<EXPERIENCE>>', '{WORK_EXPERIENCE}', '{{WORK_EXPERIENCE}}', '{EMPLOYMENT}', '{{EMPLOYMENT}}'],
    education: ['{{education}}', '{education}', '[EDUCATION]', '<<EDUCATION>>', '{ACADEMIC_BACKGROUND}', '{{ACADEMIC_BACKGROUND}}'],
    skills: ['{{skills}}', '{skills}', '[SKILLS]', '<<SKILLS>>', '{TECHNICAL_SKILLS}', '{{TECHNICAL_SKILLS}}'],
    projects: ['{{projects}}', '{projects}', '[PROJECTS]', '<<PROJECTS>>', '{PROJECT_EXPERIENCE}', '{{PROJECT_EXPERIENCE}}'],
    certifications: ['{{certifications}}', '{certifications}', '[CERTIFICATIONS]', '<<CERTIFICATIONS>>', '{CERTIFICATES}', '{{CERTIFICATES}}'],
    languages: ['{{languages}}', '{languages}', '[LANGUAGES]', '<<LANGUAGES>>', '{LANGUAGE_SKILLS}', '{{LANGUAGE_SKILLS}}'],
    references: ['{{references}}', '{references}', '[REFERENCES]', '<<REFERENCES>>', '{PROFESSIONAL_REFERENCES}', '{{PROFESSIONAL_REFERENCES}}']
  };

  static async processCustomTemplate(templateFile: File, fields: ResumeFields): Promise<string> {
    try {
      const fileExtension = templateFile.name.split('.').pop()?.toLowerCase();
      
      if (fileExtension === 'docx' || fileExtension === 'doc') {
        return await this.processDocxTemplate(templateFile, fields);
      } else {
        // Fallback for other file types
        const templateContent = await FileParser.parseFile(templateFile);
        return this.replacePlaceholders(templateContent, fields);
      }
    } catch (error) {
      console.error('Template processing error:', error);
      throw new Error(`Failed to process custom template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async processDocxTemplate(templateFile: File, fields: ResumeFields): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          
          // Extract HTML with styling to preserve formatting
          const result = await mammoth.convertToHtml({ arrayBuffer });
          
          if (!result.value.trim()) {
            throw new Error('No content found in template');
          }

          // Process the HTML content and replace placeholders
          const processedContent = this.replacePlaceholders(result.value, fields);
          
          // Convert to a complete HTML document
          const htmlDocument = this.createHtmlDocument(processedContent, templateFile.name);
          
          resolve(htmlDocument);
        } catch (error) {
          console.error('DOCX template processing error:', error);
          reject(new Error('Failed to process Word template. Please ensure it contains valid placeholders.'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read template file'));
      reader.readAsArrayBuffer(templateFile);
    });
  }

  private static replacePlaceholders(content: string, fields: ResumeFields): string {
    let processedContent = content;
    
    // Replace placeholders for each field
    Object.entries(this.FIELD_MAPPINGS).forEach(([fieldKey, placeholders]) => {
      const fieldValue = fields[fieldKey as keyof ResumeFields];
      
      placeholders.forEach(placeholder => {
        // Case-insensitive replacement
        const regex = new RegExp(placeholder.replace(/[{}[\]().*+?^$|\\]/g, '\\$&'), 'gi');
        
        // If field has value, replace with value; if empty, replace with empty string
        if (fieldValue && fieldValue.trim()) {
          processedContent = processedContent.replace(regex, fieldValue);
        } else {
          // Remove placeholder and any surrounding whitespace/formatting
          processedContent = processedContent.replace(new RegExp(`\\s*${placeholder.replace(/[{}[\]().*+?^$|\\]/g, '\\$&')}\\s*`, 'gi'), '');
        }
      });
    });

    // Handle common date placeholders
    const currentDate = new Date().toLocaleDateString();
    processedContent = processedContent.replace(/\{\{date\}\}|\{date\}|\[DATE\]|<<DATE>>/gi, currentDate);

    // Clean up any remaining unmatched placeholders and formatting
    processedContent = this.cleanUnmatchedPlaceholders(processedContent);
    
    return processedContent;
  }

  private static cleanUnmatchedPlaceholders(content: string): string {
    // Remove common placeholder patterns that weren't matched
    return content
      .replace(/\{\{[^}]+\}\}/g, '') // {{placeholder}}
      .replace(/\{[^}]+\}/g, '') // {placeholder}
      .replace(/\[[^\]]+\]/g, '') // [PLACEHOLDER]
      .replace(/<<[^>]+>>/g, '') // <<PLACEHOLDER>>
      // Clean up empty table rows and cells in HTML
      .replace(/<tr[^>]*>\s*<td[^>]*>\s*<\/td>\s*<\/tr>/gi, '')
      .replace(/<td[^>]*>\s*<\/td>/gi, '<td></td>')
      // Clean up empty paragraphs
      .replace(/<p[^>]*>\s*<\/p>/gi, '')
      // Clean up multiple spaces and empty lines
      .replace(/\s{3,}/g, '  ')
      .replace(/\n\s*\n\s*\n\s*/g, '\n\n')
      // Remove lines that are just colons or labels with no content
      .replace(/^\s*[A-Za-z\s]+:\s*$/gm, '')
      .trim();
  }

  private static createHtmlDocument(processedContent: string, templateName: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume - Generated from ${templateName}</title>
  <style>
    body {
      font-family: 'Times New Roman', serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #fff;
    }
    
    h1, h2, h3 {
      color: #2c3e50;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    
    h1 {
      font-size: 2.2em;
      text-align: center;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }
    
    h2 {
      font-size: 1.5em;
      border-bottom: 1px solid #bdc3c7;
      padding-bottom: 5px;
    }
    
    h3 {
      font-size: 1.2em;
      color: #34495e;
    }
    
    p {
      margin-bottom: 1em;
      text-align: justify;
    }
    
    strong {
      color: #2c3e50;
      font-weight: 600;
    }
    
    em {
      font-style: italic;
      color: #7f8c8d;
    }
    
    ul, ol {
      margin-left: 20px;
      margin-bottom: 1em;
    }
    
    li {
      margin-bottom: 0.5em;
    }
    
    .template-info {
      background: #ecf0f1;
      padding: 10px;
      border-radius: 5px;
      font-size: 0.9em;
      color: #7f8c8d;
      text-align: center;
      margin-top: 30px;
      border-left: 4px solid #3498db;
    }
    
    @media print {
      body { margin: 0; }
      .template-info { display: none; }
    }
  </style>
</head>
<body>
  ${processedContent}
  
  <div class="template-info">
    Generated from custom template: ${templateName} | Processed on ${new Date().toLocaleDateString()}
  </div>
</body>
</html>`;
  }

  static validateTemplate(file: File): { isValid: boolean; message: string } {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !['docx', 'doc', 'txt'].includes(fileExtension)) {
      return {
        isValid: false,
        message: 'Only DOCX, DOC, and TXT templates are supported'
      };
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return {
        isValid: false,
        message: 'Template file size must be less than 5MB'
      };
    }
    
    return {
      isValid: true,
      message: 'Template is valid'
    };
  }

  static getTemplatePlaceholders(): string[] {
    return [
      '{{name}} or {name} - Your full name',
      '{{email}} or {email} - Email address', 
      '{{phone}} or {phone} - Phone number',
      '{{location}} or {location} - Location/Address',
      '{{summary}} or {summary} - Professional summary',
      '{{experience}} or {experience} - Work experience',
      '{{education}} or {education} - Educational background',
      '{{skills}} or {skills} - Technical skills',
      '{{projects}} or {projects} - Project experience',
      '{{certifications}} or {certifications} - Certifications',
      '{{languages}} or {languages} - Language skills',
      '{{references}} or {references} - Professional references',
      '{{date}} or {date} - Current date'
    ];
  }
}