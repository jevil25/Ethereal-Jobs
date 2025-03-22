import React, { useState, useRef } from "react";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Upload, File, X, Loader2 } from "lucide-react";
import showToast from "../ui/toast";

export interface ResumeUploadCardProps {
  file: File | null;
  updateFile: (file: File | null) => void;
  isParsing: boolean;
  controller: AbortController;
}

const ResumeUploadCard: React.FC<ResumeUploadCardProps> = ({
  file,
  updateFile,
  isParsing,
  controller,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (selectedFile: File) => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(selectedFile.type)) {
      showToast("Please upload a PDF or Word document.", "error");
      return;
    }

    if (selectedFile.size > maxSize) {
      showToast("File size too large. Max size is 5MB.", "error");
      return;
    }
    setIsUploaded(true);

    // Update the file immediately to fix the double upload issue
    updateFile(selectedFile);
  };

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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    controller.abort();
    updateFile(null);
    setIsUploaded(false);
  };

  const renderUploadArea = () => (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-blue-500 bg-blue-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={triggerFileInput}
    >
      <div className="flex flex-col items-center justify-center space-y-2">
        <Upload className="h-12 w-12 text-gray-400" />
        <Label htmlFor="file-upload" className="font-medium text-gray-700">
          Drop your resume here or click to upload
        </Label>
        <input
          id="file-upload"
          ref={fileInputRef}
          name="file-upload"
          type="file"
          className="sr-only"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );

  if (!isParsing && file) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <p>
          Save time by uploading your resume. We'll automatically fill in your
          details.
        </p>
        <p className="text-sm text-gray-500">
          Supported formats: PDF, DOC, DOCX (up to 5MB)
        </p>
      </div>

      {!isUploaded ? (
        renderUploadArea()
      ) : (
        <div className="border rounded-lg p-4">
          {isParsing ? (
            <div className="space-y-2 h-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <File className="h-5 w-5 text-blue-500" />
                  <span className="font-medium text-gray-700">
                    {file && file.name}
                  </span>
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
              <div className="flex justify-center items-center w-full text-center">
                <Loader2 className="w-12 animate-spin text-blue-500" />
                <div className="h-20">
                  Parsing your resume, please wait... This normally takes about
                  10 seconds.
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ResumeUploadCard;
