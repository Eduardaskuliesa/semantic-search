import { Queue } from "bullmq";
import config from "../config";

const cloudFileProcessingQueue = new Queue(`${config.queue.cloudQueue}`, {
  connection: {
    host: config.redis.domain,
    port: parseInt(config.redis.port),
  },
});

export default cloudFileProcessingQueue;
