import React, { useState } from 'react';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Upload, File, CheckCircle2, X } from 'lucide-react';

export interface ResumeUploadCardProps {
  file: File | null;
  updateFile: (file: File | null) => void;
}

const ResumeUploadCard: React.FC<ResumeUploadCardProps> = ({ file, updateFile }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>(
    file ? 'success' : 'idle'
  );
  const [progressPercent, setProgressPercent] = useState(0);
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      processFile(droppedFile);
      e.dataTransfer.clearData();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      processFile(selectedFile);
    }
  };
  
  const processFile = (selectedFile: File) => {
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(selectedFile.type)) {
      alert('Please upload a PDF or Word document.');
      return;
    }
    
    if (selectedFile.size > maxSize) {
      alert('File size should be less than 5MB.');
      return;
    }
    
    // Update the file immediately to fix the double upload issue
    updateFile(selectedFile);
    setUploadStatus('uploading');
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setProgressPercent(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        setUploadStatus('success');
      }
    }, 150);
  };
  
  const removeFile = () => {
    updateFile(null);
    setUploadStatus('idle');
    setProgressPercent(0);
  };
  
  const getFileExtension = (filename: string) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  };

  const renderUploadArea = () => (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={() => document.getElementById('file-upload')?.click()}
    >
      <div className="flex flex-col items-center justify-center space-y-2">
        <Upload className="h-12 w-12 text-gray-400" />
        <Label htmlFor="file-upload" className="font-medium text-gray-700">
          Drop your resume here or <span className="text-blue-500">browse</span>
        </Label>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="sr-only"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <p>Save time by uploading your resume. We'll automatically fill in your details.</p>
        <p className="text-sm text-gray-500">Supported formats: PDF, DOC, DOCX (up to 5MB)</p>
      </div>
      
      {!file ? (
        renderUploadArea()
      ) : (
        <div className="border rounded-lg p-4">
          {uploadStatus === 'uploading' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <File className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-gray-700">{file.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 text-right">{progressPercent}%</p>
            </div>
          ) : uploadStatus === 'success' ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-700">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {getFileExtension(file.name).toUpperCase()}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ResumeUploadCard;