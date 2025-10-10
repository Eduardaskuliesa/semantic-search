"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUploader } from "./components/FileUploader";

const DashboardClientPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState("upload");
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const handleUpload = async () => {
    console.log("Uploading files:", files);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    handleSwipe();
  };

  const handleSwipe = () => {
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0 && activeTab === "upload") {
        setDirection(1);
        setActiveTab("jobs");
      } else if (diff < 0 && activeTab === "jobs") {
        setDirection(-1);
        setActiveTab("upload");
      }
    }
  };

  const handleTabChange = (newTab: string) => {
    if (newTab === "jobs" && activeTab === "upload") {
      setDirection(1);
    } else if (newTab === "upload" && activeTab === "jobs") {
      setDirection(-1);
    }
    setActiveTab(newTab);
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
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
        <div
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            {activeTab === "upload" && (
              <motion.div
                key="upload"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <FileUploader
                  files={files}
                  onFilesChange={setFiles}
                  onUpload={handleUpload}
                />
              </motion.div>
            )}
            {activeTab === "jobs" && (
              <motion.div
                key="jobs"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <div className="bg-secondary w-full min-h-[85vh] max-h-[85vh] rounded-md border border-border flex items-center justify-center">
                  <p className="text-muted-foreground">Jobs content</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
};

export default DashboardClientPage;
