"use client";
import React from "react";
import { toast } from "sonner";
import FileUploaderControlls from "./FileUploaderControlls";
import Uploader from "./Uploader";
import FileUploaderBody, { FileStatus } from "./FileUploaderBody";

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
  const isUploading = Array.from(fileStatuses.values()).some(
    (s) => s.status === "uploading" || s.status === "processing"
  );

  const handleFilesSelected = (csvFiles: File[]) => {
    if (csvFiles.length === 0) {
      toast.info("Only CSV files are accepted");
      return;
    }

    const removeDuplicates = csvFiles.filter((file) =>
      files.every((f) => f.name !== file.name)
    );

    if (removeDuplicates.length !== csvFiles.length) {
      toast.info("Some files were already added and have been skipped");
    }

    if (removeDuplicates.length > 0) {
      onFilesChange([...files, ...removeDuplicates]);
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-secondary w-full h-[85vh] rounded-md border border-border flex flex-col">
      <Uploader onFilesSelected={handleFilesSelected} disabled={isUploading} />

      {files.length > 0 && (
        <div className="flex-1 p-2 max-h-full overflow-y-auto">
          <FileUploaderBody
            isUploading={isUploading}
            removeFile={removeFile}
            fileStatuses={fileStatuses}
            files={files}
          />
        </div>
      )}

      {files.length > 0 && (
        <FileUploaderControlls
          isUploading={isUploading}
          files={files}
          onUpload={onUpload}
        />
      )}
    </div>
  );
};
