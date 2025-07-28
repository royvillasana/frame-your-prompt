import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, FileText, Image, Upload } from "lucide-react";

export interface FileUploadProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onFilesSelected: (files: File[]) => void;
  onFileRemove?: (file: File) => void;
  selectedFiles?: File[];
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedFileTypes?: string[];
}

const defaultAcceptedTypes = [
  "application/pdf",
  "text/plain",
  "image/jpeg",
  "image/png",
];

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({
    className,
    onFilesSelected,
    onFileRemove,
    selectedFiles = [],
    maxFiles = 5,
    maxSizeMB = 10,
    acceptedFileTypes = defaultAcceptedTypes,
    ...props
  }, ref) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList) return;
      
      const files = Array.from(fileList);
      validateAndProcessFiles(files);
    };

    const validateAndProcessFiles = (files: File[]) => {
      setError(null);
      
      // Check if adding these files would exceed the max number
      if (selectedFiles.length + files.length > maxFiles) {
        setError(`You can only upload up to ${maxFiles} files`);
        return;
      }
      
      // Validate file types and sizes
      const validFiles = files.filter(file => {
        // Check file type
        const isValidType = acceptedFileTypes.includes(file.type);
        if (!isValidType) {
          setError(`Invalid file type. Accepted types: PDF, TXT, JPG, PNG`);
          return false;
        }
        
        // Check file size
        const isValidSize = file.size <= maxSizeMB * 1024 * 1024;
        if (!isValidSize) {
          setError(`File too large. Maximum size: ${maxSizeMB}MB`);
          return false;
        }
        
        return true;
      });
      
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        validateAndProcessFiles(files);
      }
    };

    const handleButtonClick = () => {
      fileInputRef.current?.click();
    };

    const handleRemoveFile = (file: File) => {
      if (onFileRemove) {
        onFileRemove(file);
      }
    };

    const getFileIcon = (file: File) => {
      if (file.type === "application/pdf") {
        return <FileText className="h-4 w-4" />;
      } else if (file.type === "text/plain") {
        return <FileText className="h-4 w-4" />;
      } else if (file.type.startsWith("image/")) {
        return <Image className="h-4 w-4" />;
      }
      return <FileText className="h-4 w-4" />;
    };

    return (
      <div className="space-y-2">
        <div
          className={cn(
            "relative flex flex-col items-center justify-center w-full min-h-[150px] rounded-lg border-2 border-dashed p-4 transition-colors",
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
            className
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            multiple
            accept={acceptedFileTypes.join(",")}
            {...props}
          />
          
          <div className="flex flex-col items-center justify-center text-center p-4">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-1">Drag & drop files here</p>
            <p className="text-xs text-muted-foreground mb-3">PDF, TXT, JPG, PNG (max {maxSizeMB}MB)</p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleButtonClick}
            >
              Browse Files
            </Button>
          </div>
        </div>
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        
        {selectedFiles.length > 0 && (
          <div className="space-y-2 mt-2">
            <p className="text-sm font-medium">Selected files:</p>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <Badge 
                  key={`${file.name}-${index}`} 
                  variant="secondary"
                  className="flex items-center gap-1 py-1 pl-2 pr-1"
                >
                  {getFileIcon(file)}
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 ml-1"
                    onClick={() => handleRemoveFile(file)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

FileUpload.displayName = "FileUpload";

export { FileUpload };