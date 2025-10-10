import { Request, Response, NextFunction } from "express";
import config from "../config";
import logger from "../utils/logger";

export const validateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.headers["x-api-key"];

  if (apiKey !== config.frontEnd.apiKey) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const sessionToken = req.headers["better-auth-session-token"];

  console.log("Session Token:", sessionToken);

  if (!sessionToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const response = await fetch(
      `http://host.docker.internal:3000/api/verify-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.frontEnd.apiKey,
        },
        body: JSON.stringify({ sessionToken }),
      }
    );
    if (!response.ok) {
      return res.status(401).json({ error: "Invalid session" });
    }
    const { sessionIsValid } = await response.json();
    logger.info("Session is valid:", sessionIsValid);

    next();
  } catch (error) {
    return res.status(500).json({ error: "Session verification failed" });
  }
};
