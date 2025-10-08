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
        let lastRow = null;
        let totalTokensUsed = 0;
        const parser = createReadStream(job.data.filePath).pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
          })
        );
        for await (const row of parser) {
          lastRow = row;
        }
        if (lastRow) {
          // const parse = JSON.stringify(lastRow, null, 2);
          // const response = await googleGenAIService.createStructuredData(parse);
          // if (response.data && response.data.length > 0) {
         

          // }

          // logger.info("Google Gen AI Response:", response.data);
          // logger.info("Google Gen AI Tokens used:", response.tokenCount);
          // totalTokensUsed += response.tokenCount;
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

    // const generateEmbedding = await googleGenAIService.generateEmbedding({
    //   text: "This is gaming keyboard...",
    //   taskType: "RETRIEVAL_DOCUMENT",
    // });

    // try {
    //   if (generateEmbedding) {
    //     const embeddingArray = generateEmbedding[0].values;
    //     logger.info("Generated Embedding:", embeddingArray);

    //     const createProduct = await prisma.$executeRaw`
    //   INSERT INTO "Product" ("id", "productName", "description", "embedding")
    //   VALUES (
    //     ${randomUUID()},
    //     ${"Gaming Keyboard"},
    //     ${"This is gaming keyboard..."},
    //     ${`[${embeddingArray?.join(",")}]`}::vector
    //   )
    // `;

    //     if (createProduct > 0) {
    //       logger.success(`Inserted ${createProduct} product(s)`);
    //     }
    //   }
    // } catch (error) {
    //   logger.error("Database error:", error);
    //   // App continues running instead of crashing
    // }

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
