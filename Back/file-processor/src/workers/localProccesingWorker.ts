import { Worker, ConnectionOptions, Job } from "bullmq";
import IORedis from "ioredis";
import config from "../config";
import logger from "../utils/logger";
import fs, { createReadStream } from "fs";
import { JobData } from "../queues/localFileProccesingQueue";
import { parse } from "csv-parse";
import { prisma } from "@shared/database";
import { googleGenAIService } from "../services/googleGenAi";
import { randomUUID } from "crypto";

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
    logger.error(`Worker local ${i} - Redis connection error:`, error);
  });

  connection.on("connect", () => {
    logger.info(`Worker local ${i} connected to Redis`);
  });

  connection.on("reconnecting", () => {
    logger.info(`Worker local ${i} - Reconnecting to Redis`);
  });

  connection.on("close", () => {
    logger.warn(`Worker local ${i} - Redis connection closed`);
  });

  const worker = new Worker(
    `${config.queue.localQueue}`,
    async (job: Job<JobData>) => {
      if (job.data.filePath) {
        const parser = createReadStream(job.data.filePath).pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
          })
        );
        for await (const row of parser) {
        }
      }
    },
    {
      connection,
      concurrency: 3,
      removeOnComplete: {
        age: 0,
      },
    }
  );

  worker.on("ready", () => {});

  worker.on("completed", async (job: Job<JobData>) => {
    logger.success(`Worker local ${i} - Job ${job.id} completed successfully`);

    // const generateEmbedding = await googleGenAIService.generateEmbedding(
    //   "This is gaming keyboard they are very good quality newest model 2025 size is 42 eu price is 103.95 euros color is blue anyone who buys it will love it"
    // );

    try {
      const searchQuery = "keyboard for gaming";

      const searchEmbedding = await googleGenAIService.generateEmbedding(
        searchQuery
      );
      const searchVector = searchEmbedding[0].values;

      const similarProducts = await prisma.$queryRaw`
    SELECT 
      id,
      "productName",
      description,
      1 - (embedding <=> ${`[${searchVector.join(",")}]`}::vector) as similarity
    FROM "Product"
    WHERE embedding IS NOT NULL
    ORDER BY embedding <=> ${`[${searchVector.join(",")}]`}::vector
    LIMIT 5
  `;

      logger.info("Similar products:", similarProducts);
    } catch (error) {
      logger.error("Search error:", error);
    }

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
    logger.error(`Worker local ${i} - Job ${job?.id} failed:`, error);
  });
}
