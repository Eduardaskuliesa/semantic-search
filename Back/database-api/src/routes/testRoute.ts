import { Router, Express } from "express";
import { validateSession } from "../middleware/authMiddleware";

export const testRoutes = (server: Express) => {
  server.use("/test", validateSession, (req, res) => {
    res.json({ message: "Test route is working!" });
  });
};
