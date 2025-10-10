"use client";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

const RedirectToast = () => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirected = searchParams.get("redirected");
    if (redirected) {
      toast.error("Session expired. Please sign in again.");
    }
  }, [searchParams]);

  return null;
};

export default RedirectToast;
