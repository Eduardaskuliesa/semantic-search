import { Router } from "express";
import queuesRoute from "./queuesRoute";

const routes = () => {
  const router = Router();
  router.use(queuesRoute);
  return router;
};

export default routes;