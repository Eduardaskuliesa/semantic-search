import { Worker, ConnectionOptions, Job } from "bullmq";
import IORedis from "ioredis";
import config from "../config";
import logger from "../utils/logger";
import fs, { createReadStream } from "fs";
import { JobData } from "../queues/localFileProccesingQueue";
import { parse } from "csv-parse";
import { googleGenAIService } from "../services/googleGenAi";
import { createProduct } from "../queries/createProduct";
import path from "path";

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
  const workerPrefix = `[Worker-${i}]`;

  connection.on("error", (error) => {
    logger.error(`${workerPrefix} Redis connection error:`, error);
  });

  connection.on("connect", () => {
    logger.info(`${workerPrefix} Connected to Redis`);
  });

  connection.on("reconnecting", () => {
    logger.info(`${workerPrefix} Reconnecting to Redis`);
  });

  connection.on("close", () => {
    logger.warn(`${workerPrefix} Redis connection closed`);
  });

  const worker = new Worker(
    `${config.queue.localQueue}`,
    async (job: Job<JobData>) => {
      const jobPrefix = `${workerPrefix}[Job-${job.id}]`;
      if (!fs.existsSync(job.data.filePath)) {
        logger.warn(`${jobPrefix} File not found: ${job.data.filePath}`);
        return;
      }

      const rowCounterKey = `file:${path.basename(job.data.filePath)}:counter`;
      const existingCounter = await connection.get(rowCounterKey);
      const startFromRow = existingCounter ? parseInt(existingCounter, 10) : 0;

      logger.info(`${jobPrefix} Starting from row ${startFromRow}`);

      let totalTokensUsed = 0;
      let currentRow = 0;

      const parser = createReadStream(job.data.filePath).pipe(
        parse({ columns: true, skip_empty_lines: true })
      );

      for await (const row of parser) {
        if (currentRow < startFromRow) {
          currentRow++;
          continue;
        }

        const rowData = JSON.stringify(row, null, 2);
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            const response = await googleGenAIService.createStructuredData(
              rowData
            );

            if (response?.data?.[0]) {
              await createProduct(response.data[0]);
            }

            totalTokensUsed += response?.tokenCount || 0;
            currentRow++;
            await connection.set(rowCounterKey, currentRow);

            logger.info(`${jobPrefix} Row ${currentRow} processed`);
            break;
          } catch (error: any) {
            if (error.status === 429) {
              retryCount++;

              if (retryCount < maxRetries) {
                logger.warn(
                  `${jobPrefix} Rate limit hit. Retry ${retryCount}/${maxRetries} - waiting 30s`
                );
                await new Promise((resolve) => setTimeout(resolve, 30000));
              } else {
                logger.error(
                  `${jobPrefix} Rate limit exhausted at row ${currentRow}`
                );
                return;
              }
            } else {
              logger.error(
                `${jobPrefix} Error at row ${currentRow}:`,
                error.message
              );
              break;
            }
          }
        }
      }

      await connection.del(rowCounterKey);
      logger.success(
        `${jobPrefix} Completed. Total tokens: ${totalTokensUsed}`
      );
    },
    {
      connection,
      concurrency: 3,
      removeOnComplete: {
        age: 0,
      },
      stalledInterval: 30000,
      maxStalledCount: 1,
    }
  );

  worker.on("completed", async (job: Job<JobData>) => {
    logger.success(`${workerPrefix}[Job-${job.id}] Completed successfully`);

    if (job.data.filePath) {
      fs.unlink(job.data.filePath, (err) => {
        if (err) {
          logger.error(
            `${workerPrefix}[Job-${job.id}] Failed to delete file:`,
            err
          );
        } else {
          logger.info(
            `${workerPrefix}[Job-${job.id}] File deleted: ${job.data.filePath}`
          );
        }
      });
    }
  });

  worker.on("failed", async (job, error) => {
    logger.error(`${workerPrefix}[Job-${job?.id}] Failed:`, error.message);
  });
}
