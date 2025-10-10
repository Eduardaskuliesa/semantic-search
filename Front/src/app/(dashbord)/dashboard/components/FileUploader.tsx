"use client";
import { Button } from "@/components/ui/button";
import React, { useRef } from "react";
import { X, Upload, FileText, Loader, CheckCircle2 } from "lucide-react";
import { MotionButton } from "@/components/ui/motion-button";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

type FileStatus = {
  status: "pending" | "uploading" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
};

interface FileUploaderProps {
  files: File[];
  fileStatuses: Map<string, FileStatus>;
  onFilesChange: (files: File[]) => void;
  onUpload: () => void;
}

export const FileUploader = ({
  files,
  fileStatuses,
  onFilesChange,
  onUpload,
}: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isUploading = Array.from(fileStatuses.values()).some(
    (s) => s.status === "uploading" || s.status === "processing"
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      const csvFiles = fileArray.filter((file) => file.name.endsWith(".csv"));

      if (csvFiles.length !== fileArray.length) {
        toast.info("Only CSV files are accepted");
      }

      if (fileArray.length > 0) {
        onFilesChange([...files, ...fileArray]);
      }
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const getStatusIcon = (status?: FileStatus) => {
    if (!status || status.status === "pending") return null;
    if (status.status === "completed")
      return <CheckCircle2 className="h-3 w-3 text-green-500" />;
    if (status.status === "uploading" || status.status === "processing") {
      return <Loader className="h-4 w-4 animate-spin text-blue-500" />;
    }
    return null;
  };

  const getStatusText = (status?: FileStatus) => {
    if (!status || status.status === "pending") return "";
    if (status.status === "uploading") return "Uploading...";
    if (status.status === "processing") return "Processing...";
    if (status.status === "completed") return "Completed";
    if (status.status === "error") return status.error || "Error";
    return "";
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
            <AnimatePresence mode="popLayout">
              {files.map((file, index) => {
                const status = fileStatuses.get(file.name);
                return (
                  <motion.div
                    key={file.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    layout
                    className="flex flex-col bg-background border rounded-lg p-3 gap-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={isUploading}
                          className="flex-shrink-0"
                        >
                          <X className="h-4 w-4 mb-1" />
                        </Button>
                      </div>
                    </div>
                    {status && status.status !== "pending" && (
                      <motion.div
                        key={`${file.name}`}
                        initial={
                          status.progress === 0
                            ? { opacity: 0, height: 0 }
                            : false
                        }
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-2">
                            {getStatusText(status)}
                            <div className="">{getStatusIcon(status)}</div>
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {status.progress}%
                          </span>
                        </div>
                        <div className="h-1 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            key={`${file.name}`}
                            initial={
                              status.progress === 0 ? { width: 0 } : false
                            }
                            animate={{ width: `${status.progress}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="h-full bg-primary"
                          />
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="p-4 mb-4">
          <MotionButton
            disabled={isUploading}
            whileTap={{ scale: 0.98, translateY: 2 }}
            onClick={onUpload}
            className="w-full transition-none"
          >
            {isUploading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload {files.length} file{files.length > 1 ? "s" : ""}
              </>
            )}
          </MotionButton>
        </div>
      )}
    </div>
  );
};
