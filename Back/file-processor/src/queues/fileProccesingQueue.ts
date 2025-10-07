import { Queue } from "bullmq";
import config from "../config";

const fileProcessingQueue = new Queue(`${config.queue.name}`, {
  connection: {
    host: config.redis.domain,
    port: parseInt(config.redis.port),
  },
});

export default fileProcessingQueue;
