import express from "express";
import config from "./config";
import logger from "./utils/logger";

const server = express();

server.use(express.json());

server.get("/health", (req, res) => {
  res.status(200).send("OK");
});

server.listen(config.server.port, () => {
  logger.info(
    `Server is running: http://${config.server.domain}:${config.server.port}`
  );
});
