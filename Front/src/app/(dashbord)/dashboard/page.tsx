import React from "react";
import DashboardClientPage from "./DashboardClientPage";
import { validateSession } from "@/helpers/validateSession";

const page = async () => {
   await validateSession()

  return (
    <DashboardClientPage></DashboardClientPage>
  );
};

export default page;
