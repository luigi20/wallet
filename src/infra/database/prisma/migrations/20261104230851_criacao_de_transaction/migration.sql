/*
  Warnings:

  - You are about to drop the column `created_at` on the `Wallet` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Wallet` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Wallet" DROP CONSTRAINT "Wallet_user_id_fkey";

-- AlterTable
ALTER TABLE "Wallet" DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(65,30);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" UUID NOT NULL,
    "sender_wallet_id" UUID NOT NULL,
    "receiver_wallet_id" UUID NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_sender_wallet_id_fkey" FOREIGN KEY ("sender_wallet_id") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_receiver_wallet_id_fkey" FOREIGN KEY ("receiver_wallet_id") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
