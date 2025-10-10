"use client";
import { Button } from "@/components/ui/button";
import React, { useRef } from "react";
import { X, Upload, FileText } from "lucide-react";
import { MotionButton } from "@/components/ui/motion-button";
import { toast } from "sonner";

interface FileUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  onUpload: () => void;
}

export const FileUploader = ({ files, onFilesChange, onUpload }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      const csvFiles = fileArray.filter((file) => file.name.endsWith(".csv"));

      if (csvFiles.length !== fileArray.length) {
        toast.info("Only CSV files are accepted");
      }

      if (csvFiles.length > 0) {
        onFilesChange([...files, ...csvFiles]);
      }
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-secondary w-full min-h-[85vh] max-h-[85vh] rounded-md border border-border flex flex-col">
      <div className="mx-4 mt-4 mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-colors flex flex-col items-center gap-3 bg-background/50"
        >
          <Upload className="h-10 w-10 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">Click to upload CSV files</p>
            <p className="text-xs text-muted-foreground mt-1">
              Only .csv files supported
            </p>
          </div>
        </button>
      </div>

      {files.length > 0 && (
        <div className="flex-1 p-2 max-h-full overflow-y-auto">
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-background border rounded-lg p-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="p-4 mb-4">
          <MotionButton
            whileTap={{ scale: 0.98, translateY: 2 }}
            onClick={onUpload}
            className="w-full transition-none"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload {files.length} file{files.length > 1 ? "s" : ""}
          </MotionButton>
        </div>
      )}
    </div>
  );
};