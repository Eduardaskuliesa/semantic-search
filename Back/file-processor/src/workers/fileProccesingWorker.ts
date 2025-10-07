import { Worker, ConnectionOptions, Job } from "bullmq";
import IORedis from "ioredis";
import config from "../config";
import logger from "../utils/logger";
import fs, { createReadStream } from "fs";
import { JobData } from "../queues/fileProccesingQueue";
import { parse } from "csv-parse";

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
    async (job: Job<JobData>) => {
      switch (true) {
        case !!job.data.filePath:
          const parser = createReadStream(job.data.filePath).pipe(
            parse({
              columns: true,
              skip_empty_lines: true,
            })
          );

          for await (const row of parser) {
            logger.info(`Row fields:`, row);
          }

          break;
        case !!job.data.S3Key:
          logger.info(`Processing S3 file: ${job.data.S3Key}`);
          break;
      }
    },
    {
      connection,
      concurrency: 5,
      removeOnComplete: {
        age: 0,
      },
    }
  );

  worker.on("ready", () => {});

  worker.on("completed", async (job: Job<JobData>) => {
    logger.success(`Worker ${i} - Job ${job.id} completed successfully`);
    if (job.data.filePath) {
      fs.unlink(job.data.filePath, (err) => {
        if (err) {
          logger.error(`Error deleting file ${job.data.filePath}:`, err);
        } else {
          logger.info(`Deleted processed file: ${job.data.filePath}`);
        }
      });
    }
  });

  worker.on("failed", async (job, error) => {
    logger.error(`Worker ${i} - Job ${job?.id} failed:`, error);
  });
}
