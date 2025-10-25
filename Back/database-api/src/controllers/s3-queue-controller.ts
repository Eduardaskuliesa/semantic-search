import { queueService } from "../services/QueueService";
import { Request, Response } from "express";

async function createS3Queue(req: Request, res: Response) {
  try {
    const { key, userId } = req.body;

    if (!key || !userId) {
      return res.status(400).json({ message: "Missing key or userId" });
    }

    const addToS3Queue = await queueService.addToS3Queue({ key, userId });

    return res
      .status(201)
      .json({ message: "Job added to S3 queue", jobId: addToS3Queue.id });
  } catch (err) {
    console.error("Error adding job to S3 queue:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const s3QueueController = {
  createS3Queue,
};
