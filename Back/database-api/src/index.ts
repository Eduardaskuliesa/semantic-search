import express from "express";
import config from "./config";
import logger from "./utils/logger";
import { prisma } from "@shared/database"

const server = express();

server.use(express.json());

server.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "OK", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "ERROR", database: "disconnected" });
  }
});

server.listen(config.server.port, () => {
  logger.info(
    `Server is running: http://${config.server.domain}:${config.server.port}`
  );
});