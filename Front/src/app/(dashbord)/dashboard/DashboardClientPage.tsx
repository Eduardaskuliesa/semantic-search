"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { FileUploader } from "./components/FileUploader";
import { useSwipeableTabs } from "@/hooks/useSwipeableTabs";
import { SwipeableTabContent } from "./components/SwipeableTabContent";
import { generateUploadUrl } from "@/actions/generateUploadUrl";
import { toast } from "sonner";

const DashboardClientPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const tabs = ["upload", "jobs"];
  const {
    activeTab,
    direction,
    handleTouchStart,
    handleTouchEnd,
    handleTabChange,
    variants,
  } = useSwipeableTabs(tabs);

  const handleUpload = async () => {
    setUploading(true);
    try {
      for (const file of files) {
        const result = await generateUploadUrl(file.name);

        const { uploadUrl, key } = result;

        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
        });

        console.log("Uploaded:", key);
      }
      setUploading(false);
      toast.success("All files uploaded successfully");
    } catch (error) {
      setUploading(false);
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 max-h-[90vh] md:mt-14">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full max-h-[90vh]"
      >
        <TabsList>
          <TabsTrigger value="upload">Upload files</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
        </TabsList>
        <SwipeableTabContent
          activeTab={activeTab}
          direction={direction}
          variants={variants}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          tabs={tabs}
        >
          {(tab) => {
            switch (tab) {
              case "upload":
                return (
                  <FileUploader
                    files={files}
                    onFilesChange={setFiles}
                    onUpload={handleUpload}
                    uploading={uploading}
                  />
                );
              case "jobs":
                return (
                  <div className="bg-secondary w-full min-h-[85vh] max-h-[85vh] rounded-md border border-border flex items-center justify-center">
                    <p className="text-muted-foreground">Jobs content</p>
                  </div>
                );
              default:
                return null;
            }
          }}
        </SwipeableTabContent>
      </Tabs>
    </div>
  );
};

export default DashboardClientPage;
