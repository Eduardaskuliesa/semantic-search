/*
  Warnings:

  - You are about to alter the column `embedding` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `vector` to `Unsupported("vector(768)")`.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "embedding" SET DATA TYPE vector(768);
CREATE INDEX IF NOT EXISTS "Product_embedding_idx" 
ON "Product" USING hnsw (embedding vector_cosine_ops);