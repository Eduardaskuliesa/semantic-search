import { Queue } from "bullmq";
import config from "../config";
import Redis from "ioredis";

class QueueService {
  private connection: Redis;
  private s3Queue: Queue;
  private cloudQueue: Queue;

  constructor() {
    this.connection = new Redis({
      host: config.redis.domain,
      port: parseInt(config.redis.port),
    });

    this.s3Queue = new Queue(config.queue.s3Queue, {
      connection: this.connection,
    });

    this.cloudQueue = new Queue(config.queue.cloudQueue, {
      connection: this.connection,
    });
  }

  async addToS3Queue(data: { fileKey: string; userId: string }) {
    await this.s3Queue.add("process", data);
  }

  async addToCloudQueue(data: { fileKey: string; userId: string }) {
    await this.cloudQueue.add("process", data);
  }
}

export const queueService = new QueueService();
