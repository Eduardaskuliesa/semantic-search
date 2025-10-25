import { Queue } from "bullmq";
import config from "../config";
import Redis from "ioredis";
import { S3JobData, CloudJobData } from "@shared/types";

class QueueService {
  private connection: Redis;
  private s3Queue: Queue<S3JobData>;
  private cloudQueue: Queue<CloudJobData>;

  constructor() {
    this.connection = new Redis({
      host: config.redis.domain,
      port: parseInt(config.redis.port),
    });

    this.s3Queue = new Queue<S3JobData>(config.queue.s3Queue, {
      connection: this.connection,
    });

    this.cloudQueue = new Queue<CloudJobData>(config.queue.cloudQueue, {
      connection: this.connection,
    });
  }

  async addToS3Queue(data: S3JobData) {
    return await this.s3Queue.add("process", data);
  }

  async addToCloudQueue(data: CloudJobData) {
    return await this.cloudQueue.add("process", data);
  }
}

export const queueService = new QueueService();