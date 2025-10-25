import { MotionButton } from "@/components/ui/motion-button";
import { Loader, Upload } from "lucide-react";
import React from "react";

interface FileUploaderControllsProps {
  isUploading: boolean;
  files: File[];
  onUpload: () => void;
}

const FileUploaderControlls = ({
  isUploading,
  files,
  onUpload,
}: FileUploaderControllsProps) => {
  return (
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
  );
};

export default FileUploaderControlls;
