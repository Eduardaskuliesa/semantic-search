import { Express } from "express";
import { testRoutes } from "./testRoute";

const routes = (server: Express) => {
  testRoutes(server);
};

export default routes;
