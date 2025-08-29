import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, File, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const acceptedTypes = ['.pdf', '.docx', '.doc', '.txt'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): boolean => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, DOC, or TXT file.",
        variant: "destructive"
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      toast({
        title: "File uploaded successfully",
        description: `${file.name} is ready for processing.`
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'pdf' ? FileText : File;
  };

  return (
    <Card className="mx-auto max-w-2xl shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold">Upload Your Resume</CardTitle>
        <p className="text-muted-foreground">
          Upload your existing resume in any supported format to get started
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Drag and Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            isDragOver 
              ? 'border-primary bg-primary/5 scale-[1.02]' 
              : selectedFile 
              ? 'border-success bg-success/5' 
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
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-4">
            {selectedFile ? (
              <CheckCircle2 className="mx-auto h-16 w-16 text-success animate-bounce" />
            ) : (
              <Upload className={`mx-auto h-16 w-16 ${isDragOver ? 'text-primary' : 'text-muted-foreground'} transition-colors`} />
            )}
            
            <div>
              <p className={`text-lg font-medium ${selectedFile ? 'text-success' : 'text-foreground'}`}>
                {selectedFile 
                  ? 'File uploaded successfully!' 
                  : isDragOver 
                  ? 'Drop your file here' 
                  : 'Drag and drop your resume here'
                }
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedFile ? 'Ready to process' : 'or click to browse files'}
              </p>
            </div>
          </div>
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <div className="p-4 bg-success/5 border border-success/20 rounded-lg animate-fade-in">
            <div className="flex items-center space-x-3">
              {(() => {
                const IconComponent = getFileIcon(selectedFile.name);
                return <IconComponent className="h-8 w-8 text-success" />;
              })()}
              <div className="flex-1">
                <p className="font-medium text-success-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Supported Formats */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Supported Formats:</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { ext: 'PDF', desc: 'Adobe PDF files' },
              { ext: 'DOCX', desc: 'Microsoft Word documents' },
              { ext: 'DOC', desc: 'Legacy Word documents' },
              { ext: 'TXT', desc: 'Plain text files' }
            ].map(({ ext, desc }) => (
              <Badge key={ext} variant="secondary" className="text-xs">
                {ext}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-start space-x-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Maximum file size: 10MB. Your data is processed securely and never stored.</p>
          </div>
        </div>

        {/* Process Button */}
        {selectedFile && (
          <Button 
            onClick={() => onFileUpload(selectedFile)}
            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary-dark hover:to-primary text-primary-foreground font-medium py-6 text-lg animate-fade-in"
          >
            Process Resume with AI
            <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};