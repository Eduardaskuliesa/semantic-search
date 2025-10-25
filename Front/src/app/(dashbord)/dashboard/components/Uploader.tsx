import React from "react";
import { Upload } from "lucide-react";

interface UploaderProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const Uploader = ({ onFilesSelected, disabled }: UploaderProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      const csvFiles = fileArray.filter((file) => file.name.endsWith(".csv"));
      onFilesSelected(csvFiles);
    }
    e.target.value = "";
  };

  return (
    <div className="mx-4 mt-4 mb-4">
      <input
        type="file"
        accept=".csv"
        multiple
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
        disabled={disabled}
      />
      <label
        htmlFor="file-upload"
        className={`w-full border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-colors flex flex-col items-center gap-3 bg-background/50 ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <Upload className="h-10 w-10 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">Click to upload CSV files</p>
          <p className="text-xs text-muted-foreground mt-1">
            Only .csv files supported
          </p>
        </div>
      </label>
    </div>
  );
};

export default Uploader;
