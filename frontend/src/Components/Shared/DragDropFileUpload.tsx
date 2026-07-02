import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/src/Hooks/useToast';

interface DragDropFileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  className?: string;
  label?: string;
  subLabel?: string;
  children?: React.ReactNode;
}

export const DragDropFileUpload: React.FC<DragDropFileUploadProps> = ({
  onFilesSelected,
  accept = '*/*',
  maxSizeMB = 10,
  multiple = false,
  className = '',
  label = 'Click to upload or drag and drop',
  subLabel,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = (files: File[]) => {
    const MAX_SIZE = maxSizeMB * 1024 * 1024;
    const validFiles: File[] = [];
    const invalidFiles: File[] = [];

    files.forEach((f) => {
      if (f.size <= MAX_SIZE) {
        validFiles.push(f);
      } else {
        invalidFiles.push(f);
      }
    });

    if (invalidFiles.length > 0) {
      showToast(`${invalidFiles.length} file(s) exceeded the ${maxSizeMB}MB limit and were skipped.`, 'error');
    }

    if (validFiles.length > 0) {
      if (multiple) {
        onFilesSelected(validFiles);
      } else {
        onFilesSelected([validFiles[0]]); // Only take the first one if not multiple
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files) as File[];
      processFiles(filesArray);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files) as File[];
      processFiles(filesArray);
      e.target.value = ''; // Reset input so same file can be selected again
    }
  };

  const isImageAccept = accept.includes('image');

  return (
    <div className={`w-full ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center w-full px-6 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ease-in-out ${
          isDragging 
            ? 'border-blue-500 bg-blue-50/50' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
        />
        
        {children ? (
          <div className="w-full h-full flex items-center justify-center pointer-events-none">
            {children}
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2 text-center pointer-events-none">
            <div className={`p-3 rounded-full ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-400 shadow-sm'}`}>
              {isImageAccept ? <ImageIcon size={24} /> : <UploadCloud size={24} />}
            </div>
            <div className="text-sm font-medium text-gray-700">
              {label}
            </div>
            <div className="text-xs text-gray-500">
              {subLabel || `Maximum file size: ${maxSizeMB}MB`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
