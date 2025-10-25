import { Queue } from "bullmq";
import config from "../config";

export type S3JobData = {
  fileKey: string;
  fileName: string;
};

const s3FileProcessingQueue = new Queue(`${config.queue.s3Queue}`, {
  connection: {
    host: config.redis.domain,
    port: parseInt(config.redis.port),
  },
});

export default s3FileProcessingQueue;
