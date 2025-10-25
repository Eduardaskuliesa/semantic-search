import { Router } from "express";
import { validateSession } from "../middleware/authMiddleware";
import { s3QueueController } from "../controllers/s3-queue-controller";

const router = Router();

router.post("/queue/s3", validateSession, s3QueueController.createS3Queue);

export default router;