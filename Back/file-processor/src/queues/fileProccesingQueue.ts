import { Queue } from "bullmq";
import config from "../config";

export type JobData = {
  filePath?: string;
  row?: string;
  S3Key?: string;
};

const fileProcessingQueue = new Queue<JobData>(`${config.queue.name}`, {
  connection: {
    host: config.redis.domain,
    port: parseInt(config.redis.port),
  },
});

export default fileProcessingQueue;
