import { prisma } from "@shared/database";
import { googleGenAIService } from "../services/googleGenAi";
import logger from "../utils/logger";

type CreateProductInput = {
  productId: string;
  productName: string;
  description: string;
  category: string;
  price: number | string;
};

type ProductWithEmbedding = CreateProductInput & {
  embedding: number[];
};

export async function createManyProducts(inputs: CreateProductInput[], jobPrefix: string) {
  const results = {
    created: 0,
    duplicates: 0,
    failed: 0,
  };

  const embeddingPromises = inputs.map(async (input) => {
    try {
      const embedding = await googleGenAIService.generateEmbedding({
        text: input.description,
        taskType: "RETRIEVAL_DOCUMENT",
      });

      if (!embedding || embedding.length === 0) return null;

      return {
        ...input,
        embedding: embedding[0].values,
      };
    } catch (error) {
      logger.error(
        `Failed to generate embedding for ${input.productName} ${jobPrefix}:`,
        error
      );
      return null;
    }
  });

  const productsWithEmbeddings = await Promise.all(embeddingPromises);
  const validProducts = productsWithEmbeddings.filter(
    (p): p is ProductWithEmbedding => p !== null
  );
  const productsToInsert: ProductWithEmbedding[] = [];

  const duplicateChecks = await Promise.all(
    validProducts.map(async (product) => {
      const embeddingVector = `[${product.embedding.join(",")}]`;

      const duplicates = await prisma.$queryRaw<
        Array<{ id: string; distance: number }>
      >`
      SELECT 
        id,
        (embedding <=> ${embeddingVector}::vector) as distance
      FROM "Product"
      ORDER BY embedding <=> ${embeddingVector}::vector
      LIMIT 1
    `;

      const isDuplicate =
        duplicates.length > 0 && duplicates[0].distance < 0.05;
      const similarity = duplicates.length > 0 ? 1 - duplicates[0].distance : 0;

      return {
        product,
        hasDuplicate: isDuplicate,
        similarity: similarity,
      };
    })
  );

  for (const check of duplicateChecks) {
    if (check.hasDuplicate) {
      logger.warn(
        `${jobPrefix} Duplicate: ${check.product.productName} (${(
          (check.similarity || 0) * 100
        ).toFixed(2)}% similar)`
      );
      results.duplicates++;
    } else {
      productsToInsert.push(check.product);
    }
  }

  if (productsToInsert.length > 0) {
    try {
      const insertPromises = productsToInsert.map((product) => {
        const embeddingVector = `[${product.embedding.join(",")}]`;
        return prisma.$executeRaw`
          INSERT INTO "Product" ("id", "productName", "description", "category", "price", "embedding")
          VALUES(
            ${product.productId},
            ${product.productName},
            ${product.description},
            ${product.category},
            ${product.price.toString()},
            ${embeddingVector}::vector
          )
        `;
      });

      await prisma.$transaction(insertPromises);

      results.created = productsToInsert.length;
      logger.success(`${jobPrefix} Batch created ${results.created} products`);
    } catch (error) {
      logger.error("Batch insert failed:", error);
      results.failed = productsToInsert.length;
    }
  }

  return results;
}
