"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { FileUploader } from "./components/FileUploader";
import { useSwipeableTabs } from "@/hooks/useSwipeableTabs";
import { SwipeableTabContent } from "./components/SwipeableTabContent";
import { generateUploadUrl } from "@/actions/generateUploadUrl";
import { toast } from "sonner";

type FileStatus = {
  status: "pending" | "uploading" | "processing" | "completed" | "error";
  progress: number;
  error?: string;
};

const DashboardClientPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileStatuses, setFileStatuses] = useState<Map<string, FileStatus>>(
    new Map()
  );
  const tabs = ["upload", "jobs"];
  const {
    activeTab,
    direction,
    handleTouchStart,
    handleTouchEnd,
    handleTabChange,
    variants,
  } = useSwipeableTabs(tabs);

  const updateFileStatus = (fileName: string, status: Partial<FileStatus>) => {
    setFileStatuses((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(fileName) || {
        status: "pending",
        progress: 0,
      };
      newMap.set(fileName, { ...current, ...status });
      return newMap;
    });
  };

  const handleUpload = async () => {
    try {
      for (const file of files) {
        const status = fileStatuses.get(file.name);
        if (status?.status === "completed") continue;

        updateFileStatus(file.name, { status: "uploading", progress: 0 });

        const result = await generateUploadUrl(file.name);
        const { uploadUrl } = result;

        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error("Upload failed");
        }

        updateFileStatus(file.name, { status: "processing", progress: 50 });
        await new Promise((resolve) => setTimeout(resolve, 1500));

        updateFileStatus(file.name, { status: "completed", progress: 100 });
      }

      toast.success("All files uploaded successfully");
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Upload failed");
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
                    fileStatuses={fileStatuses}
                    onFilesChange={setFiles}
                    onUpload={handleUpload}
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
