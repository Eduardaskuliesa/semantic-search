"use client";
import { testAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import React from "react";

interface DashboardClientPageProps {
  token: string;
}

const DashboardClientPage = ({ token }: DashboardClientPageProps) => {
  console.log("Token:", token);
  const handleTest = async () => {
    const data = await testAction();
    console.log("Test action response:", data);
  };
  return (
    <div>
      <Button className="text-neutral-200" onClick={() => handleTest()}>
        Click me
      </Button>
    </div>
  );
};

export default DashboardClientPage;
