import express from "express";
import config from "./config";
import logger from "./utils/logger";
import { prisma } from "@shared/database";
import routes from "./routes";
import morgan from "morgan";

const server = express();

server.use(express.json());
server.use(morgan("combined"));
server.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "OK", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "ERROR", database: "disconnected" });
  }
});

routes(server);
server.listen(config.server.port, () => {
  logger.info(
    `Server is running: http://${config.server.domain}:${config.server.port}`
  );
});
