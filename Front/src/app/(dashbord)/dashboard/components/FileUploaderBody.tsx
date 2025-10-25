import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileText, Loader, X } from "lucide-react";
import React from "react";

export type FileStatus = {
  status: "pending" | "uploading" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
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

interface FileUploaderBodyProps {
  files: File[];
  fileStatuses: Map<string, FileStatus>;
  isUploading: boolean;
  removeFile: (index: number) => void;
}

const FileUploaderBody = ({
  fileStatuses,
  files,
  isUploading,
  removeFile,
}: FileUploaderBodyProps) => {
  return (
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
                    <p className="text-sm font-medium truncate">{file.name}</p>
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
                    status.progress === 0 ? { opacity: 0, height: 0 } : false
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
                      initial={status.progress === 0 ? { width: 0 } : false}
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
  );
};

export default FileUploaderBody;
