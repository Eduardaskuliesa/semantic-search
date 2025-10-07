import { Worker, ConnectionOptions } from "bullmq";
import IORedis from "ioredis";
import config from "../config";
import logger from "../utils/logger";

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
    logger.error(`Worker ${i} - Redis connection error:`, error);
  });

  connection.on("connect", () => {
    logger.info(`Worker ${i} connected to Redis`);
  });

  connection.on("reconnecting", () => {
    logger.info(`Worker ${i} - Reconnecting to Redis`);
  });

  connection.on("close", () => {
    logger.warn(`Worker ${i} - Redis connection closed`);
  });

  const worker = new Worker(
    `${config.queue.name}`,
    async (job) => {
      logger.info(`Worker ${i} - Processing job ${job.id} of type ${job.name}`);
    },
    {
      connection,
      concurrency: 5,
      removeOnComplete: {
        age: 0,
      },
    }
  );

  worker.on("ready", () => {
    logger.success(`Worker ${i} is ready and listening for jobs`);
  });

  worker.on("completed", async (job) => {
    logger.success(`Worker ${i} - Job ${job.id} completed successfully`);
  });

  worker.on("failed", async (job, error) => {
    logger.error(`Worker ${i} - Job ${job?.id} failed:`, error);
  });
}
