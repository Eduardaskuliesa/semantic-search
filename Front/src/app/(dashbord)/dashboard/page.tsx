import { getDummyUserAction } from "@/actions/test";
import { initAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import DashboardClientPage from "./DashboardClientPage";

const page = async () => {
  const auth = await initAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }
  await getDummyUserAction(session.user.id);

  return (
    <DashboardClientPage token={session.session.token}></DashboardClientPage>
  );
};

export default page;
