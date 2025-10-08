/*
  Warnings:

  - You are about to alter the column `embedding` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `vector` to `Unsupported("vector")`.
  - Added the required column `category` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "price" TEXT NOT NULL,
ALTER COLUMN "embedding" SET DATA TYPE vector;
