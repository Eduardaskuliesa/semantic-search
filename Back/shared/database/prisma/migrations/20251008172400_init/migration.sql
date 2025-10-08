/*
  Warnings:

  - You are about to alter the column `embedding` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `vector` to `Unsupported("vector")`.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "embedding" SET DATA TYPE vector;
