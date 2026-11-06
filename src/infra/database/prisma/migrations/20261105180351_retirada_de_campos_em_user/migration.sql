/*
  Warnings:

  - You are about to drop the column `mfa_code_expires_at` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mfa_code_hash` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "mfa_code_expires_at",
DROP COLUMN "mfa_code_hash";
