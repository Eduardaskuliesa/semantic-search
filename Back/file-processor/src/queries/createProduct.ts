import { prisma } from "@shared/database";
import { randomUUID } from "crypto";
import { googleGenAIService } from "../services/googleGenAi";
import logger from "../utils/logger";

type CreateProductInput = {
  productId: string;
  productName: string;
  description: string;
  category: string;
  price: number | string;
};

export async function createProduct(input: CreateProductInput) {
  try {
    const embedding = await googleGenAIService.generateEmbedding({
      text: input.description,
      taskType: "RETRIEVAL_DOCUMENT",
    });

    if (!embedding) {
      logger.error("Failed to generate embedding");
      return null;
    }
    const embeddingArray = embedding[0].values;
    const embeddingVector = `[${embeddingArray?.join(",")}]`;
    const duplicates = await prisma.$queryRaw<
      Array<{ id: string; similarity: number }>
    >`
      SELECT 
        id,
        1 - (embedding <=> ${embeddingVector}::vector) as similarity
      FROM "Product"
      WHERE (embedding <=> ${embeddingVector}::vector) < 0.05
      LIMIT 1
    `;

    if (duplicates.length > 0) {
      logger.warn(
        `Duplicate product found with ${(
          duplicates[0].similarity * 100
        ).toFixed(2)}% similarity. Skipping.`
      );
      return { duplicate: true, existingId: duplicates[0].id };
    }
    const result = await prisma.$executeRaw`
    INSERT INTO "Poduct" ("id", "productName", "description", "category", "price", "embedding")
    VALUES(
        ${input.productId},
        ${input.productName},
        ${input.description},
        ${input.category},
        ${input.price.toString()},
        ${`[${embeddingArray?.join(",")}]`}::vector
    )`;

    if (result > 0) {
      logger.success(`Product created: ${input.productName}`);
      return { success: true, productId: input.productId };
    }

    return {
      success: false,
    };
  } catch (error) {
    logger.error("Error creating product:", error);
    return {
      success: false,
    };
  }
}
