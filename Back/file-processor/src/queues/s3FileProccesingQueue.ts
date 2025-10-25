import { Queue } from "bullmq";
import config from "../config";
import logger from "../utils/logger";

const s3FileProcessingQueue = new Queue(`${config.queue.s3Queue}`, {
  connection: {
    host: config.redis.domain,
    port: parseInt(config.redis.port),
  },
});

// Initialize queue logging
s3FileProcessingQueue.getJobCounts().then((counts) => {
  logger.info("Queue state:", counts);
});

s3FileProcessingQueue.getActive().then((active) => {
  logger.info(`${active.length} jobs stuck as "active"`);
});

export default s3FileProcessingQueue;
