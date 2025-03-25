
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { processFile } from '@/lib/ocr';
import { Paperclip, FileText, ImageIcon, Loader2, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileProcessed: (text: string) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileProcessed, disabled = false }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { currentChatId } = useChat();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    // Check if file is supported
    const supportedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/bmp',
      'image/heic'
    ];
    
    // Also check file extension
    const supportedExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.heic', '.pdf', '.tiff', '.tif'];
    const hasValidExtension = supportedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!supportedTypes.includes(fileType) && !hasValidExtension) {
      toast({
        title: 'Unsupported file type',
        description: 'Please upload only PNG, JPG, JPEG, BMP, HEIC, PDF, or TIFF files',
        variant: 'destructive',
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB',
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedFile(file);
    
    // Reset file input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    
    try {
      const userId = user?.id || 'anonymous';
      const chatId = currentChatId || 'temp';
      
      const { text, fileId } = await processFile(selectedFile, userId, chatId);
      
      if (text.startsWith('Failed to process') || 
          text.startsWith('File type not supported') || 
          text.startsWith('The document could not be parsed') ||
          text.startsWith('Error extracting text')) {
        toast({
          title: 'Error',
          description: text,
          variant: 'destructive',
        });
      } else {
        onFileProcessed(text);
        
        toast({
          title: 'File processed successfully',
          description: 'Text extracted and ready to send',
        });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: 'Error processing file',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setSelectedFile(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('image')) {
      return <ImageIcon className="h-4 w-4" />;
    } else {
      return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png,image/jpeg,image/jpg,image/bmp,image/heic,application/pdf,image/tiff"
        className="hidden"
        disabled={disabled || isProcessing}
      />
      
      {!selectedFile ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isProcessing}
          className="h-10 w-10 rounded-full"
        >
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Upload file</span>
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          {isProcessing ? (
            <Button variant="ghost" size="sm" disabled className="h-10 gap-2 text-xs">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProcessFile}
              className="h-10 gap-2 text-xs"
            >
              {getFileIcon(selectedFile)}
              {selectedFile.name.length > 20
                ? `${selectedFile.name.substring(0, 20)}...`
                : selectedFile.name}
              <X
                className="h-4 w-4 hover:text-destructive transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearFile();
                }}
              />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
