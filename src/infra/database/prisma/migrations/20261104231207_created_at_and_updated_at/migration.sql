/*
  Warnings:

  - Added the required column `created_at` to the `Wallet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Wallet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "created_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
