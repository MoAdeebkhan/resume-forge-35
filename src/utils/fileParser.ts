import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class FileParser {
  static async parseFile(file: File): Promise<string> {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    try {
      switch (fileExtension) {
        case 'txt':
          return await this.parseTxtFile(file);
        case 'pdf':
          return await this.parsePdfFile(file);
        case 'docx':
        case 'doc':
          return await this.parseDocxFile(file);
        default:
          throw new Error(`Unsupported file type: ${fileExtension}`);
      }
    } catch (error) {
      console.error('File parsing error:', error);
      throw new Error(`Failed to parse ${fileExtension?.toUpperCase()} file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async parseTxtFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read text file'));
      reader.readAsText(file);
    });
  }

  private static async parsePdfFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          
          let fullText = '';
          
          // Extract text from all pages
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(' ');
            fullText += pageText + '\n';
          }
          
          if (!fullText.trim()) {
            throw new Error('No text content found in PDF');
          }
          
          resolve(fullText);
        } catch (error) {
          console.error('PDF parsing error:', error);
          reject(new Error('Failed to extract text from PDF. The file might be scanned or corrupted.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file'));
      reader.readAsArrayBuffer(file);
    });
  }

  private static async parseDocxFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const result = await mammoth.extractRawText({ arrayBuffer });
          
          if (!result.value.trim()) {
            throw new Error('No text content found in document');
          }
          
          resolve(result.value);
        } catch (error) {
          console.error('DOCX parsing error:', error);
          reject(new Error('Failed to extract text from Word document. The file might be corrupted or password protected.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read Word document'));
      reader.readAsArrayBuffer(file);
    });
  }

  static validateFileType(file: File): boolean {
    const supportedTypes = ['txt', 'pdf', 'docx', 'doc'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return supportedTypes.includes(fileExtension || '');
  }

  static getFileTypeInfo(file: File): { type: string; icon: string; description: string } {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    switch (fileExtension) {
      case 'pdf':
        return {
          type: 'PDF',
          icon: '📄',
          description: 'Adobe PDF Document'
        };
      case 'docx':
      case 'doc':
        return {
          type: 'Word',
          icon: '📝',
          description: 'Microsoft Word Document'
        };
      case 'txt':
        return {
          type: 'Text',
          icon: '📃',
          description: 'Plain Text File'
        };
      default:
        return {
          type: 'Unknown',
          icon: '📎',
          description: 'Unknown File Type'
        };
    }
  }
}