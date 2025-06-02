-- AlterTable
ALTER TABLE `MemberExternalServiceAccount` ADD COLUMN `status` ENUM('ACTIVE', 'DELETED') NOT NULL DEFAULT 'ACTIVE';
