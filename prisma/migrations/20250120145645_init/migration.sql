/*
  Warnings:

  - You are about to drop the column `email` on the `Member` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Member_email_namespaceId_key` ON `Member`;

-- AlterTable
ALTER TABLE `Member` DROP COLUMN `email`;
