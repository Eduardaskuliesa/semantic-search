import { ContentEmbedding, GoogleGenAI } from "@google/genai";
import config from "../config";
import logger from "../utils/logger";

const ai = new GoogleGenAI({
  apiKey: config.google.genAi,
});

class GoogleGenAIService {
  async generateEmbedding(
    text: string
  ): Promise<ContentEmbedding[] | undefined> {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: {
        outputDimensionality: 768,
      },
    });
    if (!response.embeddings) {
      logger.error("No embeddings returned from Google GenAI", response);
    }
    return response.embeddings;
  }
}

export const googleGenAIService = new GoogleGenAIService();