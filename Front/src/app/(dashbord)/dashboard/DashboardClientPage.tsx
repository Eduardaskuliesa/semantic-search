"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { FileUploader } from "./components/FileUploader";
import { useSwipeableTabs } from "@/hooks/useSwipeableTabs";
import { SwipeableTabContent } from "./components/SwipeableTabContent";
import { generateUploadUrl } from "@/actions/generateUploadUrl";
import { toast } from "sonner";
import { FileStatus } from "./components/FileUploaderBody";
import { createQueue } from "@/actions/queues/createQueue";

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
    let successCount = 0;

    for (const file of files) {
      const status = fileStatuses.get(file.name);
      if (status?.status === "completed") {
        successCount++;
        continue;
      }

      updateFileStatus(file.name, { status: "uploading", progress: 0 });

      const urlResult = await generateUploadUrl(file.name);
      if (!urlResult?.uploadUrl || !urlResult?.key) {
        updateFileStatus(file.name, { status: "error", progress: 100 });
        toast.error(`Failed to generate upload URL for ${file.name}`);
        continue;
      }
      updateFileStatus(file.name, { status: "processing", progress: 33 });
      const { uploadUrl, key } = urlResult;

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
      });

      if (!uploadResponse.ok) {
        updateFileStatus(file.name, { status: "error", progress: 100 });
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      updateFileStatus(file.name, { status: "processing", progress: 66 });

      const queueResult = await createQueue("s3", key);
      if (!queueResult.success) {
        updateFileStatus(file.name, { status: "error", progress: 100 });
        toast.error(`Failed to queue ${file.name}`);
        continue;
      }

      updateFileStatus(file.name, { status: "completed", progress: 100 });
      successCount++;
    }

    if (successCount === files.length) {
      toast.success(`All files uploaded successfully`);
    }
    if (successCount !== files.length) {
      toast.error(`${files.length - successCount} files failed to upload`);
    }
  };
  return (
    <div className="flex flex-1 flex-col gap-4 p-1  max-h-[90vh] md:mt-14">
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
                  <div className="bg-secondary w-full h-[85vh] rounded-md border border-border flex items-center justify-center">
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
