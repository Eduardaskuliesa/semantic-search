import { ContentEmbedding, GoogleGenAI, Type } from "@google/genai";
import config from "../config";
import logger from "../utils/logger";

const ai = new GoogleGenAI({
  apiKey: config.google.genAi,
});

const OUTPUT_DIMENSIONALITY = 768;

const systemInstruction = `Process product data in 4 steps:
1. Extract price or return ""
2. Porductname is required,
3. Write product description (max 20 words)
4. Assign generic category (e.g., sneakers → shoes, laptop → electronics)`;

type TaskType =
  | "RETRIEVAL_DOCUMENT"
  | "RETRIEVAL_QUERY"
  | "CODE_RETRIEVAL_QUERY"
  | "QUESTION_ANSWERING";

type GenerateEmbeddingParams = {
  text: string;
  taskType: TaskType;
};

type StructuredData = {
  productId: string;
  productName: string;
  description: string;
  category: string;
  price: number | string;
};

type StructuredDataResponse = {
  data: StructuredData[] | null;
  tokenCount: number;
};

class GoogleGenAIService {
  async generateEmbedding({
    text,
    taskType,
  }: GenerateEmbeddingParams): Promise<ContentEmbedding[]> {
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: {
        outputDimensionality: OUTPUT_DIMENSIONALITY,
        taskType: taskType,
      },
    });
    if (!response.embeddings) {
      logger.error("No embeddings returned from Google GenAI", response);
    }
    return response.embeddings || [];
  }
  async createStructuredData(
    contents: string
  ): Promise<StructuredDataResponse> {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json", 
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              productId: {
                type: Type.STRING,
              },
              productName: {
                type: Type.STRING,
                 nullable: false
              },
              description: {
                type: Type.STRING,
              },
              category: {
                type: Type.STRING,
              },
              price: {
                type: Type.NUMBER,
               
              },
            },
            
            propertyOrdering: [
              "productId",
              "productName",
              "description",
              "category",
              "price",
            ],
          },
        },
      },
    });
    const tokenCount = response.usageMetadata?.totalTokenCount || 0;
    if (response.text) {
      return {
        data: JSON.parse(response.text),
        tokenCount,
      };
    }

    return {
      data: null,
      tokenCount,
    };
  }
}

export const googleGenAIService = new GoogleGenAIService();
