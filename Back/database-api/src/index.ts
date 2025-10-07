import express from "express";
import config from "./config";

const server = express();

server.use(express.json());

server.get("/health", (req, res) => {
  res.status(200).send("OK");
});

server.listen(config.server.port, () => {
  console.log(
    `Server is running: ${config.server.domain}:${config.server.port} `
  );
});
