import { Worker, ConnectionOptions, Job } from "bullmq";
import IORedis from "ioredis";
import config from "../config";
import logger from "../utils/logger";
import { JobData } from "../queues/localFileProccesingQueue";

const redisOptions: ConnectionOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  host: config.redis.domain,
  port: parseInt(config.redis.port),
  connectTimeout: 10000,
  disconnectTimeout: 2000,
  keepAlive: 100000,
};

const WORKER_COUNT = 3;

for (let i = 1; i <= WORKER_COUNT; i++) {
  const connection = new IORedis(redisOptions);

  connection.on("error", (error) => {
    logger.error(`Worker s3 ${i} - Redis connection error:`, error);
  });

  connection.on("connect", () => {
    logger.info(`Worker s3 ${i} connected to Redis`);
  });

  connection.on("reconnecting", () => {
    logger.info(`Worker s3 ${i} - Reconnecting to Redis`);
  });

  connection.on("close", () => {
    logger.warn(`Worker s3 ${i} - Redis connection closed`);
  });

  const worker = new Worker(`${config.queue.s3Queue}`, async (job) => {}, {
    connection,
    concurrency: 5,
    removeOnComplete: {
      age: 0,
    },
  });

  worker.on("ready", () => {});

  worker.on("completed", async (job: Job<JobData>) => {});

  worker.on("failed", async (job, error) => {
    logger.error(`Worker cloud ${i} - Job ${job?.id} failed:`, error);
  });
}
