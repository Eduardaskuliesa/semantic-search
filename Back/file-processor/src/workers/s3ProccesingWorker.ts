import { Worker, ConnectionOptions, Job } from "bullmq";
import IORedis from "ioredis";
import config from "../config";
import logger from "../utils/logger";
import { S3JobData } from "@shared/types";
import { DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../services/s3Client";
import { Readable } from "stream";
import { parse } from "csv-parse";
import { googleGenAIService } from "../services/googleGenAi";
import { createManyProducts } from "../queries/createManyProducts";

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
  const workerPrefix = `[Worker-S3-${i}]`;
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

  const worker = new Worker(
    `${config.queue.s3Queue}`,
    async (job: Job<S3JobData>) => {
      const jobPrefix = `${workerPrefix}[Job-${job.id}]`;
      const fileName = job.data.key.split("/").pop() || job.data.key;

      const rowCounterKey = `s3file:${job.data.key}:counter`;
      const existingCounter = await connection.get(rowCounterKey);
      const startFromRow = existingCounter ? parseInt(existingCounter, 10) : 0;

      logger.info(`${jobPrefix} Starting: ${fileName}`);

      let totalTokensUsed = 0;
      let currentRow = 0;
      let batch: any[] = [];

      const processBatch = async () => {
        if (batch.length === 0) return;

        try {
          const results = await createManyProducts(batch, jobPrefix);
          logger.info(
            `${jobPrefix} Batch: ${results.created} created, ${results.duplicates} duplicates, ${results.failed} failed`
          );
          batch = [];
        } catch (error: any) {
          logger.error(`${jobPrefix} Batch processing failed:`, error.message);
          throw error;
        }
      };

      const command = new GetObjectCommand({
        Bucket: config.r2.bucketName,
        Key: job.data.key,
      });

      const response = await s3Client.send(command);
      const stream = response.Body as Readable;

      const cvsRows = stream.pipe(
        parse({ columns: true, skip_empty_lines: true })
      );

      for await (const row of cvsRows) {
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

            if (response.data && response.data.length > 0) {
              batch.push(...response.data);
            }
            totalTokensUsed += response?.tokenCount || 0;
            currentRow++;

            if (batch.length >= 10) {
              await processBatch();
              await connection.set(rowCounterKey, currentRow);
            }
            logger.info(`${jobPrefix} Row ${currentRow} processed`);
            break;
          } catch (err: any) {
            if (err.status === 429) {
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

                await processBatch();
                await connection.set(rowCounterKey, currentRow);
                return;
              }
            } else {
              logger.error(
                `${jobPrefix} Error at row ${currentRow}:`,
                err.message
              );
              break;
            }
          }
        }
      }
      await processBatch();
      await connection.del(rowCounterKey);

      logger.success(
        `${jobPrefix} Completed. Total tokens: ${totalTokensUsed}`
      );
    },
    {
      connection,
      concurrency: 3,
      stalledInterval: 30000,
      maxStalledCount: 3,
      removeOnComplete: { age: 0 },
    }
  );

  worker.on("ready", () => {});

  worker.on("completed", async (job: Job<S3JobData>) => {
    const command = new DeleteObjectCommand({
      Bucket: config.r2.bucketName,
      Key: job.data.key,
    });

    await s3Client.send(command);
    logger.success(
      `Successfully processed job ${job.id} for file ${job.data.key}`
    );
  });

  worker.on("failed", async (job, error) => {
    logger.error(`Worker s3 ${i} - Job ${job?.id} failed:`, error);
  });
}
