import { getDummyUserAction } from "@/actions/test";
import React from "react";
import DashboardClientPage from "./DashboardClientPage";
import { validateSession } from "@/helpers/validateSession";

const page = async () => {
  const session = await validateSession()
  await getDummyUserAction(session.user.id);

  return (
    <DashboardClientPage></DashboardClientPage>
  );
};

export default page;
